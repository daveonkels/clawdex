# 🦞 Clawdex

**Every shell in the sea.** The complete directory of OpenClaw clones, forks, derivatives, and inspired projects.

🌐 **[shelldex.com](https://shelldex.com)**

## What Is This?

A community-maintained directory cataloging the growing ecosystem of projects inspired by [OpenClaw](https://github.com/openclaw/openclaw) — the self-hosted AI super-agent formerly known as Clawdbot and Moltbot.

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
tier: 1  # 1 = clone, 2 = ecosystem, 3 = inspired
highlight: "What makes it unique"
emoji: 🦀
added: 2026-02-25
```

## Tech Stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS](https://tailwindcss.com) — styling
- GitHub Pages — hosting
- GitHub Actions — CI/CD

## Development

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # builds to dist/
```

## License

MIT
