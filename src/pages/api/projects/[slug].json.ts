import type { APIRoute, GetStaticPaths } from 'astro';
import activityByRepo from '../../../data/star-activity.json';
import { loadProjects } from '../../../lib/projects';
import { loadLeaderboard, computeHealthScore } from '../../../lib/compare';

import { modelAccess, quickStartUrl } from '../../../lib/agent-choice';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await loadProjects();
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const project = (props as any).project;
  const { entries } = loadLeaderboard();
  const lbEntry = entries.find((e) => e.slug === project.slug) ?? null;

  const body = {
    $schema: 'https://shelldex.com/schemas/project.schema.json',
    generated: new Date().toISOString(),
    source: `https://shelldex.com/projects/${project.slug}/`,
    license: 'CC-BY-4.0',
    daily_star_additions: (activityByRepo as Record<string, Record<string, number>>)[project.github_data?.repository_id] ?? null,
    project: {
      name: project.name,
      slug: project.slug,
      slug_aliases: project.slug_aliases ?? [],
      tagline: project.tagline,
      description: project.description,
      language: project.language,
      category: project.category,
      status: project.status,
      highlight: project.highlight,
      emoji: project.emoji,
      added: project.added,
      tier: project.tier ?? null,
      github: project.github ?? null,
      website: project.website ?? null,
      platform: project.platform ?? [],
      requires_llm: project.requires_llm ?? null,
      mcp_support: project.mcp_support ?? null,
      quick_start: quickStartUrl(project),
      first_task: project.first_task ?? null,
      model_options: modelAccess(project),
      integration_count: project.integration_count ?? null,
      perf: project.perf ?? null,
      ecosystem_role: project.ecosystem_role ?? null,
      mentions: project.mentions ?? [],
      stars: project.github_data?.stars ?? project.stars ?? null,
      github_data: project.github_data ?? null,
      leaderboard: lbEntry
        ? {
            rank: lbEntry.rank,
            health_score: computeHealthScore(lbEntry),
            health: lbEntry.health,
          }
        : null,
      urls: {
        page: `https://shelldex.com/projects/${project.slug}/`,
        json: `https://shelldex.com/api/projects/${project.slug}.json`,
        markdown: `https://shelldex.com/md/projects/${project.slug}.md`,
      },
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
