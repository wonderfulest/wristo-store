import type { ProductBaseVO, ProductVO } from '@/types/product'

export interface ProductFavoriteRecord {
  appId: number
  name: string
  price: number
  imageUrl: string
  createdAt: string
  isAvailable?: boolean
  isPurchased?: boolean
}

export const toProductFavoriteRecord = (
  product: ProductBaseVO | ProductVO,
  createdAt = new Date().toISOString(),
): ProductFavoriteRecord => ({
  appId: Number(product.appId),
  name: product.name,
  price: Number(product.price || 0),
  imageUrl: product.heroFile?.url
    || product.previewImageUrl
    || product.rawImageUrl
    || product.garminImageUrl
    || '',
  createdAt,
})

export function mergeFavoriteRecords(
  local: ProductFavoriteRecord[],
  remote: ProductFavoriteRecord[],
): ProductFavoriteRecord[] {
  const merged = new Map<number, ProductFavoriteRecord>()
  for (const record of [...local, ...remote]) {
    const existing = merged.get(Number(record.appId))
    if (!existing) {
      merged.set(Number(record.appId), { ...record, appId: Number(record.appId) })
      continue
    }
    const createdAt = existing.createdAt <= record.createdAt ? existing.createdAt : record.createdAt
    merged.set(Number(record.appId), { ...existing, ...record, appId: Number(record.appId), createdAt })
  }
  return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
