import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const importTypeScript = async (path) => {
  const source = await read(path)
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
}

test('favorite reminder is offered only when crossing 3 and 6 items', async () => {
  const { resolveFavoriteReminderThreshold } = await importTypeScript('../src/utils/favoriteReminder.ts')

  assert.equal(resolveFavoriteReminderThreshold(2, 3, []), 3)
  assert.equal(resolveFavoriteReminderThreshold(3, 3, []), null)
  assert.equal(resolveFavoriteReminderThreshold(5, 6, [3]), 6)
  assert.equal(resolveFavoriteReminderThreshold(2, 6, [3]), 6)
  assert.equal(resolveFavoriteReminderThreshold(5, 6, [3, 6]), null)
  assert.equal(resolveFavoriteReminderThreshold(6, 8, [3, 6]), null)
})

test('favorite records merge by appId and preserve earliest creation time', async () => {
  const { mergeFavoriteRecords } = await importTypeScript('../src/utils/productFavorites.ts')
  const local = [
    { appId: 2, name: 'Two', price: 2, imageUrl: '/two.png', createdAt: '2026-08-26T10:00:00Z' },
    { appId: 3, name: 'Three', price: 3, imageUrl: '/three.png', createdAt: '2026-08-26T11:00:00Z' },
  ]
  const remote = [
    { appId: 2, name: 'Two remote', price: 2, imageUrl: '/two-new.png', createdAt: '2026-08-26T09:00:00Z' },
    { appId: 4, name: 'Four', price: 4, imageUrl: '/four.png', createdAt: '2026-08-26T12:00:00Z' },
  ]

  assert.deepEqual(mergeFavoriteRecords(local, remote).map(({ appId, createdAt }) => ({ appId, createdAt })), [
    { appId: 2, createdAt: '2026-08-26T09:00:00Z' },
    { appId: 3, createdAt: '2026-08-26T11:00:00Z' },
    { appId: 4, createdAt: '2026-08-26T12:00:00Z' },
  ])
})

test('recently viewed IDs stay unique and bounded', async () => {
  const { appendRecentlyViewed } = await importTypeScript('../src/utils/productRecommendations.ts')

  assert.deepEqual(appendRecentlyViewed([1, 2, 3], 2, 3), [1, 3, 2])
  assert.deepEqual(appendRecentlyViewed([1, 2, 3], 4, 3), [2, 3, 4])
})

test('favorite store and product APIs expose guest sync contracts', async () => {
  const [store, api, productApi] = await Promise.all([
    read('../src/store/productFavorites.ts'),
    read('../src/api/product-favorites.ts'),
    read('../src/api/product.ts'),
  ])

  assert.match(store, /defineStore\(['"]productFavorites['"]/)
  assert.match(store, /sessionStorage/)
  assert.match(store, /localStorage/)
  assert.match(store, /mergeProductFavorites/)
  assert.match(api, /\/products\/favorites/)
  assert.match(api, /\/products\/favorites\/merge/)
  assert.match(productApi, /excludeIds:\s*excludeIds\.join\(['"]?,['"]?\)/)
})

test('mobile discovery components keep watch faces primary and conversion dismissible', async () => {
  const [feed, prompt, actionBar] = await Promise.all([
    read('../src/components/storefront/SimilarProductsFeed.vue'),
    read('../src/components/storefront/FavoriteCheckoutPrompt.vue'),
    read('../src/components/storefront/MobileProductActionBar.vue'),
  ])

  assert.match(feed, /class="similar-products-grid"/)
  assert.match(feed, /IntersectionObserver/)
  assert.match(feed, /aria-pressed=/)
  assert.doesNotMatch(feed, /add-to-cart|addToCart/)
  assert.match(prompt, /role="dialog"/)
  assert.match(prompt, /favorites\.continueBrowsing/)
  assert.match(prompt, /favorites\.addAndCheckout/)
  assert.match(actionBar, /favoriteLabel/)
  assert.match(actionBar, /event: 'favorite'/)
})

test('product detail wires favorites, similar feed, checkout prompt and collapsed information', async () => {
  const detail = await read('../src/views/products/ProductDetail.vue')

  assert.match(detail, /<SimilarProductsFeed/)
  assert.match(detail, /<FavoriteCheckoutPrompt/)
  assert.match(detail, /useProductFavoriteStore/)
  assert.match(detail, /class="product-more-information"/)
  assert.match(detail, /:favorite-label=/)
})
