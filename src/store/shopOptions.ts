import { defineStore } from 'pinia'
import type { PurchaseData, ShopProduct, BaseResponse } from '@/types'

export const useShopOptionsStore = defineStore('shopOptions', {
  state: () => ({
    data: null as PurchaseData | null,
    selectedProduct: null as ShopProduct | null,
    order: null as BaseResponse['data'] | null
  }),
  actions: {
    setData(data: PurchaseData) {
      this.data = data
    },
    setSelectedProduct(product: ShopProduct) {
      this.selectedProduct = product
    },
    setOrder(order: BaseResponse['data']) {
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
