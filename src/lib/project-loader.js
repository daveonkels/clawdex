import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export function loadProjectFiles() {
  const dir = path.join(process.cwd(), 'src', 'data', 'projects');
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .sort()
    .map((file) => yaml.load(fs.readFileSync(path.join(dir, file), 'utf-8')));
}

// All pages use the same saved snapshot. Network access belongs to enrichment.
export async function loadProjects() {
  return loadProjectFiles()
    .map((project) => ({ ...project, stars: project.github_data?.stars ?? project.stars ?? 0 }))
    .sort((a, b) => b.stars - a.stars || a.slug.localeCompare(b.slug));
}
