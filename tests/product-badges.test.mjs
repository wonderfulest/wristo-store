import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const url = new URL('../src/utils/productBadges.ts', import.meta.url)
const source = await readFile(url, 'utf8')
const { code } = await transformWithEsbuild(source, url.pathname, { loader: 'ts', format: 'esm', target: 'es2020' })
const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('free takes precedence and badge output is capped at two', () => {
  assert.deepEqual(mod.resolveProductBadges({ price: 0, download: 80000 }, { popularDownloadThreshold: 50000 }), [
    { kind: 'free', labelKey: 'product.badge.free' },
    { kind: 'popular', labelKey: 'product.badge.popular' },
  ])
})

test('new appears only when createdAt is reliable and within 30 days', () => {
  const now = new Date('2026-07-17T00:00:00Z')
  assert.deepEqual(mod.resolveProductBadges({ price: 2.99, createdAt: '2026-07-01T00:00:00Z' }, { now }), [
    { kind: 'new', labelKey: 'product.badge.new' },
  ])
  assert.deepEqual(mod.resolveProductBadges({ price: 2.99 }, { now }), [])
})

test('style badges require explicit category slugs and never inspect product names', () => {
  assert.deepEqual(mod.resolveProductBadges({ name: 'AMOLED Minimal', price: 1.99 }), [])
  assert.deepEqual(mod.resolveProductBadges({ price: 1.99, categories: [{ slug: 'amoled' }] }), [
    { kind: 'style', labelKey: 'product.badge.amoled' },
  ])
})
