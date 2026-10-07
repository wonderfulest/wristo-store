interface LocalizedProduct {
  name?: string
  description?: string
  names?: Record<string, string> | null
  descriptions?: Record<string, string> | null
}

// Publishing uses pt while storefront routes use pt-br. Preserve other language
// distinctions (including traditional Chinese) instead of guessing a translation.
export function localizeProduct<T extends LocalizedProduct>(product: T, locale: string): T {
  const language = locale.toLowerCase() === 'pt-br' ? 'pt' : locale
  const read = (translations: Record<string, string> | null | undefined, fallback: string | undefined) => {
    if (language.toLowerCase() === 'en') return fallback
    const key = Object.keys(translations || {}).find(key => key.toLowerCase() === language.toLowerCase())
    return (key && translations?.[key]?.trim()) || fallback
  }
  return {
    ...product,
    name: read(product.names, product.name),
    description: read(product.descriptions, product.description),
  }
}
