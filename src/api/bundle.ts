import instance from '@/config/axios'
import type { Bundle } from '@/types/product'

// 根据Bundle ID获取Bundle详情
export const getBundleById = (
  bundleId: number,
  params?: { device?: number }
): Promise<Bundle> => {
  return instance.get(`/public/bundles/${bundleId}`, {
    params: { populate: '*', ...(params || {}) },
  })
}
