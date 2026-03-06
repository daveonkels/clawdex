import type { Project } from './projects';
import { formatStars } from './projects';
import { languageLabel } from './constants';
import fs from 'node:fs';
import path from 'node:path';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  name: string;
  slug: string;
  emoji: string;
  language: string;
  github: string;
  stars: number;
  forks: number;
  open_issues: number;
  star_growth_7d: number | null;
  latest_release: string | null;
  latest_release_date: string | null;
  last_commit: string;
  license: string | null;
  health: {
    issues_stars_ratio: number;
    days_since_last_release: number | null;
    days_since_last_commit: number;
  };
}

export interface PairEntry {
  pair: string;       // URL slug: "aionui-vs-openclaw"
  canonical: string;  // alphabetical canonical slug
  slugA: string;
  slugB: string;
}

export interface ComparisonData {
  a: Project;
  b: Project;
  aEntry: LeaderboardEntry | null;
  bEntry: LeaderboardEntry | null;
  isCanonical: boolean;
  canonicalUrl: string;
  keyDifferences: string[];
  recommendation: string;
  related: PairEntry[];
}

// ── Leaderboard loader ──────────────────────────────────────────────────────

let _leaderboardCache: { entries: LeaderboardEntry[]; count: number } | null = null;

export function loadLeaderboard(): { entries: LeaderboardEntry[]; count: number } {
  if (_leaderboardCache) return _leaderboardCache;
  try {
    const lbPath = path.join(process.cwd(), 'src', 'data', 'generated', 'leaderboard.json');
    const lb = JSON.parse(fs.readFileSync(lbPath, 'utf-8'));
    _leaderboardCache = { entries: lb.entries, count: lb.count };
    return _leaderboardCache;
  } catch {
    _leaderboardCache = { entries: [], count: 0 };
    return _leaderboardCache;
  }
}

// ── Pair generation ─────────────────────────────────────────────────────────

export function makeCanonicalSlug(slugA: string, slugB: string): string {
  const sorted = [slugA, slugB].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

export function makePairSlug(slugA: string, slugB: string): string {
  return `${slugA}-vs-${slugB}`;
}

export function generateAllPairs(projects: Project[]): PairEntry[] {
  const pairs: PairEntry[] = [];
  for (let i = 0; i < projects.length; i++) {
    for (let j = 0; j < projects.length; j++) {
      if (i === j) continue;
      const a = projects[i].slug;
      const b = projects[j].slug;
      const pair = makePairSlug(a, b);
      const canonical = makeCanonicalSlug(a, b);
      pairs.push({ pair, canonical, slugA: a, slugB: b });
    }
  }
  return pairs;
}

export function getUniquePairs(projects: Project[]): PairEntry[] {
  const seen = new Set<string>();
  const unique: PairEntry[] = [];
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i].slug;
      const b = projects[j].slug;
      const canonical = makeCanonicalSlug(a, b);
      if (!seen.has(canonical)) {
        seen.add(canonical);
        unique.push({ pair: canonical, canonical, slugA: a, slugB: b });
      }
    }
  }
  return unique.sort((a, b) => a.pair.localeCompare(b.pair));
}

// ── Health score ────────────────────────────────────────────────────────────

export function computeHealthScore(entry: LeaderboardEntry | null): number {
  if (!entry) return 0;
  let score = 0;

  // Issues/stars ratio (lower is better) — up to 30 points
  if (entry.health.issues_stars_ratio < 0.01) score += 30;
  else if (entry.health.issues_stars_ratio < 0.03) score += 25;
  else if (entry.health.issues_stars_ratio < 0.05) score += 15;
  else score += 5;

  // Commit recency — up to 30 points
  const commitDays = entry.health.days_since_last_commit;
  if (commitDays <= 1) score += 30;
  else if (commitDays <= 7) score += 25;
  else if (commitDays <= 30) score += 15;
  else score += 5;

  // Release recency — up to 20 points
  const releaseDays = entry.health.days_since_last_release;
  if (releaseDays === null) score += 5;
  else if (releaseDays <= 7) score += 20;
  else if (releaseDays <= 30) score += 15;
  else score += 5;

  // Star growth — up to 20 points
  const growth = entry.star_growth_7d ?? 0;
  if (growth >= 100) score += 20;
  else if (growth >= 10) score += 15;
  else if (growth >= 1) score += 10;
  else score += 0;

  return score;
}

