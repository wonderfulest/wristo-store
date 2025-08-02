// Paddle订阅数据类型
export interface PaddleSubscriptionData {
  id: string
  status: string // 'active', 'paused', 'canceled' 等
  customerId: string
  addressId: string
  businessId: string | null
  currencyCode: string
  createdAt: string
  updatedAt: string
  startedAt: string
  firstBilledAt: string
  nextBilledAt: string | null
  pausedAt: string | null
  canceledAt: string | null
  discount: any
  collectionMode: string
  billingCycle: {
    interval: string
    frequency: number
  }
  billingDetails: any
  currentBillingPeriod: any
  managementUrls: {
    updatePaymentMethod: string
    cancel: string
  }
  items: any[]
  customData: Record<string, any>
  importMeta: any
  scheduledChange: {
    action: string // 'pause', 'cancel', 'resume' 等
    effectiveAt: string
    resumeAt: string | null
  } | null
  nextTransaction: any
  recurringTransactionDetails: any
}

export interface Subscription {
  status: number  // 1: ACTIVE, 2: CANCELED, 3: PAST_DUE, 4: PAUSED, 5: TRIALING
  name: string
  planCode: string
  partNumber: string | null
  startTime: string
  endTime: string
  isGift: boolean
  paddleSubId: string
  originalPrice: number
  discountPrice: number
  currencyCode: string
  paddleSubscriptionData?: PaddleSubscriptionData
}

export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string
  phone: string | null
  avatar: string | null
  status: string | null
  createdAt: string
  updatedAt: string
  lastLoginTime: string | null
  lastLoginIp: string | null
  isDeleted: string
  subscription?: Subscription
  activatedApps?: number[]
  roles?: Array<{id: number, roleName: string, roleCode: string, description: string, status: number}>
}

export interface UserBaseVO {
  id: number
  username: string
  nickname: string
  avatar: string
} 