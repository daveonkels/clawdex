import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { buildLeaderboard, calculateStarGrowth7d } from '../src/lib/metrics.js';

import { dailyStarActivity } from '../src/lib/star-activity.js';

const ACTIVITY_PATH = path.join(process.cwd(), 'src/data/star-activity.json');
const PROJECTS_DIR = path.join(process.cwd(), 'src/data/projects');
const HISTORY_PATH = path.join(process.cwd(), 'src/data/star-history.json');
const LEADERBOARD_PATH = path.join(process.cwd(), 'src/data/generated/leaderboard.json');
const DAY = 24 * 60 * 60 * 1000;

async function githubFetch(endpoint, optional = false) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10',
      'User-Agent': 'shelldex-enrichment/1.0',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    signal: AbortSignal.timeout(30000),
  });
  if (optional && res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${endpoint}; no project data was changed.`);
  return res.json();
}

async function fetchStarWeeks(github) {
  const weeks = [];
  for (let page = 1; page <= 100; page++) {
    const batch = await githubFetch(`/repos/${github}/stargazers/history?per_page=30&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`Invalid star history for ${github}`);
    weeks.push(...batch);
    if (batch.length < 30) break;
  }
  return weeks;
}

function validateResponse(github, response) {
  if (response?.error) throw new Error(`${github}: ${response.error}`);
  const repo = response?.repo;
  if (!repo || !['stargazers_count', 'forks_count', 'open_issues_count'].every(
    (key) => Number.isSafeInteger(repo[key]) && repo[key] >= 0,
  ) || !Number.isFinite(Date.parse(repo.pushed_at))) {
    throw new Error(`Invalid or missing repository metrics for ${github}.`);
  }
  // null means GitHub returned 404 (no published release). Missing is an error.
  if (response.release !== null && (!response.release?.tag_name || !Number.isFinite(Date.parse(response.release.published_at)))) {
    throw new Error(`Invalid or missing release response for ${github}.`);
  }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  if (args.length && (args.length !== 2 || args[0] !== '--snapshot')) {
    throw new Error('Usage: pnpm run enrich [--snapshot FILE]');
  }
  const snapshot = args.length ? JSON.parse(fs.readFileSync(args[1], 'utf8')) : null;
  if (!snapshot && !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required. Agents should use pnpm run enrich:vault.');
  }
  const now = snapshot ? new Date(snapshot.collected_at) : new Date();
  if (!Number.isFinite(now.getTime()) || now.getTime() > Date.now() + 60000 || Date.now() - now.getTime() > DAY) {
    throw new Error('The GitHub snapshot must have been collected within the last 24 hours.');
  }
  const history = fs.existsSync(HISTORY_PATH) ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')) : {};
  const files = fs.readdirSync(PROJECTS_DIR).filter((file) => /\.ya?ml$/.test(file)).sort();
  const activity = fs.existsSync(ACTIVITY_PATH) ? JSON.parse(fs.readFileSync(ACTIVITY_PATH, 'utf8')) : {};
  const pending = new Map();
  const projects = [];
  const today = now.toISOString().slice(0, 10);

  // Fetch and validate the complete batch before touching any saved data.
  for (const file of files) {
    const filePath = path.join(PROJECTS_DIR, file);
    const project = yaml.load(fs.readFileSync(filePath, 'utf8'));
    projects.push(project);
    if (!project.github) continue;
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(project.github)) throw new Error(`Invalid repository: ${project.github}`);
    const response = snapshot ? snapshot.repositories?.[project.github] : {
      repo: await githubFetch(`/repos/${project.github}`, true),
      release: await githubFetch(`/repos/${project.github}/releases/latest`, true),
    };
    if (response?.repo === null && (response.repo_status === 404 || !snapshot)) {
      if (!project.github_data?.last_enriched) throw new Error(`No historical metrics for unavailable repository ${project.github}.`);
      project.github_data = { ...project.github_data, availability: 'unavailable', last_checked: now.toISOString(), star_growth_7d: null };
      pending.set(filePath, yaml.dump(project, { lineWidth: -1, quotingType: '"', noRefs: true, sortKeys: false }));
      console.log(`${project.slug}: unavailable on GitHub; retaining metrics dated ${project.github_data.last_enriched}`);
      continue;
    }
    validateResponse(project.github, response);
    const { repo, release } = response;
    if (project.github_data?.repository_id && project.github_data.repository_id !== repo.id) {
      throw new Error(`Repository identity changed for ${project.github}; verify a transfer or reused URL before refreshing.`);
    }
    const weeks = snapshot ? response.star_weeks : await fetchStarWeeks(project.github);
    const dates = dailyStarActivity(weeks, now.toISOString(), repo.created_at);
    if (!Object.keys(dates).length && repo.stargazers_count > 0 && repo.created_at?.slice(0, 10) < today) {
      throw new Error(`Empty star history for ${project.github}`);
    }
    activity[repo.id] = dates;
    const snapshots = history[project.github] ?? [];
    const growth = calculateStarGrowth7d(snapshots, repo.stargazers_count, now);
    history[project.github] = [
      ...snapshots.filter((entry) => entry.date !== today),
      { stars: repo.stargazers_count, date: today },
    ].sort((a, b) => a.date.localeCompare(b.date));
    project.github_data = {
      repository_id: repo.id,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      license: repo.license?.spdx_id ?? null,
      topics: repo.topics ?? [],
      last_commit: repo.pushed_at,
      latest_release: release?.tag_name ?? null,
      latest_release_date: release?.published_at ?? null,
      star_growth_7d: growth,
      last_enriched: now.toISOString(),
      last_checked: now.toISOString(),
      availability: 'available',
    };
    pending.set(filePath, yaml.dump(project, { lineWidth: -1, quotingType: '"', noRefs: true, sortKeys: false }));
    console.log(`${project.slug}: ${repo.stargazers_count} stars`);
  }
  const leaderboard = buildLeaderboard(projects);
  pending.set(ACTIVITY_PATH, JSON.stringify(activity, null, 2) + '\n');
  pending.set(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n');
  pending.set(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2) + '\n');
  fs.mkdirSync(path.dirname(LEADERBOARD_PATH), { recursive: true });
  const originals = new Map([...pending.keys()].map((file) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]));
  try {
    for (const [file, content] of pending) {
      fs.writeFileSync(`${file}.tmp`, content);
      fs.renameSync(`${file}.tmp`, file);
    }
  } catch (error) {
    for (const [file, content] of originals) {
      if (content === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, content);
      fs.rmSync(`${file}.tmp`, { force: true });
    }
    throw error;
  }
  console.log(`Enriched all ${leaderboard.count} projects; saved leaderboard and star history.`);
}

main().catch((error) => {
  console.error(`Enrichment failed: ${error.message}`);
  process.exitCode = 1;
});
