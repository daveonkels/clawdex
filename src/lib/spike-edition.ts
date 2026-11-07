import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Project } from './projects';

export const csvUrl = '/analysis/data/daily-stars-2026-11-07.csv';
const firstDay = Date.UTC(2026, 9, 8);
const expectedDates = Array.from({ length: 30 }, (_, i) =>
  new Date(firstDay + i * 86_400_000).toISOString().slice(0, 10)
);

export interface EditionRow {
  slug: string;
  name: string;
  linked: boolean;
  days: { date: string; count: number }[];
  total: number;
  top: number;
  share: number;
  lastWeek: number;
}

export function editionRows(projects: Project[], csv = readFileSync(join(process.cwd(), 'public', csvUrl), 'utf8')): EditionRow[] {
  const groups = new Map<string, { repo: string; values: Map<string, number> }>();
  for (const line of csv.trim().split(/\r?\n/).slice(1)) {
    const [slug, repo, date, value] = line.split(',');
    const group = groups.get(slug) ?? { repo, values: new Map<string, number>() };
    const count = Number(value);
    if (!expectedDates.includes(date) || !/^\d+$/.test(value ?? '') || !Number.isSafeInteger(count) || group.values.has(date) || repo !== group.repo) {
      throw new Error('Invalid daily star observation for ' + slug + ' on ' + date);
    }
    group.values.set(date, count);
    groups.set(slug, group);
  }
  return Array.from(groups, ([slug, { repo, values }]) => {
    if (values.size !== expectedDates.length) throw new Error('Incomplete edition history for ' + slug);
    const days = expectedDates.map(date => ({ date, count: values.get(date)! }));
    const counts = days.map(d => d.count).sort((a, b) => b - a);
    const total = counts.reduce((a, b) => a + b, 0);
    const top = counts.slice(0, 3).reduce((a, b) => a + b, 0);
    const lastWeek = days.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const project = projects.find(p => p.slug === slug);
    return { slug, name: project?.name ?? repo.split('/')[1], linked: !!project, days, total, top, share: total ? 100 * top / total : 0, lastWeek };
  }).sort((a, b) => b.total - a.total || a.slug.localeCompare(b.slug));
}
