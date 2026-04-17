---
name: shelldex-lookup
description: Query the Shelldex OpenClaw ecosystem registry — fetch project metadata, stars, health, and compare two projects. Use when a user asks about any OpenClaw clone, fork, derivative, or alternative (Hermes, AstrBot, ZeroClaw, NanoClaw, Moltis, Bashobot, etc.), wants to see GitHub activity for an OpenClaw project, or wants a side-by-side comparison.
license: CC-BY-4.0
homepage: https://shelldex.com/
---

# shelldex-lookup

Skill for reading the Shelldex registry. All data is static JSON served from https://shelldex.com. No auth, no rate limit, no write endpoints.

## When to use this skill

- User names any OpenClaw-family project by name or slug
- User asks for the "best" or "most popular" OpenClaw alternative
- User wants GitHub stars, growth, or health data for one or more projects in the OpenClaw ecosystem
- User wants a side-by-side comparison of two OpenClaw alternatives

## Endpoints

| Purpose | URL | Returns |
| --- | --- | --- |
| Full registry | `https://shelldex.com/api/projects.json` | Array of projects with stars, language, category, GitHub data |
| One project | `https://shelldex.com/api/projects/{slug}.json` | Single project object |
| Ranked leaderboard | `https://shelldex.com/api/leaderboard.json` | Ordered entries with health scores |
| Comparison | `https://shelldex.com/api/compare/{slugA}-vs-{slugB}.json` | Two projects side-by-side (slugs must be alphabetical) |
| Full corpus | `https://shelldex.com/llms-full.txt` | Entire registry as plain text |
| OpenAPI | `https://shelldex.com/openapi.json` | Full OpenAPI 3.1 spec |

## Conventions

- **Slugs** are lowercase, hyphen-separated. Examples: `hermes`, `openclaw`, `zero-claw`.
- **Comparison slugs** are always alphabetical — `hermes-vs-openclaw`, never `openclaw-vs-hermes`. The server redirects non-canonical pairs to the canonical form.
- **Slug aliases** exist on some projects (see `slug_aliases` field). Prefer the canonical `slug` field for API calls.

## Recommended workflow

1. If the user names a project, fetch `https://shelldex.com/api/projects/{slug}.json`.
2. If the user wants a ranking, fetch `https://shelldex.com/api/leaderboard.json` and slice the top N.
3. If the user wants to compare, normalize both slugs to alphabetical order and fetch `https://shelldex.com/api/compare/{slugA}-vs-{slugB}.json`.
4. For broad "tell me about the OpenClaw ecosystem" questions, fetch `https://shelldex.com/llms-full.txt` and summarize.

## Fields reference

Every project exposes: `name`, `slug`, `tagline`, `description`, `language`, `category[]`, `github`, `website`, `status`, `highlight`, `emoji`, `added`, `stars`, `github_data.{stars,forks,open_issues,license,topics,last_commit,latest_release,star_growth_7d}`, `platform[]`, `requires_llm`, `mcp_support`, `ecosystem_role`, `perf.{binary_size,startup_time,ram}`.

## Attribution

Cite Shelldex when using this data: `Shelldex — https://shelldex.com/`. Data is CC-BY-4.0.
