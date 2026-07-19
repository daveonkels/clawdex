# Shelldex — AGENTS.md

## Build

- **Normal build**: `npm run build` — deterministic; uses the project data already tracked in Git
- **Refresh external data**: `npm run build:refresh` — enriches every project through the GitHub API before building; run only with `GITHUB_TOKEN` set

## Stack

- Astro 5 (static output), Tailwind CSS, vanilla JS
- Data: YAML files in `src/data/projects/`; enrichment is an explicit refresh step, not part of routine builds
- Hosting: Cloudflare Workers Static Assets at `shelldex.com`; `wrangler.jsonc` is the routing source of truth and `npm run deploy` builds and publishes `dist/`
