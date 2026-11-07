import type { APIRoute, GetStaticPaths } from 'astro';
import { loadProjects } from '../../../lib/projects';
import { comparisonRows, generateRecommendation, getIndexableComparePairs, loadLeaderboard } from '../../../lib/compare';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await loadProjects();
  const bySlug = new Map(projects.map(p => [p.slug, p]));
  return getIndexableComparePairs(projects).map(pair => ({
    params: { pair: pair.canonical },
    props: { a: bySlug.get(pair.slugA)!, b: bySlug.get(pair.slugB)! },
  }));
};

export const GET: APIRoute = ({ props, params }) => {
  const {a,b} = props;
  const {entries,generated} = loadLeaderboard();
  const rows = comparisonRows(a,b,entries.find(e=>e.slug===a.slug) ?? null,entries.find(e=>e.slug===b.slug) ?? null);
  const safeCell = (value: string) => value.replace(/\|/g,'\\|').replace(/\n/g,' ');
  const out = [
    `# ${a.name} vs ${b.name}`, '',
    generateRecommendation(a,b), '',
    `Metrics checked ${generated.slice(0,10)}. [How we measure](https://shelldex.com/methodology/).`, '',
    `| Measure | ${a.name} | ${b.name} |`, '| --- | --- | --- |',
    ...rows.map(r => '| ' + [r.label, ...r.values].map(safeCell).join(' | ') + ' |'), '',
    `[Comparison](https://shelldex.com/compare/${params.pair}/) · [JSON](https://shelldex.com/api/compare/${params.pair}.json)`,
  ];
  return new Response(out.join('\n'), {headers:{'Content-Type':'text/markdown; charset=utf-8'}});
};
