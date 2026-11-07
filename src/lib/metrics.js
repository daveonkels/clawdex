const DAY = 24 * 60 * 60 * 1000;

export function calculateStarGrowth7d(snapshots, currentStars, now = new Date()) {
  // Require the actual calendar date seven days earlier, never today's snapshot.
  const target = new Date(new Date(now).getTime() - 7 * DAY).toISOString().slice(0, 10);
  const baseline = snapshots.find((snapshot) => snapshot.date === target);
  return baseline ? currentStars - baseline.stars : null;
}

export function buildLeaderboard(projects) {
  const entries = projects.filter((project) => project.github).map((project) => {
    const data = project.github_data;
    if (!data || !Number.isFinite(Date.parse(data.last_enriched))) {
      throw new Error(`Missing GitHub snapshot for ${project.slug}; run enrichment first.`);
    }
    const daysSince = (date) => date
      ? Math.max(0, Math.floor((Date.parse(data.last_enriched) - Date.parse(date)) / DAY))
      : null;
    return {
      rank: 0,
      availability: data.availability ?? 'available',
      last_enriched: data.last_enriched,
      last_checked: data.last_checked ?? data.last_enriched,
      ...Object.fromEntries(['name', 'slug', 'emoji', 'language', 'github', 'status'].map((key) => [key, project[key]])),
      ...Object.fromEntries(['stars', 'forks', 'open_issues', 'star_growth_7d', 'latest_release', 'latest_release_date', 'last_commit', 'license'].map((key) => [key, data[key]])),
      health: {
        issues_stars_ratio: data.stars > 0 ? data.open_issues / data.stars : null,
        days_since_last_release: daysSince(data.latest_release_date),
        days_since_last_commit: daysSince(data.last_commit) ?? 999,
      },
    };
  });
  const current = (entry) => entry.availability !== 'unavailable' && entry.status !== 'archived';
  entries.sort((a, b) => Number(current(b)) - Number(current(a)) || b.stars - a.stars || a.slug.localeCompare(b.slug));
  entries.forEach((entry, i) => { entry.rank = current(entry) ? i + 1 : null; });
  const dates = projects.filter((project) => project.github).map((project) => project.github_data.last_checked ?? project.github_data.last_enriched).sort();
  return { generated: dates[0] ?? '', count: entries.length, entries };
}
