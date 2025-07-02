import instance from '@/config/axios'
import type { PurchaseResponse, ApiResponse } from '@/types'

export const purchaseByCode = (code: string): Promise<PurchaseResponse> => {
  return instance.post('/public/trials/v1/purchase', { code })
}

export const createPaypalOrder = (request: any): Promise<ApiResponse<any>> => {
  return instance.post('/public/paypal/orders', request)
}

export const capturePaypalOrder = (orderId: string): Promise<ApiResponse<any>> => {
  return instance.post(`/public/paypal/orders/${orderId}/capture`)
}

// 购买成功回调接口
export interface PurchaseCallbackRequest {
  transaction_id: string
}

export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<ApiResponse<any>> => {
  return instance.post('/public/trials/v1/purchase/callback', data)
}