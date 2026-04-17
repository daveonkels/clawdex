import type { APIRoute } from 'astro';
import { loadProjects, formatStars } from '../lib/projects';
import { loadLeaderboard, getIndexableComparePairs } from '../lib/compare';

export const GET: APIRoute = async () => {
  const projects = await loadProjects();
  const leaderboard = loadLeaderboard();
  const pairs = getIndexableComparePairs(projects);
  const generated = new Date().toISOString();

  const lines: string[] = [];
  lines.push('# Shelldex — Full Registry (llms-full.txt)');
  lines.push('');
  lines.push(`> Complete snapshot of every project tracked in the OpenClaw ecosystem registry at shelldex.com. Generated ${generated}.`);
  lines.push('');
  lines.push('This file concatenates the entire Shelldex registry into a single plain-text document optimized for LLM ingestion. See https://shelldex.com/llms.txt for the navigation hub and https://shelldex.com/AGENTS.md for the full index of machine-readable resources.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Registry summary');
  lines.push('');
  lines.push(`- Projects tracked: ${projects.length}`);
  const totalStars = projects.reduce((s, p) => s + (p.stars ?? 0), 0);
  lines.push(`- Combined GitHub stars: ${totalStars.toLocaleString()}`);
  const languages = [...new Set(projects.map(p => p.language))].sort();
  lines.push(`- Languages represented: ${languages.join(', ')}`);
  lines.push(`- Indexable comparison pairs: ${pairs.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Projects');
  lines.push('');

  for (const p of projects) {
    lines.push(`### ${p.name}`);
    lines.push('');
    lines.push(`- Slug: \`${p.slug}\``);
    lines.push(`- Tagline: ${p.tagline}`);
    lines.push(`- URL: https://shelldex.com/projects/${p.slug}/`);
    lines.push(`- JSON: https://shelldex.com/api/projects/${p.slug}.json`);
    lines.push(`- Markdown: https://shelldex.com/md/projects/${p.slug}.md`);
    if (p.github) lines.push(`- GitHub: https://github.com/${p.github}`);
    if (p.website) lines.push(`- Website: ${p.website}`);
    lines.push(`- Language: ${p.language}`);
    lines.push(`- Status: ${p.status}`);
    if (p.ecosystem_role) lines.push(`- Ecosystem role: ${p.ecosystem_role}`);
    if (p.category?.length) lines.push(`- Categories: ${p.category.join(', ')}`);
    if (p.platform?.length) lines.push(`- Platforms: ${p.platform.join(', ')}`);
    if (p.mcp_support) lines.push(`- MCP support: yes`);
    if (p.requires_llm !== undefined) lines.push(`- Requires external LLM: ${p.requires_llm ? 'yes' : 'no'}`);
    const gd = p.github_data;
    const stars = gd?.stars ?? p.stars;
    if (stars != null) lines.push(`- Stars: ${formatStars(stars)} (${stars.toLocaleString()})`);
    if (gd?.forks != null) lines.push(`- Forks: ${gd.forks.toLocaleString()}`);
    if (gd?.open_issues != null) lines.push(`- Open issues: ${gd.open_issues.toLocaleString()}`);
    if (gd?.license) lines.push(`- License: ${gd.license}`);
    if (gd?.last_commit) lines.push(`- Last commit: ${gd.last_commit}`);
    if (gd?.star_growth_7d != null) lines.push(`- Star growth (7d): ${gd.star_growth_7d >= 0 ? '+' : ''}${gd.star_growth_7d}`);
    if (p.perf?.binary_size) lines.push(`- Binary size: ${p.perf.binary_size}`);
    if (p.perf?.startup_time) lines.push(`- Startup time: ${p.perf.startup_time}`);
    if (p.perf?.ram) lines.push(`- RAM: ${p.perf.ram}`);
    if (p.added) lines.push(`- Added to registry: ${p.added}`);
    lines.push('');
    if (p.description) {
      lines.push(p.description);
      lines.push('');
    }
    if (p.highlight) {
      lines.push(`**Highlight:** ${p.highlight}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  lines.push('## Leaderboard (by stars)');
  lines.push('');
  for (const entry of leaderboard.entries.slice(0, 50)) {
    lines.push(`${entry.rank}. ${entry.name} — ${entry.stars.toLocaleString()} stars, ${entry.language}, license: ${entry.license ?? 'unspecified'}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Indexable comparison pages');
  lines.push('');
  for (const pair of pairs) {
    lines.push(`- https://shelldex.com/compare/${pair.canonical}/ — ${pair.slugA} vs ${pair.slugB}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
