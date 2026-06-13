import instance from '@/config/axios'
import type { DesignFontVO, ProductBaseVO, ProductPreviewConfigVO, ProductVO, Series, PageResult } from '@/types'


// 搜索商品
export const searchProducts = (keyword: string): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/search', {
    params: { keyword }
  })
}

// 搜索商品（分页）
export const searchProductsV2 = (keyword: string, pageNum = 1, pageSize = 24): Promise<PageResult<ProductBaseVO>> => {
  return instance.get('/public/products/search/v2', {
    params: { keyword, pageNum, pageSize }
  })
}

// 获取新品
export const getNewProducts = (): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/new?limit=16')
}

// 获取系列列表
export const getHotSeries = (limit = 8): Promise<Series[]> => {
  return instance.get('/public/categories/hot', {
    params: {
      limit,
      populate: 'image'
    }
  })
}

// 获取系列列表
export const getSeries = (): Promise<Series[]> => {
  return instance.get('/public/categories/all')
}

// 获取热门商品
export const getHotProducts = (limit = 24): Promise<ProductBaseVO[]> => {
  return instance.get('/public/products/hot', {
    params: { limit }
  })
}

// 获取商品详情
export const getProductDetail = (appId: string): Promise<ProductVO> => {
  return instance.get(`/public/products/app/${appId}`, {
    params: { populate: '*' }
  })
}

// 获取商品 Studio 动态预览配置
export const getProductPreviewConfig = (appId: string | number): Promise<ProductPreviewConfigVO> => {
  return instance.get(`/public/products/app/${appId}/preview-config`)
}

// 根据设计 ID 获取商品 Studio 动态预览配置
export const getProductPreviewConfigByDesignId = (designId: string): Promise<ProductPreviewConfigVO> => {
  return instance.get(`/public/products/design/${encodeURIComponent(designId)}/preview-config`)
}

// 获取公开字体详情，用于商品页按设计配置加载字体文件
export const getPublicFontBySlug = (slug: string): Promise<DesignFontVO> => {
  return instance.get(`/public/fonts/get-by-slug/${encodeURIComponent(slug)}?populate=ttf`)
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
