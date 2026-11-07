# 🦞 Shelldex

**Every shell in the sea.** A curated directory of runnable AI agents like OpenClaw and Hermes Agent.

🌐 **[shelldex.com](https://shelldex.com)**

## What Is This?

A community-maintained directory cataloging the growing ecosystem of projects inspired by [OpenClaw](https://github.com/openclaw/openclaw) — the self-hosted AI super-agent formerly known as Clawdbot and Moltbot.

Only runnable AI agents belong in Shelldex. A user must be able to give the shipped assistant a goal and have it choose and carry out actions. OpenClaw and Hermes Agent qualify. Tools for other agents never qualify, including plugins, memory libraries, registries, dashboards, orchestration layers and deployment wrappers.

## Adding a Project

1. Fork this repo
2. Create a YAML file in `src/data/projects/your-project.yml`
3. Open a PR — CI validates the schema automatically
4. A human reviews and merges

### YAML Template

```yaml
name: Your Project
slug: your-project
tagline: "A short catchy description"
description: "A longer description"
language: rust  # typescript | rust | python | go | c | multi
category:
  - security
  - lightweight
github: owner/repo
website: https://example.com  # optional
status: active  # active | experimental | archived
ecosystem_role: reimplementation
highlight: "What makes it unique"
emoji: 🦀
added: 2026-02-25
```

## Tech Stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS](https://tailwindcss.com) — styling
- Cloudflare Workers Static Assets — `pnpm run deploy` builds and publishes `dist/` to `shelldex.com`
- GitHub Actions — CI (schema validation on PRs)

## Development

```bash
sfw pnpm install --frozen-lockfile
pnpm run dev     # http://localhost:4321
pnpm run build   # builds to dist/
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Agent Vault metrics refresh, validation, and Cloudflare publication workflow. Ordinary builds use saved data; refreshes are explicit and are not currently scheduled.

## License

MIT
