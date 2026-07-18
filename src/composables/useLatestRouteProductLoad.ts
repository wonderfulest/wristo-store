import { ref } from 'vue'

export interface LatestRouteProductBase {
  appId: number
}

export interface LatestProductLoadGuard {
  appId: number
  isCurrent: () => boolean
  commit: (action: () => void) => boolean
}

export interface LatestRouteProductLoadContext<T> extends LatestProductLoadGuard {
  routeId: string
  generation: number
  product: T
}

interface LatestRouteProductLoadDependencies<T extends LatestRouteProductBase> {
  resetState: () => void
  fetchProduct: (routeId: string) => Promise<T | null>
  commitProduct: (product: T) => void
  getCurrentAppId: () => number | null | undefined
  loadDownstream: (context: LatestRouteProductLoadContext<T>) => Promise<void>
  handleMissing: (routeId: string) => Promise<unknown> | unknown
  logWarning: (message: string, error: unknown) => void
}

type RouteProductId = string | string[] | null | undefined

const normalizeRouteProductId = (routeId: RouteProductId) => {
  const value = Array.isArray(routeId) ? routeId[0] : routeId
  return typeof value === 'string' ? value.trim() : ''
}

export const useLatestRouteProductLoad = <T extends LatestRouteProductBase>(
  dependencies: LatestRouteProductLoadDependencies<T>,
) => {
  const productDetailLoading = ref(false)
  let activeGeneration = 0
  let activeRouteId = ''

  const isActiveRouteLoad = (generation: number, routeId: string) => {
    return generation === activeGeneration && routeId === activeRouteId
  }

  const createGuard = (
    appId: number,
    generation: number,
    routeId: string,
  ): LatestProductLoadGuard => {
    const isCurrent = () => {
      return (
        isActiveRouteLoad(generation, routeId) &&
        Number(dependencies.getCurrentAppId()) === appId
      )
    }

    return {
      appId,
      isCurrent,
      commit: (action) => {
        if (!isCurrent()) return false
        action()
        return true
      },
    }
  }

  const captureCurrentProductGuard = (appId: number): LatestProductLoadGuard => {
    return createGuard(appId, activeGeneration, activeRouteId)
  }

  const loadRouteProduct = async (rawRouteId: RouteProductId) => {
    const routeId = normalizeRouteProductId(rawRouteId)
    const generation = ++activeGeneration
    activeRouteId = routeId
    dependencies.resetState()
    productDetailLoading.value = true

    try {
      if (!routeId) {
        return
      }

      const product = await dependencies.fetchProduct(routeId)
      if (!isActiveRouteLoad(generation, routeId)) return
      if (!product?.appId) {
        await dependencies.handleMissing(routeId)
        return
      }

      dependencies.commitProduct(product)
      const guard = createGuard(Number(product.appId), generation, routeId)
      const context: LatestRouteProductLoadContext<T> = {
        ...guard,
        routeId,
        generation,
        product,
      }
      await dependencies.loadDownstream(context)
    } catch (error) {
      if (isActiveRouteLoad(generation, routeId)) {
        dependencies.logWarning('Failed to load product detail:', error)
      }
    } finally {
      if (isActiveRouteLoad(generation, routeId)) {
        productDetailLoading.value = false
      }
    }
  }

  return {
    productDetailLoading,
    loadRouteProduct,
    captureCurrentProductGuard,
  }
}
