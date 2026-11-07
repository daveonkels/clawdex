# Shelldex coverage review — November 7, 2026

The [published directory](https://shelldex.com/) and the original checkout contained 54 records at review time. All 54 passed the previous structural validator; their repository paths and slugs are unique. The most recent `added` date in the data is March 28. Updating repository metrics does not discover projects. There is no known denominator for the entire ecosystem; this is a prioritized audit, not a completeness percentage.

Two Sol researchers searched for direct descendants, independent assistants, non-English distributions, device ports, and ecosystem tools. A separate Sol evaluator checked fit and importance. Directories supplied leads; the evidence below comes from project repositories, project documentation, or a builder's launch account. We inspected published code and documentation, not the safety or performance of the software. Stars are rounded indications of repository interest seen during the review, not user counts or a new Shelldex metrics snapshot.

## What qualifies

Only projects that deliver a runnable AI agent like OpenClaw or Hermes belong. A user gives it a goal and the assistant selects and executes actions. A product can use an embedded agent engine or model SDK. Tools that host, extend, benchmark, manage or build other agents never qualify; there is no tools section. Require real implementation, an upstream quick start, an example task, an OpenClaw relationship or clear alternative use case, and no duplicate or commercial-only service. See [CONTRIBUTING](../CONTRIBUTING.md).

## First additions, in editorial order

Rank balances the strength of the connection, how many people might look for the project, and what it adds to existing comparisons.

| Rank | Project | Why it belongs; how to describe it |
| --- | --- | --- |
| 1 | [OpenHuman](https://github.com/tinyhumansai/openhuman) · ~43k | GPL-3.0 local agent with a Rust core, desktop and headless modes. An [April launch account](https://dev.to/neocortexdev/i-am-building-the-first-ai-agent-with-big-data-capabilities-70e) explicitly describes OpenClaw's architecture as the starting point. List as an inspired alternative; that account does not establish a Git fork or today's runtime dependency. |
| 2 | [QwenPaw](https://github.com/agentscope-ai/QwenPaw) · ~37k | Formerly CoPaw. An Apache-2.0 assistant built on AgentScope. Its [persona design docs](https://github.com/agentscope-ai/QwenPaw/blob/main/website/public/docs/persona.en.md) credit OpenClaw, so call it an inspired alternative and be specific about which design. One listing for both names. |
| 3 | [LobsterAI](https://github.com/netease-youdao/LobsterAI#how-it-works) · ~6.2k | NetEase Youdao's MIT desktop agent ships a pinned OpenClaw gateway. It adds permissions, sessions, artifacts, scheduling and messaging around that runtime. Classify as a derivative. |
| 4 | [Chinese community edition (openclaw-cn)](https://github.com/mf-yang/openclaw-cn) · ~4.7k | GitHub identifies the upstream fork; the tree and [package manifest](https://github.com/mf-yang/openclaw-cn/blob/main/package.json) ship actual gateway code and executables under MIT. Adds Chinese-language onboarding and integrations including DingTalk and WeCom. The old jiulingyun URL redirects to mf-yang. |
| 5 | [ESP-Claw](https://github.com/espressif/esp-claw) · ~2.4k | Espressif explicitly credits OpenClaw and implements the concept in C for its chips, with hardware sensing and execution. Apache-2.0. Distinct from both MimiClaw and zclaw. |

## More qualifying projects

| Project | What to record |
| --- | --- |
| [EdgeClaw](https://github.com/OpenBMB/EdgeClaw) · ~1.2k | Direct GitHub fork with edge/cloud routing. A useful comparison for local processing and selectively using cloud models. |
| [JavaClaw](https://github.com/ClawRunr/JavaClaw) · ~760 | Explicit JVM implementation with Spring AI, JobRunr and actual modules. Extend the language options to admit Java before adding; don't mislabel as JavaScript or multi. |
| [memUBot](https://github.com/NevaMind-AI/memUBot) · ~465 | AGPL-3.0 assistant which credits OpenClaw. The excluded [memU](https://github.com/NevaMind-AI/memU) is its memory layer. Only list the bot and use its own metrics. |
| [QuantClaw](https://github.com/QuantClaw/QuantClaw) · ~210 | Apache-2.0 C++ implementation. Good follow-up once the language rules can distinguish C++ from C. |

## Exclusions and open questions

- [ClawHub](https://github.com/openclaw/clawhub) (~9.5k) is the official registry for skills and plugins and was named in the original brief. [ClawX](https://github.com/ValueCell-ai/ClawX) (~7.6k) is an OpenClaw desktop client. [Lobster](https://github.com/openclaw/lobster) is a workflow execution tool. Exclude all three.
- [Paperclip](https://github.com/paperclipai/paperclip) manages OpenClaw and other agents. Exclude it: the agent it coordinates performs the work. The same distinction applies to the [Mem0 OpenClaw plugin](https://github.com/mem0ai/mem0/tree/main/integrations/openclaw).
- [GoClaw](https://github.com/nextlevelbuilder/goclaw) is an explicit Go reimplementation. The [license](https://github.com/nextlevelbuilder/goclaw/blob/dev/LICENSE) restricts commercial use. It is not a paid-only service, so the existing exclusion does not settle this case. Resolve whether to admit source-available runtimes with a clear license label; don't present it as permissively licensed.
- [CowAgent](https://github.com/zhayujie/CowAgent) and [Brigade](https://github.com/spinabot/brigade) are substantial functional competitors. We did not establish OpenClaw ancestry or explicit design inspiration. Consider them for a comparison guide without counting them in the family tree.

- Exclude [AgentTeams](https://github.com/agentscope-ai/AgentTeams) and [TinyAGI](https://github.com/TinyAGI/tinyagi): these coordinate other agents. Hold [Clawith](https://github.com/dataelement/Clawith) out of the shortlist until a review demonstrates a shipped assistant rather than a platform for creating teams.

## Catalog changes

Retiring ten ineligible records and adding the five reviewed agents brings the catalog from 54 to 49. The ten retired records are preserved outside the published site under [catalog-review/retired](catalog-review/retired/). None is a candidate for a tools section.

| Excluded repository | What it actually ships |
| --- | --- |
| [ClawGo](https://github.com/openclaw/clawgo) | Headless voice/chat node for an existing gateway. |
| [Clawra](https://github.com/SumeLabs/clawra) | Selfie skill installed into OpenClaw. |
| [ClaudeClaw](https://github.com/moazbuilds/claudeclaw) | Claude Code plugin that schedules and bridges Claude Code sessions. |
| [ClawWork](https://github.com/HKUDS/ClawWork) | Economic benchmark and task environment for evaluating agents at work. |
| [memU](https://github.com/NevaMind-AI/memU) and [MemOS](https://github.com/MemTensor/MemOS) | Memory layers for other agents. |
| [Moltworker](https://github.com/cloudflare/moltworker) and [NemoClaw](https://github.com/NVIDIA/NemoClaw) | Deployment and sandbox stacks for the OpenClaw assistant. |
| [OpenMolt](https://github.com/ybouane/OpenMolt.dev) | SDK and CLI to define and run agents from user-supplied definitions. It implements a reasoning loop, but the deliverable is an agent-building kit. |
| [SafestClaw](https://github.com/princezuda/safestclaw) | Command automation assistant. Its own feature comparison distinguishes it from agents that autonomously execute multi-step tasks. |

[AionUi](https://github.com/iOfficeAI/AionUi) stays: the built-in agent can organize files or generate documents without an external coding agent. ApexClaw remains a historical agent record with an unavailable repository, not a newly verified candidate. The November 7 refresh returned current GitHub metrics for the other 48 agents.

## Next candidates after the November 7 refresh

- [Atomic Agent](https://github.com/AtomicBot-ai/atomic-agent) is the closest next fit: a runnable local agent with an OpenClaw migration path. A [builder discussion about a concrete memory failure](https://www.reddit.com/r/LovingAIAgents/comments/1x184q7/our_agents_memory_decided_the_user_was_called/) gives a signal beyond repository stars.
- [DeerFlow](https://github.com/bytedance/deer-flow) is a prominent independent agent candidate. A [user's concurrency report](https://github.com/bytedance/deer-flow/issues/4993) specifically compares its behavior with OpenClaw. This is evidence for a comparison, not ancestry.
- [OpenJarvis](https://github.com/open-jarvis/OpenJarvis) is another independent assistant with [documented skill compatibility](https://github.com/open-jarvis/OpenJarvis/blob/main/docs/user-guide/skills.md). Verify the end-user workflow before prioritizing it over the direct descendants above.

The independent evaluator ranked EdgeClaw first for documented ancestry and
Atomic Agent second for a runnable assistant with a migration path. For the
broader comparison list, DeerFlow's [own design notes](https://github.com/bytedance/deer-flow/blob/main/docs/plans/2026-08-24-subagent-batch-capacity-implementation.md)
explicitly compare its batch execution to OpenClaw. That supports a specific
design connection, without implying that DeerFlow itself is a fork.
