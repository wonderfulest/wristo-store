import { defineStore } from 'pinia'
import type { ProductBaseVO, ProductVO } from '@/types/product'
import { getProductImageUrl } from '@/utils/productImage'

export interface CartItem {
  appId: number
  name: string
  price: number
  imageUrl: string
  garminStoreUrl?: string
  designId?: string
  quantity: number
  addedAt: string
}

type CartProduct = ProductBaseVO | ProductVO

interface State {
  items: CartItem[]
}

const toCartItem = (product: CartProduct): CartItem => ({
  appId: product.appId,
  name: product.name,
  price: product.price ?? 0,
  imageUrl: getProductImageUrl(product),
  garminStoreUrl: product.garminStoreUrl,
  designId: product.designId,
  quantity: 1,
  addedAt: new Date().toISOString(),
})

export const useCartStore = defineStore('cart', {
  state: (): State => ({
    items: [],
  }),

  getters: {
    count: (state) => state.items.length,
    totalPrice: (state) => state.items.reduce((total, item) => total + item.price, 0),
    hasItem: (state) => (appId?: number | string | null) => {
      if (appId === undefined || appId === null) return false
      return state.items.some((item) => item.appId === Number(appId))
    },
  },

  actions: {
    add(product: CartProduct) {
      if (!product?.appId) return
      const existing = this.items.find((item) => item.appId === Number(product.appId))
      if (existing) {
        const latest = toCartItem(product)
        existing.name = latest.name
        existing.price = latest.price
        existing.imageUrl = latest.imageUrl
        existing.garminStoreUrl = latest.garminStoreUrl
        existing.designId = latest.designId
        existing.quantity = 1
        existing.addedAt = new Date().toISOString()
        return
      }
      this.items.unshift(toCartItem(product))
    },

    remove(appId: number | string) {
      this.items = this.items.filter((item) => item.appId !== Number(appId))
    },

    setQuantity(appId: number | string, _quantity: number) {
      const item = this.items.find((entry) => entry.appId === Number(appId))
      if (!item) return
      item.quantity = 1
    },

    updateItem(product: CartProduct) {
      if (!product?.appId) return
      const item = this.items.find((entry) => entry.appId === Number(product.appId))
      if (!item) return
      const latest = toCartItem(product)
      item.name = latest.name
      item.price = latest.price
      item.imageUrl = latest.imageUrl
      item.garminStoreUrl = latest.garminStoreUrl
      item.designId = latest.designId
      item.quantity = 1
    },

    toggle(product: CartProduct) {
      if (!product?.appId) return
      if (this.hasItem(product.appId)) {
        this.remove(product.appId)
        return
      }
      this.add(product)
    },

    clear() {
      this.items = []
    },
  },

  persist: {
    key: 'wristo-cart',
  },
})
