import { defineStore } from 'pinia'
import { searchProducts, getNewProducts, getSeries, 
  getHotProducts, getProductDetail, getRelatedProducts, getHotSeries, 
  searchProductsV2,
} from '@/api/product'
import type { ProductBaseVO, ProductVO, Series, PageResult } from '@/types'

const withSeriesImage = (list: Series[]) => {
  return (list || []).map((s) => ({
    ...s,
    image: s.image ?? s.hero?.url ?? s.banner?.url ?? null,
  }))
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

    async getNewProducts() {
      try {
        const response: ProductBaseVO[] = await getNewProducts()
        this.newProducts = response || []
        return this.newProducts
      } catch (error) {
        console.error('获取新品失败:', error)
        return []
      }
    },

    async getHotSeries() {
      try {
        const response: Series[] = await getHotSeries()
        this.hotSeries = withSeriesImage(response || [])
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

    async getHotProducts() {
      try {
        const response: ProductBaseVO[] = await getHotProducts()
        this.hotProducts = response || []
        return this.hotProducts
      } catch (error) {
        console.error('获取热门商品失败:', error)
        return []
      }
    },

    // 获取商品详情
    async getProductDetail(appId: string): Promise<ProductBaseVO> {
      try {
        this.loading = true
        const response = await getProductDetail(appId)
        return response
      } catch (error) {
        this.error = error instanceof Error ? error : new Error('Unknown error')
        return {} as ProductVO
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