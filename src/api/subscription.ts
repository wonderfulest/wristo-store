import instance from '@/config/axios'

/**
 * 订阅计划类型
 */
export interface SubscriptionPlan {
  id: number;
  planCode: string;
  name: string;
  durationDays: number;
  isGift: boolean;
  originalPrice: number;
  discountPrice: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: number;
  isActive: number;
  version: number;
  paddleProductId: string;
  paddlePriceId: string;
}

/**
 * 获取所有有效的订阅计划
 */
export const getActivePlans = (): Promise<SubscriptionPlan[]> => {
  return instance.get('/public/subscription/plans/active')
}

/**
 * 暂停订阅
 */
export const pauseSubscription = (): Promise<boolean> => {
  return instance.post('/subscription/pause')
}

/**
 * 取消订阅
 */
export const cancelSubscription = (): Promise<boolean> => {
  return instance.post('/subscription/cancel')
}

/**
 * 恢复订阅
 */
export const resumeSubscription = (): Promise<boolean> => {
  return instance.post('/subscription/resume')
}
