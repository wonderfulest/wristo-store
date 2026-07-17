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
  const [css, layout, footer, header, mobileActionBar] = await Promise.all([
    read('../src/style.css'),
    read('../src/components/Layout.vue'),
    read('../src/components/Footer.vue'),
    read('../src/components/Header.vue'),
    read('../src/components/storefront/MobileProductActionBar.vue'),
  ])
  const variables = cssVariables(css)

  assert.match(css, /--layer-footer:\s*\d+;/)
  assert.match(css, /--layer-mobile-transaction:\s*\d+;/)
  assert.match(css, /--layer-header:\s*\d+;/)
  assert.match(css, /--layer-header-menu:\s*\d+;/)
  assert.ok(Number(variables['--layer-mobile-transaction']) > Number(variables['--layer-footer']))
  assert.ok(Number(variables['--layer-header']) > Number(variables['--layer-mobile-transaction']))
  assert.ok(Number(variables['--layer-header-menu']) > Number(variables['--layer-header']))
  assert.match(selectorBlock(footer, '.footer'), /z-index:\s*var\(--layer-footer\)/)
  assert.match(selectorBlock(mobileActionBar, '.mobile-product-action-bar'), /z-index:\s*var\(--layer-mobile-transaction\)/)
  assert.match(selectorBlock(header, '.header-bar'), /z-index:\s*var\(--layer-header\)/)
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
  assert.match(seriesCard, /t\('series\.appCount',\s*\{\s*count:\s*series\.appCount\s*\}\)/)
  assert.doesNotMatch(categories, /Most downloaded|Top rated/)
  assert.match(categories, /t\('category\.sortMostDownloaded'\)/)
  assert.match(categories, /t\('category\.sortTopRated'\)/)
  assert.doesNotMatch(productCard, /aria-label="Product popularity"/)
  assert.match(productCard, /:aria-label="t\('product\.popularityAria'\)"/)

  for (const key of [
    'series.appCount',
    'category.sortMostDownloaded',
    'category.sortTopRated',
    'product.popularityAria',
  ]) {
    const escaped = key.replaceAll('.', '\\.')
    assert.match(i18n, new RegExp(`const en = \\{[\\s\\S]*'${escaped}':`))
    assert.match(i18n, new RegExp(`zh:\\s*\\{[\\s\\S]*'${escaped}':`))
  }
})

test('shared commerce selectors define the real responsive and accessible visual contract', async () => {
  const css = await read('../src/style.css')
  const page = selectorBlock(css, '.commerce-page')
  const panel = selectorBlock(css, '.commerce-panel')
  const action = selectorBlock(css, '.commerce-primary-action')
  const actionFocus = selectorBlock(css, '.commerce-primary-action:focus-visible')
  const actionDisabled = selectorBlock(css, '.commerce-primary-action:disabled')

  assert.match(page, /width:\s*min\(100%,\s*var\(--container\)\)/)
  assert.match(page, /padding-inline:\s*var\(--page-gutter\)/)
  assert.match(panel, /background:\s*var\(--color-surface\)/)
  assert.match(panel, /border:\s*1px solid var\(--color-line\)/)
  assert.match(panel, /border-radius:\s*var\(--radius-(?:md|lg)\)/)
  assert.match(panel, /box-shadow:\s*var\(--shadow-(?:sm|md)\)/)
  assert.match(action, /min-height:\s*(?:44|48)px/)
  assert.match(action, /background:\s*var\(--color-brand\)/)
  assert.match(action, /color:\s*#fff(?:fff)?/i)
  assert.match(action, /transition:/)
  assert.match(actionFocus, /box-shadow:\s*var\(--focus-ring\)/)
  assert.match(actionDisabled, /cursor:\s*not-allowed/)
  assert.match(actionDisabled, /opacity:/)
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.commerce-page\s*\{/)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.commerce-primary-action\s*\{[^}]*transition(?:-duration)?:\s*(?:none|0\.01ms)/s)
})
