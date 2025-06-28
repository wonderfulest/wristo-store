import instance from '@/config/axios'
import type { PurchaseResponse, Response } from '@/types'

export const purchaseByCode = (code: string): Promise<PurchaseResponse> => {
  return instance.post('/public/trials/v1/purchase', { code })
}

export const createPaypalOrder = (request: any): Promise<Response<any>> => {
  return instance.post('/public/paypal/orders', request)
}

export const capturePaypalOrder = (orderId: string): Promise<Response<any>> => {
  return instance.post(`/public/paypal/orders/${orderId}/capture`)
}

// 购买成功回调接口
export interface PurchaseCallbackRequest {
  transaction_id: string
  customerEmail: string
  accounttoken: string
  code: string
  appid: number
  isBundle: boolean
}

export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<Response<any>> => {
  return instance.post('/public/trials/v1/purchase/callback', data)
}