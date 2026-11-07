# Shelldex — AGENTS.md

## Catalog scope

Only runnable AI agents belong in Shelldex. A user must be able to give the shipped assistant a goal and have it choose and carry out actions. OpenClaw and Hermes Agent qualify. Tools for other agents never qualify, including plugins, memory libraries, registries, dashboards, orchestration layers and deployment wrappers. Require a documented example of running the agent when reviewing a submission.

## Build

- **Agent metrics refresh**: `pnpm run enrich:vault` — fetch public metadata through the approved Agent Vault GitHub service; no raw credentials.
- **Tests**: `pnpm run test` — snapshot consistency, failed-refresh integrity, and seven-day growth regression checks.
- **Normal build**: `pnpm run build` — deterministic; uses the project data already tracked in Git
- **Refresh external data**: `pnpm run build:refresh` — enriches every project through the GitHub API before building; run only with `GITHUB_TOKEN` set

## Stack

- Astro 5 (static output), Tailwind CSS, vanilla JS
- Data: YAML files in `src/data/projects/`; enrichment is an explicit refresh step, not part of routine builds
- Hosting: Cloudflare Workers Static Assets at `shelldex.com`; `wrangler.jsonc` is the routing source of truth and `pnpm run deploy` validates, tests, builds, checks the sitemap, and publishes `dist/`
