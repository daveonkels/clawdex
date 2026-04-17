import type { APIRoute } from 'astro';
import { loadLeaderboard, computeHealthScore } from '../../lib/compare';
import { formatStars } from '../../lib/projects';

export const GET: APIRoute = async () => {
  const { entries } = loadLeaderboard();

  const out: string[] = [];
  out.push('# Shelldex Leaderboard');
  out.push('');
  out.push('> Ranked by GitHub stars with health scores derived from commit recency, issue ratio, release cadence, and 7-day star growth.');
  out.push('');
  out.push(`Canonical HTML: https://shelldex.com/leaderboard/`);
  out.push(`JSON: https://shelldex.com/api/leaderboard.json`);
  out.push('');
  out.push('| Rank | Project | Language | Stars | 7d growth | Health | License |');
  out.push('| ---: | --- | --- | ---: | ---: | ---: | --- |');
  for (const e of entries) {
    const growth = e.star_growth_7d == null ? '' : (e.star_growth_7d >= 0 ? `+${e.star_growth_7d}` : String(e.star_growth_7d));
    out.push(`| ${e.rank} | [${e.name}](https://shelldex.com/projects/${e.slug}/) | ${e.language} | ${formatStars(e.stars)} | ${growth} | ${computeHealthScore(e)}/100 | ${e.license ?? '—'} |`);
  }
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
