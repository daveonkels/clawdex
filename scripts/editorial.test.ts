import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { editionRows } from '../src/lib/spike-edition';
import { loadProjects } from '../src/lib/projects';
import { buildLeaderboard } from '../src/lib/metrics.js';
import { buildEditorial, compareWeeklyGrowth } from '../src/lib/editorial';
import { generateKeyDifferences, generateRecommendation, generateFAQItems } from '../src/lib/compare';

const projects = await loadProjects();
const snapshot = buildLeaderboard(projects);
const summarize = (rows = projects) => {
  const data = buildLeaderboard(rows);
  return buildEditorial(rows, data.entries, data.generated);
};

test('editorial rankings and descriptions follow changed metrics, availability, and ties', () => {
  const rows = structuredClone(projects);
  const candidate = rows.find(p => p.slug === 'nanobot')!;
  candidate.github_data!.stars = 9_000_000;
  candidate.tagline = 'Unique description for the new winner.';
  let copy = summarize(rows);
  assert.equal(copy.topAlternatives[0].slug, 'nanobot');
  assert.match(copy.mostStarredAnswer, /Nanobot.*9,000,000/i);
  assert.doesNotMatch(copy.mostStarredAnswer, /Unique description/);
  const rival = rows.find(p => p.slug === 'hermes')!;
  rival.github_data!.stars = 9_000_000;
  assert.match(summarize(rows).mostStarredAnswer, /are tied/);
  candidate.github_data!.availability = 'unavailable';
  copy = summarize(rows);
  assert.equal(copy.topAlternatives[0].slug, 'hermes');
  assert.doesNotMatch(copy.mostStarredAnswer, /Unique description/);
  assert(!copy.topAlternatives.some(p => p.slug === 'nanobot'));
  assert.equal(copy.topAlternatives.some(p => p.slug === 'openclaw'), false);
  const empty = buildEditorial([], [], '');
  assert.equal(empty.topAlternatives.length, 0);
  assert.doesNotMatch(empty.mostStarredAnswer, /undefined|NaN/);
});

test('language copy follows membership changes rather than fixed ordinal claims', () => {
  const rows = structuredClone(projects);
  for (const p of rows) p.language = 'zig';
  const copy = summarize(rows);
  assert.equal(copy.languageSummary, `The ${rows.length} tracked projects span 1 language: Zig (${rows.length}).`);
  assert.equal(copy.rustAnswer, 'Shelldex tracks 0 Rust projects.');
});

test('growth comparison distinguishes missing, zero, negative, tied, and incompatible snapshots', () => {
  const a = structuredClone(projects[0].github_data!);
  const b = structuredClone(a);
  a.star_growth_7d = 25;
  b.star_growth_7d = null;
  assert.equal(compareWeeklyGrowth(a, b), null);
  b.star_growth_7d = 0;
  assert.match(compareWeeklyGrowth(a, b)!, /\+25 and 0/);
  b.star_growth_7d = -4;
  assert.match(compareWeeklyGrowth(a, b)!, /\+25 and -4/);
  b.star_growth_7d = 25;
  assert.match(compareWeeklyGrowth(a, b)!, /\+25 and \+25/);
  b.last_enriched = '2020-01-01T00:00:00Z';
  assert.equal(compareWeeklyGrowth(a, b), null);
  b.last_enriched = a.last_enriched;
  b.availability = 'unavailable';
  assert.equal(compareWeeklyGrowth(a, b), null);
});

test('actual comparison copy does not invent zero growth or declare a tied winner', () => {
  const a = structuredClone(projects[0]);
  const b = structuredClone(projects[1]);
  a.github_data!.stars = b.github_data!.stars = 1000;
  a.github_data!.star_growth_7d = 100;
  b.github_data!.star_growth_7d = null;
  const copy = () => [
    ...generateKeyDifferences(a, b, null, null),
    generateRecommendation(a, b, null, null),
    ...generateFAQItems(a, b, null, null).map(q => q.answer),
  ].join('\n');
  assert.doesNotMatch(copy(), /growing faster|gained more stars|net star changes|momentum faster/);
  b.github_data!.star_growth_7d = 100;
  assert.match(copy(), /net star changes were \+100 and \+100/);
  assert.doesNotMatch(copy(), /gained more stars/);
  b.github_data!.availability = 'unavailable';
  assert.match(copy(), /metrics are historical/);
  assert.doesNotMatch(copy(), /net star changes/);
});

test('missing weekly history cannot support a growth leader claim', () => {
  const entries = structuredClone(snapshot.entries);
  entries.forEach(e => { e.star_growth_7d = null; });
  assert.match(buildEditorial(projects, entries, snapshot.generated).growthSummary, /not enough history/);
});


test('the frozen edition requires every calendar day, retains zeroes and sums the last seven additions', () => {
  const csv = readFileSync('public/analysis/data/daily-stars-2026-11-07.csv', 'utf8').trim();
  const rows = editionRows(projects, csv);
  assert.equal(rows.length, 50);
  assert.equal(rows.filter(r => r.total === 0).length, 6);
  assert.equal(rows.find(r => r.slug === 'hermes')?.lastWeek, 2648);
  assert.equal(rows.find(r => r.slug === 'nullclaw')?.share.toFixed(1), '51.5');
  const lines = csv.split('\n');
  assert.throws(() => editionRows(projects, lines.slice(0,-1).join('\n')), /Incomplete/);
  assert.throws(() => editionRows(projects, csv + '\n' + lines.at(-1)), /Invalid/);
});
