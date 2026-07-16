export interface ProductShareImageSource {
  id: string | number
  imageUrl?: string | null
  altText?: string | null
  image?: {
    url?: string | null
  } | null
}

export interface ProductGalleryItem {
  key: string
  url: string
  alt: string
}

export const resolveProductShareImageUrl = (image: ProductShareImageSource): string => {
  return image.imageUrl?.trim() || image.image?.url?.trim() || ''
}

export const createProductGalleryItems = (
  shareImages: ProductShareImageSource[],
  fallbackImageUrl: string | null | undefined,
  productName: string,
): ProductGalleryItem[] => {
  const seenUrls = new Set<string>()
  const items: ProductGalleryItem[] = []

  for (const image of shareImages) {
    const url = resolveProductShareImageUrl(image)
    if (!url || seenUrls.has(url)) continue

    seenUrls.add(url)
    items.push({
      key: `share-${image.id}`,
      url,
      alt: image.altText?.trim() || productName,
    })
  }

  if (items.length > 0) return items

  const fallbackUrl = fallbackImageUrl?.trim()
  if (!fallbackUrl) return []

  return [{ key: 'fallback', url: fallbackUrl, alt: productName }]
}

export const resolveAvailableGalleryItems = (
  sourceItems: readonly ProductGalleryItem[],
  fallbackItem: ProductGalleryItem | null | undefined,
  failedUrls: ReadonlySet<string>,
): ProductGalleryItem[] => {
  const availableSourceItems = sourceItems.filter((item) => !failedUrls.has(item.url))
  if (availableSourceItems.length > 0) return availableSourceItems

  return fallbackItem && !failedUrls.has(fallbackItem.url) ? [fallbackItem] : []
}

export const selectGalleryUrlAfterFailure = (
  beforeItems: readonly ProductGalleryItem[],
  afterItems: readonly ProductGalleryItem[],
  selectedUrl: string | null,
  failedUrl: string,
): string | null => {
  if (afterItems.length === 0) return null

  if (selectedUrl !== failedUrl && afterItems.some((item) => item.url === selectedUrl)) {
    return selectedUrl
  }

  const failedIndex = beforeItems.findIndex((item) => item.url === failedUrl)
  if (failedIndex < 0) return afterItems[0].url

  return afterItems[failedIndex]?.url ?? afterItems[failedIndex - 1]?.url ?? afterItems[0].url
}

export const resolveGallerySelectedIndex = (
  items: readonly ProductGalleryItem[],
  selectedUrl: string | null,
): number => {
  const index = items.findIndex((item) => item.url === selectedUrl)
  return index >= 0 ? index : 0
}
