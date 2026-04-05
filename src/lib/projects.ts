import { loadProjects as loadProjectsData } from './project-loader.js';

export type Platform = 'server' | 'browser' | 'embedded' | 'serverless' | 'messaging' | 'desktop';

export type EcosystemRole = 'reference' | 'fork' | 'reimplementation' | 'derivative' | 'infrastructure' | 'alternative';

export interface PerfProfile {
  binary_size?: string;
  startup_time?: string;
  ram?: string;
}

export type MentionType = 'tweet' | 'article' | 'video' | 'post';

export interface Mention {
  type: MentionType;
  url: string;
  author: string;
  author_url?: string;
  title?: string;
  date: string;
  quote?: string;
  thumbnail?: string;
  source?: string;
}

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
  tier?: number;
  stars?: number;
  github_data?: GitHubData;
  platform?: Platform[];
  requires_llm?: boolean;
  mcp_support?: boolean;
  integration_count?: number;
  perf?: PerfProfile;
  ecosystem_role?: EcosystemRole;
  mentions?: Mention[];
  slug_aliases?: string[];
}

export async function loadProjects(): Promise<Project[]> {
  return await loadProjectsData() as Project[];
}

export function getUniqueLanguages(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.language))].sort();
}

export function getUniqueCategories(projects: Project[]): string[] {
  return [...new Set(projects.flatMap(p => p.category))].sort();
}

export function getUniquePlatforms(projects: Project[]): Platform[] {
  return [...new Set(projects.flatMap(p => p.platform ?? []))].sort() as Platform[];
}

export function getUniqueStatuses(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.status))].sort();
}

export function formatStars(stars: number): string {
  if (stars >= 1000) return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
  return String(stars);
}
