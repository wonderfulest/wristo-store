import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadEnv } from 'vite'

const rootDir = process.cwd()
const workspaceEnvDir = path.resolve(rootDir, '..')
const envMode = process.env.VITE_WRISTO_MODE || process.env.MODE || (process.env.NODE_ENV === 'development' ? 'development' : 'prod')
const rootEnv = loadEnv(envMode, workspaceEnvDir, '')
for (const [key, value] of Object.entries(rootEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}
if (process.env.VITE_WRISTO_SITE_URL === undefined && process.env.VITE_WRISTO_STORE_URL) {
  process.env.VITE_WRISTO_SITE_URL = process.env.VITE_WRISTO_STORE_URL
}
const distDir = path.join(rootDir, 'dist')
const siteUrl = trimTrailingSlash(process.env.VITE_WRISTO_SITE_URL || 'https://wristo.io')
const apiBase = trimTrailingSlash(
  process.env.VITE_WRISTO_PUBLIC_API_BASE_URL ||
    process.env.VITE_WRISTO_API_BASE_URL ||
    'https://api.wristo.io/api',
)
const previewPort = Number(process.env.PRERENDER_PORT || 4177)
const previewUrl = `http://127.0.0.1:${previewPort}`
const maxPrerenderRoutes = Number(process.env.MAX_PRERENDER_ROUTES || 80)
const staticRoutes = [
  '/',
  '/search',
  '/brands',
  '/premium',
  '/purchase-options',
  '/faq',
  '/faq/checkout',
  '/contact',
  '/terms-and-conditions',
  '/privacy-policy',
  '/newsletter',
  '/top',
  '/creators',
  '/bundle-products',
  '/template-editor',
]
const hiddenFaqGuideRouteSlugs = new Set([
  'garmin-watchface-iq-error-fix-zh',
  'install-error',
  'mina-lcd',
])
const productPreviewByRoute = new Map()

async function main() {
  const discoveredRoutes = await discoverRoutes()
  const routes = uniqueRoutes([...staticRoutes, ...discoveredRoutes])
  const prerenderRouteList = orderedUniqueRoutes([
    ...staticRoutes,
    ...discoveredRoutes.filter((route) => !route.startsWith('/product/')),
    ...discoveredRoutes.filter((route) => route.startsWith('/product/')).slice(0, maxPrerenderRoutes),
  ]).slice(0, maxPrerenderRoutes)

  await writeSitemap(routes)
  await writeLlms(routes)

  if (process.env.SKIP_PRERENDER === '1') {
    console.log(`[seo] Generated sitemap and llms.txt for ${routes.length} routes; skipped prerender.`)
    return
  }

  const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(previewPort)], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  preview.stdout.on('data', (chunk) => process.stdout.write(`[vite preview] ${chunk}`))
  preview.stderr.on('data', (chunk) => process.stderr.write(`[vite preview] ${chunk}`))

  try {
    await waitForServer(`${previewUrl}/`)
    await prerenderRoutes(prerenderRouteList)
  } finally {
    preview.kill('SIGTERM')
  }

  console.log(
    `[seo] Generated sitemap and llms.txt for ${routes.length} routes; prerendered ${prerenderRouteList.length} routes.`,
  )
}

async function discoverRoutes() {
  const routes = []
  const [
    categories,
    hotProducts,
    newProducts,
    searchedProducts,
    faqGuideRoutes,
    localizedStaticRoutes,
  ] = await Promise.all([
    safeApiGet('/public/categories/all'),
    safeApiGet('/public/products/hot?limit=60'),
    safeApiGet('/public/products/new?limit=60'),
    safeApiGet('/public/products/search/v2?keyword=&pageNum=1&pageSize=100'),
    loadFaqGuideRoutes(),
    loadLocalizedStaticRoutes(),
  ])

  for (const category of asList(categories)) {
    if (category?.slug) routes.push(`/categories/${encodeURIComponent(category.slug)}`)
  }

  for (const product of [...asList(hotProducts), ...asList(newProducts), ...asList(searchedProducts)]) {
    const appId = product?.appId
    if (appId !== undefined && appId !== null) {
      const route = `/product/${encodeURIComponent(String(appId))}`
      routes.push(route)
      productPreviewByRoute.set(route, product)
    }
  }

  routes.push(...faqGuideRoutes)
  routes.push(...localizedStaticRoutes)

  return routes.filter(Boolean)
}

