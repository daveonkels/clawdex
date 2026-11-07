import type { APIRoute } from 'astro';
import { loadLeaderboard } from '../../lib/compare';
import { languageLabel } from '../../lib/constants';
import { issueBand, rankingSignals } from '../../lib/leaderboard-display';
import { loadProjects } from '../../lib/projects';

export const GET: APIRoute = async () => {
  const { entries, generated } = loadLeaderboard();
  const projects = await loadProjects();
  const ranked = entries.filter(e => e.rank != null && e.availability !== 'unavailable' && e.status !== 'archived');
  const historical = entries.filter(e => e.rank == null || e.availability === 'unavailable' || e.status === 'archived');
  const signals = rankingSignals(ranked, projects, generated);
  const hasMonth = signals.size > 0;
  const hasWeek = ranked.some(e => e.star_growth_7d != null);
  const fields = ['Star rank', 'Agent', 'Language', 'Stars', ...(hasMonth ? ['30-day rank', 'Added in 30 days', 'Days with additions', 'Rank gap'] : []),
    ...(hasWeek ? ['Net in 7 days'] : []), 'Forks', 'Release', 'Last push', 'Open items', 'Issue load'];
  const row = (values: (string | number | null | undefined)[]) => '| ' + values.map(v => String(v ?? '—').replace(/\|/g, '\\|')).join(' | ') + ' |';
  const profile = (e: typeof entries[number]) => `[${e.name}](https://shelldex.com/projects/${e.slug}/)`;
  const out = [
    '# Shelldex leaderboard', '',
    `${ranked.length} available agents ranked by GitHub stars. Stars measure interest in a repository.`, '',
    `Metrics checked ${generated.slice(0,10)}. [How we measure](https://shelldex.com/methodology/)`, '',
    'Issue load compares open issues and pull requests with stars. Low: under 1%. Moderate: 1% to under 5%. High: 5% or more.',
    ...(hasMonth ? ['30-day additions count new stars still present at the latest check. Incomplete windows are omitted.',
      `The rank gap compares total-star rank with 30-day rank across the same ${signals.size} complete records. Positive means a higher position for new stars. Ties share a position. Days with additions counts days with at least one new star.`] : []),
    ...(!hasWeek ? ['Seven-day net change needs snapshots a week apart.'] : []), '',
    '[Sortable leaderboard](https://shelldex.com/leaderboard/) · [Download JSON](https://shelldex.com/api/leaderboard.json)', '',
    row(fields), row(fields.map(() => '---')),
    ...ranked.map(e => { const signal = signals.get(e.slug); return row([e.rank, profile(e), languageLabel[e.language] ?? e.language, e.stars,
      ...(hasMonth ? [signal?.monthRank, signal?.additions, signal?.daysWithAdditions, signal?.gap] : []), ...(hasWeek ? [e.star_growth_7d] : []),
      e.forks, e.latest_release, e.last_commit?.slice(0,10), e.open_issues, issueBand(e.health.issues_stars_ratio, e.stars > 0).name]); }),
  ];
  if (historical.length) out.push('', '## Historical projects', '',
    ...historical.map(e => `- ${profile(e)} (${e.availability === 'unavailable' ? 'unavailable' : 'archived'}) has no current rank. Last recorded: ${e.stars} stars on ${e.last_enriched.slice(0,10)}. Last push: ${e.last_commit?.slice(0,10) || 'unknown'}.`));
  return new Response(out.join('\n') + '\n', {headers:{'Content-Type':'text/markdown; charset=utf-8'}});
};
