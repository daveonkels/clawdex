import fs from 'node:fs';
import path from 'node:path';

const HISTORY_PATH = path.join(process.cwd(), '.enrichment-history.json');

/** @type {Record<string, { stars: number; date: string }[]> | null} */
let historyCache = null;

/**
 * @returns {Record<string, { stars: number; date: string }[]>}
 */
export function loadMomentumHistory() {
  if (historyCache) return historyCache;

  try {
    historyCache = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  } catch {
    historyCache = {};
  }

  return historyCache;
}

/**
 * @param {any} item
 * @returns {number}
 */
export function getProjectMomentum(item) {
  const growth = item?.github_data?.star_growth_7d ?? item?.star_growth_7d ?? 0;
  return typeof growth === 'number' && growth > 0 ? growth : 0;
}

/**
 * @param {any[]} items
 * @returns {number}
 */
export function getAverageGrowth7d(items) {
  const values = items
    .map((item) => getProjectMomentum(item))
    .filter((value) => value > 0);

  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * @param {any} project
 * @param {number} averageGrowth7d
 * @returns {number | null}
 */
export function getMomentumRatio(project, averageGrowth7d) {
  const growth = getProjectMomentum(project);
  if (growth <= 0 || averageGrowth7d <= 0) return null;
  return growth / averageGrowth7d;
}

/**
 * @param {any} project
 * @param {Record<string, { stars: number; date: string }[]>} [history]
 * @param {number} [limit]
 * @returns {{ stars: number; date: string }[]}
 */
export function getProjectMomentumSnapshots(project, history = loadMomentumHistory(), limit = 12) {
  if (!project?.github) return [];

  const rawSnapshots = history[project.github] ?? [];
  const normalized = rawSnapshots
    .map((snapshot) => ({
      stars: Number(snapshot?.stars ?? 0),
      date: String(snapshot?.date ?? ''),
    }))
    .filter((snapshot) => snapshot.date)
    .sort((left, right) => left.date.localeCompare(right.date));

  const currentStars = project?.github_data?.stars ?? project?.stars ?? null;
  const currentDate = project?.github_data?.last_enriched?.split('T')[0] ?? null;

  if (currentStars !== null && currentDate) {
    const last = normalized[normalized.length - 1];
    if (!last || last.date !== currentDate) {
      normalized.push({ stars: Number(currentStars), date: currentDate });
    } else if (last.stars !== currentStars) {
      last.stars = Number(currentStars);
    }
  }

  const deduped = [];
  const seenDates = new Set();

  for (let i = normalized.length - 1; i >= 0; i--) {
    const snapshot = normalized[i];
    if (seenDates.has(snapshot.date)) continue;
    seenDates.add(snapshot.date);
    deduped.push(snapshot);
  }

  return deduped.reverse().slice(-limit);
}
