import instance from '@/config/axios'
import type { PublicMerchantVO } from '@/types/merchant'
import type { PageResult } from '@/types'
import type { ProductBaseVO } from '@/types'

export interface PublicMerchantAppsPageRequest {
  userId: number
  name?: string
  pageNum: number
  pageSize: number
}

export const getTopMerchants = (limit?: number): Promise<PublicMerchantVO[]> => {
  return instance.get('/public/merchants/top', {
    params: limit ? { limit } : undefined,
  })
}

export const getAllMerchants = (): Promise<PublicMerchantVO[]> => {
  return instance.get('/public/merchants/all?populate=image')
}

export const getMerchantDetail = (userId: number | string): Promise<PublicMerchantVO | null> => {
  return instance.get('/public/merchants/detail', {
    params: {
      userId,
      populate: 'image',
    },
  })
}

export const getMerchantAppsPage = (dto: PublicMerchantAppsPageRequest): Promise<PageResult<ProductBaseVO>> => {
  return instance.post('/public/merchants/apps', dto)
}
