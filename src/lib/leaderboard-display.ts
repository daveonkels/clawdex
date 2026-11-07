import activityByRepo from '../data/star-activity.json';
import type { Project } from './projects';
import { recentStarActivity } from './star-activity.js';

export const issueBands = [
  { name: 'Low', glyph: '●', tone: 'low', range: 'under 1%' },
  { name: 'Moderate', glyph: '◐', tone: 'moderate', range: '1% to under 5%' },
  { name: 'High', glyph: '▲', tone: 'high', range: '5% or more' },
];

export function issueBand(ratio?: number | null, available = true) {
  if (!available || ratio == null || !Number.isFinite(ratio)) {
    return { name: 'Unavailable', glyph: '–', tone: 'unknown' };
  }
  return issueBands[ratio < 0.01 ? 0 : ratio < 0.05 ? 1 : 2];
}

export function reportedDays(project: Project | undefined, asOf: string, length = 30): {date: string; stars: number}[] {
  const id = project?.github_data?.repository_id;
  if (!id || project?.github_data?.availability === 'unavailable') return [];
  return recentStarActivity((activityByRepo as Record<string, Record<string, number>>)[id], asOf, length);
}

// Compare both rankings within the same set of current repositories with all 30 days.
// Equal totals share a position (1, 2, 2, 4). A missing day never counts as zero.
export function rankingSignals(entries: { slug: string; stars: number }[], projects: Project[], asOf: string) {
  const bySlug = new Map(projects.map(project => [project.slug, project]));
  const complete = entries.flatMap(entry => {
    const days = reportedDays(bySlug.get(entry.slug), asOf);
    if (days.length !== 30) return [];
    return [{
      slug: entry.slug, stars: entry.stars,
      additions: days.reduce((sum, day) => sum + day.stars, 0),
      daysWithAdditions: days.filter(day => day.stars > 0).length,
    }];
  });
  function positions(values: number[]) {
    const ranks = new Map<number, number>();
    for (const [index, value] of [...values].sort((a, b) => b - a).entries()) {
      if (!ranks.has(value)) ranks.set(value, index + 1);
    }
    return ranks;
  }
  const starRanks = positions(complete.map(e => e.stars));
  const monthRanks = positions(complete.map(e => e.additions));
  return new Map(complete.map(entry => {
    const starRank = starRanks.get(entry.stars)!;
    const monthRank = monthRanks.get(entry.additions)!;
    return [entry.slug, {...entry, starRank, monthRank, gap: starRank - monthRank}];
  }));
}
