import type { APIRoute, GetStaticPaths } from 'astro';
import { loadProjects, formatStars } from '../../../lib/projects';
import {
  loadLeaderboard,
  computeHealthScore,
  generateKeyDifferences,
  getIndexableComparePairs,
} from '../../../lib/compare';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await loadProjects();
  return getIndexableComparePairs(projects).map((pair) => ({
    params: { pair: pair.canonical },
    props: { pair },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const pair = (props as any).pair;
  const projects = await loadProjects();
  const a = projects.find((p) => p.slug === pair.slugA)!;
  const b = projects.find((p) => p.slug === pair.slugB)!;
  const { entries } = loadLeaderboard();
  const aEntry = entries.find((e) => e.slug === a.slug) ?? null;
  const bEntry = entries.find((e) => e.slug === b.slug) ?? null;
  const diffs = generateKeyDifferences(a, b, aEntry, bEntry);

  const out: string[] = [];
  out.push(`# ${a.name} vs ${b.name}`);
  out.push('');
  out.push(`> Side-by-side comparison of two projects in the OpenClaw ecosystem.`);
  out.push('');
  out.push(`Canonical HTML: https://shelldex.com/compare/${pair.canonical}/`);
  out.push(`JSON: https://shelldex.com/api/compare/${pair.canonical}.json`);
  out.push('');
  out.push('| Field | ' + a.name + ' | ' + b.name + ' |');
  out.push('| --- | --- | --- |');
  out.push(`| Tagline | ${a.tagline} | ${b.tagline} |`);
  out.push(`| Language | ${a.language} | ${b.language} |`);
  out.push(`| Status | ${a.status} | ${b.status} |`);
  out.push(`| Stars | ${formatStars(a.github_data?.stars ?? a.stars ?? 0)} | ${formatStars(b.github_data?.stars ?? b.stars ?? 0)} |`);
  out.push(`| Forks | ${a.github_data?.forks ?? '—'} | ${b.github_data?.forks ?? '—'} |`);
  out.push(`| Open issues | ${a.github_data?.open_issues ?? '—'} | ${b.github_data?.open_issues ?? '—'} |`);
  out.push(`| License | ${a.github_data?.license ?? '—'} | ${b.github_data?.license ?? '—'} |`);
  out.push(`| Last commit | ${a.github_data?.last_commit ?? '—'} | ${b.github_data?.last_commit ?? '—'} |`);
  out.push(`| 7d growth | ${a.github_data?.star_growth_7d ?? '—'} | ${b.github_data?.star_growth_7d ?? '—'} |`);
  out.push(`| MCP support | ${a.mcp_support ? 'yes' : 'no'} | ${b.mcp_support ? 'yes' : 'no'} |`);
  out.push(`| Requires LLM | ${a.requires_llm === false ? 'no' : 'yes'} | ${b.requires_llm === false ? 'no' : 'yes'} |`);
  out.push(`| Platforms | ${(a.platform ?? []).join(', ') || '—'} | ${(b.platform ?? []).join(', ') || '—'} |`);
  out.push(`| Categories | ${a.category.join(', ')} | ${b.category.join(', ')} |`);
  if (aEntry && bEntry) {
    out.push(`| Health score | ${computeHealthScore(aEntry)}/100 | ${computeHealthScore(bEntry)}/100 |`);
    out.push(`| Leaderboard rank | #${aEntry.rank} | #${bEntry.rank} |`);
  }
  out.push('');

  if (diffs.length) {
    out.push('## Key differences');
    out.push('');
    for (const d of diffs) out.push(`- ${d}`);
    out.push('');
  }

  out.push('## Descriptions');
  out.push('');
  out.push(`### ${a.name}`);
  out.push('');
  out.push(a.description);
  out.push('');
  out.push(`### ${b.name}`);
  out.push('');
  out.push(b.description);
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
