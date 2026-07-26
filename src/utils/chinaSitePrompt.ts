export const CHINA_SITE_PROMPT_STORAGE_KEY = 'wristo:cn-site-prompt:dismissed-at:v1'

const CHINA_SITE_PROMPT_TTL_MS = 30 * 24 * 60 * 60 * 1000
const REGION_ENDPOINT = '/_wristo/visitor-region'
const CHINA_SITE_APPS_URL = 'https://www.wristo.cn/apps'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface RegionPayload {
  countryCode: string | null
  mainlandChina: boolean
}

interface PromptPolicyOptions {
  fetcher?: typeof fetch
  storage?: StorageLike | null
  now?: () => number
  timeoutMs?: number
}

const isDismissed = (storage: StorageLike | null | undefined, now: number) => {
  if (!storage) return false
  try {
    const dismissedAt = Number(storage.getItem(CHINA_SITE_PROMPT_STORAGE_KEY))
    return Number.isFinite(dismissedAt)
      && dismissedAt > 0
      && now - dismissedAt < CHINA_SITE_PROMPT_TTL_MS
  } catch {
    return false
  }
}

const loadRegion = async (fetcher: typeof fetch, timeoutMs: number): Promise<RegionPayload | null> => {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(REGION_ENDPOINT, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      return null
    }
    const payload = await response.json() as Partial<RegionPayload>
    if (typeof payload.mainlandChina !== 'boolean') return null
    if (payload.countryCode !== null && typeof payload.countryCode !== 'string') return null
    return {
      countryCode: payload.countryCode?.toUpperCase() || null,
      mainlandChina: payload.mainlandChina,
    }
  } catch {
    return null
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export async function shouldShowChinaSitePrompt({
  fetcher = fetch,
  storage = null,
  now = Date.now,
  timeoutMs = 3000,
}: PromptPolicyOptions = {}) {
  if (isDismissed(storage, now())) return false
  const region = await loadRegion(fetcher, timeoutMs)
  return region?.countryCode === 'CN' && region.mainlandChina === true
}

export function dismissChinaSitePrompt(
  storage: StorageLike | null | undefined,
  dismissedAt = Date.now(),
) {
  if (!storage) return
  try {
    storage.setItem(CHINA_SITE_PROMPT_STORAGE_KEY, String(dismissedAt))
  } catch {
    // The prompt still closes for this page when browser storage is unavailable.
  }
}

export function getChinaSiteDestination(pathname: string) {
  const productMatch = pathname.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?product\/(\d+)\/?$/i)
  const appId = productMatch?.[1]
  return appId
    ? `${CHINA_SITE_APPS_URL}/${encodeURIComponent(appId)}`
    : CHINA_SITE_APPS_URL
}
