import instance from '@/config/axios'
import type { ProductBaseVO } from '@/types'

export interface DiscoveryRequest {
  deviceId: number
  likedAppIds: number[]
  excludedAppIds: number[]
  limit: number
}

export const getDiscoveryRecommendations = (request: DiscoveryRequest): Promise<ProductBaseVO[]> =>
  instance.post('/public/products/discovery/recommendations', request)
