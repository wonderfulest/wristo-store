import instance from '@/config/axios'
import type { ProductBaseVO, Series, PageResult, ApiResponse } from '@/types'


// 搜索商品
export const searchProducts = (keyword: string): Promise<ApiResponse<ProductBaseVO[]>> => {
  return instance.get('/products/search', {
    params: { keyword }
  })
}

// 获取新品
export const getNewProducts = (): Promise<ApiResponse<ProductBaseVO[]>> => {
  return instance.get('/public/products/new')
}

// 获取系列列表
export const getHotSeries = (): Promise<ApiResponse<Series[]>> => {
  return instance.get('/public/categories/hot?limit=8')
}

// 获取系列列表
export const getSeries = (): Promise<ApiResponse<Series[]>> => {
  return instance.get('/public/categories/all')
}

// 获取热门商品
export const getHotProducts = (): Promise<ApiResponse<ProductBaseVO[]>> => {
  return instance.get('/public/products/hot?limit=20')
}

// 获取商品详情
export const getProductDetail = (appId: string): Promise<ApiResponse<ProductBaseVO>> => {
  return instance.get(`/public/products/app/${appId}`)
}

// 获取相关商品
export const getRelatedProducts = (appId: string): Promise<ApiResponse<ProductBaseVO[]>> => {
  return instance.get(`/public/products/related/${appId}`)
}

// 通过 slug 获取系列下商品（分页）
export const getProductsByCategory = (slug: string, pageNum = 1, pageSize = 30): Promise<ApiResponse<PageResult<ProductBaseVO>>> => {
  return instance.get('/public/products/page/category', {
    params: { slug, pageNum, pageSize, orderBy: 'download:desc' }
  })
}