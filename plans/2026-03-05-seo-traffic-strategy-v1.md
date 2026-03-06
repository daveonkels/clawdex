# Shelldex SEO & Traffic Strategy

## Objective

Drive significantly more organic traffic to shelldex.com by fixing the CTR problem (0.9% CTR despite avg position 6.6), adding rich result schema markup, creating a new high-intent landing page, and establishing backlink infrastructure. Target: 5-10x CTR improvement within 4-6 weeks, with new content pages capturing additional search intent.

## Implementation Plan

### Workstream 1: Rewrite Page Titles & Meta for CTR

- [ ] 1. **Fix trailing slash inconsistency in Astro config** — GSC shows duplicate indexed URLs (e.g., `/compare/hermes-vs-tinyclaw/` and `/compare/hermes-vs-tinyclaw` both indexed with 72 and 61 impressions respectively). Add `trailingSlash: 'always'` (or `'never'` — match whichever has more indexed pages) to `astro.config.mjs:5` to force consistent URLs sitewide. This is a prerequisite for all other SEO work since duplicate URLs dilute ranking signals.

- [ ] 2. **Rewrite the homepage title and description** — The current title at `src/pages/index.astro:26` is `"Shelldex — The OpenClaw Ecosystem"` which contains no search-intent keywords. Change it to something like `"OpenClaw Alternatives & Forks Directory — Shelldex"`. Also update the Layout default description at `src/layouts/Layout.astro:11` from the current generic phrasing to lead with the primary keyword pattern: "Compare 31 OpenClaw alternatives and forks side by side — stars, language, performance, and project health. The complete registry of the OpenClaw ecosystem." The homepage has 305 impressions but only 1 click — this is the single biggest CTR fix.

- [ ] 3. **Rewrite the compare page pair titles** — Current title pattern at `src/pages/compare/[pair].astro:95` is `"${a.name} vs ${b.name} — Shelldex"`. Change to `"${a.name} vs ${b.name}: Side-by-Side Comparison (2026) | Shelldex"`. Adding "Side-by-Side Comparison" matches how people search, and the year signals freshness. The compare index page title at `src/pages/compare/index.astro:10` is already decent but should be updated to include the project count and year: `"Compare ${projects.length} OpenClaw Alternatives Side by Side (2026) — Shelldex"`.

- [ ] 4. **Rewrite the project page titles** — Current pattern at `src/pages/projects/[slug].astro:119` is `"${name} — ${tagline} | Shelldex"`. Change to `"${name}: ${tagline} — OpenClaw Alternative (${formatStars(stars)} Stars) | Shelldex"` for derivatives, and keep the current pattern for OpenClaw itself. The star count acts as social proof in the SERP and "OpenClaw Alternative" captures the primary search intent. The Hermes project page has 180 impressions and only 3 clicks — a better title could double or triple that.

- [ ] 5. **Rewrite the FAQ page title** — Current title at `src/pages/faq.astro:44` is `"FAQ — OpenClaw Ecosystem Questions Answered | Shelldex"`. Change to `"OpenClaw FAQ: Best Alternatives, Security, Rust vs Python & More | Shelldex"`. This page has 122 impressions and 0 clicks — it needs keyword-dense title terms that match what people actually search for. Also update the meta description to front-load specific answerable questions.

- [ ] 6. **Rewrite the leaderboard page title** — Current title at `src/pages/leaderboard.astro:95` is `"Leaderboard — Shelldex"` which is completely generic and keyword-barren. Change to `"OpenClaw Alternatives Ranked by Stars, Growth & Health (2026) | Shelldex"`. This page should target "openclaw alternatives ranked", "best openclaw forks", "openclaw github stars comparison".

- [ ] 7. **Rewrite the analysis page title** — Current title at `src/pages/analysis.astro:119` is `"OpenClaw Ecosystem Analysis: ${projectCount} Projects Compared — Shelldex"`. This is already decent but could be improved to `"OpenClaw Ecosystem: ${projectCount} Projects, ${langCount} Languages — Stats & Trends (2026) | Shelldex"`. Adding the language count and "Stats & Trends" broadens the keyword surface.

- [ ] 8. **Update compare page meta descriptions to be comparison-specific** — The current compare page description at `src/pages/compare/[pair].astro:96` is good but should include more specific differentiators pulled from project data. Append language info and star counts: `"Compare ${a.name} (${formatStars(aStars)} stars, ${aLang}) and ${b.name} (${formatStars(bStars)} stars, ${bLang}) — GitHub stats, performance, MCP support, and project health side by side."` This makes the SERP snippet immediately useful and clickable.

### Workstream 2: Add FAQ Schema to Compare & FAQ Pages

- [ ] 9. **Create a FAQ generation utility in compare.ts** — Add a new exported function `generateFAQItems(a, b, aEntry, bEntry)` to `src/lib/compare.ts` that returns an array of `{ question: string, answer: string }` objects. Generate 3-4 FAQ items per comparison dynamically from project data. The questions should target real search queries: "Is [A] or [B] more popular?" (answer using stars/growth data), "What language is [A] vs [B] written in?" (from `project.language`), "Does [A/B] support MCP?" (from `mcp_support` field), and "Which is better for self-hosting, [A] or [B]?" (from platform, requires_llm, and perf data). Each answer should be 2-3 sentences using the same data the compare page already displays. This function goes alongside the existing `generateKeyDifferences` and `generateRecommendation` functions.

