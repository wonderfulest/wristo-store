import instance from '@/config/axios'
import type { ApiResponse } from '@/types'
import type { PaddleProductData, PaddlePriceData } from '@/types/paddle'

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
  paddleProduct: PaddleProductData | null;
  paddlePrice: PaddlePriceData | null;
}

/**
 * 获取所有有效的订阅计划
 */
export const getActivePlans = (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  return instance.get('/api/public/subscription/plans/active')
}
