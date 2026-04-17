import type { APIRoute, GetStaticPaths } from 'astro';
import { loadProjects, formatStars } from '../../../lib/projects';
import { loadLeaderboard, computeHealthScore } from '../../../lib/compare';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await loadProjects();
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const p = (props as any).project;
  const { entries } = loadLeaderboard();
  const lb = entries.find((e) => e.slug === p.slug) ?? null;
  const stars = p.github_data?.stars ?? p.stars ?? 0;

  const out: string[] = [];
  out.push(`# ${p.emoji} ${p.name}`);
  out.push('');
  out.push(`> ${p.tagline}`);
  out.push('');
  out.push(`Canonical HTML: https://shelldex.com/projects/${p.slug}/`);
  out.push(`JSON: https://shelldex.com/api/projects/${p.slug}.json`);
  out.push('');
  out.push('## Overview');
  out.push('');
  out.push(p.description);
  out.push('');
  if (p.highlight) {
    out.push(`**Highlight:** ${p.highlight}`);
    out.push('');
  }
  out.push('## Metadata');
  out.push('');
  if (p.github) out.push(`- GitHub: https://github.com/${p.github}`);
  if (p.website) out.push(`- Website: ${p.website}`);
  out.push(`- Language: ${p.language}`);
  out.push(`- Status: ${p.status}`);
  if (p.ecosystem_role) out.push(`- Ecosystem role: ${p.ecosystem_role}`);
  if (p.category?.length) out.push(`- Categories: ${p.category.join(', ')}`);
  if (p.platform?.length) out.push(`- Platforms: ${p.platform.join(', ')}`);
  if (p.mcp_support) out.push('- MCP support: yes');
  if (p.requires_llm !== undefined) out.push(`- Requires external LLM: ${p.requires_llm ? 'yes' : 'no'}`);
  if (p.added) out.push(`- Added to registry: ${p.added}`);
  out.push('');

  if (p.github_data) {
    out.push('## GitHub data');
    out.push('');
    out.push(`- Stars: ${formatStars(stars)} (${stars.toLocaleString()})`);
    if (p.github_data.forks != null) out.push(`- Forks: ${p.github_data.forks.toLocaleString()}`);
    if (p.github_data.open_issues != null) out.push(`- Open issues: ${p.github_data.open_issues.toLocaleString()}`);
    if (p.github_data.license) out.push(`- License: ${p.github_data.license}`);
    if (p.github_data.last_commit) out.push(`- Last commit: ${p.github_data.last_commit}`);
    if (p.github_data.latest_release) out.push(`- Latest release: ${p.github_data.latest_release} (${p.github_data.latest_release_date ?? 'unknown date'})`);
    if (p.github_data.star_growth_7d != null) {
      const g = p.github_data.star_growth_7d;
      out.push(`- Star growth (7d): ${g >= 0 ? '+' : ''}${g}`);
    }
    out.push('');
  }

  if (p.perf && (p.perf.binary_size || p.perf.startup_time || p.perf.ram)) {
    out.push('## Performance');
    out.push('');
    if (p.perf.binary_size) out.push(`- Binary size: ${p.perf.binary_size}`);
    if (p.perf.startup_time) out.push(`- Startup time: ${p.perf.startup_time}`);
    if (p.perf.ram) out.push(`- RAM: ${p.perf.ram}`);
    out.push('');
  }

  if (lb) {
    out.push('## Registry position');
    out.push('');
    out.push(`- Leaderboard rank: #${lb.rank}`);
    out.push(`- Health score: ${computeHealthScore(lb)}/100`);
    out.push(`- Days since last commit: ${lb.health.days_since_last_commit}`);
    if (lb.health.days_since_last_release != null) out.push(`- Days since last release: ${lb.health.days_since_last_release}`);
    out.push('');
  }

  if (p.mentions?.length) {
    out.push('## Mentions');
    out.push('');
    for (const m of p.mentions) {
      out.push(`- [${m.title ?? m.url}](${m.url}) — ${m.author}, ${m.date}`);
    }
    out.push('');
  }

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
