import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('purchase options put the product first and keep compact safe bottom spacing on phones', async () => {
  const source = await read('../src/views/shop/PurchaseOptions.vue')
  const mobileCss = source.slice(source.lastIndexOf('@media (max-width: 768px)'))

  assert.match(source, /class="purchase-option-product"/)
  assert.match(source, /class="purchase-option-bundle"/)
  assert.match(mobileCss, /\.purchase-option-product\s*\{[^}]*order:\s*1;/s)
  assert.match(mobileCss, /\.purchase-option-bundle\s*\{[^}]*order:\s*2;/s)
  assert.match(mobileCss, /\.purchase-options\s*\{[^}]*--commerce-page-mobile-padding-block:\s*24px max\(24px,\s*env\(safe-area-inset-bottom\)\);[^}]*margin-bottom:\s*0;/s)
  assert.match(mobileCss, /\.cards-container\s*>\s*\*:last-child\s*\{[^}]*margin-bottom:\s*0;/s)
})
