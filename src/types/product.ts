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
  rawImageUrl?: string | null
  garminImageUrl: string
  garminStoreUrl: string
  heroFile: HeroFile | null
  fallbackImageUrl?: string | null
}

export interface ProductVO {
  appId: number
  designId: string
  userId: number
  name: string
  description: string
  price: number
  rawImageUrl?: string | null
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
  configJson?: RuntimeDesignConfig | null
  fallbackImageUrl?: string | null
}

export interface RuntimeDesignConfig {
  version?: string
  properties?: Record<string, any>
  designId?: string
  name?: string
  textCase?: number
  labelLengthType?: number
  showUnit?: boolean
  elements?: RuntimeDesignElement[]
  orderIds?: string[]
  [key: string]: any
}

export interface RuntimeDesignElement {
  id?: string | number
  eleType?: string
  type?: string
  left?: number
  top?: number
  width?: number
  height?: number
  radius?: number
  rx?: number
  ry?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  originX?: string
  originY?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  angle?: number
  opacity?: number
  text?: string
  label?: string
  value?: string | number
  textTemplate?: string
  dataProperty?: string
  goalProperty?: string
  textProperty?: string
  metricSymbol?: string
  imageUrl?: string
  url?: string
  src?: string
  points?: Array<{ x: number; y: number }>
  [key: string]: any
}

export interface ProductPreviewConfigVO {
  appId: number
  designId: string
  name: string
  configJson: RuntimeDesignConfig | null
  fallbackImageUrl?: string | null
}

export interface DesignFontFileVO {
  id: number
  name: string
  url: string
  previewUrl?: string | null
  provider?: string
}

export interface DesignFontVO {
  id: number
  fullName?: string
  postscriptName?: string
  slug: string
  family?: string
  subfamily?: string
  type?: string
  status?: string
  ttf?: number
  ttfFile?: DesignFontFileVO | null
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
  representativeProduct?: ProductBaseVO | null
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
  topN?: number
}
