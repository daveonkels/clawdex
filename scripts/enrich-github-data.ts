import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// ── Paths ──────────────────────────────────────────────────────────────────────
const PROJECTS_DIR = path.join(process.cwd(), 'src', 'data', 'projects');
const GENERATED_DIR = path.join(process.cwd(), 'src', 'data', 'generated');
const HISTORY_PATH = path.join(process.cwd(), '.enrichment-history.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

// ── Types ──────────────────────────────────────────────────────────────────────
interface GitHubData {
  stars: number;
  forks: number;
  open_issues: number;
  license: string | null;
  topics: string[];
  last_commit: string;
  latest_release: string | null;
  latest_release_date: string | null;
  star_growth_7d: number | null;
  last_enriched: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  slug: string;
  emoji: string;
  language: string;
  github: string;
  stars: number;
  forks: number;
  open_issues: number;
  star_growth_7d: number | null;
  latest_release: string | null;
  latest_release_date: string | null;
  last_commit: string;
  license: string | null;
  health: {
    issues_stars_ratio: number;
    days_since_last_release: number | null;
    days_since_last_commit: number;
  };
}

interface HistorySnapshot {
  stars: number;
  date: string;
}

// ── Rate-limit tracking ────────────────────────────────────────────────────────
let remainingRequests = 5000;
let resetTime = 0;

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'shelldex-enrichment/1.0',
  };
  if (GITHUB_TOKEN) {
    h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  return h;
}

async function githubFetch(endpoint: string): Promise<any> {
  // Pause if approaching rate limit
  if (remainingRequests <= 10 && resetTime > 0) {
    const waitMs = Math.max(0, resetTime * 1000 - Date.now()) + 1000;
    console.log(`  ⏳ Rate limit near — waiting ${Math.ceil(waitMs / 1000)}s...`);
    await new Promise(r => setTimeout(r, waitMs));
  }

  const url = `${GITHUB_API}${endpoint}`;
  const res = await fetch(url, { headers: apiHeaders() });

  // Update rate-limit counters from response headers
  const remaining = res.headers.get('x-ratelimit-remaining');
  const reset = res.headers.get('x-ratelimit-reset');
  if (remaining) remainingRequests = parseInt(remaining, 10);
  if (reset) resetTime = parseInt(reset, 10);

  if (res.status === 404) return null;

  if (res.status === 403 && remainingRequests === 0) {
    const waitMs = Math.max(0, resetTime * 1000 - Date.now()) + 1000;
    console.log(`  ⛔ Rate limited — waiting ${Math.ceil(waitMs / 1000)}s then retrying...`);
    await new Promise(r => setTimeout(r, waitMs));
    return githubFetch(endpoint);
  }

  if (!res.ok) {
    console.warn(`  ⚠ GitHub API ${res.status} for ${endpoint}`);
    return null;
  }

  return res.json();
}

