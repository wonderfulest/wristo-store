import instance from '@/config/axios'
import type { Bundle } from '@/types/product'
import type { PurchaseCallbackRequest, PurchaseRecordVO, PurchaseSuccessResponseVO } from '@/types/purchase-check'

export const getBundlesForPurchase = (): Promise<Bundle[]> => {
  return instance.get('/public/purchase/bundles')
}

export const checkBundleByEmail = (request: { email: string; bundleId: number }): Promise<PurchaseRecordVO | null> => {
  return instance.post('/public/purchase/bundle/check', request)
}

export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<PurchaseSuccessResponseVO> => {
  return instance.post('/public/purchase/callback', data)
}
