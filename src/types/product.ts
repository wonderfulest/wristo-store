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
}

export interface UserBaseVO {
  id: number
  username: string
  nickname?: string
  avatar?: string
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

export interface Series {
  id: number
  name: string
  slug: string
  image: string | null
  sort: number
} 