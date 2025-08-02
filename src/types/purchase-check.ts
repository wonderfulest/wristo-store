import type { UserBaseVO } from './user'
import type { ProductBaseVO } from './product'

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

// 检查购买请求
export interface CheckPurchaseRequest {
  email: string
  accountToken: string
  appId: number
  isSubscription: boolean
}

// 购买记录 VO
export interface PurchaseRecordVO {
  id: number
  email: string
  accountToken: string
  origin: string
  appId: number
  bundleId: number
  isBundle: boolean
  transactionId: string
  customerId: string
  addressId: string
  countryCode: string
  paymentMethod: string
  fee: number
  tax: number
  total: number
  credit: number
  balance: number
  discount: number
  earnings: number
  subtotal: number
  grandTotal: number
  currencyCode: string
  creditToBalance: number
  status: number
  statusDesc: string
  createdAt: string
  updatedAt: string
  version: number
  user?: UserBaseVO
  product?: ProductBaseVO
}

// 订阅 VO
export interface SubscriptionVO {
  name: string
  planCode: string
  startTime: string
  endTime: string | null
  isGift: boolean
}

// 检查购买响应
export interface CheckPurchaseResponse {
  isPurchase: boolean
  purchase: PurchaseRecordVO | null
  subscription: SubscriptionVO | null
}
