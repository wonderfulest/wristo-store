import assert from 'node:assert/strict'
import test from 'node:test'
import { selectPrerenderRoutes, canonicalOrigin, assertRenderedPage, publicCategoryRoutes } from '../scripts/seo-policy.mjs'

test('products and guides survive the locale expansion while purchase routes retain priority', () => {
  const locales = Array.from({ length: 14 }, (_, i) => `lang${i}`)
  const localized = locales.flatMap(lang => [`/${lang}`, `/${lang}/purchase-options`, ...Array.from({ length: 12 }, (_, i) => `/${lang}/page${i}`)])
  const products = Array.from({ length: 40 }, (_, i) => `/app/${i}`)
  const routes = selectPrerenderRoutes(['/', '/support'], localized, ['/en/support/install', ...products], 80)
  assert.equal(routes.length, 80)
  assert.ok(routes.includes('/app/19'))
  assert.ok(routes.includes('/en/support/install'))
  for (const lang of locales) assert.ok(routes.indexOf(`/${lang}/purchase-options`) < routes.indexOf('/app/0'))
  assert.equal(new Set(routes).size, routes.length)
})
test('canonical domain agrees with live www redirects and preserves other regions', () => {
  assert.equal(canonicalOrigin('https://wristo.io/'), 'https://www.wristo.io')
  assert.equal(canonicalOrigin('http://localhost:3000'), 'https://www.wristo.io')
  assert.equal(canonicalOrigin('https://wristo.cn/'), 'https://wristo.cn')
  assert.throws(() => selectPrerenderRoutes([], [], [], NaN))
})
test('a successful build cannot silently ship an empty shell or private snapshot', () => {
  assert.throws(() => assertRenderedPage('/', '<div id="app"></div>'))
  assert.throws(() => assertRenderedPage('/app/1', '<main><h1></h1></main>'))
  assert.throws(() => assertRenderedPage('/', '<meta name="robots" content="noindex, follow"><main><h1>Private</h1></main>'))
  assert.doesNotThrow(() => assertRenderedPage('/', '<main><h1>Garmin watch faces</h1></main>'))
})

test('sitemap discovers only categories the public UI can actually render', () => {
  assert.deepEqual(publicCategoryRoutes([
    { slug: 'whole', isActive: 1 }, { slug: 'animal', isActive: 1 },
    { slug: 'cartoon', isActive: 1 }, { slug: 'digital', isActive: 0 },
  ], [{ slug: 'cartoon' }, { slug: 'digital' }]), ['/categories/cartoon'])
})

test('prerender refuses localhost, redirected or mismatched canonicals', () => {
  const html = '<link rel="canonical" href="http://localhost:3000/"><main><h1>Wristo</h1></main>'
  assert.throws(() => assertRenderedPage('/', html, 'https://www.wristo.io'))
  assert.doesNotThrow(() => assertRenderedPage('/', html.replace('http://localhost:3000', 'https://www.wristo.io'), 'https://www.wristo.io'))
})

test('FAQ entry aliases may point to their real translated article', () => {
  const html = '<link rel="canonical" href="https://www.wristo.io/en/support/faq"><main><h1>FAQ</h1></main>'
  assert.doesNotThrow(() => assertRenderedPage('/support', html, 'https://www.wristo.io'))
  assert.throws(() => assertRenderedPage('/app/1', html, 'https://www.wristo.io'))
})
