import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('app detail is canonical and legacy product URLs redirect permanently', async () => {
  const [routes, seo, prerender, vercel] = await Promise.all([
    readSource('src/router/routes.ts'),
    readSource('src/seo.ts'),
    readSource('scripts/prerender-seo.mjs'),
    readSource('vercel.json'),
  ])

  assert.match(routes, /path: '\/app\/:id'[\s\S]*?name: 'product-detail'/)
  assert.match(routes, /path: '\/product\/:id'[\s\S]*?redirect:/)
  assert.match(seo, /canonicalMatchPath\.startsWith\('\/app\/'\)/)
  assert.match(prerender, /const route = `\/app\/\$\{encodeURIComponent\(String\(appId\)\)\}`/)

  const redirects = JSON.parse(vercel).redirects
  assert.deepEqual(redirects.slice(0, 2), [
    { source: '/product/:id', destination: '/app/:id', permanent: true },
    { source: '/:lang/product/:id', destination: '/:lang/app/:id', permanent: true },
  ])
})

test('storefront navigation emits app detail URLs instead of legacy product URLs', async () => {
  const sources = await Promise.all([
    'src/components/ProductCard.vue',
    'src/components/storefront/SimilarProductsFeed.vue',
    'src/views/home/HomeLegacy.vue',
    'src/views/products/BundleDetail.vue',
    'src/views/products/Categories.vue',
    'src/views/user-center/CartList.vue',
    'src/views/user-center/PurchaseRecords.vue',
  ].map(readSource))

  for (const source of sources) {
    assert.doesNotMatch(source, /\/product\/\$\{/)
  }
})
