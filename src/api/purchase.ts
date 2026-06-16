import instance from '@/config/axios'
import type { Bundle, AppSalesSummaryVO, SalesQueryDTO } from '@/types/product'
import type { PurchaseCallbackRequest, PurchaseRecordVO, PurchaseSuccessResponseVO } from '@/types/purchase-check'

export interface CheckDiscountRequest {
  priceId: string
  discountCode: string
}

export interface CheckDiscountResponseVO {
  valid: boolean
  discount?: {
    type?: string
    value?: number
  }
}

export interface CartCheckoutItemRequest {
  appId: number
  quantity: number
}

export interface CartCheckoutRequest {
  items: CartCheckoutItemRequest[]
}

export interface CartCheckoutItemVO {
  appId: number
  name: string
  priceId: string
  amount: number
  quantity: number
}

export interface CartCheckoutResponseVO {
  transactionId: string
  currencyCode: string
  subtotal: number
  discountRate: number
  discountAmount: number
  estimatedTotal: number
  discountLabel: string
  grandTotal: number
  items: CartCheckoutItemVO[]
}

export interface CartPurchaseCheckItemVO {
  appId: number
  name: string
  purchased: boolean
  purchaseType?: 'app' | 'bundle' | string
  purchaseRecordId?: number
  bundleId?: number
  bundleName?: string
  message?: string
}

export interface CartPurchaseCheckResponseVO {
  hasPurchasedItems: boolean
  items: CartPurchaseCheckItemVO[]
}

export const getBundlesForPurchase = (): Promise<Bundle[]> => {
  return instance.get('/public/purchase/bundles')
}

export const getBundleProductsForPurchase = (
  bundleId: number,
  params?: { offset?: number; limit?: number }
): Promise<Bundle['products']> => {
  return instance.get(`/public/purchase/bundles/${bundleId}/products`, { params })
}

export const checkBundleByEmail = (request: { email: string; bundleId: number }): Promise<PurchaseRecordVO | null> => {
  return instance.post('/public/purchase/bundle/check', request)
}

export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<PurchaseSuccessResponseVO> => {
  return instance.post('/public/purchase/callback', data)
}

export const checkDiscount = (data: CheckDiscountRequest): Promise<CheckDiscountResponseVO> => {
  return instance.post('/public/purchase/check-discount', data)
}

export const createCartCheckout = (data: CartCheckoutRequest): Promise<CartCheckoutResponseVO> => {
  return instance.post('/public/purchase/cart/checkout', data)
}

export const checkCartPurchases = (data: CartCheckoutRequest): Promise<CartPurchaseCheckResponseVO> => {
  return instance.post('/public/purchase/cart/check', data)
}

// Top apps by sales for last 7 days
export const getTopWeekApps = (data?: SalesQueryDTO): Promise<AppSalesSummaryVO[]> => {
  return instance.post('/public/website/purchases/app/top-week', { topN: 20, ...(data || {}) })
}

// Top apps by sales for last 30 days
export const getTopMonthApps = (data?: SalesQueryDTO): Promise<AppSalesSummaryVO[]> => {
  return instance.post('/public/website/purchases/app/top-month', { topN: 20, ...(data || {}) })
}
