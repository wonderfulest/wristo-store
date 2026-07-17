import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { compileTemplate, parse } from '@vue/compiler-sfc'
import ts from 'typescript'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')
const readOptional = async (path) => {
  try {
    return await read(path)
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

const selectorBlock = (source, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

const declarationsForSelector = (source, selector, includeStates = true) => {
  const style = source.match(/<style\s+scoped>([\s\S]*?)<\/style>/)?.[1] ?? source
  const declarations = []
  for (const match of style.matchAll(/(?:^|})\s*([^{}]+)\{([^{}]*)\}/gm)) {
    const selectors = match[1].split(',').map((value) => value.trim())
    if (selectors.some((value) => value === selector || (includeStates && value.startsWith(`${selector}:`)))) {
      declarations.push(...[...match[2].matchAll(/^\s*([\w-]+)\s*:/gm)].map(([, property]) => property))
    }
  }
  return declarations.filter((property) => !property.startsWith('--'))
}

const cssVariables = (source) => Object.fromEntries(
  [...source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
)

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const relativeLuminance = (hex) => {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

test('new arrivals nested cart keyboard events stay local and the cart target is 44px', async () => {
  const source = await read('../src/views/home/components/NewArrivalsCarousel.vue')
  const { descriptor } = parse(source, { filename: 'NewArrivalsCarousel.vue' })
  assert.ok(descriptor.template)
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: 'NewArrivalsCarousel.vue',
    id: 'new-arrivals-keyboard',
  })

  assert.deepEqual(result.errors, [])
  const selfBeforePrevent = /_withKeys\(_withModifiers\([\s\S]*?\["self",\s*"prevent"\]\),\s*\["(?:enter|space)"\]\)/g
  assert.equal(result.code.match(selfBeforePrevent)?.length, 2)

  const cartTarget = selectorBlock(source, '.cart-toggle')
  assert.match(cartTarget, /min-width:\s*44px/)
  assert.match(cartTarget, /min-height:\s*44px/)
  assert.doesNotMatch(source, /@media[\s\S]*?\.cart-toggle\s*\{[^}]*(?:min-)?(?:width|height):\s*(?:[1-3]\d|4[0-3])px/s)
})

test('categories delegates product navigation and returns home through the active locale', async () => {
  const source = await read('../src/views/products/Categories.vue')
  const productCard = source.match(/<product-card\b[\s\S]*?\/>/)?.[0] ?? ''

  assert.doesNotMatch(productCard, /@click=/)
  assert.doesNotMatch(source, /const goToProduct\b/)
  assert.match(source, /router\.push\(addLocaleToPath\('\/',\s*localeStore\.currentLocale\)\)/)
})

test('mobile product action presentation only exposes executable actions', async () => {
  const helperSource = await readOptional('../src/utils/productMobileAction.ts')
  assert.match(helperSource, /export function resolveMobileProductActionState/)

  const compiled = ts.transpileModule(helperSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const { resolveMobileProductActionState } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )

  assert.deepEqual(resolveMobileProductActionState({
    appId: 42,
    hasEntitlement: true,
    garminStoreUrl: 'https://apps.garmin.com/app/42',
    cartEnabled: true,
    isInCart: false,
  }), { visible: true, primaryAction: 'download', secondaryAction: null })
  assert.deepEqual(resolveMobileProductActionState({
    appId: 42,
    hasEntitlement: true,
    garminStoreUrl: '  ',
    cartEnabled: true,
    isInCart: false,
  }), { visible: false, primaryAction: null, secondaryAction: null })
  assert.deepEqual(resolveMobileProductActionState({
    appId: 42,
    hasEntitlement: false,
    garminStoreUrl: null,
    cartEnabled: true,
    isInCart: false,
  }), { visible: true, primaryAction: 'buy', secondaryAction: 'add-to-cart' })
})

test('mobile transaction layer is shared and remains above the footer without a layout trap', async () => {
  const [css, layout, footer, header, floatingActions, mobileActionBar] = await Promise.all([
    read('../src/style.css'),
    read('../src/components/Layout.vue'),
    read('../src/components/Footer.vue'),
    read('../src/components/Header.vue'),
    read('../src/components/FloatingActions/FloatingActions.vue'),
    read('../src/components/storefront/MobileProductActionBar.vue'),
  ])
  const variables = cssVariables(css)

  assert.match(css, /--layer-footer:\s*\d+;/)
  assert.match(css, /--layer-mobile-transaction:\s*\d+;/)
  assert.match(css, /--layer-floating-actions:\s*\d+;/)
  assert.match(css, /--layer-header:\s*\d+;/)
  assert.match(css, /--layer-header-overlay:\s*\d+;/)
  assert.match(css, /--layer-header-menu:\s*\d+;/)
  assert.ok(Number(variables['--layer-mobile-transaction']) > Number(variables['--layer-footer']))
  assert.ok(Number(variables['--layer-floating-actions']) > Number(variables['--layer-mobile-transaction']))
  assert.ok(Number(variables['--layer-header']) > Number(variables['--layer-floating-actions']))
  assert.ok(Number(variables['--layer-header-overlay']) > Number(variables['--layer-floating-actions']))
  assert.ok(Number(variables['--layer-header']) > Number(variables['--layer-mobile-transaction']))
  assert.ok(Number(variables['--layer-header-menu']) > Number(variables['--layer-header']))
  assert.match(selectorBlock(footer, '.footer'), /z-index:\s*var\(--layer-footer\)/)
  assert.match(selectorBlock(mobileActionBar, '.mobile-product-action-bar'), /z-index:\s*var\(--layer-mobile-transaction\)/)
  assert.match(selectorBlock(floatingActions, '.floating-actions'), /z-index:\s*var\(--layer-floating-actions\)/)
  assert.match(floatingActions, /<Teleport\s+to="body">/)
  assert.doesNotMatch(floatingActions, /z-index:\s*9999/)
  assert.match(selectorBlock(header, '.header-bar'), /z-index:\s*var\(--layer-header\)/)
  assert.match(selectorBlock(header, '.mobile-overlay'), /z-index:\s*var\(--layer-header-overlay\)/)
  assert.match(selectorBlock(header, '.mobile-nav'), /z-index:\s*var\(--layer-header-menu\)/)
  assert.doesNotMatch(selectorBlock(layout, '.layout-main'), /isolation:\s*isolate/)
})

test('storefront spacing references resolve and stage-muted text meets WCAG AA contrast', async () => {
  const css = await read('../src/style.css')
  const topApps = await read('../src/views/shop/TopApps.vue')
  const variables = cssVariables(css)
  const srcRoot = new URL('../src/', import.meta.url)
  const storefrontFiles = (await readdir(srcRoot, { recursive: true }))
    .filter((path) => /\.(?:css|vue)$/.test(path))
  const sourceFiles = await Promise.all(
    storefrontFiles.map((path) => readFile(new URL(path, srcRoot), 'utf8')),
  )
  const spacingReferences = new Set(
    sourceFiles.flatMap((source) => [...source.matchAll(/var\((--space-[\w-]+)\)/g)].map(([, token]) => token)),
  )

  for (const token of spacingReferences) {
    assert.ok(variables[token], `${token} must resolve in src/style.css`)
  }
  assert.match(variables['--color-stage'], /^#[0-9a-f]{6}$/i)
  assert.match(variables['--color-stage-muted'], /^#[0-9a-f]{6}$/i)
  assert.ok(
    contrastRatio(variables['--color-stage-muted'], variables['--color-stage']) >= 4.5,
    'stage-muted text must have at least 4.5:1 contrast on the stage background',
  )
  assert.match(selectorBlock(topApps, '.segment-btn'), /color:\s*var\(--color-stage-muted\)/)
})

test('series counts, category sorting and popularity labels are localized in English and Chinese', async () => {
  const [seriesCard, categories, productCard, i18n] = await Promise.all([
    read('../src/components/SeriesCard.vue'),
    read('../src/views/products/Categories.vue'),
    read('../src/components/ProductCard.vue'),
    read('../src/i18n.ts'),
  ])

  assert.doesNotMatch(seriesCard, /\{\{\s*series\.appCount\s*\}\}\s*apps/)
  assert.match(seriesCard, /formatSeriesAppCount\(series\.appCount\)/)
  assert.doesNotMatch(categories, /Most downloaded|Top rated/)
  assert.match(categories, /t\('category\.sortMostDownloaded'\)/)
  assert.match(categories, /t\('category\.sortTopRated'\)/)
  assert.doesNotMatch(productCard, /aria-label="Product popularity"/)
  assert.match(productCard, /:aria-label="t\('product\.popularityAria'\)"/)

  for (const key of [
    'series.appCount.one',
    'series.appCount.other',
    'category.sortMostDownloaded',
    'category.sortTopRated',
    'product.popularityAria',
  ]) {
    const escaped = key.replaceAll('.', '\\.')
    assert.match(i18n, new RegExp(`const en = \\{[\\s\\S]*'${escaped}':`))
    assert.match(i18n, new RegExp(`zh:\\s*\\{[\\s\\S]*'${escaped}':`))
  }
  assert.match(i18n, /'series\.appCount\.one':\s*'\{count\} app'/)
  assert.match(i18n, /'series\.appCount\.other':\s*'\{count\} apps'/)
})

test('commerce consumers inherit core page, panel and primary-action declarations', async () => {
  const consumers = Object.fromEntries(await Promise.all([
    ['checkout', '../src/views/shop/Checkout.vue'],
    ['activation', '../src/views/shop/AlreadyPurchased.vue'],
    ['success', '../src/views/shop/Success.vue'],
    ['purchaseOptions', '../src/views/shop/PurchaseOptions.vue'],
    ['cartPage', '../src/views/user-center/CartListPage.vue'],
    ['cart', '../src/views/user-center/CartList.vue'],
    ['purchaseCard', '../src/components/PurchaseCard.vue'],
  ].map(async ([name, path]) => [name, await read(path)])))

  const pageCore = new Set(['width', 'max-width', 'padding', 'padding-inline', 'padding-block'])
  for (const [consumer, selector] of [
    ['checkout', '.checkout'],
    ['activation', '.already-purchased-page'],
    ['success', '.success-page'],
    ['purchaseOptions', '.purchase-options'],
    ['cartPage', '.cart-page-shell'],
  ]) {
    const duplicates = declarationsForSelector(consumers[consumer], selector, false)
      .filter((property) => pageCore.has(property))
    assert.deepEqual(duplicates, [], `${consumer} ${selector} must inherit commerce-page sizing and gutters`)
  }

  const panelCore = new Set(['background', 'background-color', 'border', 'border-radius', 'box-shadow'])
  for (const [consumer, selector] of [
    ['activation', '.content-container'],
    ['checkout', '.checkout-right'],
    ['success', '.confirmation-panel'],
    ['success', '.order-panel'],
    ['success', '.account-panel'],
    ['cartPage', '.cart-list-page'],
  ]) {
    const duplicates = declarationsForSelector(consumers[consumer], selector, false)
      .filter((property) => panelCore.has(property))
    assert.deepEqual(duplicates, [], `${consumer} ${selector} must inherit commerce-panel surface`)
  }

  const actionCore = new Set([
    'width', 'min-height', 'padding', 'border', 'border-color', 'border-radius',
    'background', 'background-color', 'color', 'box-shadow', 'transition', 'outline',
    'outline-offset', 'cursor', 'opacity', 'transform', 'filter', 'font-size', 'font-weight',
  ])
  for (const [consumer, selector] of [
    ['checkout', '.purchase-btn'],
    ['activation', '.activation-btn'],
    ['success', '.primary-action'],
    ['cart', '.checkout-btn'],
    ['purchaseCard', '.buy-btn'],
    ['purchaseCard', '.buy-btn-bundle'],
    ['purchaseCard', '.buy-btn-product'],
  ]) {
    const duplicates = declarationsForSelector(consumers[consumer], selector)
      .filter((property) => actionCore.has(property))
    assert.deepEqual(duplicates, [], `${consumer} ${selector} must inherit commerce-primary-action styling`)
  }
})

test('commerce panel chrome belongs to visual panels rather than layout wrappers', async () => {
  const checkout = await read('../src/views/shop/Checkout.vue')
  const purchaseOptions = await read('../src/views/shop/PurchaseOptions.vue')
  const success = await read('../src/views/shop/Success.vue')

  assert.doesNotMatch(checkout, /class="checkout-main[^"\n]*\bcommerce-panel\b/)
  assert.doesNotMatch(purchaseOptions, /class="cards-container[^"\n]*\bcommerce-panel\b/)
  assert.doesNotMatch(success, /class="success-hero[^"\n]*\bcommerce-panel\b/)

  assert.match(checkout, /class="checkout-right[^"\n]*\bcommerce-panel\b/)
  assert.match(success, /class="confirmation-panel[^"\n]*\bcommerce-panel\b/)
  assert.match(success, /class="order-panel[^"\n]*\bcommerce-panel\b/)
  assert.match(success, /class="account-panel[^"\n]*\bcommerce-panel\b/)
})

