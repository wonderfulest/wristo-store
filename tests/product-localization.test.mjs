import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'
const url = new URL('../src/utils/productLocalization.ts', import.meta.url)
const { code } = await transformWithEsbuild(await readFile(url, 'utf8'), url.pathname, { loader: 'ts', format: 'esm' })
const { localizeProduct } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const source = { name: 'English', description: 'English description', names: { zh: '中文', fr: '  ' }, descriptions: { fr: 'Français', pt: 'Português' } }
test('name and description fall back independently, without changing source', () => {
  assert.equal(localizeProduct(source, 'zh').name, '中文')
  assert.equal(localizeProduct(source, 'zh').description, 'English description')
  assert.equal(localizeProduct(source, 'fr').name, 'English')
  assert.equal(localizeProduct(source, 'fr').description, 'Français')
  assert.equal(source.name, 'English')
})
test('switching language, missing translations and legacy products', () => {
  assert.equal(localizeProduct(source, 'en').name, 'English')
  assert.equal(localizeProduct(source, 'ja').description, 'English description')
  assert.equal(localizeProduct({ name: 'Legacy' }, 'zh').name, 'Legacy')
})
test('matches storefront Brazilian Portuguese to publishing Portuguese', () => {
  assert.equal(localizeProduct(source, 'pt-br').description, 'Português')
})
