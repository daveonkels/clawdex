import type { Project } from './projects';
import { archiveNotice, licenseLabel, modelAccess, projectFocus } from './agent-choice';
import dailyActivity from '../data/star-activity.json';
import { recentStarActivity } from './star-activity.js';
import { compareWeeklyGrowth } from './editorial';
import { languageLabel } from './constants';
import fs from 'node:fs';
import path from 'node:path';
import { makeCanonicalSlug as makeCanonicalSlugBase, getIndexableComparePairs as getIndexableComparePairsBase, getFeaturedComparePairs as getFeaturedComparePairsBase } from './compare-seo.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  availability: 'available' | 'unavailable';
  last_enriched: string;
  last_checked: string;
  status?: Project['status'];
  rank: number | null;
  name: string;
  slug: string;
  emoji: string;
  language: string;
  github: string;
  stars: number;
  forks: number;
  open_issues: number;
  star_growth_7d: number | null;
  latest_release: string | null;
  latest_release_date: string | null;
  last_commit: string;
  license: string | null;
  health: {
    issues_stars_ratio: number | null;
    days_since_last_release: number | null;
    days_since_last_commit: number;
  };
}

export interface PairEntry {
  pair: string;       // URL slug: "aionui-vs-openclaw"
  canonical: string;  // alphabetical canonical slug
  slugA: string;
  slugB: string;
}

export interface ComparisonData {
  a: Project;
  b: Project;
  aEntry: LeaderboardEntry | null;
  bEntry: LeaderboardEntry | null;
  isCanonical: boolean;
  canonicalUrl: string;
  keyDifferences: string[];
  recommendation: string;
  related: PairEntry[];
}

// ── Leaderboard loader ──────────────────────────────────────────────────────

let _leaderboardCache: { entries: LeaderboardEntry[]; count: number; generated: string } | null = null;

export function loadLeaderboard(): { entries: LeaderboardEntry[]; count: number; generated: string } {
  if (_leaderboardCache) return _leaderboardCache;
  try {
    const lbPath = path.join(process.cwd(), 'src', 'data', 'generated', 'leaderboard.json');
    const lb = JSON.parse(fs.readFileSync(lbPath, 'utf-8'));
    _leaderboardCache = { entries: lb.entries, count: lb.count, generated: lb.generated };
    return _leaderboardCache;
  } catch {
    _leaderboardCache = { entries: [], count: 0, generated: '' };
    return _leaderboardCache;
  }
}

// ── Pair generation ─────────────────────────────────────────────────────────

export const makeCanonicalSlug = makeCanonicalSlugBase;

export function makePairSlug(slugA: string, slugB: string): string {
  return `${slugA}-vs-${slugB}`;
}

export function generateAllPairs(projects: Project[]): PairEntry[] {
  const pairs: PairEntry[] = [];
  const seen = new Set<string>();

  function addPair(pair: string, canonical: string, slugA: string, slugB: string) {
    if (seen.has(pair)) return;
    seen.add(pair);
    pairs.push({ pair, canonical, slugA, slugB });
  }

  for (let i = 0; i < projects.length; i++) {
    for (let j = 0; j < projects.length; j++) {
      if (i === j) continue;
      const a = projects[i].slug;
      const b = projects[j].slug;
      const canonical = makeCanonicalSlug(a, b);

      addPair(makePairSlug(a, b), canonical, a, b);

      // Generate alias-based pairs (same content, different URL, canonical points to real page)
      for (const aliasA of projects[i].slug_aliases ?? []) {
        addPair(makePairSlug(aliasA, b), canonical, a, b);
      }
      for (const aliasB of projects[j].slug_aliases ?? []) {
        addPair(makePairSlug(a, aliasB), canonical, a, b);
      }
    }
  }
  return pairs;
}

export function getUniquePairs(projects: Project[]): PairEntry[] {
  const seen = new Set<string>();
  const unique: PairEntry[] = [];
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i].slug;
      const b = projects[j].slug;
      const canonical = makeCanonicalSlug(a, b);
      if (!seen.has(canonical)) {
        seen.add(canonical);
        unique.push({ pair: canonical, canonical, slugA: a, slugB: b });
      }
    }
  }
  return unique.sort((a, b) => a.pair.localeCompare(b.pair));
}

