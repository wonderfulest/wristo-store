export type BannerLinkType = string

export interface WebsiteImageFormatVO {
  url: string
  width?: number
  height?: number
}

export interface WebsiteImageVO {
  id: number
  url: string
  alternativeText?: string
  width?: number
  height?: number
  formats?: Record<string, WebsiteImageFormatVO>
}

export interface HomeBannerVO {
  id: number
  imageId: number
  image?: WebsiteImageVO
  linkType?: BannerLinkType
  linkUrl?: string
  openTarget?: string
  sortOrder?: number
  remark?: string
  clickCount?: number
  isActive?: number
  createdAt?: string
  updatedAt?: string
}
