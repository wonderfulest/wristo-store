import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'
const url = new URL('../src/utils/productLocalization.ts', import.meta.url)
const { code } = await transformWithEsbuild(await readFile(url, 'utf8'), url.pathname, { loader: 'ts', format: 'esm' })
const { localizeProduct } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const source = {
  name: 'English', description: 'English description',
  names: { zh: '中文', fr: 'Français' },
  descriptions: { zh: '中文描述', fr: 'Français', pt: 'Português' },
}
test('all non-Chinese faces show English in every storefront locale', () => {
  for (const appLanguage of ['en', 'de', undefined, null, '']) {
    for (const locale of ['en', 'zh', 'fr', 'pt-br', 'ja']) {
      const result = localizeProduct({ ...source, appLanguage }, locale)
      assert.equal(result.name, source.name)
      assert.equal(result.description, source.description)
    }
  }
})
test('Chinese faces show Chinese only on the Chinese storefront', () => {
  for (const appLanguage of ['zhs', 'zh']) {
    const product = { ...source, appLanguage }
    assert.equal(localizeProduct(product, 'zh').name, '中文')
    assert.equal(localizeProduct(product, 'zh').description, '中文描述')
    for (const locale of ['en', 'fr', 'pt-br', 'ja']) {
      assert.equal(localizeProduct(product, locale).description, source.description)
      assert.equal(localizeProduct(product, locale).name, source.name)
    }
    assert.equal(product.name, 'English')
    assert.equal(product.descriptions.fr, 'Français')
  }
})
test('missing or blank Chinese fields fall back independently', () => {
  const product = { ...source, appLanguage: 'zhs', descriptions: { zh: '  ' } }
  assert.equal(localizeProduct(product, 'zh').name, '中文')
  assert.equal(localizeProduct(product, 'zh').description, source.description)
  assert.equal(localizeProduct({ name: 'Legacy' }, 'zh').name, 'Legacy')
})
