import instance from '@/config/axios'
import type { HomeBannerVO } from '@/types/website'

export const getActiveHomeBanners = (): Promise<HomeBannerVO[]> => {
  return instance.get('/public/website/home-banners/active')
}
