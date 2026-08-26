import { defineStore } from 'pinia'
import type { ProductBaseVO, ProductVO } from '@/types/product'
import {
  addProductFavorite,
  getProductFavorites,
  mergeProductFavorites,
  removeProductFavorite,
} from '@/api/product-favorites'
import {
  mergeFavoriteRecords,
  toProductFavoriteRecord,
  type ProductFavoriteRecord,
} from '@/utils/productFavorites'
import { resolveFavoriteReminderThreshold, type FavoriteReminderThreshold } from '@/utils/favoriteReminder'

const LOCAL_KEY = 'wristo-product-favorites'
const SESSION_KEY = 'wristo-favorite-reminder-thresholds'

const readJson = <T>(storage: Storage | undefined, key: string, fallback: T): T => {
  if (!storage) return fallback
  try {
    const value = storage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

const browserStorage = (kind: 'local' | 'session') => {
  if (typeof window === 'undefined') return undefined
  return kind === 'local' ? window.localStorage : window.sessionStorage
}

export const useProductFavoriteStore = defineStore('productFavorites', {
  state: () => ({
    items: readJson<ProductFavoriteRecord[]>(browserStorage('local'), LOCAL_KEY, []),
    consumedThresholds: readJson<FavoriteReminderThreshold[]>(browserStorage('session'), SESSION_KEY, []),
    pendingThreshold: null as FavoriteReminderThreshold | null,
    syncing: false,
  }),
  getters: {
    count: (state) => state.items.length,
    hasFavorite: (state) => (appId?: number | string | null) =>
      appId != null && state.items.some((item) => item.appId === Number(appId)),
  },
  actions: {
    persistLocal() {
      browserStorage('local')?.setItem(LOCAL_KEY, JSON.stringify(this.items))
    },
    loadGuest() {
      this.items = readJson<ProductFavoriteRecord[]>(browserStorage('local'), LOCAL_KEY, [])
    },
    consumeThreshold(threshold: FavoriteReminderThreshold) {
      if (!this.consumedThresholds.includes(threshold)) this.consumedThresholds.push(threshold)
      browserStorage('session')?.setItem(SESSION_KEY, JSON.stringify(this.consumedThresholds))
      this.pendingThreshold = null
    },
    async toggle(product: ProductBaseVO | ProductVO, authenticated: boolean) {
      const previous = [...this.items]
      const previousCount = previous.length
      const appId = Number(product.appId)
      const removing = this.hasFavorite(appId)
      this.items = removing
        ? this.items.filter((item) => item.appId !== appId)
        : mergeFavoriteRecords(this.items, [toProductFavoriteRecord(product)])
      if (!authenticated) this.persistLocal()
      try {
        if (authenticated) {
          if (removing) await removeProductFavorite(appId)
          else await addProductFavorite(appId)
        }
      } catch (error) {
        this.items = previous
        if (!authenticated) this.persistLocal()
        throw error
      }
      this.pendingThreshold = resolveFavoriteReminderThreshold(
        previousCount,
        this.items.length,
        this.consumedThresholds,
      )
    },
    async syncAuthenticated() {
      this.syncing = true
      try {
        const local = readJson<ProductFavoriteRecord[]>(browserStorage('local'), LOCAL_KEY, [])
        const remote = await getProductFavorites()
        const merged = local.length
          ? await mergeProductFavorites(local.map((item) => item.appId))
          : remote
        this.items = mergeFavoriteRecords(local, merged)
        browserStorage('local')?.removeItem(LOCAL_KEY)
      } finally {
        this.syncing = false
      }
    },
  },
})
