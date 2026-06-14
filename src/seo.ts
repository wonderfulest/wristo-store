import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { BlogPostVO, BlogPostTranslationVO, ProductVO } from '@/types'
import { blogUrlToFaqUrl, buildFaqGuidePath } from '@/content/faq-guides'
import { DEFAULT_LOCALE, getRouteLocaleParam, stripLocaleFromPath } from '@/store/locale'
import { translate } from '@/i18n'
import { getProductImageUrl } from '@/utils/productImage'

export const SITE_NAME = 'Wristo'
export const DEFAULT_SITE_URL = 'https://wristo.io'
export const DEFAULT_DESCRIPTION =
  'Discover premium Garmin watch faces, bundles, and setup guides from Wristo.'
export const BRAND_LOGO_URL = 'https://cdn.wristo.io/brands/wristo-logo/png/wristo-og-cover-1200x630.png'
export const DEFAULT_IMAGE = BRAND_LOGO_URL

export type JsonLdObject = Record<string, unknown>

export interface SeoConfig {
  title: string
  description: string
  path?: string
  image?: string | null
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  alternates?: Array<{ lang: string; href: string }>
  jsonLd?: JsonLdObject[]
}

const staticSeoByPath: Record<string, SeoConfig> = {
  '/': {
    title: 'Wristo | Garmin Watch Faces and Connect IQ Apps',
    description:
      'Browse Garmin watch faces, bundles, categories, and setup guides built for Connect IQ devices.',
  },
  '/search': {
    title: 'Search Garmin Watch Faces | Wristo',
    description: 'Search Wristo Garmin watch faces and Connect IQ apps by keyword.',
  },
  '/brands': {
    title: 'Creators and Brands | Wristo',
    description: 'Explore Garmin watch face creators and brand collections on Wristo.',
  },
  '/premium': {
    title: 'Premium Garmin Watch Face Access | Wristo',
    description: 'Unlock Wristo premium watch face access and bundle purchase options.',
  },
  '/purchase-options': {
    title: 'Purchase Options | Wristo',
    description: 'Compare Wristo purchase options for Garmin watch faces and bundles.',
  },
  '/faq': {
    title: 'Garmin Watch Face FAQ and Guides | Wristo',
    description: 'Read Wristo FAQ guides about Garmin devices, watch faces, health metrics, activation, and Connect IQ setup.',
    type: 'article',
  },
  '/faq/support': {
    title: 'Garmin Watch Face Help and Support FAQ | Wristo',
    description: 'Find answers about installing, activating, uninstalling, and using Wristo Garmin watch faces.',
  },
  '/faq/checkout': {
    title: 'Activation and Checkout Help | Wristo',
    description: 'Learn how to activate trials and complete checkout for Wristo Garmin watch faces.',
  },
  '/contact': {
    title: 'Contact Wristo',
    description: 'Contact Wristo for Garmin watch face support, creator questions, and business inquiries.',
  },
  '/terms-and-conditions': {
    title: 'Terms and Conditions | Wristo',
    description: 'Read the Wristo terms and conditions for using the store and purchasing watch faces.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Wristo',
    description: 'Read how Wristo handles privacy, account data, purchases, and email preferences.',
  },
  '/newsletter': {
    title: 'Wristo Newsletter',
    description: 'Subscribe to Wristo updates about Garmin watch faces, releases, and guides.',
  },
  '/top': {
    title: 'Top Garmin Watch Faces | Wristo',
    description: 'Explore popular Garmin watch faces and Connect IQ apps on Wristo.',
  },
  '/creators': {
    title: 'Garmin Watch Face Creators | Wristo',
    description: 'Learn about Wristo creators and publishing Garmin watch faces.',
  },
  '/studio/membership': {
    title: 'Studio Membership | Wristo',
    description: 'Choose a Wristo Studio membership plan and pay securely on wristo.io.',
    noindex: true,
  },
  '/bundle-products': {
    title: 'Garmin Watch Face Bundles | Wristo',
    description: 'Browse Wristo bundles for Garmin watch faces and Connect IQ apps.',
  },
  '/template-editor': {
    title: 'Garmin Watch Face Template Editor | Wristo',
    description: 'Create and preview Garmin watch face templates with Wristo tools.',
  },
}

