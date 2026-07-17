import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { compileTemplate, parse } from '@vue/compiler-sfc'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('global storefront tokens define spacing, surfaces, focus and reduced motion', async () => {
  const css = await read('../src/style.css')
  for (const token of [
    '--color-stage:', '--color-rating:', '--surface-raised:', '--page-gutter:',
    '--space-section:', '--container-wide:', '--motion-fast:', '--focus-ring:',
  ]) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(css, /:focus-visible/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.el-skeleton/)
})

test('shared storefront container owns its border-box sizing contract', async () => {
  const css = await read('../src/style.css')
  assert.match(css, /\.storefront-container\s*\{[^}]*box-sizing:\s*border-box;/s)
})

test('footer links preserve a 44px interactive target', async () => {
  const footer = await read('../src/components/Footer.vue')
  assert.match(footer, /\.footer-nav a,\s*\.footer-detail a\s*\{[^}]*min-height:\s*44px;/s)
})

test('reduced motion neutralizes storefront entry without breaking layout transforms', async () => {
  const css = await read('../src/style.css')
  const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)')
  const reducedMotionEnd = css.indexOf('@media (max-width:', reducedMotionStart)
  const reducedMotion = css.slice(reducedMotionStart, reducedMotionEnd)
  const universalBlock = reducedMotion.match(/\*,\s*\*::before,\s*\*::after\s*\{([^}]*)\}/s)?.[1] ?? ''

  assert.doesNotMatch(universalBlock, /transform:\s*none/)
  assert.match(reducedMotion, /\.storefront-enter\s*\{[^}]*transform:\s*none\s*!important;/s)
})

test('layout exposes a shared content container without forcing viewport width', async () => {
  const source = await read('../src/components/Layout.vue')
  assert.match(source, /class="layout-root"/)
  assert.match(source, /--header-height/)
  assert.doesNotMatch(source, /width:\s*100vw/)
  assert.doesNotMatch(source, /min-width:\s*100vw/)
})

test('storefront primitives expose heading and skeleton contracts', async () => {
  const heading = await read('../src/components/storefront/SectionHeading.vue')
  const skeleton = await read('../src/components/storefront/ProductGridSkeleton.vue')
  assert.match(heading, /headingLevel/)
  assert.match(heading, /name="action"/)
  assert.match(skeleton, /product-grid-skeleton/)
  assert.match(skeleton, /aria-hidden="true"/)
})

test('product cards expose badges, keyboard access and mobile-friendly controls', async () => {
  const card = await read('../src/components/ProductCard.vue')

  assert.match(card, /product-badges/)
  assert.match(card, /:aria-label="productAriaLabel"/)
  assert.match(card, /@keydown\.enter/)
  assert.match(card, /@keydown\.space/)
  assert.match(card, /(?:min-)?width:\s*44px/)
  assert.match(card, /@media \(max-width:\s*600px\)/)
})

test('compiled product card keyboard handlers ignore events from nested controls', async () => {
  const source = await read('../src/components/ProductCard.vue')
  const { descriptor } = parse(source, { filename: 'ProductCard.vue' })
  assert.ok(descriptor.template)

  const result = compileTemplate({
    source: descriptor.template.content,
    filename: 'ProductCard.vue',
    id: 'product-card-keyboard',
  })
  assert.deepEqual(result.errors, [])

  const selfBeforePrevent = /_withKeys\(_withModifiers\([\s\S]*?\["self",\s*"prevent"\]\),\s*\["(?:enter|space)"\]\)/g
  assert.equal(result.code.match(selfBeforePrevent)?.length, 2)
})