async function loadLocalizedStaticRoutes() {
  const locales = await loadSupportedLocales()
  const routes = []
  for (const locale of locales) {
    for (const route of staticRoutes) {
      routes.push(route === '/' ? `/${locale}` : `/${locale}${route}`)
    }
  }
  return routes
}

async function loadSupportedLocales() {
  try {
    const source = await readFile(path.join(rootDir, 'src/store/locale.ts'), 'utf8')
    const match = source.match(/SUPPORTED_LOCALES\s*=\s*\[([\s\S]*?)\]\s+as const/)
    if (!match) throw new Error('SUPPORTED_LOCALES not found')
    return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]).filter(Boolean)
  } catch (error) {
    console.warn(`[seo] Locale discovery failed: ${error.message}`)
    return ['en']
  }
}

async function loadFaqGuideRoutes() {
  try {
    const source = await readFile(path.join(rootDir, 'src/content/faq-pages.ts'), 'utf8')
    const legacySource = await readFile(path.join(rootDir, 'src/content/faq-pages-legacy.ts'), 'utf8')
    const routes = ['/faq']
    for (const match of source.matchAll(/tr\(\s*'([^']+)'\s*,\s*'([^']+)'/g)) {
      if (hiddenFaqGuideRouteSlugs.has(match[2])) continue
      routes.push(`/${encodeURIComponent(match[1])}/faq/${encodeURIComponent(match[2])}`)
    }
    for (const post of parseLegacyFaqPosts(legacySource)) {
      if (isHiddenFaqGuideRoutePost(post)) continue
      for (const translation of asList(post?.translations)) {
        if (translation?.lang && translation?.slug && translation?.contentHtml) {
          routes.push(`/${encodeURIComponent(translation.lang)}/faq/${encodeURIComponent(translation.slug)}`)
        }
      }
    }
    return uniqueRoutes(routes)
  } catch (error) {
    console.warn(`[seo] Static FAQ guide route discovery failed: ${error.message}`)
    return ['/faq']
  }
}

function parseLegacyFaqPosts(source) {
  const match = source.match(/legacyFaqGuidePosts\s*=\s*(\[[\s\S]*?\])\s+as unknown/)
  if (!match) throw new Error('legacyFaqGuidePosts array not found')
  return JSON.parse(match[1])
}

function isHiddenFaqGuideRoutePost(post) {
  return hiddenFaqGuideRouteSlugs.has(post?.slug) ||
    asList(post?.translations).some((translation) => hiddenFaqGuideRouteSlugs.has(translation?.slug))
}

async function prerenderRoutes(routes) {
  const shellHtml = await readFile(path.join(distDir, 'index.html'), 'utf8')
  let browser
  try {
    browser = await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`[seo] Browser prerender unavailable: ${error.message}`)
    await writeFallbackRouteHtml(routes, shellHtml)
    return
  }

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } })
  page.setDefaultTimeout(8000)
  page.setDefaultNavigationTimeout(12000)
  await page.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.hostname === 'www.googletagmanager.com' || requestUrl.hostname === 'www.google-analytics.com') {
      await route.abort()
      return
    }
    if (requestUrl.origin === previewUrl && requestUrl.pathname.startsWith('/api/')) {
      try {
        const upstream = `${apiBase}${requestUrl.pathname.replace(/^\/api/, '')}${requestUrl.search}`
        const response = await fetch(upstream, {
          method: route.request().method(),
          headers: {
            Accept: route.request().headers().accept || 'application/json',
            'Content-Type': route.request().headers()['content-type'] || 'application/json',
          },
          body: ['GET', 'HEAD'].includes(route.request().method()) ? undefined : route.request().postData(),
        })
        await route.fulfill({
          status: response.status,
          headers: {
            'content-type': response.headers.get('content-type') || 'application/json',
          },
          body: await response.text(),
        })
      } catch (error) {
        await route.fulfill({
          status: 502,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, msg: error.message, data: null }),
        })
      }
      return
    }
    await route.continue()
  })
  page.on('pageerror', (error) => {
    console.warn(`[seo] page error: ${error.message}`)
  })

  for (const [index, route] of routes.entries()) {
    try {
      console.log(`[seo] Prerender ${index + 1}/${routes.length}: ${route}`)
      await page.goto(`${previewUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(800)
      let html = await page.content()
      html = html.replaceAll(previewUrl, siteUrl)
      html = applyBuildTimeFallbackSeo(route, html)
      html = ensureDoctype(html)
      await writeRouteHtml(route, html)
    } catch (error) {
      console.warn(`[seo] Failed to prerender ${route}: ${error.message}`)
      await writeRouteHtml(route, ensureDoctype(applyBuildTimeFallbackSeo(route, shellHtml)))
    }
  }

  await browser.close()
}

async function writeFallbackRouteHtml(routes, shellHtml) {
  for (const route of routes) {
    await writeRouteHtml(route, ensureDoctype(applyBuildTimeFallbackSeo(route, shellHtml)))
  }
  console.warn(`[seo] Wrote fallback SEO HTML for ${routes.length} routes.`)
}

async function writeSitemap(routes) {
  const now = new Date().toISOString()
  const body = routes
    .map((route) => {
      const priority = route === '/' ? '1.0' : route.startsWith('/product/') ? '0.8' : '0.7'
      const changefreq = route === '/' || route.startsWith('/product/') ? 'weekly' : 'monthly'
      return [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>`,
        `    <lastmod>${now}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  await writeFile(
    path.join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  )
}

async function writeLlms(routes) {
  const lines = [
    '# Wristo',
    '',
    'Wristo is a storefront for Garmin Connect IQ watch faces, bundles, creator collections, and setup guides.',
    '',
    '## Core pages',
    `- Home: ${siteUrl}/`,
    `- Top watch faces: ${siteUrl}/top`,
    `- Bundles: ${siteUrl}/bundle-products`,
    `- FAQ: ${siteUrl}/faq`,
    `- FAQ guides: ${siteUrl}/faq`,
    '',
    '## Indexed routes',
    ...routes.slice(0, 200).map((route) => `- ${siteUrl}${route}`),
    '',
  ]
  await writeFile(path.join(distDir, 'llms.txt'), lines.join('\n'))
}

async function writeRouteHtml(route, html) {
  const outputPath =
    route === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.replace(/^\/+/, ''), 'index.html')
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html)
}

async function safeApiGet(endpoint) {
  try {
    const response = await fetch(`${apiBase}${endpoint}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    return unwrapApiResponse(payload)
  } catch (error) {
    console.warn(`[seo] API route discovery failed for ${endpoint}: ${error.message}`)
    return []
  }
}

function unwrapApiResponse(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

function asList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.items)) return value.items
  return []
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000
  let lastError
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw lastError || new Error(`Timed out waiting for ${url}`)
}

