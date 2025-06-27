// 基础响应类型
export interface Response<T> {
  code: number
  msg: string
  data: T
}

// 通用分页返回类型
export interface PageResult<T> {
  pageNum: number
  pageSize: number
  total: number
  pages: number
  list: T[]
}
// 定义系列类型
export interface Series {
  id: number
  name: string
  slug: string
  image: string | null
  sort: number
}


// 产品类型
export interface ProductBaseVO {
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
  paddleProductId: string
  paddlePriceId: string
  bundleName: string
  bundleDesc: string
  price: number
  isActive: number
  createdAt: string
  updatedAt: string
  products: ProductBaseVO[]
}


// 购买时返回的商品类型
export interface ProductVO {
  appId: number
  designId: string
  userId: number
  paddleProductId: string
  paddlePriceId: string
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
  heroFile: string | null
  backgroundFile: string | null
  categories: any // 可根据实际类型调整
  packageStatus: number
}


// 请求信息类型
export interface RequestInfo {
  appid: number
  accounttoken: string
  purchaseCode: string
}

// 购买响应数据类型
export interface PurchaseData {
  product: ProductBaseVO
  bundles: Bundle[]
  request: RequestInfo
}

// 购买接口响应类型
export interface PurchaseResponse extends Response<PurchaseData> {
  data: PurchaseData
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



// 套餐信息
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

// 请求信息
export interface ProductDetailRequest {
  appid: number;
  accounttoken: string;
  purchaseCode: string;
}

// 产品详情接口返回结构
export interface ProductDetailResponse {
  code: number;
  msg: string;
  data: {
    product: ProductVO;
    bundles: BundleItem[];
    request: ProductDetailRequest;
  };
} 