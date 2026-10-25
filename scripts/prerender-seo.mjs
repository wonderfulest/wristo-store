import { selectPrerenderRoutes, canonicalOrigin, assertRenderedPage, publicCategoryRoutes } from './seo-policy.mjs'
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadEnv } from 'vite'

const rootDir = process.cwd()
const workspaceEnvDir = path.resolve(rootDir, '..')
const envMode = process.env.VITE_WRISTO_MODE || process.env.MODE || (process.env.NODE_ENV === 'development' ? 'development' : 'prod')
const rootEnv = { ...loadEnv(envMode, workspaceEnvDir, ''), ...loadEnv(envMode, rootDir, '') }
for (const [key, value] of Object.entries(rootEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}
if (process.env.VITE_WRISTO_SITE_URL === undefined && process.env.VITE_WRISTO_STORE_URL) {
  process.env.VITE_WRISTO_SITE_URL = process.env.VITE_WRISTO_STORE_URL
}
const distDir = path.join(rootDir, 'dist')
const siteUrl = canonicalOrigin(process.env.VITE_WRISTO_SITE_URL || 'https://www.wristo.io')
const apiBase = trimTrailingSlash(
  process.env.VITE_WRISTO_PUBLIC_API_BASE_URL ||
    process.env.VITE_WRISTO_API_BASE_URL ||
    'https://api.wristo.io/api',
)
const previewPort = Number(process.env.PRERENDER_PORT || 4177)
const previewUrl = `http://127.0.0.1:${previewPort}`
const maxPrerenderRoutes = Number(process.env.MAX_PRERENDER_ROUTES || 80)
const staticRoutes = [
  '/collections/data-rich-garmin-watch-faces',
  '/collections/analog-garmin-watch-faces',
  '/collections/outdoor-garmin-watch-faces',
  '/',
  '/search',
  '/brands',
  '/membership',
  '/purchase-options',
  '/support',
  '/support/checkout',
  '/contact',
  '/terms-and-conditions',
  '/privacy-policy',
  '/top',
  '/creators',
  '/bundle-products',
]
const hiddenFaqGuideRouteSlugs = new Set([
  'garmin-watchface-iq-error-fix-zh',
  'install-error',
  'mina-lcd',
])

async function main() {
  const [discoveredRoutes, localizedStaticRoutes] = await Promise.all([
    discoverRoutes(),
    loadLocalizedStaticRoutes(),
  ])
  const routes = uniqueRoutes([...staticRoutes, ...localizedStaticRoutes, ...discoveredRoutes])
  const prerenderRouteList = selectPrerenderRoutes(uniqueRoutes(staticRoutes), orderedUniqueRoutes(localizedStaticRoutes), orderedUniqueRoutes(discoveredRoutes), maxPrerenderRoutes)

  const robots = await readFile(path.join(rootDir, 'public/robots.txt'), 'utf8')
  await writeFile(path.join(distDir, 'robots.txt'), robots.replace(/^Sitemap:.*$/m, `Sitemap: ${siteUrl}/sitemap.xml`))
  await writeSitemap(routes)
  await writeLlms(routes)

  if (process.env.SKIP_PRERENDER === '1') {
    console.log(`[seo] Generated sitemap and llms.txt for ${routes.length} routes; skipped prerender.`)
    return
  }

  const preview = spawn('npx', ['vite', 'preview', '--strictPort', '--host', '127.0.0.1', '--port', String(previewPort)], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  preview.stdout.on('data', (chunk) => process.stdout.write(`[vite preview] ${chunk}`))
  preview.stderr.on('data', (chunk) => process.stderr.write(`[vite preview] ${chunk}`))

  try {
    await waitForServer(`${previewUrl}/`)
    const canonicalPaths = await prerenderRoutes(prerenderRouteList)
    const canonicalRoutes = uniqueRoutes(routes.map(route => canonicalPaths.get(route) || route))
    await writeSitemap(canonicalRoutes)
    await writeLlms(canonicalRoutes)
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
  ] = await Promise.all([
    safeApiGet('/public/categories/all'),
    safeApiGet('/public/products/hot?limit=60'),
    safeApiGet('/public/products/new?limit=60'),
    safeApiGet('/public/products/search/v2?keyword=&pageNum=1&pageSize=100'),
    loadFaqGuideRoutes(),
  ])

  const definitions = JSON.parse(await readFile(path.join(rootDir, 'src/utils/publicSeriesDefinitions.json'), 'utf8'))
  routes.push(...publicCategoryRoutes(asList(categories), definitions))

  for (const product of [...asList(hotProducts), ...asList(newProducts), ...asList(searchedProducts)]) {
    const appId = product?.appId
    if (appId !== undefined && appId !== null) {
      const route = `/app/${encodeURIComponent(String(appId))}`
      routes.push(route)
    }
  }

  routes.push(...faqGuideRoutes)

  return routes.filter(Boolean)
}

async function loadLocalizedStaticRoutes() {
  const locales = await loadSupportedLocales()
  const routes = []
  for (const locale of locales) {
    for (const route of staticRoutes.filter(route => !route.startsWith('/collections/'))) {
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
    const routes = ['/support']
    for (const match of source.matchAll(/tr\(\s*'([^']+)'\s*,\s*'([^']+)'/g)) {
      if (hiddenFaqGuideRouteSlugs.has(match[2])) continue
      routes.push(`/${encodeURIComponent(match[1])}/support/${encodeURIComponent(match[2])}`)
    }
    for (const post of parseLegacyFaqPosts(legacySource)) {
      if (isHiddenFaqGuideRoutePost(post)) continue
      for (const translation of asList(post?.translations)) {
        if (translation?.lang && translation?.slug && translation?.contentHtml) {
          routes.push(`/${encodeURIComponent(translation.lang)}/support/${encodeURIComponent(translation.slug)}`)
        }
      }
    }
    return uniqueRoutes(routes)
  } catch (error) {
    console.warn(`[seo] Static FAQ guide route discovery failed: ${error.message}`)
    return ['/support']
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
  // Preserve a neutral SPA fallback for routes that have no static snapshot.
  await writeFile(path.join(distDir, 'app.html'), shellHtml)
  // Vercel's build image lacks the shared libraries required by Playwright's downloaded browser.
  const serverlessChromium = process.env.VERCEL && process.platform === 'linux'
    ? (await import('@sparticuz/chromium')).default
    : null
  const browser = await chromium.launch({
    headless: true,
    ...(serverlessChromium
      ? { executablePath: await serverlessChromium.executablePath(), args: serverlessChromium.args }
      : process.env.PRERENDER_BROWSER_CHANNEL ? { channel: process.env.PRERENDER_BROWSER_CHANNEL } : {}),
  }).catch(error => {
    throw new Error(`SEO build requires a browser. Run npx playwright install chromium, or set PRERENDER_BROWSER_CHANNEL=chrome. ${error.message}`)
  })
  const snapshots = new Map()
  const canonicalPaths = new Map()
  const pendingApi = new Set()
  const pageErrors = []
  let lastApiActivity = Date.now()

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } })
  page.setDefaultTimeout(25000)
  page.setDefaultNavigationTimeout(12000)
  await page.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url())
    if (requestUrl.hostname === 'www.googletagmanager.com' || requestUrl.hostname === 'www.google-analytics.com') {
      await route.abort()
      return
    }
    if (requestUrl.origin === previewUrl && requestUrl.pathname.startsWith('/api/')) {
      if (!['GET', 'HEAD'].includes(route.request().method()) || requestUrl.pathname.includes('/analytics/')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: null }) })
        return
      }
      pendingApi.add(route)
      lastApiActivity = Date.now()
      try {
        const upstream = `${apiBase}${requestUrl.pathname.replace(/^\/api/, '')}${requestUrl.search}`
        const response = await fetch(upstream, {
          signal: AbortSignal.timeout(15000),
          method: route.request().method(),
          headers: {
            Accept: route.request().headers().accept || 'application/json',
            'X-Lang': route.request().headers()['x-lang'] || 'en',
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
      } finally {
        pendingApi.delete(route)
        lastApiActivity = Date.now()
      }
      return
    }
    await route.continue()
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  try {
    for (const [index, route] of routes.entries()) {
      console.log(`[seo] Prerender ${index + 1}/${routes.length}: ${route}`)
      pageErrors.length = 0
      // Isolate language/session state so the preceding locale cannot leak into the next page.
      await page.goto(`${previewUrl}/app.html`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
      await page.context().clearCookies()
      await page.goto(`${previewUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForFunction(() => Array.from(document.querySelectorAll('main h1, main h2')).some(heading => !!heading.textContent?.trim()))
      const deadline = Date.now() + 20000
      while (pendingApi.size || Date.now() - lastApiActivity < 400) {
        if (Date.now() > deadline) throw new Error(`API did not settle for ${route}`)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (route.startsWith('/app/')) {
        await page.waitForFunction(() => !!document.querySelector('h1.product-title')?.textContent?.trim())
      }
      if (pageErrors.length) throw new Error(`${route}: ${pageErrors.join('; ')}`)
      const html = ensureDoctype((await page.content()).replaceAll(previewUrl, siteUrl))
      assertRenderedPage(route, html, siteUrl)
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      canonicalPaths.set(route, new URL(canonical).pathname)
      snapshots.set(route, html)
    }
  } finally {
    await browser.close()
  }
  // Write only after rendering finishes: the preview server must keep serving the original shell.
  for (const [route, html] of snapshots) await writeRouteHtml(route, html)
  return canonicalPaths
}

async function writeSitemap(routes) {
  const body = routes
    .map((route) => {
      const priority = route === '/' ? '1.0' : route.startsWith('/app/') ? '0.8' : '0.7'
      const changefreq = route === '/' || route.startsWith('/app/') ? 'weekly' : 'monthly'
      return [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>`,
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
    `- FAQ: ${siteUrl}/support`,
    `- FAQ guides: ${siteUrl}/support`,
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
      signal: AbortSignal.timeout(15000),
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
    '/categories/whole',
    '/auth',
    '/checkout',
    '/checkout-subscription',
    '/payment',
    '/auto-unlock',
    '/subscription-management',
    '/subscription-cancel',
    '/activate',
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

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
