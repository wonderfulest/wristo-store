export interface MerchantImageFormatVO {
  url: string
  width?: number
  height?: number
}

export interface MerchantImageVO {
  id: number
  url: string
  formats?: Record<string, MerchantImageFormatVO>
  alternativeText?: string
  width?: number
  height?: number
}

export interface PublicMerchantVO {
  userId: number
  username?: string
  nickname?: string
  avatar?: string

  bannerImageId?: number
  bannerImage?: MerchantImageVO

  slogan?: string
  facebookUrl?: string
  instagramUrl?: string
  xUrl?: string

  appCount?: number
  totalDownloads?: number
}