- [ ] 10. **Add FAQPage JSON-LD schema to compare pages** — In `src/pages/compare/[pair].astro`, call the new `generateFAQItems` function in the frontmatter, then add a third `<script type="application/ld+json">` block after the existing breadcrumb and webPage blocks (after line 280). The schema should follow the FAQPage spec with `@type: "FAQPage"` containing `mainEntity` array of `Question` objects each with an `acceptedAnswer` of type `Answer`. This is the single most impactful schema addition because Google can show FAQ rich results directly in SERPs, dramatically increasing CTR for comparison queries. Pass the FAQ items through as props from `getStaticPaths` alongside the existing `keyDifferences` and `recommendation` props.

- [ ] 11. **Render FAQ content visually on compare pages** — Below the "Which should you choose?" section and above "Related Comparisons" in `src/pages/compare/[pair].astro` (around line 393), add a new "Frequently Asked Questions" section that renders the same FAQ items as expandable Q&A elements. This serves two purposes: (1) the content matching the schema must be visible on the page per Google's structured data guidelines, and (2) it adds keyword-rich crawlable content to each comparison page. Use `<details>/<summary>` elements for the expand/collapse pattern — no JS needed.

- [ ] 12. **Add FAQPage JSON-LD schema to the FAQ page** — The FAQ page at `src/pages/faq.astro` has 20 questions with full answers but the JSON-LD at line 47-60 is only a `WebPage` type. Change the `@type` to `"FAQPage"` and add a `mainEntity` array containing all 20 questions as `Question` objects. The questions and answers are already in the HTML (each `<h3>` is a question, the following `<div>` is the answer). This requires extracting the Q&A pairs into a data structure in the frontmatter so they can be both rendered in HTML and serialized into JSON-LD. Given the page has 122 impressions and 0 clicks, FAQ rich results could be transformative.

### Workstream 3: Create /best-alternatives Roundup Page

- [ ] 13. **Create the best-alternatives page file** — Add a new page at `src/pages/best-alternatives.astro`. This targets the highest-volume search intent that Shelldex currently misses entirely: "best openclaw alternatives", "openclaw alternatives 2026", "projects like openclaw". The page should import `loadProjects` and `loadLeaderboard` from the existing libs, filter out openclaw itself, and sort by a combination of stars and health score. Set the title to `"Best OpenClaw Alternatives (2026): ${count} Projects Ranked & Compared | Shelldex"` and a description like `"The definitive guide to OpenClaw alternatives — ranked by GitHub stars, project health, and community momentum. From Rust rewrites to embedded agents."`.

- [ ] 14. **Structure the page as an SEO-optimized listicle** — The page should open with a 2-3 paragraph introduction explaining what OpenClaw is and why alternatives exist (targeting featured snippet for "what are openclaw alternatives"). Follow with an `<h2>` for each project (excluding OpenClaw) ordered by stars, containing: the project name and star count in the heading, a "Best for:" one-liner, 2-3 sentence description pulled from the project's `description` and `highlight` fields, a pros/cons list derived from project attributes (language, platform support, MCP support, LLM requirement, performance profile), and links to both the project's Shelldex page and its compare-with-openclaw page. This creates a content-rich page with natural internal linking that doesn't exist anywhere else on the site.

- [ ] 15. **Add ItemList and Article schema to the best-alternatives page** — Include JSON-LD for both `ItemList` (listing each alternative with position, name, and URL) and `Article` schema (author: Dave Onkels, datePublished, dateModified from build time). The ItemList positions should match the display order. This page should also link from the main nav (add it between "Analysis" and "About" in `src/layouts/Layout.astro` nav section around line 93-99) and from the homepage hero area in `src/components/Hero.astro`.

- [ ] 16. **Add internal links from the best-alternatives page to comparison pages** — For each listed project, include a "Compare with OpenClaw" link pointing to `/compare/openclaw-vs-{slug}` (using `makeCanonicalSlug` from `src/lib/compare.ts` to generate the correct URL). Also add "Compare with..." links between adjacent projects in the list. This creates a dense internal linking web that distributes PageRank to the comparison pages, which are already the best-performing pages by impressions.

- [ ] 17. **Add a sitemap priority entry for the best-alternatives page** — Update the `serialize` function in `astro.config.mjs:11-33` to give `/best-alternatives` a priority of 0.9 (same as editorial pages). This signals to search engines that this is a high-value page.

### Workstream 4: GitHub README Backlinks

- [ ] 18. **Create a Shelldex badge SVG** — Add a badge file at `public/badges/shelldex-badge.svg`. Design a simple, professional shield-style badge (similar to shields.io style) with the Shelldex lobster emoji and text "Listed on Shelldex" in the site's bioluminescent teal color (#00d4aa) on a dark background. Also create a smaller variant `shelldex-badge-sm.svg` for inline use. These should be static SVGs, not dynamically generated, for reliability and caching.

