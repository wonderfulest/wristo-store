import instance from '@/config/axios'
import type { PurchaseData } from '@/types/purchase'
import type { PurchaseRecord } from '@/types/purchase'
import type { CheckPurchaseRequest, CheckPurchaseResponse,
   PurchaseCallbackRequest, PurchaseSuccessResponseVO } from '@/types/purchase-check'

export const purchaseByCode = (code: string): Promise<PurchaseData> => {
  return instance.post('/public/trials/v1/purchase', { code })
}

export const createPaypalOrder = (request: any): Promise<any> => {
  return instance.post('/public/paypal/orders', request)
}

export const capturePaypalOrder = (orderId: string): Promise<any> => {
  return instance.post(`/public/paypal/orders/${orderId}/capture`)
}

// 购买成功回调接口
export const purchaseCallback = (data: PurchaseCallbackRequest): Promise<PurchaseSuccessResponseVO> => {
  return instance.post('/public/trials/v1/purchase/callback', data)
}

// 获取用户购买记录列表
export const getPurchaseRecords = (): Promise<PurchaseRecord[]> => {
  return instance.get('/purchase/list/bytoken?populate=user,product')
}

// 根据邮箱查询购买记录列表
export const getPurchaseRecordsByEmail = (email: string): Promise<boolean> => {
  return instance.get(`/public/purchase/list/byemail?email=${encodeURIComponent(email)}`)
}

// 根据邮箱 + part_number 校验购买过的权益
export const checkPurchase = (request: CheckPurchaseRequest): Promise<CheckPurchaseResponse> => {
  return instance.post('/public/trials/v1/check-purchase', request)
}

// 激活已购买的产品（使用购买邮箱和智能手表代码）
export const activatePurchase = (email: string, smartwatchCode: string): Promise<CheckPurchaseResponse> => {
  return instance.post('/public/trials/v1/activate-purchase', { email, code: smartwatchCode })
}

// 根据用户token和代码检查购买状态
export const checkPurchaseByToken = (code: string): Promise<CheckPurchaseResponse> => {
  return instance.post('/trials/check-purchase', { code })
}

// 继续支付：根据交易ID获取6位激活码
export const continuePurchase = (txnId: string): Promise<string> => {
  return instance.post('/public/trials/v1/purchase/continue', { txnId })
}