// ── Key differences ─────────────────────────────────────────────────────────

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
}

export function generateKeyDifferences(a: Project, b: Project, aEntry: LeaderboardEntry | null, bEntry: LeaderboardEntry | null): string[] {
  const diffs: string[] = [];
  const aStars = a.github_data?.stars ?? a.stars ?? 0;
  const bStars = b.github_data?.stars ?? b.stars ?? 0;

  // Star comparison
  if (aStars > 0 && bStars > 0) {
    if (aStars > bStars * 2) {
      const ratio = Math.round(aStars / bStars);
      diffs.push(`${a.name} has ${ratio}x more stars (${formatStars(aStars)} vs ${formatStars(bStars)}), indicating significantly broader adoption.`);
    } else if (bStars > aStars * 2) {
      const ratio = Math.round(bStars / aStars);
      diffs.push(`${b.name} has ${ratio}x more stars (${formatStars(bStars)} vs ${formatStars(aStars)}), indicating significantly broader adoption.`);
    } else if (aStars !== bStars) {
      const leader = aStars > bStars ? a : b;
      const trailer = aStars > bStars ? b : a;
      const leaderStars = Math.max(aStars, bStars);
      const trailerStars = Math.min(aStars, bStars);
      diffs.push(`${leader.name} leads in stars (${formatStars(leaderStars)} vs ${formatStars(trailerStars)}), though both have substantial communities.`);
    }
  }

  // Growth comparison
  const aGrowth = a.github_data?.star_growth_7d ?? 0;
  const bGrowth = b.github_data?.star_growth_7d ?? 0;
  if (aGrowth > 0 || bGrowth > 0) {
    if (aGrowth > bGrowth * 3 && aGrowth > 5) {
      diffs.push(`${a.name} is growing faster with +${formatStars(aGrowth)} stars this week vs +${formatStars(bGrowth)} for ${b.name}.`);
    } else if (bGrowth > aGrowth * 3 && bGrowth > 5) {
      diffs.push(`${b.name} is growing faster with +${formatStars(bGrowth)} stars this week vs +${formatStars(aGrowth)} for ${a.name}.`);
    }
  }

  // Language
  if (a.language !== b.language) {
    const aLang = languageLabel[a.language] ?? a.language;
    const bLang = languageLabel[b.language] ?? b.language;
    diffs.push(`${a.name} is written in ${aLang} while ${b.name} uses ${bLang}, which may influence your choice depending on your stack.`);
  }

  // Commit recency
  const aCommit = daysSince(a.github_data?.last_commit);
  const bCommit = daysSince(b.github_data?.last_commit);
  if (aCommit !== null && bCommit !== null) {
    if (aCommit <= 1 && bCommit > 7) {
      diffs.push(`${a.name} was updated today, while ${b.name}'s last commit was ${bCommit} days ago.`);
    } else if (bCommit <= 1 && aCommit > 7) {
      diffs.push(`${b.name} was updated today, while ${a.name}'s last commit was ${aCommit} days ago.`);
    }
  }

  // Fork ratio
  const aForks = a.github_data?.forks ?? 0;
  const bForks = b.github_data?.forks ?? 0;
  if (aForks > 0 && bForks > 0 && aStars > 0 && bStars > 0) {
    const aRatio = aForks / aStars;
    const bRatio = bForks / bStars;
    if (aRatio > bRatio * 2 && aRatio > 0.1) {
      diffs.push(`${a.name} has a higher fork-to-star ratio (${(aRatio * 100).toFixed(0)}% vs ${(bRatio * 100).toFixed(0)}%), suggesting more active contributor participation.`);
    } else if (bRatio > aRatio * 2 && bRatio > 0.1) {
      diffs.push(`${b.name} has a higher fork-to-star ratio (${(bRatio * 100).toFixed(0)}% vs ${(aRatio * 100).toFixed(0)}%), suggesting more active contributor participation.`);
    }
  }

  // License
  const aLicense = a.github_data?.license;
  const bLicense = b.github_data?.license;
  if (aLicense && bLicense && aLicense !== bLicense) {
    diffs.push(`${a.name} uses the ${aLicense} license while ${b.name} uses ${bLicense}.`);
  }

  // Platform
  const aPlatforms = a.platform ?? [];
  const bPlatforms = b.platform ?? [];
  if (aPlatforms.length > 0 && bPlatforms.length > 0) {
    const aHasBrowser = aPlatforms.includes('browser');
    const bHasBrowser = bPlatforms.includes('browser');
    const aHasEmbedded = aPlatforms.includes('embedded');
    const bHasEmbedded = bPlatforms.includes('embedded');
    const aHasServerless = aPlatforms.includes('serverless');
    const bHasServerless = bPlatforms.includes('serverless');

    if (aHasBrowser && !bHasBrowser) {
      diffs.push(`${a.name} runs in the browser while ${b.name} requires a server.`);
    } else if (bHasBrowser && !aHasBrowser) {
      diffs.push(`${b.name} runs in the browser while ${a.name} requires a server.`);
    }

    if (aHasEmbedded && !bHasEmbedded) {
      diffs.push(`${a.name} supports embedded/IoT hardware while ${b.name} does not.`);
    } else if (bHasEmbedded && !aHasEmbedded) {
      diffs.push(`${b.name} supports embedded/IoT hardware while ${a.name} does not.`);
    }

    if (aHasServerless && !bHasServerless) {
      diffs.push(`${a.name} can run serverless while ${b.name} requires persistent infrastructure.`);
    } else if (bHasServerless && !aHasServerless) {
      diffs.push(`${b.name} can run serverless while ${a.name} requires persistent infrastructure.`);
    }
  }

  // LLM requirement
  if (a.requires_llm === false && b.requires_llm !== false) {
    diffs.push(`${a.name} works without any API keys — zero LLM cost — while ${b.name} requires an LLM provider.`);
  } else if (b.requires_llm === false && a.requires_llm !== false) {
    diffs.push(`${b.name} works without any API keys — zero LLM cost — while ${a.name} requires an LLM provider.`);
  }

  // MCP support
  if (a.mcp_support === true && !b.mcp_support) {
    diffs.push(`${a.name} has MCP (Model Context Protocol) support while ${b.name} does not.`);
  } else if (b.mcp_support === true && !a.mcp_support) {
    diffs.push(`${b.name} has MCP (Model Context Protocol) support while ${a.name} does not.`);
  }

  // Integration count
  if (a.integration_count && b.integration_count && a.integration_count !== b.integration_count) {
    const leader = a.integration_count > b.integration_count ? a : b;
    const leaderCount = Math.max(a.integration_count, b.integration_count);
    const trailerCount = Math.min(a.integration_count, b.integration_count);
    diffs.push(`${leader.name} advertises ${leaderCount}+ integrations vs ${trailerCount}+ for the other.`);
  } else if (a.integration_count && !b.integration_count) {
    diffs.push(`${a.name} advertises ${a.integration_count}+ built-in integrations.`);
  } else if (b.integration_count && !a.integration_count) {
    diffs.push(`${b.name} advertises ${b.integration_count}+ built-in integrations.`);
  }

  // Categories
  const aOnly = a.category.filter(c => !b.category.includes(c));
  const bOnly = b.category.filter(c => !a.category.includes(c));
  if (aOnly.length > 0 && bOnly.length > 0) {
    diffs.push(`${a.name} focuses on ${aOnly.join(', ')} while ${b.name} targets ${bOnly.join(', ')}.`);
  }

  // Health score
  if (aEntry && bEntry) {
    const aHealth = computeHealthScore(aEntry);
    const bHealth = computeHealthScore(bEntry);
    if (Math.abs(aHealth - bHealth) >= 15) {
      const healthier = aHealth > bHealth ? a : b;
      diffs.push(`${healthier.name} scores higher on project health (maintenance activity, issue management, release cadence).`);
    }
  }

  return diffs.slice(0, 6);
}