export function getIndexableComparePairs(projects: Project[]): PairEntry[] {
  return getIndexableComparePairsBase(projects).map((pair: { canonical: string; slugA: string; slugB: string }) => ({
    pair: pair.canonical,
    canonical: pair.canonical,
    slugA: pair.slugA,
    slugB: pair.slugB,
  }));
}

export function getFeaturedComparePairs(projects: Project[], limit?: number): PairEntry[] {
  return getFeaturedComparePairsBase(projects, limit).map((pair: { canonical: string; slugA: string; slugB: string }) => ({
    pair: pair.canonical,
    canonical: pair.canonical,
    slugA: pair.slugA,
    slugB: pair.slugB,
  }));
}

// ── Health score ────────────────────────────────────────────────────────────

export function computeHealthScore(entry: LeaderboardEntry | null): number | null {
  if (!entry || entry.status === 'archived' || entry.availability === 'unavailable') return null;
  let score = 0;

  // Issues/stars ratio (lower is better) — up to 30 points
  const ratio = entry.health.issues_stars_ratio;
  if (ratio != null) {
    if (ratio < 0.01) score += 30;
    else if (ratio < 0.03) score += 25;
    else if (ratio < 0.05) score += 15;
    else score += 5;
  }

  // Commit recency — up to 30 points
  const commitDays = entry.health.days_since_last_commit;
  if (commitDays <= 1) score += 30;
  else if (commitDays <= 7) score += 25;
  else if (commitDays <= 30) score += 15;
  else score += 5;

  // Release recency — up to 20 points
  const releaseDays = entry.health.days_since_last_release;
  if (releaseDays === null) score += 5;
  else if (releaseDays <= 7) score += 20;
  else if (releaseDays <= 30) score += 15;
  else score += 5;

  // Star growth — up to 20 points
  const growth = entry.star_growth_7d ?? 0;
  if (growth >= 100) score += 20;
  else if (growth >= 10) score += 15;
  else if (growth >= 1) score += 10;
  else score += 0;

  return score;
}

// Both displayed columns and the highlighted differences use these same definitions.
export interface MetricRow {
  label: string;
  detail: string;
  values: [string, string];
  difference?: string;
}

export function comparisonRows(a: Project, b: Project, aEntry: LeaderboardEntry | null, bEntry: LeaderboardEntry | null): MetricRow[] {
  const rows: MetricRow[] = [];
  const current = !archiveNotice(a) && !archiveNotice(b);
  function numeric(label: string, detail: string, left: number | null | undefined, right: number | null | undefined, direction: string, lower = false) {
    if (left == null && right == null) return;
    const present = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('en-US');
    const row: MetricRow = { label, detail, values: [present(left), present(right)] };
    if (current && left != null && right != null && left !== right) {
      const project = (left > right) !== lower ? a : b;
      row.difference = project.name + ' ' + direction;
    }
    rows.push(row);
  }
  function fact(label: string, detail: string, left?: string | null, right?: string | null) {
    if (left || right) rows.push({ label, detail, values: [left || '—', right || '—'] });
  }
  numeric('Stars added in 30 days', 'Counts new stars still present at collection.', additions(a), additions(b), 'added more stars');
  numeric('Open issues + pull requests', 'GitHub counts both kinds of open work together.', a.github_data?.open_issues, b.github_data?.open_issues, 'has fewer open items', true);
  numeric('Health score /100', 'Higher indicates more points under the Shelldex formula.', computeHealthScore(aEntry), computeHealthScore(bEntry), 'scores higher');
  numeric('Stars', 'More stars indicate more bookmarks.', a.github_data?.stars, b.github_data?.stars, 'has more stars');
  numeric('Forks', 'Copies of a repository on GitHub.', a.github_data?.forks, b.github_data?.forks, 'has more forks');
  numeric('Net stars over 7 days', 'Change between two totals measured seven days apart.', a.github_data?.star_growth_7d, b.github_data?.star_growth_7d, 'had the larger net change');
  fact('Runs on or connects through', 'Choose a device or chat channel you use.', a.platform?.join(', '), b.platform?.join(', '));
  fact('Model options', 'Check the provider, hardware and billing before setup.', modelAccess(a), modelAccess(b));
  fact('Language', 'Relevant if you want to change the code.', languageLabel[a.language] || a.language, languageLabel[b.language] || b.language);
  fact('MCP tools', 'MCP is a common way to connect an agent to tools.', a.mcp_support ? 'Documented' : null, b.mcp_support ? 'Documented' : null);
  fact('License', 'Check the terms for your intended use.', licenseLabel(a), licenseLabel(b));
  fact('Latest repository push', 'Date GitHub last recorded a push (UTC).', a.github_data?.last_commit?.slice(0, 10), b.github_data?.last_commit?.slice(0, 10));
  fact('Release', 'Latest tagged release seen at collection.', a.github_data?.latest_release, b.github_data?.latest_release);
  return rows;
}

