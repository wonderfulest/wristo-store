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

test('only ROLE_ADMIN receives exact role-aware counts', async () => {
  const source = await read('../src/utils/downloadCount.ts')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const formatters = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )

  const roleCases = [
    { label: 'guest', roles: undefined, expected: '40+' },
    { label: 'ordinary role', roles: [{ roleCode: 'ROLE_USER' }], expected: '40+' },
    { label: 'merchant', roles: [{ roleCode: 'ROLE_MERCHANT' }], expected: '40+' },
    { label: 'unknown role', roles: [{ roleCode: 'ROLE_UNKNOWN' }], expected: '40+' },
    { label: 'admin', roles: [{ roleCode: 'ROLE_ADMIN' }], expected: '42' },
  ]

  for (const { label, roles, expected } of roleCases) {
    const isAdmin = formatters.hasAdminRole(roles)
    assert.equal(isAdmin, label === 'admin', `${label} admin predicate`)
    assert.equal(formatters.formatRoleAwareAppCount(42, isAdmin), expected, `${label} count`)
  }
})

test('count display composable reuses the shared admin role predicate', async () => {
  const source = await read('../src/composables/useCountDisplay.ts')

  assert.match(source, /import\s*\{[^}]*hasAdminRole[^}]*\}\s*from\s*['"]@\/utils\/downloadCount['"]/s)
  assert.match(source, /computed\(\(\)\s*=>\s*hasAdminRole\(userStore\.userInfo\?\.roles\)\)/)
  assert.doesNotMatch(source, /role\.roleCode\s*===\s*['"]ROLE_ADMIN['"]/)
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
    assert.match(source, /useCountDisplay\s*\(/)
    assert.doesNotMatch(source, /import\s*\{[^}]*format(?:Exact|ApproxApp|ApproxDownload)Count/)
  }
})

test('series bundle and subscription app counts use the shared count policy', async () => {
  const paths = [
    '../src/components/SeriesCard.vue',
    '../src/components/PurchaseCard.vue',
    '../src/components/subscription/SubscriptionCard.vue',
  ]
  for (const path of paths) {
    const source = await read(path)
    assert.match(source, /useCountDisplay\s*\(/)
    assert.match(source, /formatDisplayAppCount/)
  }

  const purchaseCard = await read('../src/components/PurchaseCard.vue')
  const subscriptionCard = await read('../src/components/subscription/SubscriptionCard.vue')
  assert.doesNotMatch(purchaseCard, /const formatCountPlus/)
  assert.doesNotMatch(subscriptionCard, /\{\{\s*productCount\s*\}\}\s*watch faces/)
})

test('bundle detail formats only its visible product count through the shared policy', async () => {
  const source = await read('../src/views/products/BundleDetail.vue')

  assert.match(source, /const\s*\{\s*formatDisplayAppCount\s*\}\s*=\s*useCountDisplay\s*\(\s*\)/)
  assert.match(
    source,
    /\{\{\s*formatDisplayAppCount\(bundle\.products\?\.length\s*\|\|\s*0\)\s*\}\}\s*items/,
  )
  assert.doesNotMatch(source, /\{\{\s*bundle\.products\?\.length\s*\|\|\s*0\s*\}\}\s*items/)
  assert.match(source, /v-if="bundle\.products\s*&&\s*bundle\.products\.length\s*>\s*0"/)
  assert.match(source, /v-for="product\s+in\s+bundle\.products"/)
})

test('category results format the visible filtered count through the shared policy', async () => {
  const source = await read('../src/views/products/Categories.vue')

  assert.match(source, /useCountDisplay\s*\(/)
  assert.match(
    source,
    /category\.results',\s*\{\s*count:\s*formatDisplayAppCount\(filteredProducts\.length\)\s*\}/,
  )
  assert.doesNotMatch(source, /category\.results',\s*\{\s*count:\s*filteredProducts\.length\s*\}/)
})

test('search results format only the visible total through the shared policy', async () => {
  const source = await read('../src/views/search/SearchView.vue')

  assert.match(source, /useCountDisplay\s*\(/)
  assert.match(
    source,
    /formattedTotal\s*=\s*computed\(\(\)\s*=>\s*formatDisplayAppCount\(total\.value\s*\|\|\s*searchResults\.value\.length\s*\|\|\s*0\)\)/,
  )
  assert.doesNotMatch(source, /formattedTotal\s*=\s*computed\(\(\)\s*=>\s*new Intl\.NumberFormat/)
})
