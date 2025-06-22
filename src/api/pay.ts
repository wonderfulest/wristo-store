import instance from '@/config/axios'
import type { PurchaseResponse, BaseResponse } from '@/types'

export const purchaseByCode = (code: string): Promise<PurchaseResponse> => {
  return instance.post('/trials/v1/purchase', { code })
}

export const createPaypalOrder = (request: any): Promise<BaseResponse> => {
  return instance.post('/paypal/orders', request)
}

export const capturePaypalOrder = (orderId: string): Promise<BaseResponse> => {
  return instance.post(`/paypal/orders/${orderId}/capture`)
}