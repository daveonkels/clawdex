// GitHub reports creation dates for stars still present when history is fetched.
// This series measures additions and must never be used as a net-growth baseline.
const DAY_MS = 86400000;

export function dailyStarActivity(weeks, collectedAt, createdAt) {
  if (!Array.isArray(weeks)) throw new Error('Missing GitHub star history');
  const cutoff = collectedAt.slice(0, 10);
  const firstDate = createdAt?.slice(0, 10);
  const days = {};
  for (const bucket of weeks) {
    if (!Number.isSafeInteger(bucket?.week) || !Array.isArray(bucket.days) || bucket.days.length !== 7 ||
        !bucket.days.every(n => Number.isSafeInteger(n) && n >= 0) ||
        bucket.total !== bucket.days.reduce((sum, n) => sum + n, 0)) {
      throw new Error('Invalid GitHub star history bucket');
    }
    for (const [i, stars] of bucket.days.entries()) {
      const date = new Date(bucket.week * 1000 + i * DAY_MS).toISOString().slice(0, 10);
      if (date >= cutoff || (firstDate && date < firstDate)) continue;
      if (Object.hasOwn(days, date)) throw new Error('Overlapping GitHub star history buckets');
      days[date] = stars;
    }
  }
  return Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)));
}

// Select a calendar window, leaving unreported days absent rather than inventing zeroes.
export function recentStarActivity(days, asOf, length = 30) {
  if (!days || !asOf) return [];
  const end = Date.parse(asOf.slice(0, 10));
  return Object.entries(days).filter(([date]) => {
    const time = Date.parse(date);
    return time >= end - length * DAY_MS && time < end;
  }).sort(([a], [b]) => a.localeCompare(b)).map(([date, stars]) => ({date, stars}));
}