test('home composes an editorial gallery with a motion-aware stage and shared headings', async () => {
  const home = await read('../src/views/home/Home.vue')
  const orderedSections = [
    '<HomeBanner',
    '<SearchSection',
    '<NewArrivalsCarousel',
    '<SeriesSection',
    '<BrandsSection',
    '<HotProductsSection',
    '<PremiumSuiteCard',
  ]
  let previousIndex = -1
  for (const section of orderedSections) {
    const index = home.indexOf(section)
    assert.ok(index > previousIndex, `${section} should follow the previous home section`)
    previousIndex = index
  }

  const banner = await read('../src/views/home/components/HomeBanner.vue')
  assert.match(banner, /class="banner-stage"/)
  assert.equal(banner.match(/class="banner-primary"/g)?.length, 1)
  assert.match(banner, /pauseCarousel/)
  assert.match(banner, /resumeCarousel/)
  assert.match(banner, /@media \(prefers-reduced-motion: reduce\)/)

  const contentSections = await Promise.all([
    '../src/views/home/components/NewArrivalsCarousel.vue',
    '../src/views/home/components/SeriesSection.vue',
    '../src/views/brands/BrandsSection.vue',
    '../src/views/home/components/FeatureSection.vue',
    '../src/views/home/components/HotProductsSection.vue',
  ].map(read))
  const sharedHeadingUses = contentSections.reduce(
    (count, source) => count + (source.match(/<SectionHeading\b/g)?.length ?? 0),
    0,
  )
  assert.ok(sharedHeadingUses >= 5, 'home content sections should share SectionHeading')
})

test('home carousel dots keep a 44px interactive target while rendering a compact pill', async () => {
  const banner = await read('../src/views/home/components/HomeBanner.vue')
  const dotBlock = banner.match(/\.carousel-dot\s*\{([^}]*)\}/s)?.[1] ?? ''

  assert.match(dotBlock, /min-width:\s*44px/)
  assert.match(dotBlock, /min-height:\s*44px/)
  assert.match(banner, /\.carousel-dot::before\s*\{/)
  assert.doesNotMatch(banner, /@media[^}]+\.carousel-dot\s*\{[^}]*(?:width|height):\s*(?:3\d|4[0-3])px/s)
})

test('new arrivals auto-scroll follows reduced-motion changes and releases its listener', async () => {
  const carousel = await read('../src/views/home/components/NewArrivalsCarousel.vue')

  assert.match(carousel, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/)
  assert.match(carousel, /reducedMotionQuery\.matches/)
  assert.match(carousel, /addEventListener\('change',\s*handleReducedMotionChange\)/)
  assert.match(carousel, /removeEventListener\('change',\s*handleReducedMotionChange\)/)
  assert.match(carousel, /handleReducedMotionChange[\s\S]*pauseAndCancelResume/)
})

test('product cards own one locale-aware product route without home grid mouse capture', async () => {
  const card = await read('../src/components/ProductCard.vue')
  const hot = await read('../src/views/home/components/HotProductsSection.vue')
  const home = await read('../src/views/home/Home.vue')

  assert.match(card, /addLocaleToPath\(`\/product\/\$\{props\.product\.appId\}`[^)]*localeStore\.currentLocale\)/)
  assert.doesNotMatch(card, /name:\s*'product-detail'/)
  assert.doesNotMatch(hot, /@click\.capture|handleProductClick|product-click/)
  const hotBinding = home.match(/<HotProductsSection[\s\S]*?\/>/)?.[0] ?? ''
  assert.doesNotMatch(hotBinding, /@product-click/)
})

test('header keeps desktop and mobile search and cart entry points available', async () => {
  const header = await read('../src/components/Header.vue')

  assert.match(header, /class="header-search-link"/)
  assert.match(header, /class="header-cart-link"/)
  assert.doesNotMatch(header, /v-if="isCartEnabled\s*&&\s*cartStore\.count"[\s\S]{0,180}class="header-cart-link"/)
  assert.match(header, /class="mobile-search-link"/)
  assert.match(header, /class="mobile-cart-link"/)
  assert.match(header, /class="header-search-link"[^>]*:aria-label=/)
  assert.match(header, /class="header-cart-link"[^>]*:aria-label=/)
  assert.match(header, /class="mobile-search-link"[^>]*:aria-label=/)
  assert.match(header, /class="mobile-cart-link"[^>]*:aria-label=/)
  assert.match(header, /class="mobile-menu-btn"[\s\S]{0,180}aria-label=/)
})

