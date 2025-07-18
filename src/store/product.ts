import { defineStore } from 'pinia'
import { searchProducts, getNewProducts, getSeries, 
  getHotProducts, getProductDetail, getRelatedProducts, getHotSeries, 
} from '@/api/product'
import type { ApiResponse, ProductBaseVO, ProductVO, Series } from '@/types'

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
        const response: ApiResponse<ProductBaseVO[]> = await searchProducts(keyword)
        if (response.code === 0) {
          this.searchResults = response.data || []
        }
        return this.searchResults
      } catch (error) {
        console.error('搜索商品失败:', error)
        return []
      }
    },

    async getNewProducts() {
      try {
        const response: ApiResponse<ProductBaseVO[]> = await getNewProducts()
        if (response.code === 0) {
          this.newProducts = response.data || []
        }
        return this.newProducts
      } catch (error) {
        console.error('获取新品失败:', error)
        return []
      }
    },

    async getHotSeries() {
      try {
        const response = await getHotSeries()
        if (response.code === 0) {
          this.hotSeries = response.data || []
        }
        return this.hotSeries
      } catch (error) {
        console.error('获取热门系列失败:', error)
        return []
      }
    },

    async getSeries() {
      try {
        const response = await getSeries()
        if (response.code === 0) {
          this.seriesList = response.data || []
        }
        return this.seriesList
      } catch (error) {
        console.error('获取系列失败:', error)
        return []
      }
    },

    async getHotProducts() {
      try {
        const response: ApiResponse<ProductBaseVO[]> = await getHotProducts()
        if (response.code === 0) {
          this.hotProducts = response.data || []
        }
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
        return response.data as ProductVO
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
        const response: ApiResponse<ProductBaseVO[]> = await getRelatedProducts(id)
        return response.data || []
      } catch (error) {
        this.error = error instanceof Error ? error : new Error('Unknown error')
        return []
      } finally {
        this.loading = false
      }
    },
  }
}) 