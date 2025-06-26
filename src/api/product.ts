import instance from '@/config/axios'
import type { ProductBaseVO, Series, PageResult, Response } from '@/types'


// 搜索商品
export const searchProducts = (keyword: string): Promise<Response<ProductBaseVO[]>> => {
  return instance.get('/products/search', {
    params: { keyword }
  })
}

// 获取新品
export const getNewProducts = (): Promise<Response<ProductBaseVO[]>> => {
  return instance.get('/public/products/new')
}

// 获取系列列表
export const getHotSeries = (): Promise<Response<Series[]>> => {
  return instance.get('/public/categories/hot?limit=8')
}

// 获取系列列表
export const getSeries = (): Promise<Response<Series[]>> => {
  return instance.get('/public/categories/all')
}

// 获取热门商品
export const getHotProducts = (): Promise<Response<ProductBaseVO[]>> => {
  return instance.get('/public/products/hot')
}

// 获取商品详情
export const getProductDetail = (appId: string): Promise<Response<ProductBaseVO>> => {
  return instance.get(`/public/products/app/${appId}`)
}

// 获取相关商品
export const getRelatedProducts = (appId: string): Promise<Response<ProductBaseVO[]>> => {
  return instance.get(`/public/products/related/${appId}`)
}

// 通过 slug 获取系列下商品（分页）
export const getProductsByCategory = (slug: string, pageNum = 1, pageSize = 30): Promise<Response<PageResult<ProductBaseVO>>> => {
  return instance.get('/public/products/page/category', {
    params: { slug, pageNum, pageSize, orderBy: 'download:desc' }
  })
}