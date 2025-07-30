import { defineStore } from 'pinia'
import type { PurchaseData, Bundle, ApiResponse, ProductVO } from '@/types'
import type { SubscriptionPlan } from '@/api/subscription'

export const useShopOptionsStore = defineStore('shopOptions', {
  state: () => ({
    data: null as PurchaseData | null,
    selectedProduct: null as Bundle | ProductVO | null,
    selectedSubscription: null as SubscriptionPlan | null,
    order: null as ApiResponse<any>['data'] | null
  }),
  actions: {
    setData(data: PurchaseData) {
      this.data = data
    },
    setSelectedProduct(product: Bundle | ProductVO) {
      this.selectedProduct = product
      this.selectedSubscription = null
    },
    setSelectedSubscription(subscription: SubscriptionPlan) {
      this.selectedSubscription = subscription
      this.selectedProduct = null
    },
    setOrder(order: ApiResponse<any>['data']) {
      this.order = order
    },
    reset() {
      this.data = null
      this.selectedProduct = null
      this.selectedSubscription = null
      this.order = null
    }
  },
  persist: true
})
