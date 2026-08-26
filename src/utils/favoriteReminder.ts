export type FavoriteReminderThreshold = 3 | 6

export function resolveFavoriteReminderThreshold(
  previousCount: number,
  currentCount: number,
  consumed: number[],
): FavoriteReminderThreshold | null {
  for (const threshold of [3, 6] as const) {
    if (previousCount < threshold && currentCount >= threshold && !consumed.includes(threshold)) {
      return threshold
    }
  }
  return null
}
