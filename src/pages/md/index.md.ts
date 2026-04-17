import type { APIRoute } from 'astro';
import { loadProjects, formatStars } from '../../lib/projects';
import { loadLeaderboard, getIndexableComparePairs } from '../../lib/compare';

export const GET: APIRoute = async () => {
  const projects = await loadProjects();
  const { entries } = loadLeaderboard();
  const pairs = getIndexableComparePairs(projects);
  const totalStars = projects.reduce((s, p) => s + (p.stars ?? 0), 0);
  const languages = [...new Set(projects.map((p) => p.language))].sort();

  const out: string[] = [];
  out.push('# Shelldex — The OpenClaw Ecosystem');
  out.push('');
  out.push('> Every shell in the sea. The complete registry of OpenClaw clones, forks, and alternatives.');
  out.push('');
  out.push(`Canonical HTML: https://shelldex.com/`);
  out.push(`JSON: https://shelldex.com/api/projects.json`);
  out.push(`Full corpus: https://shelldex.com/llms-full.txt`);
  out.push('');
  out.push('## At a glance');
  out.push('');
  out.push(`- ${projects.length} projects tracked`);
  out.push(`- ${totalStars.toLocaleString()} combined GitHub stars`);
  out.push(`- Languages: ${languages.join(', ')}`);
  out.push(`- Indexable comparison pairs: ${pairs.length}`);
  out.push('');
  out.push('## Top 10 by stars');
  out.push('');
  out.push('| Rank | Project | Language | Stars | GitHub |');
  out.push('| --- | --- | --- | --- | --- |');
  for (const e of entries.slice(0, 10)) {
    out.push(`| ${e.rank} | [${e.name}](https://shelldex.com/projects/${e.slug}/) | ${e.language} | ${formatStars(e.stars)} | \`${e.github}\` |`);
  }
  out.push('');
  out.push('## Full registry');
  out.push('');
  for (const p of projects) {
    const stars = p.github_data?.stars ?? p.stars ?? 0;
    out.push(`- [${p.name}](https://shelldex.com/projects/${p.slug}/) — ${p.tagline} (${p.language}, ${formatStars(stars)} stars)`);
  }
  out.push('');
  out.push('## Sections');
  out.push('');
  out.push('- [Leaderboard](https://shelldex.com/leaderboard/) · [markdown](https://shelldex.com/md/leaderboard.md)');
  out.push('- [Compare index](https://shelldex.com/compare/)');
  out.push('- [Analysis](https://shelldex.com/analysis/)');
  out.push('- [Best alternatives](https://shelldex.com/best-alternatives/)');
  out.push('- [FAQ](https://shelldex.com/faq/)');
  out.push('- [About](https://shelldex.com/about/)');
  out.push('- [Submit a project](https://shelldex.com/submit/)');
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
