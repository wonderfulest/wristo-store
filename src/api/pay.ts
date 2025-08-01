import instance from '@/config/axios'
import type { ApiResponse } from '@/types'
import type { PurchaseResponse } from '@/types/purchase'
import type { PurchaseRecord } from '@/types/purchase'

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

// 购买成功回调响应
export interface PurchaseSuccessResponseVO {
  txnId: string;
  productName: string;
  grandTotal: string;
  currencyCode: string;
}

// 购买成功回调接口
export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<ApiResponse<PurchaseSuccessResponseVO>> => {
  return instance.post('/public/trials/v1/purchase/callback', data)
}

// 获取用户购买记录列表
export const getPurchaseRecords = (): Promise<ApiResponse<PurchaseRecord[]>> => {
  return instance.get('/purchase-records/list/bytoken?populate=user,product')
}

// 根据邮箱查询购买记录列表
export const getPurchaseRecordsByEmail = (email: string): Promise<ApiResponse<boolean>> => {
  return instance.get(`/public/purchase-records/list/byemail?email=${encodeURIComponent(email)}`)
}