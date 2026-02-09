import type { UserBaseVO } from "./user";

export interface HeroFile {
  id: number
  name: string
  url: string
  previewUrl: string | null
  provider: string
}

export interface PaymentVO {
  paddleProductId: string
  paddlePriceId: string
}

export interface GarminDeviceBaseVO {
  id: number
  deviceId: string
  displayName: string
  imageUrl: string | null
}

export interface ProductBaseVO {
  appId: number
  name: string
  price: number
  designId: string
  garminImageUrl: string
  garminStoreUrl: string
  heroFile: HeroFile | null
}

export interface ProductVO {
  appId: number
  designId: string
  userId: number
  name: string
  description: string
  price: number
  garminImageUrl: string
  garminStoreUrl: string
  garminAppUuid: string
  trialLasts: number
  createdAt: string
  updatedAt: string
  isActive: number
  isDeleted: number
  download: number
  purchase: number
  heroFile: HeroFile | null
  backgroundFile: string | null
  categories: any
  packageStatus: number
  payment: PaymentVO
  devices?: GarminDeviceBaseVO[]
}

export interface Bundle {
  bundleId: number
  userId: number
  paddleProductId: string
  paddlePriceId: string
  bundleName: string
  bundleDesc: string
  price: number
  isActive: number
  createdAt: string
  updatedAt: string
  appCount: number
  appTotalPrice: number
  products: ProductBaseVO[]
  user?: UserBaseVO
}

export interface BundleItem {
  bundleId: number;
  userId: number;
  paddleProductId: string;
  paddlePriceId: string;
  bundleName: string;
  bundleDesc: string;
  price: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  products: ProductVO[];
}

export interface ImageFormatVO {
  url: string
  width?: number
  height?: number
}

export interface ImageVO {
  id: number
  documentId?: string
  name?: string
  alternativeText?: string
  caption?: string
  width?: number
  height?: number
  formats?: Record<string, ImageFormatVO>
  url: string
  previewUrl?: string | null
  provider?: string
  folderPath?: string
  usageType?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  locale?: string
}

export interface Series {
  id: number
  name: string
  slug: string
  heroId?: number | null
  bannerId?: number | null
  sort?: number | null
  isActive?: number | null
  hero?: ImageVO | null
  banner?: ImageVO | null
  image?: string | null
}

// Top sales summary for apps
export interface AppSalesSummaryVO {
  appId: number
  salesCount: number
  totalAmount: number
  bundleTriggerCount: number
  app: ProductBaseVO | null
}

// Optional query for sales range / filters
export interface SalesQueryDTO {
  startDate?: string
  endDate?: string
  appId?: number
}