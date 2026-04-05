import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const STARS_CACHE_PATH = path.join(process.cwd(), '.stars-cache.json');
const CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

async function fetchStars(github) {
  try {
    const res = await fetch(`https://api.github.com/repos/${github}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.stargazers_count;
  } catch {
    return undefined;
  }
}

function loadStarsCache() {
  try {
    const raw = fs.readFileSync(STARS_CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStarsCache(cache) {
  try {
    fs.writeFileSync(STARS_CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // Cache persistence is optional. Builds should not fail because the filesystem is grumpy.
  }
}

export function loadProjectFiles() {
  const dir = path.join(process.cwd(), 'src', 'data', 'projects');
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return yaml.load(content);
  });
}

export async function loadProjects() {
  const projects = loadProjectFiles();
  const cache = loadStarsCache();
  const now = Date.now();

  for (const project of projects) {
    if (!project.github) continue;
    const cached = cache[project.github];
    if (cached && (now - cached.fetched) < CACHE_MAX_AGE_MS) {
      project.stars = cached.stars;
    } else {
      const stars = await fetchStars(project.github);
      if (stars !== undefined) {
        project.stars = stars;
        cache[project.github] = { stars, fetched: now };
      } else if (cached) {
        project.stars = cached.stars;
      }
    }
  }

  saveStarsCache(cache);

  return projects.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
}
