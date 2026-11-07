# Next Shelldex edition: Where’s my morning briefing?

**Reader decision:** I want a note on my phone before I leave home. Which agent and hosting arrangement should I trust with that job? Can I tell whether it was late, failed, or finished somewhere I didn’t see?

**Opening scene:** A reader schedules a 7 a.m. briefing and closes the laptop. At 9 a.m. there’s nothing in the chat. Let readers move the wake-up time on a timeline and switch the message service on or off. Label three events independently: *was due*, *finished*, *arrived*. Show “not documented” rather than animating an invented result. Include a replay link for each scenario and a small text table for readers who do not want the animation.

## Evidence to pursue

- [OpenClaw: missed morning note](https://github.com/openclaw/openclaw/issues/1614) is a January report about a sleeping Mac. [Current scheduler guide](https://docs.openclaw.ai/automation/cron-jobs/managing-jobs) documents catch-up on startup, including a choice to skip overdue recurring runs. A late note and an on-time note serve different needs.
- [Hermes: completed reports, failed delivery](https://github.com/NousResearch/hermes-agent/issues/13566). A September participant recovered four reports from disk. [Hermes scheduler documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron) separates run output and delivery status. A historical incident identifies a question; it does not establish today’s failure rate.
- [NanoClaw scheduling documentation](https://github.com/nanocoai/nanoclaw/blob/main/docs/scheduled-tasks.md#delivery-and-run-logs) makes the destination an explicit part of the job. Follow the task from creation through delivery before assuming “scheduled” means “sent to my chat.”

## Comparison protocol

Pick the latest stable release of each of the three agents on the editorial cutoff date. Save a tag, commit permalink, host type, delivery destination, default setting, relevant configuration option and exact source/test lines for every cell. Trace the same daily private-chat task through an awake host, a sleeping host that wakes two hours late, and a running host with a temporarily unavailable messenger. Record whether work starts, where output persists, whether a missed run is skipped/replayed, and what delivery status a nontechnical user can see. Split default behavior from an opt-in setup. If docs and code disagree, say so. This is a read-only implementation review; it does not establish delivery reliability percentages.

## Two follow-ups

- **Find out whose private information is in play before sharing an assistant.** Follow a surprise-party note from one person's private chat to another person's private chat, then to a family group. Distinguish chat history, long-lived memory and permission to use a shared account. [OpenClaw discussion about shared-session routing](https://github.com/openclaw/openclaw/issues/38345), [OpenClaw session configuration](https://github.com/openclaw/openclaw/blob/main/docs/concepts/session.md), [Hermes conversation lifecycle](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/gateway-session-lifecycle.md).
- **Find the setting that can actually stop spending before leaving a recurring job unattended.** Build a bill-anatomy illustration for one daily summary and a job that retries. Compare usage displays, alerts, limits on steps and enforced provider spending caps. Mark a proposed control as proposed until its implementation and release are verified. [Hermes retry-loop and cumulative budget discussion](https://github.com/NousResearch/hermes-agent/issues/91713), [OpenClaw cost categories](https://docs.openclaw.ai/reference/api-usage-costs).

## Two-week editorial plan

Days 1–4: complete the nine scenario traces and record unknowns. Days 5–7: build the interactive timeline, add each agent’s best-fit scenario, link the evidence beside each outcome and make a single comparison graphic with an accessible text equivalent. Days 8–10: check the graphic and simulator against the same data, prepare one permalink for the most surprising case and cross-link it from the FAQ's scheduling answer. Days 11–14: compare visits to FAQ and Analysis, new referring domains and Search Console landing-page clicks with the preceding two weeks; report counts and the lag in search data. Track referral quality and which question draws follow-up, not just raw traffic. No outreach or scheduled publication is implied by this plan.
