import instance from '@/config/axios'
import type { ProductBaseVO, Series, PageResult } from '@/types'


// 搜索商品
export const searchProducts = (keyword: string): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/search', {
    params: { keyword }
  })
}

// 获取新品
export const getNewProducts = (): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/new?limit=16')
}

// 获取系列列表
export const getHotSeries = (): Promise<Series[]> => {
  return instance.get('/public/categories/hot?limit=8')
}

// 获取系列列表
export const getSeries = (): Promise<Series[]> => {
  return instance.get('/public/categories/all')
}

// 获取热门商品
export const getHotProducts = (): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/hot?limit=18')
}

// 获取商品详情
export const getProductDetail = (appId: string): Promise<ProductBaseVO> => {
  return instance.get(`/public/products/app/${appId}?populate=devices`)
}

// 获取相关商品
export const getRelatedProducts = (appId: string): Promise<ProductBaseVO[]> => {
  return instance.get(`/public/products/related/${appId}`)
}

// 通过 slug 获取系列下商品（分页）
export const getProductsByCategory = (slug: string, pageNum = 1, pageSize = 30): Promise<PageResult<ProductBaseVO>> => {
  return instance.get('/public/products/page/category', {
    params: { slug, pageNum, pageSize, orderBy: 'download:desc' }
  })
}