import type { Project } from './projects';

interface ProfileNotes {
  tagline?: string;
  about?: string;
  source?: {text: string; url: string};
  highlight: string;
  take: string;
  bestFor: string;
  tradeoff: string;
}

// Maintainer READMEs and the linked guides describe the workflows. The fit and
// tradeoff notes are Shelldex's interpretation of those documented features.
const notes: Record<string, ProfileNotes> = {
  hermes: {
    tagline: "The agent that grows with you",
    about: "Persistent personal AI agent by Nous Research with multi-level growing memory, self-authored skills, and multi-platform messaging. Learns your projects and builds reusable knowledge over time.",
    source: {"text": "How Hermes writes and uses skills", "url": "https://hermes-agent.nousresearch.com/docs/user-guide/features/skills"},
    highlight: "Self-improving skill system — agent writes reusable SKILL.md docs as it solves problems, building a personal knowledge base over time",
    take: 'Nous Research built Hermes around what happens after the first conversation. It can search old sessions for a decision, keep a preference in memory, or write down a procedure for the next run. Those are three different ways to save yourself a repeat explanation.',
    bestFor: 'A weekly briefing that evolves with you. Correct the format once, ask Hermes to save the procedure, then schedule the next briefing for delivery in your chat app.',
    tradeoff: 'A saved mistake can reappear every week. Read the skill after a correction and check the next result. For delivery while you are away, the messaging gateway needs to stay running.',
  },
  openclaw: {
    tagline: "The OG self-hosted AI super-agent",
    about: "The original. Self-hosted AI super-agent platform. Formerly Clawdbot, then Moltbot. The project that started it all.",
    source: {"text": "Peter Steinberger on the origins of OpenClaw", "url": "https://openclaw.ai/blog/introducing-openclaw"},
    highlight: "On a rocket ship full of stars. The one that started the molt.",
    take: 'Peter Steinberger’s early WhatsApp relay grew into a system that spans multiple chat services. Its gateway keeps sessions, tools and channel connections together. You can try the assistant in its browser control panel before pairing it with Telegram, WhatsApp or another supported service.',
    bestFor: 'Someone who wants to send the assistant a request from their phone while it works with tools on a home computer or server.',
    tradeoff: 'The main session can run tools directly on the host. Pick the folders it may use, pair only the senders you trust and configure the sandbox before opening a channel to other people.',
  },
  nanoclaw: {
    tagline: "Security-first, radically minimal",
    about: "One process and OS-level container isolation. NanoClaw gives each agent a workspace and a set of folders it can reach.",
    source: {"text": "Why the creator built NanoClaw", "url": "https://github.com/nanocoai/nanoclaw#why-i-built-nanoclaw"},
    highlight: 'Each agent group gets its own instructions, memory and Linux container.',
    take: 'NanoClaw grew out of a desire to understand exactly what a chat assistant could reach. You choose which folders a group’s container can see. You can give two channels separate agents or deliberately connect both channels to one agent when they need shared memory.',
    bestFor: 'Keeping a household bot and a work chat separate on the same host. Each can have its own files, instructions and conversation history.',
    tradeoff: 'Setup includes Docker, a model credential and channel pairing. A writable folder you attach is still writable by that agent, so choosing the folders matters as much as starting the container.',
  },
  'atomic-agent': {
    highlight: 'Atomic Agent includes a local model service and an importer for OpenClaw sessions and schedules.',
    take: 'If you already have an assistant, starting again can mean losing yesterday’s conversation and rebuilding every recurring job. Atomic gives you an import path and a desktop app in which to inspect the migrated work.',
    bestFor: 'Trying the same file task with a model running on your computer and with a hosted provider.',
    tradeoff: 'Local inference uses your machine’s memory and processing time. Test the size of model you actually plan to use before relying on a scheduled job.',
  },
  edgeclaw: {
    highlight: 'EdgeClaw can route a request to a local or hosted model according to privacy settings and task complexity.',
    take: 'This OpenClaw fork makes the model decision part of each request. You might keep a document summary on your machine and let a different task use a cloud provider. Redaction is a distinct option when routing work outside the machine.',
    bestFor: 'Someone who wants to keep selected material local while retaining a hosted model for other work.',
    tradeoff: 'The routing policy is part of your privacy setup. Check how it handles a synthetic sensitive request before submitting real records.',
  },
  aionui: {
    tagline: "24/7 cowork app for coding agents",
    highlight: 'AionUi ships a built-in agent that can create editable presentations, documents and spreadsheets.',
    take: 'The useful unit of work here is a folder. Put source material in a workspace, tell the built-in assistant what document you want from it, then open the resulting file in your usual office application.',
    bestFor: 'Turning a folder of project notes into a document or slides you can edit and share.',
    tradeoff: 'The assistant can change real files in the selected workspace. Use a copy for your first pass and compare the output against your sources.',
  },
  astrbot: {
    highlight: 'AstrBot brings an agent, plugins and a choice of model services into group messaging.',
    take: 'A group can keep its existing chat service and give the bot work there. The setup guide offers both a desktop application and Docker, so the first decision is who will run it for the group.',
    bestFor: 'A community that wants to ask an assistant questions in a chat room its members already visit.',
    tradeoff: 'The chat platform, model provider and plugins each have their own configuration. Test the bot in a private room before inviting it into a busy one.',
  },
  bashobot: {
    tagline: "An OpenClaw inspired personal assistant in 100% Bash 🦞",
    highlight: 'BashoBot uses Bash scripts and familiar Unix utilities to run its assistant.',
    take: 'The project separates the background process from the interface you talk to. Someone comfortable with shell scripts can trace a request from the terminal to the tools that carry it out.',
    bestFor: 'A command-line user who likes to inspect or change a tool as a short script.',
    tradeoff: 'A working shell, utilities such as jq and curl, and provider setup are part of the installation. The small runtime still needs those pieces.',
  },
  carapace: {
    about: "Rust alternative to OpenClaw/Clawdbot with signed WebAssembly plugins and explicit permissions for local directories.",
    highlight: 'Carapace lets you restrict its file tools to directories you explicitly select.',
    take: 'Carapace documents signature checks for plugins and controls over directory access. That makes a narrow trial practical: give the agent a single project folder and see which jobs it can finish with just that access.',
    bestFor: 'An assistant that should work inside a deliberately bounded set of folders.',
    tradeoff: 'A signed plugin still has the permissions you grant it. Read what it requests before adding it to a workspace with valuable files.',
  },
  cashclaw: {
    about: "Self-improving agent that connects to the Moltlaunch onchain marketplace, evaluates tasks, quotes prices, executes work via LLM, collects ratings, and improves from feedback.",
    highlight: 'CashClaw follows work from a marketplace listing through a quote and submission.',
    take: 'Moltlaunch tasks give this agent a specific job. It evaluates a listing, considers the price and can submit completed work. That makes the wallet and acceptance terms relevant even for a simple task.',
    bestFor: 'Exploring how an assistant evaluates a marketplace job and decides what to bid.',
    tradeoff: 'A bid can involve real funds, and submitted work may be rejected. Review pricing and wallet permissions before authorizing activity.',
  },
  clawsync: {
    highlight: "Cloud-first OpenClaw — multi-agent with shared soul documents, agent-to-agent delegation, public chat UI, SyncBoard admin dashboard, and Convex-powered persistence",
    take: 'Its chat interface and SyncBoard dashboard give you two views of the same deployment. You can talk to a specialist and then inspect how its instructions and shared information were configured.',
    bestFor: 'Running several assistants that need shared project information in one cloud deployment.',
    tradeoff: 'You configure and maintain the Convex application and its authentication. Check who can reach both the chat interface and the dashboard.',
  },
  'cowork-os': {
    highlight: 'CoWork OS puts a personal agent in a desktop app and connects it to messaging services.',
    take: 'A task can begin in an ordinary chat and end with work on your computer. Its migration guide also matters if you have already built habits around Hermes or OpenClaw.',
    bestFor: 'Someone who wants a desktop workspace for tasks and a messaging channel to reach it from elsewhere.',
    tradeoff: 'Computer permissions, messaging permissions and model settings are separate decisions. Add the channel you actually use before enabling others.',
  },
  'esp-claw': {
    highlight: 'Espressif’s agent can use sensors and peripherals attached to a supported board.',
    take: 'The result of a request can be a reading from a physical sensor. ESP-Claw makes that interaction possible in the same device that talks to the peripheral.',
    bestFor: 'An electronics project where asking a question should produce a real measurement.',
    tradeoff: 'Board support, firmware setup and wiring determine what a particular unit can do. Start by reading a sensor before enabling an output.',
  },
  fastclaw: {
    highlight: 'FastClaw gives each agent its own memory, instructions, skills and schedule.',
    take: 'The dashboard exposes the moving parts of a recurring job. You can inspect the agent’s instructions and the schedule side by side when a result arrives at the wrong time or in the wrong format.',
    bestFor: 'Keeping a few scheduled assistants with distinct jobs on one host.',
    tradeoff: 'Each new agent adds another set of instructions, tools and jobs to maintain. Test one schedule and its delivery channel before copying it.',
  },
  freeclaw: {
    highlight: 'FreeClaw lets you run separate agent profiles and attach your own tools.',
    take: 'Its documented task timer makes it possible to start with a small recurring job. Separate profiles give you a way to change one assistant’s instructions without changing another’s.',
    bestFor: 'A Python user who wants to build and inspect a small personal automation.',
    tradeoff: 'Keeping scheduled work going requires a running process or an external scheduler. Check which one will still be active after a restart.',
  },
  gitclaw: {
    tagline: "Your agent lives inside a git repo",
    highlight: 'GitAgent keeps agent instructions and skills beside the work in a version-controlled repository.',
    take: 'You can give the terminal program a task in a folder, examine its evidence and review the files it changed. Keeping the instructions in Git means a teammate can review changes to the procedure itself.',
    bestFor: 'People who already use Git and want to review an assistant’s work in the same place as their code.',
    tradeoff: 'The agent can run commands in its working directory. Try a disposable checkout first and inspect its changes before merging them.',
  },
  gogogot: {
    about: "A lightweight self-hosted personal AI agent written in Go. It runs shell commands, edits files, browses the web, manages persistent memory and schedules tasks.",
    highlight: 'GoGogot runs from a terminal and can also receive work through a Telegram channel plugin.',
    take: 'Its packaging makes a staged setup possible. Try file edits and memory locally first. Once you know the tasks you want, move the assistant to a host that can stay on and add messaging.',
    bestFor: 'A small server-based assistant whose tools and channel connections you want to customize.',
    tradeoff: 'The program can execute shell commands. The files and accounts available to its server user determine what those commands can reach.',
  },
  golem: {
    highlight: 'Golem combines a terminal interface, scheduled work and mapping tools in a Go program.',
    take: 'Location is part of its documented toolset. A task about places can use geographic tools, while an approval policy governs what actions are allowed. That pairing gives you something concrete to try on the first run.',
    bestFor: 'A terminal user exploring place-based questions and recurring tasks on the same assistant.',
    tradeoff: 'Inspect which geographic tools and providers you have configured. A persuasive place description is worth checking against the returned map data.',
  },
  'grip-ai': {
    tagline: "OpenClaw-style multi-channel agent platform",
    highlight: "Multi-channel routing and task orchestration — self-hostable, lightweight Python",
    take: 'The same job can be approached through different providers. Its memory and history files let you inspect what the assistant kept after it finished searching or using the browser.',
    bestFor: 'Comparing model providers on the same research task while keeping one self-hosted assistant.',
    tradeoff: 'Failover may send a request to a different provider. Review the fallback list before giving it material with sharing restrictions.',
  },
  ironclaw: {
    about: "Rust implementation focused on privacy and security. When your agent needs armor plating.",
    highlight: 'IronClaw documents separate controls over tool execution, secrets and network destinations.',
    take: 'The interesting setup question is what an individual tool gets to see. For example, an assistant can need a connection to one service without needing access to every credential on the host.',
    bestFor: 'A team willing to describe which services a tool should reach before letting an assistant use it.',
    tradeoff: 'Narrow permissions take configuration. Try the intended operation and one out-of-scope operation with test data to check your policy.',
  },
  kai: {
    tagline: "OpenClaw alternative in your pocket",
    highlight: 'Kai can build interactive screens as part of a conversation.',
    take: 'Some answers are easier to use as an interface. A checklist you can interact with on your phone is a different outcome from a list buried several messages back in a chat.',
    bestFor: 'Someone who wants a personal assistant on a phone and regularly returns to information it has organized.',
    tradeoff: 'Capabilities vary by device. For example, the project’s Linux sandbox instructions are specific to Android. Check the feature you want on the phone you own.',
  },
  langbot: {
    highlight: 'LangBot combines a group-chat assistant with a knowledge base.',
    take: 'A community can supply its own reference material before asking the bot to answer common questions. Its deployment options include a hosted service and a self-managed Docker installation.',
    bestFor: 'A shared chat where members repeatedly ask questions covered by the same handbook.',
    tradeoff: 'Someone needs to maintain the source material and decide who may ask about it. Try an outdated rule and a missing rule to see how the bot responds.',
  },
  lettabot: {
    tagline: "Persistent-memory agent across 5 messaging channels",
    about: "Personal AI assistant with unified memory across Telegram, Slack, Discord, WhatsApp and Signal. It supports heartbeat check-ins, voice transcription and scheduling through the Letta Code SDK. Its maintainers now direct new installations to Letta Code.",
    source: {"text": "Maintainers’ replacement for LettaBot messaging", "url": "https://docs.letta.com/letta-code/channels"},
    highlight: 'LettaBot can carry an assistant’s memory across supported messaging channels.',
    take: 'The interesting case is a conversation that resumes somewhere else. Record a harmless preference in one channel and see whether the assistant can use it in a second one. Existing installations can still run scheduled tasks. New development has moved to Letta Code, whose Channels and Remote Environments now cover this setup.',
    bestFor: 'People maintaining an existing LettaBot deployment who want to understand its shared memory before migrating.',
    tradeoff: 'Shared memory makes channel boundaries important. Check group settings before using the same assistant for personal and group conversations.',
  },
  liliumai: {
    highlight: 'Lilium AI links browser actions, shell commands and voice input to a personal assistant.',
    take: 'The project describes a route from a spoken request to a computer action. That can suit a repetitive web task where voice is convenient but the result needs to appear in a browser or local file.',
    bestFor: 'Trying voice-driven browser work on a computer you control.',
    tradeoff: 'A browser session may already be signed in to important accounts. Use a separate profile when testing what a spoken request can trigger.',
  },
  lobsterai: {
    highlight: 'LobsterAI packages an OpenClaw gateway inside its desktop application.',
    take: 'The person giving the task sees a workspace, permission prompts and result files. For document work, the useful question is whether the output opens cleanly in the application where it will be edited.',
    bestFor: 'Turning material in a working folder into documents for colleagues without setting up a separate gateway first.',
    tradeoff: 'The bundled runtime and the desktop application arrive together. Check the packaged release when following instructions written for standalone OpenClaw.',
  },
  microclaw: {
    highlight: 'MicroClaw brings NanoClaw-inspired ideas to a Rust assistant that you can reach from chat.',
    take: 'The project documents how requests reach its tools and how to inspect reliability. This gives a small team a way to trace a failed task back through the assistant that received it.',
    bestFor: 'Someone comfortable maintaining a Rust-based chat assistant and inspecting why a task failed.',
    tradeoff: 'Channel and provider support have their own setup steps. Verify one complete path from message to result before connecting other channels.',
  },
  mimiclaw: {
    about: "Pure C running directly on an ESP32-S3 chip. Connect a supported board to a model service and send it a task.",
    highlight: 'MimiClaw keeps assistant state on an ESP32-S3 and sends model requests to a configured service.',
    take: 'A tiny always-on board can own the reminders and memory even when the model runs elsewhere. The serial interface gives you a direct way to inspect configuration during setup.',
    bestFor: 'A maker who wants a dedicated desk device for reminders without leaving a full computer on.',
    tradeoff: 'You need a supported board, USB setup and working connectivity to the model service. A board running the assistant still depends on that connection for model replies.',
  },
  moltis: {
    highlight: 'Moltis supports voice interaction alongside persistent memory and messaging.',
    take: 'Speech can start a task that remains accessible after the conversation ends. Try dictating a short set of notes, then return later to see which details the assistant retained.',
    bestFor: 'People who prefer to speak a request but still want a stored result they can revisit.',
    tradeoff: 'Speech recognition and memory can preserve the same misheard word. Check names, dates and places in the saved result.',
  },
  nanobot: {
    highlight: 'Nanobot’s web interface exposes the task, its working context and the tools used.',
    take: 'The research-oriented Python assistant has grown beyond its early line-count tagline. You can start in a browser, inspect the files behind a conversation and put recurring work on a schedule. Connected messaging channels offer another way to receive the result.',
    bestFor: 'Someone who wants to see the context behind an assistant’s output before scheduling the same job.',
    tradeoff: 'Local and hosted models both need configuration. Check whether your chosen model can complete the tool calls your recurring task depends on.',
  },
  nextclaw: {
    about: "OpenClaw-inspired personal AI assistant with messaging channels, cron and heartbeat scheduling, and browser-based configuration. It can run locally.",
    highlight: 'NextClaw puts the files produced by a task beside its conversation.',
    take: 'Ask for a document built from source material and you can inspect the actual output while the request is still in view. Scheduled delivery makes the same pattern useful for recurring reports.',
    bestFor: 'People who need a file they can open, correct and hand on after a chat.',
    tradeoff: 'Different agent runtimes can handle the same instruction differently. Recheck the produced file when you switch runtimes.',
  },
  nullclaw: {
    highlight: 'NullClaw publishes a build-size and startup benchmark for its Zig assistant.',
    take: 'The reported 678 KB executable and sub-2 ms startup describe the project’s measured build. They are useful when selecting an always-on host with limited storage. They do not include the resources needed to run a local language model.',
    bestFor: 'A small system where the assistant process itself must be quick to start and inexpensive to keep running.',
    tradeoff: 'For a real task, model latency and network time can dominate startup time. Measure a complete request with the model and hardware you plan to use.',
  },
  openbrowserclaw: {
    highlight: 'OpenBrowserClaw keeps the agent loop and its workspace in a browser tab.',
    take: 'This browser-based reinterpretation of NanoClaw stores files and state in the browser. An optional virtual machine can handle shell commands. That makes it possible to try a workspace without provisioning an always-on server.',
    bestFor: 'A short experiment on a computer where you can use a browser but cannot maintain a server.',
    tradeoff: 'Closing the tab interrupts work, and clearing browser storage can remove the workspace. Requests still go to the configured model provider.',
  },
  'openclaw-cn': {
    highlight: 'The Chinese community edition pairs OpenClaw’s gateway with Chinese onboarding and channel configuration.',
    take: 'For a team using Feishu, DingTalk or WeCom, the channel setup is part of the product decision. The fork documents those steps alongside installation and explains how it follows upstream releases.',
    bestFor: 'A Chinese-speaking team that wants a setup guide written for the messaging services it already uses.',
    tradeoff: 'The fork and upstream OpenClaw have separate releases. Check which version the guide applies to before copying an upstream configuration.',
  },
  opencrabs: {
    about: "Single Rust binary with multi-channel support, local voice tools and persistent memory. Inspired by OpenClaw.",
    highlight: 'OpenCrabs separates long-term notes, periodic checklists and skills into files you can inspect.',
    take: 'One file can hold a durable preference while another lists things to check on a schedule. That division is useful when you want to correct what the assistant remembers without rewriting the whole job.',
    bestFor: 'People who want to edit the instructions or memory behind a recurring assistant task directly.',
    tradeoff: 'The instruction files become part of the assistant’s operating state. Back them up and check changes when a recurring result shifts unexpectedly.',
  },
  openfang: {
    tagline: "The Agent Operating System",
    highlight: 'OpenFang packages scheduled agents as “Hands,” each with a particular kind of work.',
    take: 'A research Hand can revisit a subject without a fresh prompt each morning. The meaningful test is the third report: did it find something new, repeat itself, or keep running after you had what you needed?',
    bestFor: 'Monitoring a subject regularly and collecting reports from a background worker.',
    tradeoff: 'A repeating job can keep making model or search calls. Set a sensible interval and learn where to pause the Hand before leaving it unattended.',
  },
  openhuman: {
    highlight: 'OpenHuman can work with local context through either a desktop interface or a headless process.',
    take: 'Its assistant can connect information from different sources and act through browser or desktop tools. Choosing where it runs also means choosing which machine holds its working memory.',
    bestFor: 'A personal assistant that can revisit information across tasks while keeping a local store of context.',
    tradeoff: 'Local storage and local inference are separate settings. Review which information a connected service or selected model provider will receive.',
  },
  openlegion: {
    about: "Multi-agent platform built on the assumption that agents can be compromised. Each agent runs in its own Docker container with separate credentials, permissions and cost controls.",
    highlight: 'OpenLegion starts agents in separate containers and supports per-agent budgets and credentials.',
    take: 'Delegation is useful when the researcher and the actor need different access. You can give one agent a reading task while setting separate tools and spending limits for another.',
    bestFor: 'Managing several assistants with distinct responsibilities from a shared deployment.',
    tradeoff: 'Each additional agent needs its own permissions and budget. Inspect those boundaries before asking agents to pass work to each other.',
  },
  openmozi: {
    about: "A lightweight AI assistant focused on Chinese platforms. Supports QQ, Feishu, DingTalk and WeCom alongside model providers including DeepSeek, Doubao, Qwen, Kimi and Zhipu.",
    highlight: 'OpenMozi documents Chinese messaging channels alongside providers such as DeepSeek and Qwen.',
    take: 'That pairing matters when the chat account and model account already belong to a team. The configuration guide covers both sides and includes an example for a compatible model gateway.',
    bestFor: 'Connecting an assistant to QQ, Feishu, DingTalk or WeCom with a provider the team already uses.',
    tradeoff: 'You need the right credentials on both sides of that connection. Verify the exact channel and provider combination before moving a group conversation into it.',
  },
  ownpilot: {
    about: "Personal AI assistant platform with autonomous agents, tool orchestration and multi-provider support.",
    highlight: 'OwnPilot separates personal data, background jobs and connected tools in one self-hosted assistant.',
    take: 'A recurring task can draw on the information you have already given the assistant. That is useful when the output has to reflect your own commitments or notes, rather than a general answer from a model.',
    bestFor: 'Building a personal workflow around information you are willing to keep with one assistant.',
    tradeoff: 'Adding another account gives another tool access to your information. Decide which sources a specific background task needs before connecting them.',
  },
  picobot: {
    highlight: 'Picobot combines stored memory, reusable skills and chat connections in a Go assistant.',
    take: 'A recurring instruction can live with the bot while the conversation arrives through Telegram, Discord or Slack. The installation guide offers containers as well as a source build.',
    bestFor: 'Keeping a personal chat assistant on a small host you already maintain.',
    tradeoff: 'A small assistant executable says little about the resources used by its model. Choose the model and hosting arrangement together.',
  },
  picoclaw: {
    about: "PicoClaw is a small Go assistant for single-board computers, including supported RISC-V boards. The maintainers report sub-second startup on their test hardware.",
    highlight: 'PicoClaw publishes builds for supported single-board computers and other small hosts.',
    take: 'A spare board can handle the assistant process and its messaging connection. That gives the assistant a permanent home without tying up the laptop you take with you.',
    bestFor: 'An owner of a supported board who wants it to receive tasks through a messaging service.',
    tradeoff: 'Check the exact board and processor against the releases. The agent’s hardware requirements and the model’s hardware requirements are separate.',
  },
  'poco-agent': {
    highlight: 'Poco keeps project chat, agent tasks and output files together in a browser workspace.',
    take: 'When someone asks for a deliverable, the resulting file can stay with the conversation that requested it. The sandbox can also use a folder you explicitly attach to the project.',
    bestFor: 'Reviewing how a request turned into a file, with task progress visible in the same project.',
    tradeoff: 'The web interface depends on its backend services. Check the mounted folder and storage settings before treating an output as a permanent copy.',
  },
  qwenpaw: {
    highlight: 'QwenPaw, formerly CoPaw, supports both scheduled work and requests from connected chats.',
    take: 'Its documented installation options range from a desktop application to a cloud host. A job you want delivered while you are away needs an installation that stays awake at the scheduled time.',
    bestFor: 'A recurring personal briefing that should be available in a messaging app.',
    tradeoff: 'Existing guides may still use the CoPaw name. Match the configuration instructions and channel adapter to the release you installed.',
  },
  'rt-claw': {
    highlight: 'RT-Claw documents short-term memory in RAM and persistent memory in flash on supported devices.',
    take: 'A board can retain selected details through a restart even though its working memory is limited. The project distinguishes finished capabilities from features still in development, including parts of its voice service.',
    bestFor: 'An embedded developer exploring what an assistant can remember and do on a specific board.',
    tradeoff: 'Support depends on the board and firmware configuration. Check the feature-status table before buying hardware for a particular input or output.',
  },
  'secure-openclaw': {
    highlight: 'Secure-OpenClaw can act through connected accounts from a messaging conversation.',
    take: 'Its memory and scheduled tasks are useful when a request involves another application. A good trial is an action you can check in that application afterward, such as a draft in a disposable account.',
    bestFor: 'A personal assistant that needs to carry a request from a chat into another service.',
    tradeoff: 'The permissions you authorize determine what the assistant can do in each account. Check scopes and how to revoke access before connecting a work account.',
  },
  spacebot: {
    about: "Rust-based AI agent built for multi-user environments such as Discord servers, Slack workspaces and Telegram groups. It separates conversation from background work and supports MCP tools, scheduled jobs and persistent memory.",
    highlight: 'Spacebot keeps the conversation responsive while separate workers carry out longer jobs.',
    take: 'In a busy team room, someone can start research while other people keep talking to the assistant. The workers can use connected tools and return their findings to the conversation.',
    bestFor: 'A shared chat where long-running requests would otherwise hold up everyone asking a short question.',
    tradeoff: 'Decide where worker results and shared memories should appear. Teams planning to redistribute or host the software should also read its FSL-1.1-ALv2 license.',
  },
  tinyclaw: {
    tagline: "Your self-improving AI companion",
    about: "Self-improving AI companion with a personality system called Heartware. The friendliest claw in the sea.",
    highlight: 'TinyClaw calls its configurable companion personality “Heartware.”',
    take: 'It puts the assistant’s style and continuing memory at the center of the experience. Those features are easier to judge over several short conversations than with one impressive answer.',
    bestFor: 'Someone who wants to shape how a personal companion interacts over time.',
    tradeoff: 'Check what the companion retains after you correct it. A consistent tone and an accurate memory are different things to evaluate.',
  },
  zclaw: {
    about: "C-based personal AI assistant that runs on ESP32 microcontrollers. Supports scheduled tasks, GPIO control, persistent memory, custom tools, and Telegram integration.",
    highlight: 'zclaw targets a complete default firmware image of at most 888 KiB on supported ESP32 boards.',
    take: 'The agent can read or control pins and schedule work on the board. A timed sensor check is a small example whose result you can verify independently of the conversation.',
    bestFor: 'A maker who wants to control a simple wired project through natural-language requests.',
    tradeoff: 'A pin change can affect the device physically. Confirm the wiring and test a harmless read before enabling a scheduled write.',
  },
  zeptoclaw: {
    highlight: 'ZeptoClaw combines messaging channels with a container option for running tools.',
    take: 'The project includes a migration path from OpenClaw as well as instructions for a fresh host. That lets an existing operator compare a familiar task before moving more channels or settings.',
    bestFor: 'Trying a Rust assistant with a known messaging workflow and a bounded tool environment.',
    tradeoff: 'Transferred settings may grant different access on the new host. Check the sandbox and mounted directories after migration.',
  },
  zeroclaw: {
    highlight: 'ZeroClaw can use different model providers and messaging channels from the same Rust runtime.',
    take: 'You can start with the provider you already know and change the connection later. The useful comparison is a real task with both setups, especially if your next provider will be a local model.',
    bestFor: 'People who want to keep their assistant configuration while experimenting with different providers.',
    tradeoff: 'Tool calling and response speed depend on the selected model and machine. Check the workflow you need before committing to a provider switch.',
  },
};

export function profileNotes(project: Project): ProfileNotes | undefined {
  if (project.status === 'archived' || project.github_data?.availability === 'unavailable') return;
  return notes[project.slug];
}