test('shared commerce selectors define the real responsive and accessible visual contract', async () => {
  const css = await read('../src/style.css')
  const page = selectorBlock(css, '.commerce-page')
  const panel = selectorBlock(css, '.commerce-panel')
  const action = selectorBlock(css, '.commerce-primary-action')
  const actionFocus = selectorBlock(css, '.commerce-primary-action:focus-visible')
  const actionDisabled = selectorBlock(css, '.commerce-primary-action:disabled')

  assert.match(page, /width:\s*min\(100%,\s*var\(--commerce-page-width,\s*var\(--container\)\)\)/)
  assert.match(page, /padding-inline:\s*var\(--commerce-page-gutter,\s*var\(--page-gutter\)\)/)
  assert.match(panel, /background:\s*var\(--commerce-panel-background,\s*var\(--color-surface\)\)/)
  assert.match(panel, /border:\s*var\(--commerce-panel-border,\s*1px solid var\(--color-line\)\)/)
  assert.match(panel, /border-radius:\s*var\(--commerce-panel-radius,\s*var\(--radius-lg\)\)/)
  assert.match(panel, /box-shadow:\s*var\(--commerce-panel-shadow,\s*var\(--shadow-md\)\)/)
  assert.match(action, /min-height:\s*var\(--commerce-primary-min-height,\s*48px\)/)
  assert.match(action, /background:\s*var\(--commerce-primary-background,\s*var\(--color-brand\)\)/)
  assert.match(action, /color:\s*var\(--commerce-primary-color,\s*#fff\)/i)
  assert.match(action, /transition:/)
  assert.match(actionFocus, /box-shadow:\s*var\(--focus-ring\)/)
  assert.match(actionDisabled, /cursor:\s*var\(--commerce-primary-disabled-cursor,\s*not-allowed\)/)
  assert.match(actionDisabled, /opacity:\s*var\(--commerce-primary-disabled-opacity,/)
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.commerce-page\s*\{/)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.commerce-primary-action\s*\{[^}]*transition(?:-duration)?:\s*(?:none|0\.01ms)/s)
})