function additions(p: Project): number | null {
  const id = p.github_data?.repository_id;
  if (!id || archiveNotice(p)) return null;
  const days = recentStarActivity((dailyActivity as Record<string, Record<string, number>>)[id], p.github_data?.last_enriched);
  return days.length === 30 ? days.reduce((n, day) => n + Number(day.stars), 0) : null;
}

export function generateKeyDifferences(a: Project, b: Project, aEntry: LeaderboardEntry | null, bEntry: LeaderboardEntry | null): string[] {
  const notices = [a, b].map(archiveNotice).filter(Boolean);
  if (notices.length) return notices;
  const changes = compareWeeklyGrowth(a.github_data, b.github_data);
  const rows = comparisonHighlights(comparisonRows(a, b, aEntry, bEntry));
  return [...(changes ? [changes] : []), ...rows.map(r => `${r.label}: ${a.name} ${r.values[0]}, ${b.name} ${r.values[1]}.`)];
}

export function comparisonHighlights(rows: MetricRow[]) {
  // Lead with the recent interest, backlog, and activity signals when they differ.
  // Use lifetime counts only when those three cannot distinguish this pair.
  return rows.filter(row => row.difference).slice(0, 3);
}

export function generateRecommendation(a: Project, b: Project, _aEntry?: LeaderboardEntry | null, _bEntry?: LeaderboardEntry | null) {
  const historical = [a, b].filter(p => archiveNotice(p));
  if (historical.length) return historical.map(archiveNotice).join(' ');
  if ([a.slug, b.slug].sort().join() === 'hermes,openclaw') {
    return 'Both agents take tasks from chat apps. Hermes keeps notes between sessions and writes reusable skills. OpenClaw lets you work through a gateway on your own computer or an always-on host.';
  }
  return `${a.name}: ${projectFocus(a)}. ${b.name}: ${projectFocus(b)}.`;
}

export interface FAQItem { question: string; answer: string; }

export function generateFAQItems(a: Project, b: Project, _aEntry?: LeaderboardEntry | null, _bEntry?: LeaderboardEntry | null): FAQItem[] {
  if (archiveNotice(a) || archiveNotice(b)) return [];
  return [{
    question: 'What model can I use?',
    answer: [a,b].map(p => `${p.name}: ${modelAccess(p)}`).join(' '),
  }, {
    question: 'How can I try these on the same task?',
    answer: 'Give both agents a copy of the same short, non-sensitive task. Check what they produced, what access they requested, and how often you had to step in.',
  }];
}

// ── Related comparisons ─────────────────────────────────────────────────────

export function getRelatedComparisons(slugA: string, slugB: string, allPairs: PairEntry[], limit = 8): PairEntry[] {
  const currentCanonical = makeCanonicalSlug(slugA, slugB);
  const includesOpenClaw = slugA === 'openclaw' || slugB === 'openclaw';
  const related = allPairs.filter(p =>
    p.canonical !== currentCanonical &&
    p.pair === p.canonical && // only canonical versions
    (p.slugA === slugA || p.slugB === slugA || p.slugA === slugB || p.slugB === slugB)
  );

  const prioritized = includesOpenClaw
    ? related
    : related.filter((p) => p.slugA !== 'openclaw' && p.slugB !== 'openclaw');

  return prioritized.slice(0, limit);
}
