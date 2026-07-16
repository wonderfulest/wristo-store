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

export const resolveGallerySwipeDirection = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 48,
): -1 | 1 | null => {
  const deltaX = startX - endX
  const deltaY = startY - endY
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) return null
  return deltaX > 0 ? 1 : -1
}

export const resolveAddImagesLabel = (
  uploading: boolean,
  canAddImages: boolean,
): string => {
  if (uploading) return 'Uploading…'
  return canAddImages ? 'Add images' : '8 image limit'
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

  if (afterItems[selectedIndex]) return afterItems[selectedIndex].url

  const remainingUrls = new Set(afterItems.map((item) => item.url))
  for (let index = selectedIndex - 1; index >= 0; index -= 1) {
    if (remainingUrls.has(beforeItems[index].url)) return beforeItems[index].url
  }

  return afterItems[0].url
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

export const reorderShareImageIdsAtTarget = (
  ids: readonly number[],
  sourceId: number,
  targetId: number,
): number[] => {
  const reorderedIds = [...ids]
  const sourceIndex = reorderedIds.indexOf(sourceId)
  const targetIndex = reorderedIds.indexOf(targetId)
  if (sourceIndex < 0 || targetIndex < 0 || sourceId === targetId) return reorderedIds

  reorderedIds.splice(sourceIndex, 1)
  const targetIndexAfterRemoval = reorderedIds.indexOf(targetId)
  const insertionIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval
  reorderedIds.splice(insertionIndex, 0, sourceId)
  return reorderedIds
}

export const reorderProductShareImageSources = (
  sources: readonly ProductShareImageSource[],
  imageIds: readonly number[],
): ProductShareImageSource[] | null => {
  if (imageIds.length !== sources.length) return null

  const sourcesById = new Map<number, ProductShareImageSource>()
  for (const source of sources) {
    if (typeof source.id !== 'number' || sourcesById.has(source.id)) return null
    sourcesById.set(source.id, source)
  }

  if (new Set(imageIds).size !== imageIds.length) return null

  const reorderedSources: ProductShareImageSource[] = []
  for (const imageId of imageIds) {
    const source = sourcesById.get(imageId)
    if (!source) return null
    reorderedSources.push(source)
  }

  return reorderedSources
}

export const resolveGallerySelectedIndex = (
  items: readonly ProductGalleryItem[],
  selectedUrl: string | null,
): number => {
  const index = items.findIndex((item) => item.url === selectedUrl)
  return index >= 0 ? index : 0
}
