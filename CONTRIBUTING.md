# Contributing to Clawdex

Thanks for helping catalog the crustacean ecosystem! 🦞

## Adding a Project

The fastest way to add a project:

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
language: rust          # typescript | rust | python | go | c | multi
category:
  - security
  - lightweight
github: owner/repo      # optional but strongly preferred
website: https://...    # optional
status: active          # active | experimental | archived
tier: 1                 # 1 = clone/rewrite, 2 = ecosystem tool, 3 = inspired by
highlight: "The one thing that makes this stand out"
emoji: 🦀
added: 2026-02-25       # today's date
```

### Required Fields

All fields are required except `github` and `website` (but at least one should be provided).

### Slug Rules

- Lowercase, hyphenated: `my-cool-project`
- Must match the filename: `my-cool-project.yml`
- No spaces, no special characters

### What Qualifies?

✅ Direct clones, forks, or reimplementations of OpenClaw
✅ Tools and services built for the OpenClaw ecosystem
✅ Independent projects clearly inspired by OpenClaw's vision
✅ Must have a public repo or website with actual code

❌ Paid-only / closed-source commercial products
❌ Vaporware (README-only repos with no code)
❌ Projects unrelated to the AI agent / assistant space

## Updating an Existing Entry

Edit the relevant `.yml` file and open a PR, or [file an issue](https://github.com/daveonkels/clawdex/issues/new?template=update.yml).

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # builds to dist/
node scripts/validate-projects.mjs   # validate all YAML
```

## Code of Conduct

Be excellent to each other. This is a directory, not a competition. Every shell belongs.