// ── Recommendation ──────────────────────────────────────────────────────────

export function generateRecommendation(a: Project, b: Project, aEntry: LeaderboardEntry | null, bEntry: LeaderboardEntry | null): string {
  const aStars = a.github_data?.stars ?? a.stars ?? 0;
  const bStars = b.github_data?.stars ?? b.stars ?? 0;
  const aGrowth = a.github_data?.star_growth_7d ?? 0;
  const bGrowth = b.github_data?.star_growth_7d ?? 0;
  const aHealth = computeHealthScore(aEntry);
  const bHealth = computeHealthScore(bEntry);

  const aLang = languageLabel[a.language] ?? a.language;
  const bLang = languageLabel[b.language] ?? b.language;

  const paragraphs: string[] = [];

  // Opening context
  paragraphs.push(
    `Both ${a.name} and ${b.name} are part of the OpenClaw ecosystem of personal AI agent frameworks. Your choice depends on your priorities — community size, language preference, project maturity, and specific feature focus.`
  );

  // Main recommendation logic
  const lines: string[] = [];

  if (aStars > bStars * 5 && aStars > 1000) {
    lines.push(`If you want the most battle-tested option with the largest community, ${a.name} is the clear choice with ${formatStars(aStars)} stars and a mature ecosystem.`);
    lines.push(`However, ${b.name} may be worth considering if ${b.category.length > 0 ? `you need its focus on ${b.category[0]}` : 'you prefer a different approach'} or prefer ${bLang}.`);
  } else if (bStars > aStars * 5 && bStars > 1000) {
    lines.push(`If you want the most battle-tested option with the largest community, ${b.name} is the clear choice with ${formatStars(bStars)} stars and a mature ecosystem.`);
    lines.push(`However, ${a.name} may be worth considering if ${a.category.length > 0 ? `you need its focus on ${a.category[0]}` : 'you prefer a different approach'} or prefer ${aLang}.`);
  } else {
    // More balanced comparison
    if (a.language !== b.language) {
      lines.push(`If your stack is ${aLang}-based, ${a.name} will integrate more naturally. For ${bLang} developers, ${b.name} is the better fit.`);
    }

    if (aGrowth > bGrowth * 2 && aGrowth > 5) {
      lines.push(`${a.name} is gaining momentum faster right now (+${formatStars(aGrowth)}/week), which may indicate a growing community and faster feature development.`);
    } else if (bGrowth > aGrowth * 2 && bGrowth > 5) {
      lines.push(`${b.name} is gaining momentum faster right now (+${formatStars(bGrowth)}/week), which may indicate a growing community and faster feature development.`);
    }

    if (aHealth > bHealth + 15) {
      lines.push(`${a.name} currently shows stronger project health indicators, suggesting more consistent maintenance and release cadence.`);
    } else if (bHealth > aHealth + 15) {
      lines.push(`${b.name} currently shows stronger project health indicators, suggesting more consistent maintenance and release cadence.`);
    }
  }

  // Platform-specific recommendations
  if (a.requires_llm === false && b.requires_llm !== false) {
    lines.push(`If you want zero API costs, ${a.name} doesn't require any LLM provider.`);
  } else if (b.requires_llm === false && a.requires_llm !== false) {
    lines.push(`If you want zero API costs, ${b.name} doesn't require any LLM provider.`);
  }

  const aPlatforms = a.platform ?? [];
  const bPlatforms = b.platform ?? [];
  if (aPlatforms.includes('embedded') && !bPlatforms.includes('embedded')) {
    lines.push(`For IoT or embedded deployments, ${a.name} is designed to run on constrained hardware.`);
  } else if (bPlatforms.includes('embedded') && !aPlatforms.includes('embedded')) {
    lines.push(`For IoT or embedded deployments, ${b.name} is designed to run on constrained hardware.`);
  }

  if (lines.length === 0) {
    lines.push(`Both projects are viable choices. Consider trying each one to see which better fits your workflow and requirements.`);
  }

  paragraphs.push(lines.join(' '));

  paragraphs.push(
    `Ultimately, the best choice depends on your specific use case. Check out each project's page for detailed stats and links to their repositories.`
  );

  return paragraphs.join('\n\n');
}

