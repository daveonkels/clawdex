import type { APIRoute } from 'astro';
import { loadProjects } from '../../lib/projects';

export const GET: APIRoute = async () => {
  const projects = await loadProjects();
  const body = {
    $schema: 'https://shelldex.com/schemas/projects.schema.json',
    generated: new Date().toISOString(),
    source: 'https://shelldex.com/',
    license: 'CC-BY-4.0',
    count: projects.length,
    projects: projects.map((p) => ({
      name: p.name,
      slug: p.slug,
      slug_aliases: p.slug_aliases ?? [],
      tagline: p.tagline,
      description: p.description,
      language: p.language,
      category: p.category,
      status: p.status,
      highlight: p.highlight,
      emoji: p.emoji,
      added: p.added,
      tier: p.tier ?? null,
      github: p.github ?? null,
      website: p.website ?? null,
      platform: p.platform ?? [],
      requires_llm: p.requires_llm ?? null,
      mcp_support: p.mcp_support ?? false,
      integration_count: p.integration_count ?? null,
      perf: p.perf ?? null,
      ecosystem_role: p.ecosystem_role ?? null,
      stars: p.github_data?.stars ?? p.stars ?? null,
      github_data: p.github_data ?? null,
      urls: {
        page: `https://shelldex.com/projects/${p.slug}/`,
        json: `https://shelldex.com/api/projects/${p.slug}.json`,
        markdown: `https://shelldex.com/md/projects/${p.slug}.md`,
      },
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
