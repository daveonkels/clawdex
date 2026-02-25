import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

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
  tier: 1 | 2 | 3;
  highlight: string;
  emoji: string;
  added: string;
}

export function loadProjects(): Project[] {
  const dir = path.join(process.cwd(), 'src', 'data', 'projects');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return yaml.load(content) as Project;
  }).sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });
}

export function getUniqueLanguages(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.language))].sort();
}

export function getUniqueCategories(projects: Project[]): string[] {
  return [...new Set(projects.flatMap(p => p.category))].sort();
}

export function getUniqueTiers(projects: Project[]): number[] {
  return [...new Set(projects.map(p => p.tier))].sort();
}

export function getUniqueStatuses(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.status))].sort();
}
