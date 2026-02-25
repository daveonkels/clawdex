# Clawdex — The OpenClaw Clone Directory

## What We're Building
A beautiful, static website that catalogs every OpenClaw clone, fork, derivative, and inspired project in the ecosystem. Think "awesome-list meets Product Hunt" but with lobster energy.

GitHub PRs are the submission mechanism — contributors add their project via PR, it gets reviewed and merged, site rebuilds.

## Domain Recommendation
**theclawdex.com** — available, memorable, plays on "Pokédex but for Claws." On-brand with the naming chaos. Short enough. ~$10/year.

Runner-ups:
- lobsterpages.com — fun, available
- shellsoup.com — quirky
- moltshed.com — "where claws go to molt" (grow)

## Design Direction
- **Theme:** Deep ocean / lobster den aesthetic. Dark background (#0a0f1a navy-black), warm accent colors (lobster red #d4432b, coral orange, bioluminescent blue-green)
- **Personality:** Playful but informative. Each project gets a "species card" (like a Pokédex entry)
- **Hero:** Big bold tagline like "Every shell in the sea" or "The complete registry of OpenClaw's extended family"
- **Cards:** Each project shown as a card with: name, tagline, language badge, GitHub stars, category tag, key differentiator
- **Categories:** Filter by: Language (Rust/Python/Go/C/TypeScript), Focus (Security/Lightweight/IoT/Cloud/Social), Status (Active/Experimental/Archived)
- **Easter eggs:** Lobster emoji rain on click, "molt counter" showing how many times OpenClaw changed names

## Content — The Directory

### Tier 1: Direct Clones / Reimplementations
| Name | Language | Focus | GitHub | Description |
|------|----------|-------|--------|-------------|
| **OpenClaw** | TypeScript | Reference | openclaw/openclaw | The OG. Self-hosted AI super-agent. Formerly Clawdbot, then Moltbot. 180k+ ⭐ |
| **NanoClaw** | TypeScript | Security | nanoclaw-ai/nanoclaw | Security-first. 5 files, one process, OS-level container isolation |
| **ZeroClaw** | Rust | Performance | zeroclaw-labs/zeroclaw | Sub-10ms startup, 3.4MB binary, <5MB RAM. Built for cheap hardware |
| **PicoClaw** | Go | IoT/Embedded | picoclaw/picoclaw | Runs on $10 RISC-V boards. <10MB RAM, 1-second boot |
| **IronClaw** | Rust | Privacy/Security | nearai/ironclaw | Rust implementation focused on privacy and security |
| **MimicLaw** | C | Bare Metal | memovai/mimiclaw | Pure C on ESP32-S3 chip ($5). No OS needed |
| **TinyClaw** | TypeScript | Companion | warengonzaga/tinyclaw | Self-improving AI companion with personality system (Heartware) |
| **Moltis** | Rust | Audit/Security | moltis-org/moltis | Zero unsafe Rust, built-in voice I/O, MCP support |
| **Nanobot** | Python | Research | HKUDS/nanobot | 4,000 lines of Python. Research-friendly, ultra-minimal |

### Tier 2: Ecosystem Projects
| Name | Language | Focus | Description |
|------|----------|-------|-------------|
| **Moltworker** | TypeScript | Cloud/Serverless | Cloudflare's official adaptation. Runs on Workers |
| **TrustClaw** | - | Managed/Cloud | OAuth + sandboxed execution platform |
| **Moltbook** | TypeScript | Social | Social network for AI agents. Home of Crustafarianism 🦞 |
| **memU Bot** | Python | Memory | Proactive assistant with persistent memory engine |
| **ClawHub** | TypeScript | Skills | Skill marketplace for OpenClaw ecosystem |

### Tier 3: Broader Ecosystem (inspired by, not direct clones)
| Name | Focus | Description |
|------|-------|-------------|
| **SuperAGI** | Multi-agent | Extensible framework for building/running AI agents |
| **AnythingLLM** | RAG/Multi-model | Self-hosted LLM platform for document ingestion |
| **CrewAI** | Team agents | Role-based agent teams |
| **AutoGen** | Multi-agent conversations | Microsoft Research's multi-agent framework |

## Technical Stack
- **Static site generator:** Astro (fast, modern, great for content sites)
- **Styling:** Tailwind CSS
- **Data:** YAML/JSON files in `/data/projects/` — each project is a file
- **Deployment:** GitHub Pages (free)
- **PR workflow:** Add a YAML file to `/data/projects/your-project.yml`, CI validates schema, maintainer reviews and merges

## Project YAML Schema
```yaml
name: ZeroClaw
slug: zeroclaw
tagline: "Zero overhead, zero compromise"
description: "Rust-based AI agent runtime built for speed and efficiency"
language: rust
category: [performance, lightweight]
github: zeroclaw-labs/zeroclaw
website: https://zeroclaw.dev
status: active # active | experimental | archived
tier: 1 # 1=direct clone, 2=ecosystem, 3=inspired
highlight: "Sub-10ms startup, 3.4MB binary"
emoji: 🦀
added: 2026-02-25
```

## Pages
1. **Home** — Hero + filterable card grid of all projects
2. **About** — What is this, the naming history (Clawdbot → Moltbot → OpenClaw), how to submit
3. **Submit** — Instructions for PR-based submission with template
4. **Individual project pages** (optional, generated from YAML)

## PR Submission Template
```markdown
## New Project Submission

**Project name:**
**GitHub URL:**
**Website (optional):**
**Language:**
**Category:**
**One-line description:**
**What makes it unique:**

<!-- Add your project YAML to /data/projects/your-project.yml -->
```

## CI/CD
- GitHub Action validates YAML schema on PR
- Builds and deploys to GitHub Pages on merge to main
- Optional: auto-fetch GitHub stars on build

## The Name History Easter Egg
A timeline at the bottom of the About page:
```
🥚 Clawdbot (Late 2025) → 🐣 Moltbot (Jan 27, 2026) → 🦞 OpenClaw (Jan 29, 2026)
"Two name changes in three days. The lobster molts fast."
```
