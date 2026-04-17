import type { APIRoute, GetStaticPaths } from 'astro';
import { loadProjects } from '../../../lib/projects';
import {
  loadLeaderboard,
  computeHealthScore,
  generateKeyDifferences,
  getIndexableComparePairs,
} from '../../../lib/compare';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await loadProjects();
  const pairs = getIndexableComparePairs(projects);
  return pairs.map((pair) => ({
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

  const body = {
    $schema: 'https://shelldex.com/schemas/compare.schema.json',
    generated: new Date().toISOString(),
    source: `https://shelldex.com/compare/${pair.canonical}/`,
    license: 'CC-BY-4.0',
    pair: {
      canonical: pair.canonical,
      slugA: pair.slugA,
      slugB: pair.slugB,
    },
    projects: [
      {
        ...a,
        leaderboard: aEntry ? { rank: aEntry.rank, health_score: computeHealthScore(aEntry), health: aEntry.health } : null,
      },
      {
        ...b,
        leaderboard: bEntry ? { rank: bEntry.rank, health_score: computeHealthScore(bEntry), health: bEntry.health } : null,
      },
    ],
    key_differences: diffs,
    urls: {
      page: `https://shelldex.com/compare/${pair.canonical}/`,
      json: `https://shelldex.com/api/compare/${pair.canonical}.json`,
      markdown: `https://shelldex.com/md/compare/${pair.canonical}.md`,
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
