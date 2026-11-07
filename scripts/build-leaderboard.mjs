import fs from 'node:fs';
import { loadProjects } from '../src/lib/project-loader.js';
import { buildLeaderboard } from '../src/lib/metrics.js';

import { getIndexableCompareSlugSet } from '../src/lib/compare-seo.js';
import { INDEXABLE_ALTERNATIVE_SLUGS } from '../src/lib/seo-sets.js';
import { retired } from '../src/lib/catalog-redirects.js';

const projects = await loadProjects();
const leaderboard = buildLeaderboard(projects);
const active = projects.map(p => p.slug);
for (const slug of Object.values(retired)) if (!active.includes(slug)) throw Error('Missing redirect target: ' + slug);
const routes = { active, aliases: Object.fromEntries(projects.flatMap(p => (p.slug_aliases || []).map(alias => [alias, p.slug]))),
  pairs: [...getIndexableCompareSlugSet(projects)], alternatives: [...INDEXABLE_ALTERNATIVE_SLUGS] };
fs.mkdirSync('src/data/generated', { recursive: true });
fs.writeFileSync('src/data/generated/catalog-routes.json', JSON.stringify(routes));
fs.writeFileSync('src/data/generated/leaderboard.json', JSON.stringify(leaderboard, null, 2) + '\n');
console.log(`Built leaderboard from ${leaderboard.count} saved project snapshots.`);
