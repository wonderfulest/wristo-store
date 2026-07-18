import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('role-aware count formatters expose exact values only to admins', async () => {
  const source = await read('../src/utils/downloadCount.ts')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const formatters = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )

  assert.equal(formatters.formatRoleAwareAppCount(42, true), '42')
  assert.equal(formatters.formatRoleAwareAppCount(42, false), '40+')
  assert.equal(formatters.formatRoleAwareDownloadCount(1234, true), '1,234')
  assert.equal(formatters.formatRoleAwareDownloadCount(1234, false), '1K+')
  assert.equal(formatters.formatRoleAwareAppCount(null, false), '0')
})

test('all existing metrics surfaces consume the shared count policy', async () => {
  const paths = [
    '../src/components/Header.vue',
    '../src/components/ProductCard.vue',
    '../src/views/brands/Brands.vue',
    '../src/views/brands/MerchantDetail.vue',
    '../src/views/products/ProductDetail.vue',
  ]
  for (const path of paths) {
    const source = await read(path)
    assert.match(source, /useCountDisplay/)
    assert.doesNotMatch(source, /import\s*\{[^}]*format(?:Exact|ApproxApp|ApproxDownload)Count/)
  }
})
