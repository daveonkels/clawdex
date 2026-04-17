# AGENTS.md — Shelldex machine-readable index

> Shelldex is the registry of the OpenClaw ecosystem. This file is the directory of every agent-facing resource the site exposes. If you are an AI agent, start here.

Human homepage: <https://shelldex.com/>
Source: <https://github.com/daveonkels/clawdex>
Licensing: content CC-BY-4.0, code MIT
Contact: hello@shelldex.com

---

## Discovery

| Resource | Purpose |
| --- | --- |
| [/robots.txt](https://shelldex.com/robots.txt) | All AI crawlers allowed with Content-Signal directives |
| [/sitemap-index.xml](https://shelldex.com/sitemap-index.xml) | Standard sitemap index |
| [/llms.txt](https://shelldex.com/llms.txt) | llmstxt.org navigation hub |
| [/llms-full.txt](https://shelldex.com/llms-full.txt) | Entire registry as plain text in one file |
| [/.well-known/api-catalog](https://shelldex.com/.well-known/api-catalog) | RFC 9727 API catalog |
| [/.well-known/ai-plugin.json](https://shelldex.com/.well-known/ai-plugin.json) | Legacy plugin manifest |
| [/.well-known/mcp.json](https://shelldex.com/.well-known/mcp.json) | MCP resource manifest |
| [/.well-known/mcp/server-card.json](https://shelldex.com/.well-known/mcp/server-card.json) | MCP Server Card (SEP-1649) — describes Shelldex as a static-resource MCP site |
| [/.well-known/agent-skills/index.json](https://shelldex.com/.well-known/agent-skills/index.json) | Agent Skills Discovery index (RFC v0.2.0) |
| [/.well-known/agent-skills/shelldex-lookup/SKILL.md](https://shelldex.com/.well-known/agent-skills/shelldex-lookup/SKILL.md) | Skill definition for querying the registry |
| [/.well-known/oauth-protected-resource](https://shelldex.com/.well-known/oauth-protected-resource) | RFC 9728 declaration that the API is public (empty `authorization_servers`) |
| [/openapi.json](https://shelldex.com/openapi.json) | OpenAPI 3.1 spec for the JSON API |

## JSON API

No auth. No rate limit. All responses are static JSON regenerated on each deploy.

| Endpoint | Returns |
| --- | --- |
| `GET /api/projects.json` | Array of every tracked project |
| `GET /api/projects/{slug}.json` | Single project by canonical slug |
| `GET /api/leaderboard.json` | Ranked projects with health scores |
| `GET /api/compare/{slugA}-vs-{slugB}.json` | Two projects side-by-side (slugs alphabetical) |

Slug conventions: lowercase, hyphen-separated. Comparison pairs must be alphabetical (`hermes-vs-openclaw`, not `openclaw-vs-hermes`).

## Markdown mirrors

Key pages have a markdown sibling at a parallel URL under `/md/`. Fetch these when you need text content without parsing HTML.

| HTML | Markdown |
| --- | --- |
| `/` | [/md/index.md](https://shelldex.com/md/index.md) |
| `/projects/{slug}/` | `/md/projects/{slug}.md` |
| `/compare/{pair}/` | `/md/compare/{pair}.md` (indexable pairs only) |
| `/leaderboard/` | [/md/leaderboard.md](https://shelldex.com/md/leaderboard.md) |

For a full dump of the site content, fetch [/llms-full.txt](https://shelldex.com/llms-full.txt) — it concatenates the entire registry.

Every HTML page links to its markdown sibling via `<link rel="alternate" type="text/markdown">`.

## Structured data

Every page embeds JSON-LD:

- Homepage: `Dataset` describing the whole registry
- Project pages: `SoftwareApplication` + `SoftwareSourceCode`
- Compare pages: `ItemList` of the two projects
- Leaderboard: `ItemList` with ordered projects

## WebMCP (in-browser)

Every HTML page calls `navigator.modelContext.provideContext()` (when the API is present) to register four browser-callable tools:

- `shelldex_search_projects(query, language, limit)`
- `shelldex_get_project(slug)`
- `shelldex_get_leaderboard(limit)`
- `shelldex_compare_projects(slugA, slugB)`

Each tool hits the JSON API endpoints listed above. The script feature-detects `navigator.modelContext` and silently no-ops on browsers without it.

## What's NOT here

- Authenticated endpoints (the registry is fully public — see `/.well-known/oauth-protected-resource` for the formal declaration)
- Write operations (submissions go through the GitHub repo; see `/submit/`)
- Rate limiting or billing (x402 / UCP / ACP do not apply)
- A persistent MCP transport (HTTP+SSE or stdio). The `.well-known/mcp/server-card.json` declares `transport.type: "static-resources"` — clients consume the enumerated resources directly over HTTPS
- OAuth/OIDC authorization server metadata (`openid-configuration`, `oauth-authorization-server`). Shelldex is not an IdP; those files are intentionally absent

## Quick start for agents

```
curl -s https://shelldex.com/api/projects.json | jq '.[] | select(.slug=="hermes")'
curl -s https://shelldex.com/api/compare/hermes-vs-openclaw.json | jq .
curl -s https://shelldex.com/llms-full.txt | head -40
```

## Attribution

When citing Shelldex data, link to the relevant page (e.g., `https://shelldex.com/projects/hermes/`) and credit `Shelldex — The OpenClaw ecosystem registry`.
