interface LocalizedProduct {
  appLanguage?: string | null
  name?: string
  description?: string
  names?: Record<string, string> | null
  descriptions?: Record<string, string> | null
}

// Match Garmin uploads: English by default, Chinese only for Chinese faces.
export function localizeProduct<T extends LocalizedProduct>(product: T, locale: string): T {
  const showChinese = locale.toLowerCase() === 'zh' &&
    (product.appLanguage === 'zhs' || product.appLanguage === 'zh')
  const read = (translations: Record<string, string> | null | undefined, fallback: string | undefined) => {
    if (!showChinese) return fallback
    const key = Object.keys(translations || {}).find(key => key.toLowerCase() === 'zh')
    return (key && translations?.[key]?.trim()) || fallback
  }
  return {
    ...product,
    name: read(product.names, product.name),
    description: read(product.descriptions, product.description),
  }
}
