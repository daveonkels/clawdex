import type { APIRoute } from 'astro';
import { loadProjects } from '../../lib/projects';
import { getIndexableComparePairs } from '../../lib/compare';

export const GET: APIRoute = async () => {
  const projects = await loadProjects();
  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  const pairs = getIndexableComparePairs(projects);

  const body = {
    $schema: 'https://shelldex.com/schemas/compare-index.schema.json',
    generated: new Date().toISOString(),
    source: 'https://shelldex.com/compare/',
    license: 'CC-BY-4.0',
    count: pairs.length,
    pairs: pairs.map((pair) => {
      const a = projectMap.get(pair.slugA);
      const b = projectMap.get(pair.slugB);

      return {
        canonical: pair.canonical,
        slugA: pair.slugA,
        slugB: pair.slugB,
        title: `${a?.name ?? pair.slugA} vs ${b?.name ?? pair.slugB}`,
        projects: [
          {
            slug: pair.slugA,
            name: a?.name ?? pair.slugA,
            emoji: a?.emoji ?? null,
          },
          {
            slug: pair.slugB,
            name: b?.name ?? pair.slugB,
            emoji: b?.emoji ?? null,
          },
        ],
        urls: {
          page: `https://shelldex.com/compare/${pair.canonical}/`,
          json: `https://shelldex.com/api/compare/${pair.canonical}.json`,
          markdown: `https://shelldex.com/md/compare/${pair.canonical}.md`,
        },
      };
    }),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