const noindexPrefixes = [
  '/auth',
  '/checkout',
  '/checkout-subscription',
  '/payment',
  '/auto-unlock',
  '/subscription-management',
  '/subscription-cancel',
  '/already-purchased',
  '/purchases-history',
  '/user',
  '/email',
  '/preferences',
  '/unsubscribe',
  '/code',
  '/unlock',
  '/studio/membership',
]

export function siteUrl(): string {
  const envUrl = import.meta.env.VITE_WRISTO_SITE_URL as string | undefined
  if (envUrl) return trimTrailingSlash(envUrl)
  if (typeof window !== 'undefined' && window.location.origin) return window.location.origin
  return DEFAULT_SITE_URL
}

export function absoluteUrl(pathOrUrl = '/'): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${siteUrl()}${path}`
}

export function getRouteSeo(route: RouteLocationNormalizedLoaded): SeoConfig {
  const path = route.path
  const canonicalMatchPath = stripLocaleFromPath(path)
  const matchedStatic = staticSeoByPath[canonicalMatchPath]
  if (matchedStatic) return localizeStaticSeo(canonicalMatchPath, matchedStatic, route)

  if (canonicalMatchPath.startsWith('/categories/')) {
    const pathParts = canonicalMatchPath.split('/').filter(Boolean)
    const slug = readableSlug(pathParts[pathParts.length - 1] || 'garmin-watch-faces')
    return {
      title: `${slug} Garmin Watch Faces | Wristo`,
      description: `Browse ${slug} Garmin watch faces and compatible Connect IQ apps on Wristo.`,
      path,
    }
  }

  if (canonicalMatchPath.startsWith('/brands/')) {
    return {
      title: 'Garmin Watch Face Creator | Wristo',
      description: 'Browse this creator profile and Garmin watch face collection on Wristo.',
      path,
    }
  }

  if (canonicalMatchPath.startsWith('/product/')) {
    return {
      title: 'Garmin Watch Face | Wristo',
      description: 'View Garmin watch face details, supported devices, and installation options on Wristo.',
      path,
      type: 'product',
    }
  }

  if (canonicalMatchPath.startsWith('/bundle/')) {
    return {
      title: 'Garmin Watch Face Bundle | Wristo',
      description: 'View Wristo bundle details and included Garmin watch faces.',
      path,
      type: 'product',
    }
  }

  if (canonicalMatchPath.includes('/faq')) {
    return {
      title: 'Garmin Watch Face FAQ Guide | Wristo',
      description: 'Read Wristo guides about Garmin devices, watch faces, and Connect IQ setup.',
      path,
      type: 'article',
    }
  }

  return {
    title: `${SITE_NAME} Store`,
    description: DEFAULT_DESCRIPTION,
    path,
    noindex: path !== '/',
  }
}

export function isNoindexPath(path: string): boolean {
  const normalizedPath = stripLocaleFromPath(path)
  return noindexPrefixes.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))
}

export function applySeo(config: SeoConfig): void {
  if (typeof document === 'undefined') return

  const url = absoluteUrl(config.path || window.location.pathname)
  const image = absoluteUrl(config.image || DEFAULT_IMAGE)
  const title = config.title || SITE_NAME
  const description = config.description || DEFAULT_DESCRIPTION
  const shouldNoindex = config.noindex || isNoindexPath(new URL(url).pathname)

  document.title = title
  setMeta('description', description)
  setMeta('robots', shouldNoindex ? 'noindex, nofollow' : 'index, follow')
  setLink('canonical', url)

  setMetaProperty('og:site_name', SITE_NAME)
  setMetaProperty('og:title', title)
  setMetaProperty('og:description', description)
  setMetaProperty('og:url', url)
  setMetaProperty('og:type', config.type === 'article' ? 'article' : 'website')
  setMetaProperty('og:image', image)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)
  setMeta('twitter:image', image)

  clearAlternateLinks()
  for (const alternate of config.alternates || []) {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.href = absoluteUrl(alternate.href)
    link.hreflang = alternate.lang
    link.dataset.seoAlternate = 'true'
    document.head.appendChild(link)
  }

  setJsonLd([
    organizationSchema(),
    websiteSchema(),
    ...(config.jsonLd || []),
  ])
}

export function productSeo(product: ProductVO, path: string): SeoConfig {
  const image = getProductImageUrl(product)
  const description = stripHtml(product.description) ||
    `${product.name} is a Garmin Connect IQ watch face from Wristo with supported-device installation guidance.`

  return {
    title: `${product.name} Garmin Watch Face | Wristo`,
    description: truncate(description, 155),
    path,
    image,
    type: 'product',
    jsonLd: [productSchema(product, path)],
  }
}

export function blogSeo(post: BlogPostVO, translation: BlogPostTranslationVO, path: string): SeoConfig {
  const alternates = (post.translations || []).map((t) => ({
    lang: t.lang,
    href: blogUrlToFaqUrl(t.url) || buildFaqGuidePath(t.lang, t.slug),
  }))
  return {
    title: `${translation.title} | Wristo FAQ`,
    description: truncate(translation.summary || stripHtml(translation.contentHtml), 155),
    path,
    image: post.coverImageUrl,
    type: 'article',
    alternates: [
      ...alternates,
      ...(alternates.length ? [{ lang: 'x-default', href: alternates[0].href }] : []),
    ],
    jsonLd: [articleSchema(post, translation, path)],
  }
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: stripHtml(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(item.answer),
      },
    })),
  }
}

function productSchema(product: ProductVO, path: string): JsonLdObject {
  const price = typeof product.price === 'number' ? product.price.toFixed(2) : undefined
  const image = getProductImageUrl(product)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description) || `Garmin Connect IQ watch face: ${product.name}`,
    image: image ? [absoluteUrl(image)] : [],
    sku: String(product.appId),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: 'Garmin Connect IQ Watch Face',
    url: absoluteUrl(path),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(path),
    },
    additionalProperty: (product.devices || []).slice(0, 50).map((device) => ({
      '@type': 'PropertyValue',
      name: 'Compatible device',
      value: device.displayName,
    })),
  }
}

function articleSchema(post: BlogPostVO, translation: BlogPostTranslationVO, path: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: translation.title,
    description: translation.summary || stripHtml(translation.contentHtml),
    image: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author?.nickname || post.author?.username || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: BRAND_LOGO_URL,
      },
    },
    mainEntityOfPage: absoluteUrl(path),
  }
}

function organizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl(),
    logo: BRAND_LOGO_URL,
    sameAs: [
      'https://www.facebook.com/wristo',
      'https://www.instagram.com/wristo',
      'https://www.pinterest.com/wristo',
      'https://www.youtube.com/@wristo',
    ],
  }
}

function websiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl()}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

function setMeta(name: string, content: string): void {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.name = name
    document.head.appendChild(element)
  }
  element.content = content
}

function setMetaProperty(property: string, content: string): void {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.content = content
}

function setLink(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

function setJsonLd(schemas: JsonLdObject[]): void {
  document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((element) => element.remove())
  for (const schema of schemas) {
    const element = document.createElement('script')
    element.type = 'application/ld+json'
    element.dataset.seoJsonld = 'true'
    element.textContent = JSON.stringify(removeUndefined(schema))
    document.head.appendChild(element)
  }
}

function clearAlternateLinks(): void {
  document.querySelectorAll('link[data-seo-alternate="true"]').forEach((element) => element.remove())
}

function stripHtml(value = ''): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trim()}...`
}

function getRouteLocale(route: RouteLocationNormalizedLoaded) {
  const raw = Array.isArray(route.params.lang) ? route.params.lang[0] : route.params.lang
  return getRouteLocaleParam(raw) || DEFAULT_LOCALE
}

function localizeStaticSeo(
  canonicalPath: string,
  seo: SeoConfig,
  route: RouteLocationNormalizedLoaded,
): SeoConfig {
  if (canonicalPath !== '/purchase-options') return { ...seo, path: route.path }

  const locale = getRouteLocale(route)
  return {
    ...seo,
    title: translate('purchase.seoTitle', locale),
    description: translate('purchase.seoDesc', locale),
    path: route.path,
  }
}

function readableSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function removeUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeUndefined).filter((item) => item !== undefined)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== '')
      .map(([key, entryValue]) => [key, removeUndefined(entryValue)]),
  )
}
