import { defineStore } from 'pinia'
import type { PurchaseData, ShopProduct, Response } from '@/types'

export const useShopOptionsStore = defineStore('shopOptions', {
  state: () => ({
    data: null as PurchaseData | null,
    selectedProduct: null as ShopProduct | null,
    order: null as Response<any>['data'] | null
  }),
  actions: {
    setData(data: PurchaseData) {
      this.data = data
    },
    setSelectedProduct(product: ShopProduct) {
      this.selectedProduct = product
    },
    setOrder(order: Response<any>['data']) {
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
