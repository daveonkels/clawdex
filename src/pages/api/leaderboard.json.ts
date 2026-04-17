import type { APIRoute } from 'astro';
import { loadLeaderboard, computeHealthScore } from '../../lib/compare';

export const GET: APIRoute = async () => {
  const { entries, count } = loadLeaderboard();
  const body = {
    $schema: 'https://shelldex.com/schemas/leaderboard.schema.json',
    generated: new Date().toISOString(),
    source: 'https://shelldex.com/leaderboard/',
    license: 'CC-BY-4.0',
    count,
    entries: entries.map((e) => ({
      ...e,
      health_score: computeHealthScore(e),
      urls: {
        page: `https://shelldex.com/projects/${e.slug}/`,
        json: `https://shelldex.com/api/projects/${e.slug}.json`,
      },
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
