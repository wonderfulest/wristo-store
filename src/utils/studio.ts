import { ElMessageBox } from 'element-plus'
import { DEFAULT_LOCALE, getRouteLocaleParam } from '@/store/locale'
import { translate } from '@/i18n'

export const getStudioUrl = () => {
  return import.meta.env.VITE_WRISTO_STUDIO_URL || 'https://studio.wristo.io'
}

const getCurrentLocale = () => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const pathLocale = getRouteLocaleParam(window.location.pathname.split('/')[1])
  return pathLocale || DEFAULT_LOCALE
}

const isMobileStudioClient = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent || ''
  const mobileUserAgent = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent)
  const iPadLike = /iPad/i.test(userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(userAgent))
  const narrowTouchViewport = navigator.maxTouchPoints > 1 && window.innerWidth <= 900
  return mobileUserAgent || iPadLike || narrowTouchViewport
}

const showStudioDesktopOnlyPrompt = () => {
  const locale = getCurrentLocale()
  return ElMessageBox.alert(
    translate('studio.desktopOnly.message', locale),
    translate('studio.desktopOnly.title', locale),
    {
      confirmButtonText: translate('studio.desktopOnly.confirm', locale),
      type: 'warning',
    }
  )
}

const ensureStudioDesktopClient = () => {
  if (!isMobileStudioClient()) return true
  void showStudioDesktopOnlyPrompt()
  return false
}

export const openStudioUrl = (url: string, target: '_blank' | '_self' = '_blank') => {
  if (!ensureStudioDesktopClient()) return false
  if (target === '_self') {
    window.location.href = url
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return true
}

export const openStudio = () => {
  return openStudioUrl(getStudioUrl())
}

export const openStudioDesign = (designId: string) => {
  const normalizedDesignId = designId.trim()
  if (!normalizedDesignId) return false

  const studioUrl = new URL('/design', getStudioUrl())
  studioUrl.searchParams.set('id', normalizedDesignId)
  return openStudioUrl(studioUrl.toString())
}

export const openStudioDesignCopy = (designId: string) => {
  const normalizedDesignId = designId.trim()
  if (!normalizedDesignId) return false

  const studioUrl = new URL('/designs/copy', getStudioUrl())
  studioUrl.searchParams.set('from', normalizedDesignId)
  return openStudioUrl(studioUrl.toString())
}
