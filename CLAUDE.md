# Shelldex — CLAUDE.md

## Build

- **Build without enrichment**: `npx astro build` — use this for local testing to avoid GitHub API rate limits
- **Full build with enrichment**: `npm run build` — runs `tsx scripts/enrich-github-data.ts && astro build`, hits GitHub API for every project. Will get rate-limited without a `GITHUB_TOKEN`.

## Stack

- Astro 5 (static output), Tailwind CSS, vanilla JS
- Data: YAML files in `src/data/projects/`, enriched at build time
- Hosting: GitHub Pages (CNAME: shelldex.com)
