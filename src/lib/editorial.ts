import type { Project, GitHubData } from './projects';
import type { LeaderboardEntry } from './compare';
import { languageLabel } from './constants';

const number = (value: number) => value.toLocaleString('en-US');
const list = (items: string[]) => new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(items);
const date = (value: string) => new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });

// The same answers feed visible copy and structured data. Never attach a fixed
// project's description to a winner whose identity can change on refresh.
export function buildEditorial(projects: Project[], entries: LeaderboardEntry[], generated: string) {
  const available = entries.filter(e => e.availability !== 'unavailable' && e.status !== 'archived')
    .sort((a, b) => b.stars - a.stars || a.slug.localeCompare(b.slug));
  const alternatives = available.filter(e => e.slug !== 'openclaw');
  const topAlternatives = alternatives.slice(0, 5);
  const winners = alternatives.filter(e => e.stars === alternatives[0]?.stars);
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.language, (counts.get(p.language) ?? 0) + 1);
  const languages = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const languageSummary = `The ${projects.length} tracked projects span ${languages.length} ${languages.length === 1 ? 'language' : 'languages'}: ${list(languages.map(([lang, count]) => `${languageLabel[lang] ?? lang} (${count})`))}.`;
  const rust = projects.filter(p => p.language === 'rust');
  const rustAnswer = `Shelldex tracks ${rust.length} Rust projects${rust.length ? `: ${list(rust.map(p => p.name))}` : ''}.`;
  const topAlternativesAnswer = topAlternatives.length
    ? `If you want to start with widely followed projects, the ${topAlternatives.length} most-starred alternatives at the latest check were ${list(topAlternatives.map(e => `${e.name} (${number(e.stars)} stars)`))}. Try the same small task in two candidates before choosing.`
    : 'No available repository snapshots are present to rank alternatives.';
  const mostStarredAnswer = winners.length === 1
    ? `${winners[0].name} led the available alternatives with ${number(winners[0].stars)} stars${generated ? ` on ${date(generated)}` : ''}. A GitHub star lets someone bookmark a project.`.trim()
    : winners.length > 1
      ? `Excluding OpenClaw, ${list(winners.map(e => e.name))} are tied for the most saved GitHub stars among available repositories, with ${number(winners[0].stars)} each.`
      : 'No available repository snapshots are present to identify a most-starred alternative.';
  const historical = entries.length - available.length;
  const snapshotNotice = historical
    ? `${historical} archived or unavailable ${historical === 1 ? 'repository keeps its' : 'repositories keep their'} last known counts in historical totals. Current rankings exclude those entries.`
    : 'Rankings use repositories available at this check.';
  const measured = available.filter(e => Number.isFinite(e.star_growth_7d));
  const growthSummary = `Seven-day growth is available for ${measured.length} of ${available.length} available repositories. ${measured.length ? 'Growth comparisons require measurements covering the same week.' : 'There is not enough history to identify a weekly growth leader.'}`;
  return { topAlternatives, topAlternativesAnswer, mostStarredAnswer, languageSummary, rustAnswer, snapshotNotice, growthSummary };
}

// Missing measurements, unavailable repositories, and different observation
// dates cannot support a relative growth claim. Zero is a real measurement.
export function compareWeeklyGrowth(a?: GitHubData, b?: GitHubData): string | null {
  if (!a || !b || a.availability === 'unavailable' || b.availability === 'unavailable'
    || !Number.isFinite(a.star_growth_7d) || !Number.isFinite(b.star_growth_7d)
    || !a.last_enriched || !b.last_enriched
    || a.last_enriched.slice(0, 10) !== b.last_enriched.slice(0, 10)) return null;
  const signed = (n: number) => `${n > 0 ? '+' : ''}${number(n)}`;
  return `Over the seven days ending ${date(a.last_enriched)}, the net star changes were ${signed(a.star_growth_7d!)} and ${signed(b.star_growth_7d!)}, respectively.`;
}
