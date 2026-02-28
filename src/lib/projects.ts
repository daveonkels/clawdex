import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface GitHubData {
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

export interface Project {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  language: string;
  category: string[];
  github?: string;
  website?: string;
  status: 'active' | 'experimental' | 'archived';
  highlight: string;
  emoji: string;
  added: string;
  stars?: number;
  github_data?: GitHubData;
}

const STARS_CACHE_PATH = path.join(process.cwd(), '.stars-cache.json');
const CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

async function fetchStars(github: string): Promise<number | undefined> {
  try {
    const res = await fetch(`https://api.github.com/repos/${github}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) return undefined;
    const data = await res.json() as { stargazers_count?: number };
    return data.stargazers_count;
  } catch {
    return undefined;
  }
}

function loadStarsCache(): Record<string, { stars: number; fetched: number }> {
  try {
    const raw = fs.readFileSync(STARS_CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStarsCache(cache: Record<string, { stars: number; fetched: number }>) {
  fs.writeFileSync(STARS_CACHE_PATH, JSON.stringify(cache, null, 2));
}

export async function loadProjects(): Promise<Project[]> {
  const dir = path.join(process.cwd(), 'src', 'data', 'projects');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  const projects = files.map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return yaml.load(content) as Project;
  });

  // Fetch stars with caching
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
        project.stars = cached.stars; // use stale cache on failure
      }
    }
  }

  saveStarsCache(cache);

  return projects.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
}

export function getUniqueLanguages(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.language))].sort();
}

export function getUniqueCategories(projects: Project[]): string[] {
  return [...new Set(projects.flatMap(p => p.category))].sort();
}

export function getUniqueStatuses(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.status))].sort();
}

export function formatStars(stars: number): string {
  if (stars >= 1000) return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
  return String(stars);
}
