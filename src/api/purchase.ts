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

export const getBundlesForPurchase = (): Promise<Bundle[]> => {
  return instance.get('/public/purchase/bundles')
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

// Top apps by sales for last 7 days
export const getTopWeekApps = (data?: SalesQueryDTO): Promise<AppSalesSummaryVO[]> => {
  return instance.post('/public/website/purchases/app/top-week', data || {})
}

// Top apps by sales for last 30 days
export const getTopMonthApps = (data?: SalesQueryDTO): Promise<AppSalesSummaryVO[]> => {
  return instance.post('/public/website/purchases/app/top-month', data || {})
}
