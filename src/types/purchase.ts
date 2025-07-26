import type { ProductBaseVO, Bundle } from './product'
import type { UserBaseVO } from './user'
import type { ApiResponse } from './api'

export interface PurchaseRequest {
  appid: number
  accounttoken: string
  purchaseCode: string
}

export interface PurchaseData {
  product: ProductBaseVO
  bundles: Bundle[]
  request: PurchaseRequest
}

export interface PurchaseRecord {
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
  user: UserBaseVO
  product: ProductBaseVO
}

export interface PurchaseRecordsResponse {
  code: number
  msg: string
  data: PurchaseRecord[]
}

// 购买接口响应类型
export interface PurchaseResponse extends ApiResponse<PurchaseData> {
  data: PurchaseData
} 