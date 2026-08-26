export function appendRecentlyViewed(ids: number[], appId: number, limit = 24): number[] {
  return [...ids.filter((id) => id !== appId), appId].slice(-Math.max(1, limit))
}