test('header uses a sticky accessible shell and switches controls at 900px', async () => {
  const header = await read('../src/components/Header.vue')

  assert.match(header, /\.header-bar\s*\{[^}]*position:\s*sticky;/s)
  assert.match(header, /\.header-bar\s*\{[^}]*min-height:\s*var\(--header-height\);/s)
  assert.match(header, /\.header-bar\s*\{[^}]*backdrop-filter:\s*blur\(18px\);/s)
  assert.match(header, /min-height:\s*44px/)
  assert.match(header, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.desktop-nav,[\s\S]*?display:\s*none;/)
  assert.match(header, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.mobile-controls[\s\S]*?display:\s*flex;/)
  assert.match(header, /max-height:\s*calc\(100dvh\s*-\s*var\(--header-height\)\)/)
})

test('header utility triggers use accessible 44px controls with visible focus', async () => {
  const language = await read('../src/components/LanguageSwitcher.vue')
  const device = await read('../src/components/DeviceDisplay.vue')

  assert.match(language, /class="current"[^>]*:aria-label=/)
  assert.match(language, /global-line-duotone" width="20" height="20"/)
  assert.match(language, /\.current\s*\{[^}]*min-height:\s*44px;[^}]*border-color:\s*var\(--color-line\);/s)
  assert.match(language, /\.current:focus-visible[\s\S]*box-shadow:\s*var\(--focus-ring\);/)
  assert.match(device, /<button[\s\S]*class="device-info selected-state"/)
  assert.match(device, /\.device-info\s*\{[^}]*min-height:\s*44px;/s)
  assert.match(device, /\.device-info:focus-visible[\s\S]*box-shadow:\s*var\(--focus-ring\);/)
})

