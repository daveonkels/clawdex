# Contributing to Shelldex

Thanks for helping catalog the crustacean ecosystem! 🦞

## Adding a Project

Use the [suggestion form](https://github.com/daveonkels/clawdex/issues/new?template=new-project.yml) to send a setup link and a first task. To contribute the catalog record directly:

1. Fork this repo
2. Create `src/data/projects/your-project.yml` using the template below
3. Open a PR — CI validates automatically
4. A human reviews and merges

### YAML Template

```yaml
name: Your Project
slug: your-project
tagline: "A short catchy description"
description: "A longer description of what this project does"
language: rust          # typescript | rust | python | go | c | bash | zig | javascript | kotlin | multi
category:
  - security
  - lightweight
github: owner/repo      # optional but strongly preferred
website: https://example.com    # optional
quick_start: https://example.com/getting-started
first_task: "Ask it to summarize a sample folder of notes."
status: active          # active | experimental | archived
ecosystem_role: reimplementation
highlight: "The one thing that makes this stand out"
emoji: 🦀
added: 2026-02-25       # today's date
```

### Required Fields

Provide a repository or website, an upstream quick start and a first task for every new submission. Archived or unavailable agents may lack the last two fields.

### Slug Rules

- Lowercase, hyphenated: `my-cool-project`
- Must match the filename: `my-cool-project.yml`
- No spaces, no special characters

### What Qualifies?

Only runnable AI agents belong in Shelldex. A user must be able to give the shipped assistant a goal and have it choose and carry out actions. OpenClaw and Hermes Agent qualify. Tools for other agents never qualify, including plugins, memory libraries, registries, dashboards, orchestration layers and deployment wrappers.

Link to upstream runnable code or a quick start in the submission, and give an example task. A model provider or an embedded SDK is fine; forwarding the task to a separately installed agent is not. No paid-only or closed-source commercial products, duplicate entries, or README-only proposals.

## Updating an Existing Entry

Edit the relevant `.yml` file and open a PR, or [file an issue](https://github.com/daveonkels/clawdex/issues/new?template=update.yml).

## Development

```bash
sfw pnpm install --frozen-lockfile
pnpm run dev          # http://localhost:4321
pnpm run build        # builds to dist/
node scripts/validate-projects.mjs   # validate all YAML
```

## Code of Conduct

Be excellent to each other. This is a directory, not a competition.
