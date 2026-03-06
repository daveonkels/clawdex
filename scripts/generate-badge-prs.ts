/**
 * Generate PR-ready badge markdown snippets for all tracked projects.
 * Output: dist/badge-prs/<slug>.md + dist/badge-prs/checklist.md
 *
 * Usage: npx tsx scripts/generate-badge-prs.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

interface Project {
  name: string;
  slug: string;
  github?: string;
}

const projectsDir = path.join(process.cwd(), 'src', 'data', 'projects');
const outDir = path.join(process.cwd(), 'dist', 'badge-prs');

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
const projects: Project[] = files.map(f => yaml.load(fs.readFileSync(path.join(projectsDir, f), 'utf-8')) as Project);

const checklist: string[] = [
  '# Shelldex Badge PR Checklist',
  '',
  `Generated: ${new Date().toISOString().split('T')[0]}`,
  '',
  '| Project | GitHub | Badge PR Status |',
  '|---------|--------|-----------------|',
];

for (const p of projects) {
  if (!p.github || p.slug === 'openclaw') continue;

  const badgeUrl = `https://shelldex.com/badges/shelldex-badge.svg`;
  const profileUrl = `https://shelldex.com/projects/${p.slug}/`;
  const repoUrl = `https://github.com/${p.github}`;

  const snippet = [
    `# Shelldex Badge for ${p.name}`,
    '',
    '## Badge Markdown',
    '',
    'Add this to your README.md:',
    '',
    '```markdown',
    `[![Listed on Shelldex](${badgeUrl})](${profileUrl})`,
    '```',
    '',
    '## PR Description',
    '',
    `Add a [Shelldex](https://shelldex.com) badge linking to the project's profile page.`,
    '',
    `[Shelldex](https://shelldex.com) is a community directory tracking the OpenClaw ecosystem.`,
    `${p.name} is listed at ${profileUrl}`,
    '',
    '---',
    `Repository: ${repoUrl}`,
    `Profile: ${profileUrl}`,
  ].join('\n');

  fs.writeFileSync(path.join(outDir, `${p.slug}.md`), snippet);
  checklist.push(`| ${p.name} | [${p.github}](${repoUrl}) | [ ] Pending |`);
}

fs.writeFileSync(path.join(outDir, 'checklist.md'), checklist.join('\n'));

console.log(`Generated ${projects.filter(p => p.github && p.slug !== 'openclaw').length} badge PR snippets in ${outDir}`);
