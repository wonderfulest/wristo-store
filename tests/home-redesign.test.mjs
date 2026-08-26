import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('the store home promotes Premium above search and below applications while preserving the legacy home', async () => {
  const home = await read('../src/views/home/Home.vue')
  const legacy = await read('../src/views/home/HomeLegacy.vue')

  const sections = ['<HomeBanner premium-only', '<HomeIntro', '<HomeProductGrid', '<PremiumSuiteCard']
  let previousIndex = -1
  for (const section of sections) {
    const index = home.indexOf(section)
    assert.ok(index > previousIndex, `${section} should follow the previous new-home section`)
    previousIndex = index
  }
  assert.doesNotMatch(home, /<HomeGuides/)

  for (const legacySection of [
    '<HomeBanner',
    '<SearchSection',
    '<NewArrivalsCarousel',
    '<SeriesSection',
    '<BrandsSection',
    '<FeatureSection',
    '<HotProductsSection',
    '<PremiumSuiteCard',
  ]) {
    assert.match(legacy, new RegExp(legacySection))
  }
})

test('the Premium-only homepage banner renders one offer without carousel controls or rotation', async () => {
  const banner = await read('../src/views/home/components/HomeBanner.vue')

  assert.match(banner, /premiumOnly\?: boolean/)
  assert.match(banner, /props\.premiumOnly\s*\?\s*allSlides\.filter\(\(slide\) => slide\.id === 'premium'\)/)
  assert.match(banner, /v-if="visibleSlides\.length > 1" class="banner-carousel"/)
  assert.match(banner, /if \(visibleSlides\.value\.length <= 1\) return/)
})

test('the legacy home remains directly reachable and is excluded from indexing', async () => {
  const routes = await read('../src/router/routes.ts')

  assert.match(routes, /path:\s*'\/home-legacy'[\s\S]*?name:\s*'HomeLegacy'/)
  assert.match(routes, /HomeLegacy\.vue/)
  assert.match(routes, /path:\s*'\/home-legacy'[\s\S]*?noindex:\s*true/)
})

test('the new home removes company copy while preserving localized search and product discovery', async () => {
  const intro = await read('../src/views/home/components/HomeIntro.vue')
  const grid = await read('../src/views/home/components/HomeProductGrid.vue')

  assert.doesNotMatch(intro, /home\.catalogTitle|home\.catalogDescription|home\.catalogBrowse/)
  assert.match(intro, /t\('search\.placeholder'\)/)
  assert.doesNotMatch(grid, /t\('home\.newKicker'\)/)
  assert.match(grid, /t\('home\.newArrivalsTitle'\)/)
  assert.match(grid, /catalog-products :deep\(\.section-heading__title\)[\s\S]*font-size:\s*clamp\(1\.5rem,/)
  assert.match(grid, /\.catalog-products\s*\{[^}]*padding:\s*clamp\(28px,/s)
  assert.match(grid, /<ProductCard/)
  assert.match(grid, /ProductGridSkeleton/)
})

test('the new home grid has explicit desktop, tablet, and mobile layouts', async () => {
  const grid = await read('../src/views/home/components/HomeProductGrid.vue')

  assert.match(grid, /grid-template-columns:\s*repeat\(4,/)
  assert.match(grid, /@media \(max-width:\s*1024px\)[\s\S]*repeat\(3,/)
  assert.match(grid, /@media \(max-width:\s*760px\)[\s\S]*repeat\(2,/)
  assert.match(grid, /@media \(max-width:\s*480px\)[\s\S]*grid-template-columns:\s*1fr/)
})

test('new homepage copy has English defaults and Chinese localization', async () => {
  const i18n = await read('../src/i18n.ts')
  const keys = [
    'home.catalogTitle',
    'home.catalogDescription',
    'home.catalogBrowse',
    'home.guidesTitle',
    'home.guidePurchaseTitle',
    'home.guideActivateTitle',
    'home.guideInstallTitle',
  ]

  for (const key of keys) {
    assert.equal(i18n.match(new RegExp(`'${key.replace('.', '\\.')}':`, 'g'))?.length, 2)
  }
  assert.match(i18n, /'home\.catalogTitle': 'A better face for every day\.'/)
  assert.match(i18n, /'home\.catalogTitle': '每天，都有更合适的表盘。'/)
})

test('the compact home search stays within the mobile viewport', async () => {
  const intro = await read('../src/views/home/components/HomeIntro.vue')
  const search = await read('../src/views/home/components/SearchSection.vue')

  assert.doesNotMatch(intro, /<h1/)
  assert.match(search, /@media \(max-width:\s*768px\)[\s\S]*\.search-section-compact \.search-bar-inner\s*\{[^}]*width:\s*100%;/)
  assert.match(search, /\.search-bar-outer\s*\{[^}]*box-sizing:\s*border-box;/)
  assert.match(search, /\.search-bar-inner\s*\{[^}]*box-sizing:\s*border-box;/)
})

test('the new home removes categories and unlocks infinite newest-product browsing after More', async () => {
  const home = await read('../src/views/home/Home.vue')
  const grid = await read('../src/views/home/components/HomeProductGrid.vue')

  assert.doesNotMatch(home, /<SeriesSection|seriesList|getHotSeries|goToSeries/)
  assert.match(home, /const pageSize = 24/)
  assert.match(home, /const infiniteScrollEnabled = ref\(false\)/)
  assert.match(home, /const enableInfiniteScroll/)
  assert.match(home, /getNewProducts\(requestedLimit\)/)
  assert.match(home, /:infinite-scroll-enabled="infiniteScrollEnabled"/)

  assert.match(grid, /v-if="hasMore && !infiniteScrollEnabled"/)
  assert.match(grid, /@click="\$emit\('load-more'\)"/)
  assert.match(grid, /v-else-if="loadMoreError"[^>]*@click="\$emit\('retry'\)"/)
  assert.match(grid, /ref="loadMoreSentinel"/)
  assert.match(grid, /new IntersectionObserver/)
})

test('the retired whole category redirects home and is excluded from public category navigation', async () => {
  const routes = await read('../src/router/routes.ts')
  const publicSeries = await read('../src/utils/publicSeries.ts')

  const redirectIndex = routes.indexOf("path: '/categories/whole'")
  const dynamicIndex = routes.indexOf("path: '/categories/:slug'")
  assert.ok(redirectIndex >= 0 && redirectIndex < dynamicIndex)
  assert.match(routes, /path:\s*'\/categories\/whole'[\s\S]*?redirect:\s*redirectRetiredWholeCategory/)
  assert.match(routes, /const redirectRetiredWholeCategory[\s\S]*?params\.lang[\s\S]*?`\/\$\{lang\}`\s*:\s*'\/'/)
  assert.doesNotMatch(publicSeries, /slug:\s*'whole'/)
})