function uniqueRoutes(routes) {
  return orderedUniqueRoutes(routes)
    .filter((route) => route.startsWith('/'))
    .filter((route) => !isNoindexRoute(route))
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
}

function orderedUniqueRoutes(routes) {
  return [...new Set(routes.map(normalizeRoutePath))]
    .filter((route) => route.startsWith('/'))
    .filter((route) => !isNoindexRoute(route))
}

function normalizeRoutePath(value) {
  if (!value) return '/'
  try {
    if (/^https?:\/\//i.test(value)) return new URL(value).pathname || '/'
  } catch {}
  const route = value.startsWith('/') ? value : `/${value}`
  return route.replace(/\/+$/, '') || '/'
}

function isNoindexRoute(route) {
  return [
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
  ].some((prefix) => route === prefix || route.startsWith(`${prefix}/`))
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function ensureDoctype(html) {
  return html.toLowerCase().startsWith('<!doctype') ? html : `<!doctype html>\n${html}`
}

function applyBuildTimeFallbackSeo(route, html) {
  if (!route.startsWith('/product/')) return html
  const product = productPreviewByRoute.get(route)
  if (!product?.name) return html

  const image = product.heroFile?.url || product.garminImageUrl || 'https://cdn.wristo.io/brands/wristo-logo/png/wristo-og-cover-1200x630.png'
  const title = `${product.name} Garmin Watch Face | Wristo`
  const description = truncate(
    stripHtml(product.description) ||
      `${product.name} is a Garmin Connect IQ watch face from Wristo with installation and unlock guidance.`,
    155,
  )
  const url = `${siteUrl}${route}`
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: [image],
    sku: String(product.appId),
    brand: { '@type': 'Brand', name: 'Wristo' },
    category: 'Garmin Connect IQ Watch Face',
    url,
    offers: {
      '@type': 'Offer',
      price: typeof product.price === 'number' ? product.price.toFixed(2) : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url,
    },
  }

  let nextHtml = html
  nextHtml = replaceTagContent(nextHtml, 'title', escapeHtml(title))
  nextHtml = setMeta(nextHtml, 'description', description)
  nextHtml = setMeta(nextHtml, 'twitter:title', title)
  nextHtml = setMeta(nextHtml, 'twitter:description', description)
  nextHtml = setMeta(nextHtml, 'twitter:image', image)
  nextHtml = setMetaProperty(nextHtml, 'og:title', title)
  nextHtml = setMetaProperty(nextHtml, 'og:description', description)
  nextHtml = setMetaProperty(nextHtml, 'og:url', url)
  nextHtml = setMetaProperty(nextHtml, 'og:image', image)
  nextHtml = setLink(nextHtml, 'canonical', url)
  nextHtml = nextHtml.replace(/<h1([^>]*)class="product-title"([^>]*)>\s*<\/h1>/, `<h1$1class="product-title"$2>${escapeHtml(product.name)}</h1>`)
  nextHtml = injectJsonLd(nextHtml, productSchema)
  return nextHtml
}

function replaceTagContent(html, tagName, content) {
  const pattern = new RegExp(`<${tagName}[^>]*>.*?</${tagName}>`, 'i')
  return pattern.test(html)
    ? html.replace(pattern, `<${tagName}>${content}</${tagName}>`)
    : html.replace('</head>', `<${tagName}>${content}</${tagName}></head>`)
}

function setMeta(html, name, content) {
  const escaped = escapeHtml(content)
  const pattern = new RegExp(`<meta name="${escapeRegExp(name)}" content="[^"]*">`, 'i')
  const tag = `<meta name="${name}" content="${escaped}">`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `${tag}</head>`)
}

function setMetaProperty(html, property, content) {
  const escaped = escapeHtml(content)
  const pattern = new RegExp(`<meta property="${escapeRegExp(property)}" content="[^"]*">`, 'i')
  const tag = `<meta property="${property}" content="${escaped}">`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `${tag}</head>`)
}

function setLink(html, rel, href) {
  const escaped = escapeHtml(href)
  const pattern = new RegExp(`<link rel="${escapeRegExp(rel)}" href="[^"]*">`, 'i')
  const tag = `<link rel="${rel}" href="${escaped}">`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `${tag}</head>`)
}

function injectJsonLd(html, schema) {
  return html.replace(
    '</head>',
    `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(removeUndefined(schema))}</script></head>`,
  )
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, maxLength) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}...`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined).filter((item) => item !== undefined)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== '')
      .map(([key, entryValue]) => [key, removeUndefined(entryValue)]),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
