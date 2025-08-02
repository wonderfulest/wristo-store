import instance from '@/config/axios'
import type { Subscription } from '@/types/user'

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
 * 获取当前用户的订阅详情
 */
export const getSubscriptionDetails = (): Promise<Subscription> => {
  return instance.get('/v1/user/subscriptions/details?populate=paddle')
}

/**
 * 暂停订阅
 */
export const pauseSubscription = (remark: string): Promise<Subscription> => {
  return instance.post('/v1/user/subscriptions/pause-with-reason?populate=paddle', {
    remark
  })
}

/**
 * 恢复订阅
 */
export const resumeSubscription = (): Promise<Subscription> => {
  return instance.post('/v1/user/subscriptions/resume?populate=paddle')
}
