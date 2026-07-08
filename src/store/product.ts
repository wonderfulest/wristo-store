import { defineStore } from 'pinia'
import { searchProducts, getNewProducts, getSeries, 
  getHotProducts, getProductDetail, getRelatedProducts, getHotSeries, 
  searchProductsV2,
} from '@/api/product'
import type { ProductBaseVO, ProductVO, Series, PageResult } from '@/types'

const withSeriesImage = (list: Series[]) => {
  return (list || []).map((s) => ({
    ...s,
    image: s.representativeProduct?.heroFile?.url
      ?? s.representativeProduct?.garminImageUrl
      ?? s.image
      ?? s.hero?.url
      ?? s.banner?.url
      ?? null,
  }))
}

const getRepresentativeProductKey = (series: Series) => {
  const appId = series.representativeProduct?.appId
  return appId != null ? `app:${appId}` : null
}

const uniqueByRepresentativeProduct = (list: Series[]) => {
  const usedProductKeys = new Set<string>()
  const uniqueList: Series[] = []

  for (const series of list || []) {
    const productKey = getRepresentativeProductKey(series)
    if (productKey) {
      if (usedProductKeys.has(productKey)) {
        continue
      }
      usedProductKeys.add(productKey)
    }
    uniqueList.push(series)
  }

  return uniqueList
}

interface State {
  loading: boolean
  error: Error | null
  searchResults: ProductBaseVO[]
  newProducts: ProductBaseVO[]
  seriesList: Series[]
  hotProducts: ProductBaseVO[]
  hotSeries: Series[]
}

export const useProductStore = defineStore('product', {
  state: (): State => ({
    loading: false,
    error: null,
    searchResults: [],
    newProducts: [],
    seriesList: [],
    hotProducts: [],
    hotSeries: []
  }),

  actions: {
    async searchProducts(keyword: string) {
      try {
        const response: ProductBaseVO[] = await searchProducts(keyword)
        this.searchResults = response || []
        return this.searchResults
      } catch (error) {
        console.error('搜索商品失败:', error)
        return []
      }
    },

    async searchProductsV2(keyword: string, pageNum = 1, pageSize = 24): Promise<PageResult<ProductBaseVO>> {
      try {
        const response: PageResult<ProductBaseVO> = await searchProductsV2(keyword, pageNum, pageSize)
        this.searchResults = response?.list || []
        return {
          pageNum: response?.pageNum || pageNum,
          pageSize: response?.pageSize || pageSize,
          total: response?.total || 0,
          pages: response?.pages || 0,
          list: response?.list || [],
        }
      } catch (error) {
        console.error('搜索商品失败:', error)
        this.searchResults = []
        return {
          pageNum,
          pageSize,
          total: 0,
          pages: 0,
          list: [],
        }
      }
    },

    async getNewProducts(limit = 30) {
      try {
        const response: ProductBaseVO[] = await getNewProducts(limit)
        this.newProducts = response || []
        return this.newProducts
      } catch (error) {
        console.error('获取新品失败:', error)
        return []
      }
    },

    async getHotSeries(limit = 8) {
      try {
        const response: Series[] = await getHotSeries(limit * 3)
        this.hotSeries = uniqueByRepresentativeProduct(withSeriesImage(response || [])).slice(0, limit)
        return this.hotSeries
      } catch (error) {
        console.error('获取热门系列失败:', error)
        return []
      }
    },

    async getSeries() {
      try {
        const response: Series[] = await getSeries()
        this.seriesList = withSeriesImage(response || [])
        return this.seriesList
      } catch (error) {
        console.error('获取系列失败:', error)
        return []
      }
    },

    async getHotProducts(limit = 24) {
      try {
        const response: ProductBaseVO[] = await getHotProducts(limit)
        this.hotProducts = response || []
        return this.hotProducts
      } catch (error) {
        console.error('获取热门商品失败:', error)
        return []
      }
    },

    // 获取商品详情
    async getProductDetail(appId: string): Promise<ProductVO | null> {
      try {
        this.loading = true
        const response = await getProductDetail(appId)
        return response
      } catch (error) {
        this.error = error instanceof Error ? error : new Error('Unknown error')
        return null
      } finally {
        this.loading = false
      }
    },

    // 获取相关商品
    async getRelatedProducts(id: string): Promise<ProductBaseVO[]> {
      try {
        this.loading = true
        const response: ProductBaseVO[] = await getRelatedProducts(id)
        return response || []
      } catch (error) {
        this.error = error instanceof Error ? error : new Error('Unknown error')
        return []
      } finally {
        this.loading = false
      }
    },
  }
})
