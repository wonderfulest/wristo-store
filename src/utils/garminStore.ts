import type { LocationQueryRaw } from 'vue-router'

const GARMIN_HOST_PATTERN = /(^|\.)garmin\.com$/i
const MOBILE_USER_AGENT_PATTERN = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i

export const GARMIN_INSTALL_REQUEST_EVENT = 'wristo:garmin-install-request'

export interface GarminStoreEnvironment {
  viewportWidth: number
  maxTouchPoints: number
  userAgent: string
}

export interface GarminStoreBridgeParams {
  url: string
  name?: string | null
  imageUrl?: string | null
  sourcePath?: string | null
}

export function resolveGarminStoreOpenMode(environment: GarminStoreEnvironment) {
  const mobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(environment.userAgent)
  const narrowViewport = environment.viewportWidth <= 767
  const touchViewport = environment.maxTouchPoints > 1 && environment.viewportWidth <= 900
  return mobileUserAgent || narrowViewport || touchViewport ? 'confirm' : 'bridge'
}

export function getCurrentGarminStoreOpenMode() {
  return resolveGarminStoreOpenMode({
    viewportWidth: window.innerWidth,
    maxTouchPoints: navigator.maxTouchPoints,
    userAgent: navigator.userAgent,
  })
}

export function requestGarminInstall(params: GarminStoreBridgeParams) {
  window.dispatchEvent(new CustomEvent<GarminStoreBridgeParams>(GARMIN_INSTALL_REQUEST_EVENT, {
    detail: params,
  }))
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
