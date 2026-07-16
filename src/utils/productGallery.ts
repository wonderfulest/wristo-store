export interface ProductShareImageSource {
  id: string | number
  sortOrder?: number | null
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
  kind: 'fixed' | 'share'
  sourceId: string | number | null
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
  const defaultAlt = productName.trim()
  const fixedUrl = fallbackImageUrl?.trim()

  if (fixedUrl) {
    seenUrls.add(fixedUrl)
    items.push({
      key: 'fixed',
      url: fixedUrl,
      alt: defaultAlt,
      kind: 'fixed',
      sourceId: null,
    })
  }

  for (const image of shareImages) {
    const url = resolveProductShareImageUrl(image)
    if (!url || seenUrls.has(url)) continue

    seenUrls.add(url)
    items.push({
      key: `share-${image.id}`,
      url,
      alt: image.altText?.trim() || defaultAlt,
      kind: 'share',
      sourceId: image.id,
    })
  }

  return items
}

export const resolveAvailableGalleryItems = (
  items: readonly ProductGalleryItem[],
  failedUrls: ReadonlySet<string>,
): ProductGalleryItem[] => {
  return items.filter((item) => !failedUrls.has(item.url))
}

export const resolveCircularGalleryUrl = (
  items: readonly ProductGalleryItem[],
  selectedUrl: string | null,
  delta: -1 | 1,
): string | null => {
  if (items.length === 0) return null

  const selectedIndex = items.findIndex((item) => item.url === selectedUrl)
  if (selectedIndex < 0) {
    return delta === 1 ? items[0].url : items[items.length - 1].url
  }

  const nextIndex = (selectedIndex + delta + items.length) % items.length
  return items[nextIndex].url
}

export const resolveSelectionAfterItemsChange = (
  beforeItems: readonly ProductGalleryItem[],
  afterItems: readonly ProductGalleryItem[],
  selectedUrl: string | null,
): string | null => {
  if (afterItems.length === 0) return null

  if (afterItems.some((item) => item.url === selectedUrl)) {
    return selectedUrl
  }

  const selectedIndex = beforeItems.findIndex((item) => item.url === selectedUrl)
  if (selectedIndex < 0) return afterItems[0].url

  return afterItems[selectedIndex]?.url ?? afterItems[selectedIndex - 1]?.url ?? afterItems[0].url
}

export const moveShareImageIds = (
  ids: readonly number[],
  imageId: number,
  delta: -1 | 1,
): number[] => {
  const movedIds = [...ids]
  const sourceIndex = movedIds.indexOf(imageId)
  const targetIndex = sourceIndex + delta

  if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= movedIds.length) {
    return movedIds
  }

  const sourceId = movedIds[sourceIndex]
  movedIds[sourceIndex] = movedIds[targetIndex]
  movedIds[targetIndex] = sourceId
  return movedIds
}

export const resolveGallerySelectedIndex = (
  items: readonly ProductGalleryItem[],
  selectedUrl: string | null,
): number => {
  const index = items.findIndex((item) => item.url === selectedUrl)
  return index >= 0 ? index : 0
}
