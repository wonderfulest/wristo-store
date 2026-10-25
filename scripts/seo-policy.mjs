/** Keep indexable product pages in the budget before multiplying locales. */
export function selectPrerenderRoutes(staticRoutes, localizedRoutes, discoveredRoutes, limit) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('MAX_PRERENDER_ROUTES must be a positive integer')
  const products = discoveredRoutes.filter(route => route.startsWith('/app/'))
  const editorial = discoveredRoutes.filter(route => !route.startsWith('/app/'))
  const purchase = localizedRoutes.filter(route => route.endsWith('/purchase-options'))
  return [...new Set([
    ...staticRoutes,
    ...purchase,
    ...products.slice(0, 20),
    ...editorial.slice(0, 20),
    ...localizedRoutes,
    ...editorial,
    ...products.slice(20),
  ])].slice(0, limit)
}
export function canonicalOrigin(value = 'https://www.wristo.io') {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid Store origin')
  if (['wristo.io', 'www.wristo.io', 'localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return 'https://www.wristo.io'
  return url.origin
}
export function assertRenderedPage(route, html, origin) {
  if (origin) {
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]
    if (!canonical || new URL(canonical).origin !== origin) {
      throw new Error(`Canonical origin does not match the published site: ${route}`)
    }
    // FAQ entry aliases intentionally canonicalize to their translated article URL.
    const isSupport = /^\/(?:[a-z-]+\/)?support(?:\/|$)/.test(route)
    if (!isSupport && canonical !== `${origin}${route}`) {
      throw new Error(`Canonical does not match the published URL: ${route}`)
    }
  }
  if (!/<(?:main|article)[\s>]/i.test(html) || !/<h[12][^>]*>[\s\S]*?[^\s<>][\s\S]*?<\/h[12]>/i.test(html)) {
    throw new Error(`Refusing empty or incomplete prerender: ${route}`)
  }
  if (/name="robots"[^>]*content="[^"]*noindex/i.test(html)) {
    throw new Error(`Refusing noindex prerender: ${route}`)
  }
}

export function publicCategoryRoutes(categories, definitions) {
  const canonicalSlugs = new Set(definitions.map(definition => definition.slug))
  return categories
    .filter(category => Number(category.isActive ?? 1) === 1 && canonicalSlugs.has(category.slug))
    .map(category => `/categories/${encodeURIComponent(category.slug)}`)
}
