import { fetchAdminStoreMetrics } from '@/api/product'
import type { ProductStoreMetricsVO } from '@/types'

const cache = new Map<number, ProductStoreMetricsVO | null>()
const pending = new Map<number, Array<(value: ProductStoreMetricsVO | null) => void>>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

const flush = async () => {
  flushTimer = null
  const entries = Array.from(pending.entries())
  pending.clear()
  const appIds = entries.map(([appId]) => appId)

  try {
    const metrics = await fetchAdminStoreMetrics(appIds)
    const metricsMap = new Map((metrics || []).map((item) => [Number(item.appId), item]))
    entries.forEach(([appId, resolvers]) => {
      const metric = metricsMap.get(appId) || null
      cache.set(appId, metric)
      resolvers.forEach((resolve) => resolve(metric))
    })
  } catch (error) {
    entries.forEach(([appId, resolvers]) => {
      cache.delete(appId)
      resolvers.forEach((resolve) => resolve(null))
    })
  }
}

export const fetchAdminStoreMetricBatched = (appId: number, options: { force?: boolean } = {}) => {
  if (!options.force && cache.has(appId)) {
    return Promise.resolve(cache.get(appId) || null)
  }

  if (options.force) {
    cache.delete(appId)
  }

  return new Promise<ProductStoreMetricsVO | null>((resolve) => {
    const resolvers = pending.get(appId) || []
    resolvers.push(resolve)
    pending.set(appId, resolvers)

    if (!flushTimer) {
      flushTimer = setTimeout(flush, 0)
    }
  })
}

export const invalidateAdminStoreMetric = (appId: number) => {
  cache.delete(appId)
}
