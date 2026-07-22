import instance from '@/config/axios'
import type { DesignFontVO, ImageVO, ProductBaseVO, ProductPreviewConfigVO, ProductRatingStatsVO, ProductReviewVO, ProductStoreMetricsVO, ProductVO, Series, PageResult } from '@/types'

export interface CategoryPageData {
  total: number
  pageNum: number
  pageSize: number
  pages: number
  list: Series[]
}

export interface CategoryMutationPayload {
  name?: string
  slug?: string
  heroId?: number | null
  bannerId?: number | null
  sort?: number | null
  isActive?: number | null
}

export interface AdminProductPageQuery {
  pageNum: number
  pageSize: number
  name?: string
  orderBy?: string
  populate?: string
}


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

export const fetchAdminProductPage = (query: AdminProductPageQuery): Promise<PageResult<ProductVO>> => {
  return instance.post('/admin/products/page?populate=*', query)
}

// 获取新品
export const getNewProducts = (limit = 30, weight?: number): Promise<ProductBaseVO[]> => {
  const params: { limit: number; weight?: number } = { limit }
  if (weight !== undefined) {
    params.weight = weight
  }
  return instance.get('/public/products/new', {
    params
  })
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
  return instance.get('/public/categories/all', {
    params: { populate: 'image' }
  })
}

export const fetchAdminCategories = (): Promise<CategoryPageData> => {
  return instance.get('/admin/categories/page?populate=image', {
    params: { pageNum: 1, pageSize: 1000, orderBy: 'sort:desc' }
  })
}

export const createAdminCategory = (data: Pick<CategoryMutationPayload, 'name' | 'slug' | 'heroId' | 'bannerId'>): Promise<Series> => {
  return instance.post('/admin/categories/create', data)
}

export const updateAdminCategory = (id: number, data: CategoryMutationPayload): Promise<Series> => {
  return instance.post(`/admin/categories/update/${id}`, data)
}

export const updateAdminCategoryStatus = (id: number, isActive: number): Promise<Series> => {
  return instance.post(`/admin/categories/active/${id}/${isActive}`)
}

export const uploadAdminCategoryImage = (file: File): Promise<ImageVO> => {
  const form = new FormData()
  form.append('file', file)
  form.append('aspect', 'hero')
  return instance.post('/admin/image/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
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

export const getProductRating = (appId: string | number): Promise<ProductRatingStatsVO> => {
  return instance.get(`/public/products/app/${appId}/rating`)
}

export const getMyProductRating = (appId: string | number): Promise<ProductRatingStatsVO> => {
  return instance.get(`/products/app/${appId}/rating`)
}

export const updateProductRating = (appId: string | number, rating: number, comment?: string): Promise<ProductRatingStatsVO> => {
  return instance.post(`/products/app/${appId}/rating`, { rating, comment })
}

export const getProductReviews = (appId: string | number): Promise<ProductReviewVO[]> => {
  return instance.get(`/public/products/app/${appId}/reviews`)
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

export type CategoryProductOrderBy = 'download:desc' | 'rating:desc,download:desc' | 'createdAt:desc'

export interface CategoryAuthorOption {
  id: number
  username?: string | null
  nickname?: string | null
}

// 通过 slug 获取系列下商品（分页）
export const getProductsByCategory = (
  slug: string,
  pageNum = 1,
  pageSize = 30,
  orderBy: CategoryProductOrderBy = 'download:desc',
  userId?: number
): Promise<PageResult<ProductBaseVO>> => {
  return instance.get('/public/products/page/category', {
    params: { slug, pageNum, pageSize, orderBy, ...(userId ? { userId } : {}) }
  })
}

export const fetchCategoryAuthors = (slug: string): Promise<CategoryAuthorOption[]> => {
  return instance.get('/admin/products/category-authors', { params: { slug } })
}

export const fetchAdminStoreMetrics = (appIds: number[]): Promise<ProductStoreMetricsVO[]> => {
  return instance.post('/admin/products/store-metrics', { appIds })
}

export const updateProductStoreDisplay = (
  appId: number,
  payload: { storeVisibility?: string; weight?: number; storeWeight?: number; reason?: string }
): Promise<ProductVO> => {
  return instance.post(`/admin/products/store-display/${appId}`, payload)
}

export const updateProductSampleStatus = (appId: number, isTemplate: number): Promise<ProductVO> => {
  return instance.post(`/admin/products/sample/${appId}/${isTemplate}`)
}

export const updateProductCategories = (appId: number, categoryIds: number[]): Promise<ProductVO> => {
  return instance.post(`/admin/products/category/${appId}`, { categoryIds })
}

export const removeProductCategory = (appId: number, categoryId: number): Promise<ProductVO> => {
  return instance.post(`/admin/products/category/${appId}/delete`, null, {
    params: { categoryId }
  })
}
