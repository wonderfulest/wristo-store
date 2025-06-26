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