- [ ] 19. **Create per-project badge variants** — Add a build script at `scripts/generate-badges.ts` that generates a badge SVG for each tracked project, reading from the project YAML files. Each badge should include the project name and its Shelldex URL (e.g., "Hermes Agent on Shelldex"). Output to `public/badges/{slug}.svg`. These personalized badges are more compelling for project maintainers to add to their READMEs because they link directly to the project's profile page. Run this script as part of the build pipeline by adding it to the build command in `package.json:8`.

- [ ] 20. **Update the Submit page with badge instructions** — Add a new section to `src/pages/submit.astro` (after the existing submission steps, around line 30) showing project maintainers how to add the Shelldex badge to their GitHub README. Include the markdown snippet for both the generic badge and the project-specific badge, with a preview of what the badge looks like. Frame it as "Help others discover your project" rather than "give us a backlink." This encourages new project submitters to add the badge proactively.

- [ ] 21. **Create a script to generate PR-ready badge markdown for existing projects** — Add `scripts/generate-badge-prs.ts` that iterates through all tracked projects, generates a markdown snippet for each one with their specific badge linking to their Shelldex page, and outputs the snippets to `dist/badge-prs/` as individual text files (one per project). This makes it easy to manually open PRs on tracked projects' GitHub repos. The script should also generate a checklist markdown file listing all projects with their GitHub repo URLs and badge PR status, so progress can be tracked. This is a manual outreach workflow aid, not an automated PR bot.

- [ ] 22. **Add a public /badges page showing all available badges** — Create `src/pages/badges.astro` as a lightweight reference page that displays all available badge variants with copy-to-clipboard markdown snippets. This serves as both a documentation page for badge users and an additional indexed page that links to every project page. Include the page in the footer nav (alongside "Submit a Project" in `src/layouts/Layout.astro:192`).

## Verification Criteria

- All page titles contain at least one high-intent keyword (e.g., "OpenClaw alternative", "vs", "comparison", "ranked")
- No duplicate URLs in sitemap (trailing slash is consistent across all generated pages)
- FAQ schema validates at https://search.google.com/test/rich-results for at least 3 compare pages and the FAQ page
- The `/best-alternatives` page renders correctly with all projects, internal links resolve, and ItemList schema validates
- Badge SVGs render correctly at multiple sizes and the markdown snippets produce working badge images when pasted into a GitHub README
- `npx astro build` completes without errors after all changes
- Google Search Console shows no new crawl errors after deployment

## Potential Risks and Mitigations

1. **Title rewrites could temporarily hurt rankings during re-indexing**
   Mitigation: Make all title changes in a single deployment rather than iterating. Google typically re-indexes within 3-7 days. Monitor GSC daily for the first week. If any page drops significantly in position, revert that specific title while keeping others.

2. **FAQ schema could be flagged as "not visible on page" by Google if content doesn't match**
   Mitigation: Always render the FAQ content visually on the page (Workstream 2, task 11). Google requires that structured data content be present and accessible in the HTML. Use `<details>/<summary>` so content is in the DOM even when collapsed.

3. **Best-alternatives page could cannibalize traffic from existing compare pages**
   Mitigation: The best-alternatives page targets different keywords ("best openclaw alternatives" vs "X vs Y comparison"). It should actually boost compare page traffic through internal linking rather than compete with it. Monitor both page types in GSC after launch.

4. **GitHub badge PRs could be perceived as spam by project maintainers**
   Mitigation: Only open PRs on projects where the badge adds genuine value (active projects with >500 stars). Personalize each PR message. Open at most 2-3 per week to avoid looking spammy. Frame the badge as a "discovery mechanism" that helps users find the project, not as a promotional tool for Shelldex.

5. **Year in titles (2026) becomes stale**
   Mitigation: Use `new Date().getFullYear()` in the Astro frontmatter rather than hardcoding "2026". This way it auto-updates on each build. Add a comment in the code noting this is intentional for SEO freshness signals.

## Alternative Approaches

1. **Blog/content marketing instead of best-alternatives page**: Could create a `/blog` section with weekly ecosystem updates. More sustainable long-term, but higher ongoing effort. The best-alternatives page is a better first move because it's mostly auto-generated from existing data and targets high-intent keywords immediately.

2. **Dynamic OG images per comparison page**: Using the existing `generate-images.ts` FAL AI integration, generate unique OG images for each comparison page showing both project logos/emojis and star counts. This could improve CTR on social shares but has minimal direct SEO impact. Consider as a follow-up to the core title/schema work.

3. **Category landing pages instead of single best-alternatives page**: Create separate pages for `/rust-alternatives`, `/lightweight-agents`, `/embedded-agents`, etc. This captures more long-tail keywords but requires more pages to maintain. Could be Phase 2 after measuring the impact of the single best-alternatives page.

4. **Automated badge PR bot via GitHub Actions**: Instead of manual PR outreach, create a GitHub Action that automatically opens PRs on tracked repos. Higher automation but significant risk of being perceived as spam. The manual approach (task 21) is safer and allows relationship-building with maintainers.
