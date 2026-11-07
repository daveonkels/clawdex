/**
 * @param {any} item
 * @returns {number}
 */
export function getProjectMomentum(item) {
  const growth = item?.github_data?.star_growth_7d ?? item?.star_growth_7d ?? 0;
  return typeof growth === 'number' && growth > 0 ? growth : 0;
}

/**
 * @param {any[]} items
 * @returns {number}
 */
export function getAverageGrowth7d(items) {
  const values = items
    .map((item) => getProjectMomentum(item))
    .filter((value) => value > 0);

  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * @param {any} project
 * @param {number} averageGrowth7d
 * @returns {number | null}
 */
export function getMomentumRatio(project, averageGrowth7d) {
  const growth = getProjectMomentum(project);
  if (growth <= 0 || averageGrowth7d <= 0) return null;
  return growth / averageGrowth7d;
}