// ── Star-growth history ────────────────────────────────────────────────────────
function loadHistory(): Record<string, HistorySnapshot[]> {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveHistory(history: Record<string, HistorySnapshot[]>): void {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

function calculateStarGrowth7d(
  snapshots: HistorySnapshot[],
  currentStars: number,
): number | null {
  if (snapshots.length === 0) return null;

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Find snapshot closest to 7 days ago
  let best: HistorySnapshot | null = null;
  let bestDiff = Infinity;

  for (const snap of snapshots) {
    const t = new Date(snap.date).getTime();
    const diff = Math.abs(t - sevenDaysAgo);
    if (diff < bestDiff && t <= now) {
      bestDiff = diff;
      best = snap;
    }
  }

  if (!best) return null;

  // Only meaningful if snapshot is within 10 days of target window
  if (bestDiff > 10 * 24 * 60 * 60 * 1000) return null;

  return currentStars - best.stars;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

// ── Enrich a single project ────────────────────────────────────────────────────
async function enrichProject(
  github: string,
  history: Record<string, HistorySnapshot[]>,
): Promise<GitHubData | null> {
  console.log(`  Fetching /repos/${github} ...`);
  const repo = await githubFetch(`/repos/${github}`);
  if (!repo) return null;

  console.log(`  Fetching /repos/${github}/releases/latest ...`);
  const release = await githubFetch(`/repos/${github}/releases/latest`);

  const stars: number = repo.stargazers_count ?? 0;
  const today = new Date().toISOString().split('T')[0];

  // Record today's snapshot
  if (!history[github]) history[github] = [];
  const existing = history[github].find((s: HistorySnapshot) => s.date === today);
  if (existing) {
    existing.stars = stars;
  } else {
    history[github].push({ stars, date: today });
  }

  // Prune history older than 30 days
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  history[github] = history[github].filter(
    (s: HistorySnapshot) => new Date(s.date).getTime() >= cutoff,
  );

  return {
    stars,
    forks: repo.forks_count ?? 0,
    open_issues: repo.open_issues_count ?? 0,
    license: repo.license?.spdx_id ?? null,
    topics: repo.topics ?? [],
    last_commit: repo.pushed_at ?? '',
    latest_release: release?.tag_name ?? null,
    latest_release_date: release?.published_at ?? null,
    star_growth_7d: calculateStarGrowth7d(history[github], stars),
    last_enriched: new Date().toISOString(),
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('Shelldex GitHub Data Enrichment');
  console.log('================================\n');

  if (!GITHUB_TOKEN) {
    console.warn('⚠ No GITHUB_TOKEN set — rate limit is 60 req/hr.');
    console.warn('  Set GITHUB_TOKEN for 5 000 req/hr.\n');
  }

  // Ensure output directory
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const history = loadHistory();
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f: string) => f.endsWith('.yml') || f.endsWith('.yaml'));

  console.log(`Found ${files.length} project files.\n`);

  const leaderboard: LeaderboardEntry[] = [];

  for (const file of files) {
    const filePath = path.join(PROJECTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const project = yaml.load(raw) as Record<string, any>;

    console.log(`[${project.name}]`);

    if (!project.github) {
      console.log('  No github field — skipping.\n');
      continue;
    }

    const data = await enrichProject(project.github, history);
    if (!data) {
      console.log('  Failed to fetch — skipping.\n');
      continue;
    }

    // Write github_data back into the YAML
    project.github_data = {
      stars: data.stars,
      forks: data.forks,
      open_issues: data.open_issues,
      license: data.license,
      topics: data.topics,
      last_commit: data.last_commit,
      latest_release: data.latest_release,
      latest_release_date: data.latest_release_date,
      star_growth_7d: data.star_growth_7d,
      last_enriched: data.last_enriched,
    };

    const updatedYaml = yaml.dump(project, {
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: false,
      noRefs: true,
      sortKeys: false,
    });
    fs.writeFileSync(filePath, updatedYaml);

    console.log(`  ★ ${data.stars} | Forks: ${data.forks} | Issues: ${data.open_issues}`);
    if (data.latest_release) console.log(`  Release: ${data.latest_release}`);
    if (data.star_growth_7d !== null) {
      const sign = data.star_growth_7d > 0 ? '+' : '';
      console.log(`  7d growth: ${sign}${data.star_growth_7d}`);
    }
    console.log();

    // Build leaderboard entry
    const daysCommit = daysSince(data.last_commit) ?? 999;
    const daysRelease = daysSince(data.latest_release_date);

    leaderboard.push({
      rank: 0,
      name: project.name,
      slug: project.slug,
      emoji: project.emoji,
      language: project.language,
      github: project.github,
      stars: data.stars,
      forks: data.forks,
      open_issues: data.open_issues,
      star_growth_7d: data.star_growth_7d,
      latest_release: data.latest_release,
      latest_release_date: data.latest_release_date,
      last_commit: data.last_commit,
      license: data.license,
      health: {
        issues_stars_ratio: data.stars > 0
          ? parseFloat((data.open_issues / data.stars).toFixed(4))
          : 0,
        days_since_last_release: daysRelease,
        days_since_last_commit: daysCommit,
      },
    });
  }

  // Sort by stars descending and assign ranks
  leaderboard.sort((a, b) => b.stars - a.stars);
  leaderboard.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  // Write leaderboard JSON
  const leaderboardPath = path.join(GENERATED_DIR, 'leaderboard.json');
  fs.writeFileSync(
    leaderboardPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        count: leaderboard.length,
        entries: leaderboard,
      },
      null,
      2,
    ),
  );

  // Persist star history
  saveHistory(history);

  console.log('================================');
  console.log(`Enriched ${leaderboard.length} projects.`);
  console.log(`Leaderboard → ${leaderboardPath}`);
  console.log(`History    → ${HISTORY_PATH}`);
}

main().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
