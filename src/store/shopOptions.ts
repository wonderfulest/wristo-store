import { defineStore } from 'pinia'
import type { PurchaseData, Bundle, ApiResponse, ProductVO } from '@/types'

export const useShopOptionsStore = defineStore('shopOptions', {
  state: () => ({
    data: null as PurchaseData | null,
    selectedProduct: null as Bundle | ProductVO | null,
    order: null as ApiResponse<any>['data'] | null
  }),
  actions: {
    setData(data: PurchaseData) {
      this.data = data
    },
    setSelectedProduct(product: Bundle | ProductVO) {
      this.selectedProduct = product
    },
    setOrder(order: ApiResponse<any>['data']) {
      this.order = order
    },
    reset() {
      this.data = null
      this.selectedProduct = null
      this.order = null
    }
  },
  persist: true
})
