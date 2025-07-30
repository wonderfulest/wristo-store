import instance from '@/config/axios'
import type { ApiResponse } from '@/types'

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
export const getActivePlans = (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  return instance.get('/public/subscription/plans/active')
}
