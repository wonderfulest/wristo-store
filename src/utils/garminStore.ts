import type { LocationQueryRaw } from 'vue-router'

const GARMIN_HOST_PATTERN = /(^|\.)garmin\.com$/i

export interface GarminStoreBridgeParams {
  url: string
  name?: string | null
  imageUrl?: string | null
  sourcePath?: string | null
}

export function isAllowedGarminStoreUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && GARMIN_HOST_PATTERN.test(url.hostname)
  } catch {
    return false
  }
}

export function toGarminStoreBridge(params: GarminStoreBridgeParams) {
  const query: LocationQueryRaw = {
    url: params.url,
  }

  if (params.name) query.name = params.name
  if (params.imageUrl) query.image = params.imageUrl
  if (params.sourcePath) query.from = params.sourcePath

  return {
    name: 'GarminStoreBridge',
    query,
  }
}
