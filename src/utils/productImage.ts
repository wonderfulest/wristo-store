import type { HeroFile } from '@/types/product'

export interface ProductImageSource {
  fallbackImageUrl?: string | null
  heroFile?: HeroFile | null
  garminImageUrl?: string | null
  rawImageUrl?: string | null
  imageUrl?: string | null
}

export const getProductImageUrl = (product?: ProductImageSource | null): string => {
  return (
    product?.fallbackImageUrl ||
    product?.heroFile?.previewUrl ||
    product?.heroFile?.url ||
    product?.garminImageUrl ||
    product?.rawImageUrl ||
    product?.imageUrl ||
    ''
  )
}
