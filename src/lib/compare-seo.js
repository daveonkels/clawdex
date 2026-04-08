/**
 * Shared compare-page curation logic used by both the Astro config and page templates.
 * The goal is to keep a compact set of editorial comparison landing pages while still
 * allowing the compare hub to handle ad-hoc pairs interactively.
 */

const MAX_INDEXABLE_COMPARE_PAGES = 80;
const TOP_PROJECT_POOL = 12;
const FEATURED_COMPARE_LIMIT = 24;

const EXCLUDED_COMPARE_SLUGS = new Set([
  // Previously excluded high-demand pages have been re-enabled.
  // Only add slugs here if they serve zero search demand.
]);

const PROMOTED_COMPARE_SLUGS = new Set(
  [
    ['safeclaw', 'ironclaw'],
    ['moltworker', 'aionui'],
    ['zeroclaw', 'nullclaw'],
    ['ironclaw', 'secure-openclaw'],
    ['memu', 'memos'],
    ['ironclaw', 'moltis'],
    ['kai', 'secure-openclaw'],
    // GSC-validated high-demand pages (Apr 2026)
    ['hermes', 'safeclaw'],            // 1,214 impressions — "hermes agent vs openclaw" (safeclaw-vs-hermes-agent URL)
    ['astrbot', 'openbrowserclaw'],    // 580 impressions — "astrbot vs openclaw" (Google prefers this)
    ['hermes', 'tinyclaw'],            // 476 impressions — "hermes agent vs openclaw" variant
    ['nullclaw', 'openclaw'],          // 118 impressions — "nullclaw vs openclaw"
    ['aionui', 'openbrowserclaw'],     // 54 impressions — "aionui vs openclaw"
  ].map(([a, b]) => makeCanonicalSlug(a, b)),
);

/**
 * @param {string} slugA
 * @param {string} slugB
 */
export function makeCanonicalSlug(slugA, slugB) {
  const sorted = [slugA, slugB].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

/**
 * @param {any} project
 */
export function getProjectStars(project) {
  return project?.github_data?.stars ?? project?.stars ?? 0;
}

/**
 * @param {any[]} projects
 */
function getCanonicalPairs(projects) {
  const pairs = [];
  const sortedProjects = [...projects].sort((a, b) => a.slug.localeCompare(b.slug));

  for (let i = 0; i < sortedProjects.length; i++) {
    for (let j = i + 1; j < sortedProjects.length; j++) {
      pairs.push({
        slugA: sortedProjects[i].slug,
        slugB: sortedProjects[j].slug,
        canonical: makeCanonicalSlug(sortedProjects[i].slug, sortedProjects[j].slug),
      });
    }
  }

  return pairs;
}

/**
 * @param {string[] | undefined} left
 * @param {string[] | undefined} right
 */
function countShared(left, right) {
  if (!left?.length || !right?.length) return 0;
  const rightSet = new Set(right);
  let count = 0;
  for (const value of left) {
    if (rightSet.has(value)) count++;
  }
  return count;
}

/**
 * @param {any} project
 */
function getTier(project) {
  return Number(project?.tier ?? 0);
}

/**
 * @param {any} a
 * @param {any} b
 * @param {Set<string>} topSlugs
 */
function scorePair(a, b, topSlugs) {
  const aStars = getProjectStars(a);
  const bStars = getProjectStars(b);
  const totalStars = aStars + bStars;
  const sharedCategories = countShared(a.category, b.category);
  const sharedPlatforms = countShared(a.platform, b.platform);
  const sameLanguage = a.language && b.language && a.language === b.language;
  const bothActive = a.status === 'active' && b.status === 'active';
  const bothTierOne = getTier(a) >= 1 && getTier(b) >= 1;
  const bothMentioned = (a.mentions?.length ?? 0) > 0 && (b.mentions?.length ?? 0) > 0;
  const oneTop = topSlugs.has(a.slug) || topSlugs.has(b.slug);
  const bothTop = topSlugs.has(a.slug) && topSlugs.has(b.slug);
  const canonical = makeCanonicalSlug(a.slug, b.slug);
  const includesOpenClaw = a.slug === 'openclaw' || b.slug === 'openclaw';

  let score = 0;
  score += sharedCategories * 30;
  score += sharedPlatforms * 18;
  score += sameLanguage ? 14 : 0;
  score += bothActive ? 12 : 0;
  score += bothTierOne ? 10 : 0;
  score += bothMentioned ? 6 : 0;
  score += a.mcp_support !== b.mcp_support ? 6 : 0;
  score += a.requires_llm !== b.requires_llm ? 8 : 0;
  score += bothTop ? 35 : oneTop ? 18 : 0;
  score += Math.min(totalStars, 100000) / 2000;
  score += Math.min(Math.max(aStars, bStars), 50000) / 800;
  score += PROMOTED_COMPARE_SLUGS.has(canonical) ? 80 : 0;
  score += includesOpenClaw ? 100 : 0;

  return {
    slugA: a.slug,
    slugB: b.slug,
    canonical,
    score,
    includesOpenClaw,
    promoted: PROMOTED_COMPARE_SLUGS.has(canonical),
  };
}

/**
 * @param {any[]} projects
 */
export function getIndexableComparePairs(projects) {
  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  const topSlugs = new Set(
    [...projects]
      .sort((a, b) => getProjectStars(b) - getProjectStars(a))
      .slice(0, TOP_PROJECT_POOL)
      .map((project) => project.slug),
  );

  const scoredPairs = getCanonicalPairs(projects)
    .map((pair) => scorePair(projectMap.get(pair.slugA), projectMap.get(pair.slugB), topSlugs))
    .filter((pair) => !EXCLUDED_COMPARE_SLUGS.has(pair.canonical))
    .sort((left, right) => right.score - left.score || left.canonical.localeCompare(right.canonical));

  const selected = new Map();

  for (const pair of scoredPairs) {
    if (pair.includesOpenClaw || pair.promoted) {
      selected.set(pair.canonical, pair);
    }
  }

  for (const pair of scoredPairs) {
    if (selected.size >= MAX_INDEXABLE_COMPARE_PAGES) break;
    selected.set(pair.canonical, pair);
  }

  return [...selected.values()].sort(
    (left, right) => right.score - left.score || left.canonical.localeCompare(right.canonical),
  );
}

/**
 * @param {any[]} projects
 */
export function getIndexableCompareSlugSet(projects) {
  return new Set(getIndexableComparePairs(projects).map((pair) => pair.canonical));
}

/**
 * @param {any[]} projects
 * @param {number} [limit]
 */
export function getFeaturedComparePairs(projects, limit = FEATURED_COMPARE_LIMIT) {
  return getIndexableComparePairs(projects).slice(0, limit);
}

/**
 * @param {string} slugA
 * @param {string} slugB
 * @param {Set<string>} indexableCompareSlugs
 */
export function buildComparisonHref(slugA, slugB, indexableCompareSlugs) {
  if (!slugA || !slugB || slugA === slugB) return '/compare/';

  const canonical = makeCanonicalSlug(slugA, slugB);
  if (indexableCompareSlugs.has(canonical)) {
    return `/compare/${canonical}/`;
  }

  const params = new URLSearchParams({ a: slugA, b: slugB });
  return `/compare/?${params.toString()}`;
}
