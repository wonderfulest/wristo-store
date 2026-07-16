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
