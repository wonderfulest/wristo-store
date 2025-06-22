// 基础响应类型
export interface BaseResponse {
  code: number
  msg: string
  data: any
}

// 产品类型 (用于购买接口返回)
export interface Product {
  appId: number
  name: string
  price: number
  designId: string
  garminImageUrl: string
  garminStoreUrl: string
  heroFile: string | null
}

// Bundle类型
export interface Bundle {
  bundleId: number
  userId: number
  bundleName: string
  bundleDesc: string
  price: number
  isActive: number
  createdAt: string
  updatedAt: string
  products: Product[]
}

// 请求信息类型
export interface RequestInfo {
  appid: number
  accounttoken: string
  purchaseCode: string
}

// 购买响应数据类型
export interface PurchaseData {
  product: Product
  bundles: Bundle[]
  request: RequestInfo
}

// 购买接口响应类型
export interface PurchaseResponse extends BaseResponse {
  data: PurchaseData
}

// 商店选项产品类型 (用于商店选项页面)
export interface ShopProduct {
  productName: string
  productDescription: string
  productId: number
  isBundle: boolean
  merchantName: string
  price: number
  imageUrl: string
  licenseValidityDurationInDays: number | null
  appId: number
  allowTipping: boolean | null
  bundleContent: string | null
  products?: ShopProduct[]
  discount?: string
  website?: string
  limitedOffer?: string
  newFaceTip?: string
  originalPrice?: number
}

// --- Paddle Checkout Completed Event Types ---

export interface PaddleCustomData {
  app_id: number;
  product_name: string;
  product_image: string;
  product_price: number;
  product_is_bundle: boolean;
}

export interface PaddleAddress {
  id: string;
  country_code: string;
  postal_code: string;
  city: string;
  region: string;
  first_line: string;
}

export interface PaddleCustomer {
  id: string;
  email: string;
  address: PaddleAddress | null;
  business: any | null;
}

export interface PaddleProductInfo {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
}

export interface PaddleItemTotals {
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  balance: number;
  credit: number;
}

export interface PaddleItem {
  price_id: string;
  product: PaddleProductInfo;
  billing_cycle: any | null;
  trial_period: any | null;
  quantity: number;
  totals: PaddleItemTotals;
}

export interface PaddleTransactionTotals {
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  credit: number;
  balance: number;
}

export interface PaddlePaymentDetails {
  type: string;
}

export interface PaddleSettings {
  display_mode: string;
  theme: string;
  variant: string;
}

export interface PaddleCheckoutCompletedData {
  id: string;
  transaction_id: string;
  status: string;
  custom_data: PaddleCustomData;
  currency_code: string;
  customer: PaddleCustomer;
  items: PaddleItem[];
  totals: PaddleTransactionTotals;
  payment: {
    method_details: PaddlePaymentDetails;
  };
  settings: PaddleSettings;
}

export interface PaddleCheckoutCompletedEvent {
  name: 'checkout.completed';
  data: PaddleCheckoutCompletedData;
} 