test('navigation search copy is English by default and localized in Chinese', async () => {
  const i18n = await read('../src/i18n.ts')

  assert.match(i18n, /const en = \{[\s\S]*'nav\.search':\s*'Search'/)
  assert.match(i18n, /zh:\s*\{[\s\S]*'nav\.search':\s*'搜索'/)
})

test('browse surfaces share the storefront grid and loading primitives', async () => {
  const [categories, search, topApps, searchResults] = await Promise.all([
    '../src/views/products/Categories.vue',
    '../src/views/search/SearchView.vue',
    '../src/views/shop/TopApps.vue',
    '../src/views/home/components/SearchResultsSection.vue',
  ].map(read))

  for (const source of [categories, search, topApps, searchResults]) {
    assert.match(source, /storefront-product-grid/)
  }
  assert.match(categories, /<ProductGridSkeleton\s+v-if="loading\s*&&\s*products\.length\s*===\s*0"\s+:count="10"/)
  assert.match(categories, /v-if="loading\s*&&\s*products\.length\s*>\s*0"/)
  assert.match(search, /v-if="loading"[^>]*role="status"[\s\S]*<ProductGridSkeleton\s+:count="pageSize"/)
  assert.match(search, /<SectionHeading/)
  assert.match(topApps, /<ProductCard/)
})

test('category browse states are actionable, localized and preserve filtering semantics', async () => {
  const [categories, i18n] = await Promise.all([
    read('../src/views/products/Categories.vue'),
    read('../src/i18n.ts'),
  ])

  assert.match(categories, /const loadError = ref\(false\)/)
  assert.match(categories, /role="alert"/)
  assert.match(categories, /@click="fetchSeriesAndProducts\(true\)"/)
  assert.match(categories, /@click="selectFilter\('all'\)"/)
  assert.match(categories, /@click="goHome"/)
  assert.match(categories, /:aria-pressed="selectedFilter === option\.value"/)
  assert.match(categories, /const categoryAccent = computed/)
  for (const key of [
    'collection', 'filtersAria', 'sort', 'sortAria', 'loading', 'end', 'empty',
    'noMatches', 'clearFilter', 'results', 'error', 'retry',
  ]) {
    assert.match(i18n, new RegExp(`'category\\.${key}':`))
  }
  assert.match(i18n, /zh:\s*\{[\s\S]*'category\.collection':/)
})

test('category filters use explicit numeric product fields and never infer style from names', async () => {
  const categories = await read('../src/views/products/Categories.vue')

  assert.doesNotMatch(categories, /productSearchText|designId/)
  assert.doesNotMatch(categories, /'amoled'|'minimal'|'analog'|'data'/)
  assert.match(categories, /type CategoryFilterValue = 'all' \| 'free' \| 'popular'/)
  assert.match(categories, /Number\(product\.price \|\| 0\) === 0/)
  assert.match(categories, /Number\(product\.download \|\| 0\)/)
})

test('category load-more errors remain retryable and never render as the end state', async () => {
  const categories = await read('../src/views/products/Categories.vue')

  assert.match(categories, /const loadMoreError = ref\(false\)/)
  assert.match(categories, /const failedPage = ref<number \| null>\(null\)/)
  assert.match(categories, /@click="loadMore"/)
  assert.match(categories, /v-if="loadMoreError && products\.length > 0"[^>]*role="alert"/)
  assert.match(categories, /!loadMoreError && !hasMore/)
  assert.doesNotMatch(categories, /currentPage\.value\+\+/)
})

test('active category controls retain the shared visible focus ring', async () => {
  const categories = await read('../src/views/products/Categories.vue')

  const sortFocusBlock = categories.match(/\.category-sort-btn:focus-visible\s*\{([^}]*)\}/s)?.[1] ?? ''
  const filterFocusBlock = categories.match(/\.category-filter-chip:focus-visible\s*\{([^}]*)\}/s)?.[1] ?? ''
  assert.match(sortFocusBlock, /box-shadow:\s*var\(--focus-ring\);/)
  assert.match(filterFocusBlock, /box-shadow:\s*var\(--focus-ring\);/)
  assert.match(categories, /\.category-sort-btn\.active:focus-visible\s*\{[^}]*box-shadow:\s*var\(--focus-ring\);/s)
  assert.match(categories, /\.category-filter-chip\.active:focus-visible\s*\{[^}]*box-shadow:\s*var\(--focus-ring\);/s)
})

test('browse grids keep five, four, three and two columns without collapsing narrow phones', async () => {
  const sources = await Promise.all([
    '../src/views/products/Categories.vue',
    '../src/views/shop/TopApps.vue',
    '../src/views/home/components/SearchResultsSection.vue',
  ].map(read))
  const combined = sources.join('\n')

  for (const columns of [5, 4, 3, 2]) {
    assert.match(combined, new RegExp(`grid-template-columns:\\s*repeat\\(${columns},\\s*minmax\\(0,\\s*1fr\\)\\)`))
  }
  assert.match(combined, /@media\s*\(max-width:\s*430px\)[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
})

test('search keeps desktop pagination, mobile infinite loading and code activation', async () => {
  const search = await read('../src/views/search/SearchView.vue')

  assert.match(search, /showDesktopPagination/)
  assert.match(search, /<el-pagination/)
  assert.match(search, /canLoadMore/)
  assert.match(search, /loadNextPage/)
  assert.match(search, /isFetchingMore/)
  assert.match(search, /\/\^\\d\{6\}\$\//)
  assert.match(search, /localizedPath\('\/code'\)/)
})

test('search and top apps expose semantic recoverable list failures', async () => {
  const [search, topApps] = await Promise.all([
    read('../src/views/search/SearchView.vue'),
    read('../src/views/shop/TopApps.vue'),
  ])

  assert.match(search, /const loadError = ref\(false\)/)
  assert.match(search, /const loadMoreError = ref\(false\)/)
  assert.match(search, /role="alert"/)
  assert.match(search, /@click="retrySearch"/)
  assert.match(search, /@click="loadNextPage"/)
  assert.match(topApps, /role="alert"/)
  assert.match(topApps, /@click="loadData"/)
  for (const source of [search, topApps]) {
    assert.match(source, /role="status"/)
    assert.doesNotMatch(source, /icon="mdi:/)
  }
})

test('product detail keeps desktop purchase actions sticky and reserves mobile action space', async () => {
  const [detail, mobileActionBar] = await Promise.all([
    read('../src/views/products/ProductDetail.vue'),
    read('../src/components/storefront/MobileProductActionBar.vue'),
  ])

  assert.match(detail, /class="product-purchase-panel"/)
  assert.match(detail, /\.product-purchase-panel\s*\{[^}]*position:\s*sticky;/s)
  assert.match(detail, /\.product-purchase-panel\s*\{[^}]*top:\s*calc\(var\(--header-height\)/s)
  assert.match(detail, /<MobileProductActionBar/)
  assert.match(detail, /:price-label="mobilePriceLabel"/)
  assert.match(detail, /:primary-label="mobilePrimaryLabel"/)
  assert.match(detail, /:secondary-label="mobileSecondaryLabel"/)
  assert.match(detail, /@primary="mobilePrimaryAction"/)
  assert.match(detail, /@secondary="toggleCart"/)
  assert.match(detail, /@media\s*\(max-width:\s*900px\)[\s\S]*?padding-bottom:\s*calc\([^;]*var\(--mobile-product-action-reserve\)/)

  assert.match(mobileActionBar, /visible:\s*boolean/)
  assert.match(mobileActionBar, /priceLabel:\s*string/)
  assert.match(mobileActionBar, /primaryLabel:\s*string/)
  assert.match(mobileActionBar, /primaryDisabled\?:\s*boolean/)
  assert.match(mobileActionBar, /secondaryLabel\?:\s*string/)
  assert.match(mobileActionBar, /\(event:\s*'primary'\):\s*void/)
  assert.match(mobileActionBar, /\(event:\s*'secondary'\):\s*void/)
  assert.match(mobileActionBar, /env\(safe-area-inset-bottom\)/)
  assert.match(mobileActionBar, /\.mobile-product-action-bar__primary[\s\S]*?min-height:\s*48px/)
  assert.match(mobileActionBar, /mobile-product-action-bar__primary--wide/)
  assert.match(mobileActionBar, /\.mobile-product-action-bar__primary--wide\s*\{[^}]*grid-column:\s*2\s*\/\s*-1;/s)
})

test('commerce journey shares an accessible transaction shell without changing checkout contracts', async () => {
  const [css, cart, cartPage, purchaseOptions, checkout, activation, success, purchaseCard] = await Promise.all([
    '../src/style.css',
    '../src/views/user-center/CartList.vue',
    '../src/views/user-center/CartListPage.vue',
    '../src/views/shop/PurchaseOptions.vue',
    '../src/views/shop/Checkout.vue',
    '../src/views/shop/AlreadyPurchased.vue',
    '../src/views/shop/Success.vue',
    '../src/components/PurchaseCard.vue',
  ].map(read))

  for (const source of [cartPage, purchaseOptions, checkout, activation, success]) {
    assert.match(source, /commerce-page/)
    assert.match(source, /commerce-panel/)
  }
  for (const source of [cart, checkout, activation, success, purchaseCard]) {
    assert.match(source, /commerce-primary-action/)
  }
  assert.match(css, /\.commerce-page\s*\{[^}]*width:\s*min\(100%,\s*var\(--commerce-page-width,\s*var\(--container\)\)\);[^}]*padding-inline:\s*var\(--commerce-page-gutter,\s*var\(--page-gutter\)\);/s)
  assert.match(css, /\.commerce-panel\s*\{[^}]*border:\s*var\(--commerce-panel-border,[^;]+;[^}]*background:\s*var\(--commerce-panel-background,[^;]+;[^}]*box-shadow:\s*var\(--commerce-panel-shadow,[^;]+;/s)
  assert.match(css, /\.commerce-primary-action\s*\{[^}]*min-height:\s*var\(--commerce-primary-min-height,\s*48px\);[^}]*background:\s*var\(--commerce-primary-background,[^;]+;[^}]*transition:/s)
  assert.match(css, /\.commerce-primary-action:focus-visible\s*\{[^}]*box-shadow:\s*var\(--focus-ring\);/s)
  assert.match(css, /\.commerce-primary-action:disabled\s*\{[^}]*cursor:\s*var\(--commerce-primary-disabled-cursor,\s*not-allowed\);[^}]*opacity:\s*var\(--commerce-primary-disabled-opacity,/s)

  assert.match(cart, /checkCartPurchases/)
  assert.match(cart, /checkout\(items, email/)
  assert.match(cart, /paddle-inline-checkout/)
  assert.match(cart, /displayMode:\s*'inline'/)
  assert.match(cart, /class="purchase-warning"[^>]*role="alert"/)
  assert.match(cart, /class="checkout-btn[^\"]*commerce-primary-action[^\"]*"[^>]*:disabled=[^>]*:aria-busy=/)
  assert.match(cart, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(340px,\s*420px\)/)
  assert.match(cart, /top:\s*calc\(var\(--header-height\)\s*\+\s*24px\)/)

  assert.match(checkout, /emailError/)
  assert.match(checkout, /initializePaddle/)
  assert.match(checkout, /window\.Paddle\.Checkout\.open\(checkoutOptions\)/)
  assert.match(checkout, /role="alert"/)
  assert.match(checkout, /class="purchase-btn[^\"]*commerce-primary-action[^\"]*"[\s\S]{0,220}:disabled="loading"[\s\S]{0,100}:aria-busy="loading"/)

  assert.match(activation, /@submit\.prevent="handleActivation"/)
  assert.match(activation, /activatePurchase\(email\.value, activationCode\.value\)/)
  assert.match(activation, /class="message error-message"[^>]*role="alert"/)
  assert.match(activation, /class="activation-btn[^\"]*commerce-primary-action[^\"]*"[^>]*:disabled=[^>]*:aria-busy=/)

  assert.match(success, /store\.reset\(\)/)
  assert.match(success, /router\.push\('\/code'\)/)
  assert.match(success, /buildSsoSignupUrl\('store', \{ mode: 'signup' \}\)/)
})

test('activation and payment success public copy is localized in English and Chinese', async () => {
  const [activation, success, i18n] = await Promise.all([
    read('../src/views/shop/AlreadyPurchased.vue'),
    read('../src/views/shop/Success.vue'),
    read('../src/i18n.ts'),
  ])

  for (const key of [
    'activation.eyebrow', 'activation.title', 'activation.description', 'activation.emailLabel',
    'activation.codeLabel', 'activation.submit', 'activation.submitting', 'activation.syncNote',
    'paymentSuccess.eyebrow', 'paymentSuccess.title', 'paymentSuccess.summary',
    'paymentSuccess.nextStepTitle', 'paymentSuccess.orderSummary', 'paymentSuccess.accountBenefitManage',
    'paymentSuccess.actionsAria',
  ]) {
    assert.match(i18n, new RegExp(`'${key.replace('.', '\\\.')}'`, 'g'))
  }
  assert.match(i18n, /const en = \{[\s\S]*'activation\.title':/)
  assert.match(i18n, /zh:\s*\{[\s\S]*'activation\.title':/)
  assert.match(i18n, /zh:\s*\{[\s\S]*'paymentSuccess\.title':/)
  assert.match(activation, /t\('activation\.title'\)/)
  assert.match(success, /t\('paymentSuccess\.title'\)/)
})

test('transaction controls expose 44px touch targets in their actual selector blocks', async () => {
  const [cart, activation, purchaseCard] = await Promise.all([
    read('../src/views/user-center/CartList.vue'),
    read('../src/views/shop/AlreadyPurchased.vue'),
    read('../src/components/PurchaseCard.vue'),
  ])
  const selectorBlock = (source, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  }

  const removeButton = selectorBlock(cart, '.remove-btn')
  assert.match(removeButton, /width:\s*44px/)
  assert.match(removeButton, /height:\s*44px/)
  assert.match(selectorBlock(cart, '.recommend-search-btn'), /min-height:\s*44px/)
  assert.match(selectorBlock(cart, '.email-lock input'), /min-height:\s*44px/)
  assert.match(selectorBlock(cart, '.cart-email-login'), /min-height:\s*44px/)
  assert.match(selectorBlock(activation, '.help-link-inline'), /min-height:\s*44px/)
  assert.match(selectorBlock(purchaseCard, '.purchase-card-select'), /min-height:\s*44px/)
  assert.match(selectorBlock(purchaseCard, '.purchase-card-select'), /min-width:\s*44px/)
})

test('checkout email field has an explicit label and invalid state wiring', async () => {
  const checkout = await read('../src/views/shop/Checkout.vue')

  assert.match(checkout, /<label class="input-label" for="checkout-email">/)
  assert.match(checkout, /<input[\s\S]{0,400}id="checkout-email"/)
  assert.match(checkout, /<input[\s\S]{0,500}:aria-invalid="Boolean\(emailError\)"/)
  assert.match(checkout, /aria-describedby="checkout-email-help checkout-email-error"/)
  assert.match(checkout, /id="checkout-email-error"[^>]*role="alert"/)
})

test('purchase cards use sibling selection and buy controls without interactive nesting', async () => {
  const source = await read('../src/components/PurchaseCard.vue')
  const { descriptor } = parse(source, { filename: 'PurchaseCard.vue' })
  assert.ok(descriptor.template)
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: 'PurchaseCard.vue',
    id: 'purchase-card-accessibility',
  })

  assert.deepEqual(result.errors, [])
  assert.match(source, /<article[\s\S]{0,180}:class="\['purchase-card'/)
  assert.doesNotMatch(source, /<article[^>]*(?:role="button"|tabindex="0")/)
  assert.match(source, /<button[\s\S]{0,240}class="purchase-card-select"[\s\S]{0,240}@click\.stop="handleSelect"/)
  assert.match(source, /class="purchase-card-select"[\s\S]*<\/button>[\s\S]*<button[\s\S]*commerce-primary-action/)
  assert.match(source, /emit\('select'\)/)
  assert.match(source, /emit\('buy'\)/)
  assert.match(source, /emit\('loadMoreBundleItems'\)/)
})

test('purchase card stacking rules do not override the absolute selection control', async () => {
  const purchaseCard = await read('../src/components/PurchaseCard.vue')

  assert.match(
    purchaseCard,
    /\.purchase-card\s*>\s*:where\(:not\(\.purchase-card-select\)\)\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s,
  )
  assert.doesNotMatch(purchaseCard, /\.purchase-card\s*>\s*\*\s*\{[^}]*position:\s*relative;/s)
  assert.match(purchaseCard, /\.purchase-card-select\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*3;/s)
})

test('purchase card generic stacking has zero specificity so both badges stay absolute', async () => {
  const purchaseCard = await read('../src/components/PurchaseCard.vue')

  assert.match(
    purchaseCard,
    /\.purchase-card\s*>\s*:where\(:not\(\.purchase-card-select\)\)\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s,
  )
  assert.doesNotMatch(purchaseCard, /\.purchase-card\s*>\s*:not\(\.purchase-card-select\)\s*\{/)
  assert.match(purchaseCard, /\.discount-badge\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*2;/s)
  assert.match(purchaseCard, /\.lifetime-badge\s*\{[^}]*position:\s*absolute;[^}]*z-index:\s*2;/s)
})
