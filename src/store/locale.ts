import { defineStore } from 'pinia'

export const SUPPORTED_LOCALES = ['de', 'en', 'es', 'fr', 'it', 'zh'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export function normalizeLocale(value: unknown): SupportedLocale {
  const locale = String(value || '').toLowerCase()
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE
}

export function getRouteLocaleParam(value: unknown): SupportedLocale | null {
  const locale = String(value || '').toLowerCase()
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale) ? (locale as SupportedLocale) : null
}

export function stripLocaleFromPath(path: string): string {
  const pattern = `^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`
  const stripped = path.replace(new RegExp(pattern), '')
  return stripped || '/'
}

export function addLocaleToPath(path: string, locale: SupportedLocale): string {
  const normalizedPath = stripLocaleFromPath(path)
  return normalizedPath === '/'
    ? `/${locale}`
    : `/${locale}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`
}

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    currentLocale: DEFAULT_LOCALE as SupportedLocale,
  }),
  actions: {
    setLocale(locale: string) {
      this.currentLocale = normalizeLocale(locale)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.currentLocale
      }
    },
    syncDocumentLang() {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.currentLocale
      }
    },
  },
  persist: {
    key: 'wristo-locale',
    storage: localStorage,
  },
})
