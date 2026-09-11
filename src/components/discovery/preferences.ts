export type Preference = 'like' | 'dislike'
export type Preferences = Record<string, Preference>
export function selectRound<T extends { appId: number }>(products: T[], preferences: Preferences): T[] {
  return [...new Map(products.map(product => [product.appId, product])).values()]
    .filter(product => !preferences[String(product.appId)])
    .slice(0, 10)
}
