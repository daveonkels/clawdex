import type { APIRoute } from 'astro';
import spec from '../../../public/openapi.json';

export function getStaticPaths() {
  return Object.entries({ projects: 'ProjectList', project: 'ProjectDetail', leaderboard: 'Leaderboard', 'compare-index': 'ComparisonIndex', compare: 'Comparison' })
    .map(([name, definition]) => ({ params: { name }, props: { definition } }));
}
export const GET: APIRoute = ({ params, props }) => {
  const defs = JSON.parse(JSON.stringify(spec.components.schemas).replaceAll('#/components/schemas/', () => '#/$defs/'));
  return Response.json({ $schema: 'https://json-schema.org/draft/2020-12/schema', $id: 'https://shelldex.com/schemas/' + params.name + '.schema.json', $ref: '#/$defs/' + props.definition, $defs: defs });
};
