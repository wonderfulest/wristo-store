import instance from '@/config/axios'
import type { ProductFavoriteRecord } from '@/utils/productFavorites'

export const getProductFavorites = (): Promise<ProductFavoriteRecord[]> =>
  instance.get('/products/favorites')

export const addProductFavorite = (appId: number): Promise<ProductFavoriteRecord[]> =>
  instance.post(`/products/favorites/${appId}`)

export const removeProductFavorite = (appId: number): Promise<boolean> =>
  instance.delete(`/products/favorites/${appId}`)

export const mergeProductFavorites = (appIds: number[]): Promise<ProductFavoriteRecord[]> =>
  instance.post('/products/favorites/merge', { appIds })
