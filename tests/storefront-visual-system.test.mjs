import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

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
