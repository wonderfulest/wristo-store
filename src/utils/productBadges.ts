export type ProductBadge = {
  kind: 'free' | 'new' | 'popular' | 'style'
  labelKey: string
}

type BadgeProduct = {
  price?: number | null
  download?: number | null
  createdAt?: string | null
  categories?: Array<{ slug?: string | null }> | null
}

type BadgeContext = {
  now?: Date
  popularDownloadThreshold?: number
}

export const resolveProductBadges = (product: BadgeProduct, context: BadgeContext = {}): ProductBadge[] => {
  const badges: ProductBadge[] = []
  if (Number(product.price ?? 0) <= 0) badges.push({ kind: 'free', labelKey: 'product.badge.free' })
  const createdAt = product.createdAt ? new Date(product.createdAt) : null
  const now = context.now ?? new Date()
  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const age = now.getTime() - createdAt.getTime()
    if (age >= 0 && age <= 30 * 24 * 60 * 60 * 1000) badges.push({ kind: 'new', labelKey: 'product.badge.new' })
  }
  if (Number(product.download ?? 0) >= (context.popularDownloadThreshold ?? 50000)) {
    badges.push({ kind: 'popular', labelKey: 'product.badge.popular' })
  }
  const slugs = new Set((product.categories ?? []).map((item) => item.slug?.trim().toLowerCase()).filter(Boolean))
  if (slugs.has('amoled')) badges.push({ kind: 'style', labelKey: 'product.badge.amoled' })
  else if (slugs.has('minimal')) badges.push({ kind: 'style', labelKey: 'product.badge.minimal' })
  return badges.slice(0, 2)
}