// ── FAQ generation ──────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQItems(a: Project, b: Project, aEntry: LeaderboardEntry | null, bEntry: LeaderboardEntry | null): FAQItem[] {
  const items: FAQItem[] = [];
  const aStars = a.github_data?.stars ?? a.stars ?? 0;
  const bStars = b.github_data?.stars ?? b.stars ?? 0;
  const aLang = languageLabel[a.language] ?? a.language;
  const bLang = languageLabel[b.language] ?? b.language;

  // Popularity question
  if (aStars > 0 && bStars > 0) {
    const leader = aStars >= bStars ? a : b;
    const leaderStars = Math.max(aStars, bStars);
    const trailer = aStars >= bStars ? b : a;
    const trailerStars = Math.min(aStars, bStars);
    const aGrowth = a.github_data?.star_growth_7d ?? 0;
    const bGrowth = b.github_data?.star_growth_7d ?? 0;
    const growthNote = aGrowth > 0 || bGrowth > 0
      ? ` In the last 7 days, ${aGrowth >= bGrowth ? a.name : b.name} gained more stars (+${formatStars(Math.max(aGrowth, bGrowth))}).`
      : '';
    items.push({
      question: `Is ${a.name} or ${b.name} more popular?`,
      answer: `${leader.name} currently has ${formatStars(leaderStars)} GitHub stars compared to ${formatStars(trailerStars)} for ${trailer.name}.${growthNote}`,
    });
  }

  // Language question
  if (a.language !== b.language) {
    items.push({
      question: `What language is ${a.name} vs ${b.name} written in?`,
      answer: `${a.name} is written in ${aLang} while ${b.name} uses ${bLang}. This affects plugin ecosystems, contribution accessibility, and runtime performance characteristics.`,
    });
  } else {
    items.push({
      question: `What language are ${a.name} and ${b.name} written in?`,
      answer: `Both ${a.name} and ${b.name} are written in ${aLang}. This means they share similar deployment requirements and can potentially reuse plugins or extensions.`,
    });
  }

  // MCP question
  if (a.mcp_support !== undefined || b.mcp_support !== undefined) {
    const aMcp = a.mcp_support === true;
    const bMcp = b.mcp_support === true;
    if (aMcp && bMcp) {
      items.push({
        question: `Do ${a.name} and ${b.name} support MCP?`,
        answer: `Yes, both ${a.name} and ${b.name} support the Model Context Protocol (MCP), allowing them to connect to external tools and data sources through a standardized interface.`,
      });
    } else if (aMcp || bMcp) {
      const hasMcp = aMcp ? a : b;
      const noMcp = aMcp ? b : a;
      items.push({
        question: `Does ${a.name} or ${b.name} support MCP?`,
        answer: `${hasMcp.name} supports the Model Context Protocol (MCP) for connecting to external tools, while ${noMcp.name} does not currently offer MCP support.`,
      });
    }
  }

  // Self-hosting / LLM requirement question
  if (a.requires_llm !== undefined || b.requires_llm !== undefined) {
    const aFree = a.requires_llm === false;
    const bFree = b.requires_llm === false;
    if (aFree !== bFree) {
      const free = aFree ? a : b;
      const paid = aFree ? b : a;
      items.push({
        question: `Which is cheaper to self-host, ${a.name} or ${b.name}?`,
        answer: `${free.name} does not require an LLM API key, meaning zero ongoing token costs. ${paid.name} requires an LLM provider, so you will need an API key and will incur per-token costs. For cost-conscious self-hosting, ${free.name} has an advantage.`,
      });
    }
  }

  // Platform question
  const aPlatforms = a.platform ?? [];
  const bPlatforms = b.platform ?? [];
  if (aPlatforms.length > 0 && bPlatforms.length > 0) {
    const aHasEmbedded = aPlatforms.includes('embedded');
    const bHasEmbedded = bPlatforms.includes('embedded');
    if (aHasEmbedded !== bHasEmbedded) {
      const embedded = aHasEmbedded ? a : b;
      const other = aHasEmbedded ? b : a;
      items.push({
        question: `Can ${a.name} or ${b.name} run on embedded hardware?`,
        answer: `${embedded.name} is designed to run on embedded and IoT devices like Raspberry Pi and ESP32 boards. ${other.name} targets ${(aHasEmbedded ? bPlatforms : aPlatforms).join(', ')} platforms and is not optimized for constrained hardware.`,
      });
    }
  }

  return items.slice(0, 4);
}

// ── Related comparisons ─────────────────────────────────────────────────────

export function getRelatedComparisons(slugA: string, slugB: string, allPairs: PairEntry[], limit = 8): PairEntry[] {
  const currentCanonical = makeCanonicalSlug(slugA, slugB);
  const related = allPairs.filter(p =>
    p.canonical !== currentCanonical &&
    p.pair === p.canonical && // only canonical versions
    (p.slugA === slugA || p.slugB === slugA || p.slugA === slugB || p.slugB === slugB)
  );
  return related.slice(0, limit);
}
