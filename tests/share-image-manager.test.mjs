import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { transformWithEsbuild } from 'vite'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const extractNamedImportsFrom = (source, modulePath) => {
  const lines = source.split('\n')
  const endIndex = lines.findIndex((line) => line.includes(`from '${modulePath}'`))
  assert.notEqual(endIndex, -1, `Expected import from ${modulePath}`)

  let startIndex = endIndex
  while (startIndex >= 0 && !lines[startIndex].trimStart().startsWith('import ')) {
    startIndex -= 1
  }
  assert.ok(startIndex >= 0, `Expected import declaration for ${modulePath}`)

  const declaration = lines.slice(startIndex, endIndex + 1).join('\n')
  const openBraceIndex = declaration.indexOf('{')
  const closeBraceIndex = declaration.lastIndexOf('}')
  assert.ok(openBraceIndex >= 0 && closeBraceIndex > openBraceIndex, 'Expected named imports')

  return declaration
    .slice(openBraceIndex + 1, closeBraceIndex)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

const loadTypeScriptModule = async (path) => {
  const url = new URL(path, import.meta.url)
  const source = await readFile(url, 'utf8')
  const { code } = await transformWithEsbuild(source, url.pathname, {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  })
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  return { source, module: await import(moduleUrl) }
}

test('store share image API can page every app and manage app-bound assets', async () => {
  const [productApi, shareApi] = await Promise.all([
    read('../src/api/product.ts'),
    read('../src/api/product-share-images.ts'),
  ])

  assert.match(productApi, /fetchAdminProductPage/)
  assert.match(productApi, /\/admin\/products\/page/)
  assert.match(shareApi, /fetchProductShareImages/)
  assert.match(shareApi, /uploadProductShareImages/)
  assert.match(shareApi, /deleteProductShareImage/)
  assert.match(shareApi, /\/admin\/products\/\$\{appId\}\/share-images/)
  assert.match(shareApi, /formData\.append\('files', file\)/)
})

test('store exposes an admin-only share image manager with an eight-image limit', async () => {
  const [routes, router, header, page, policy] = await Promise.all([
    read('../src/router/routes.ts'),
    read('../src/router/index.ts'),
    read('../src/components/Header.vue'),
    read('../src/views/admin/ShareImageManager.vue'),
    loadTypeScriptModule('../src/utils/productShareImagePolicy.ts'),
  ])

  assert.match(routes, /path:\s*'\/admin\/share-images'/)
  assert.match(routes, /requiresAdmin:\s*true/)
  assert.match(router, /requiresAdmin/)
  assert.match(router, /ROLE_ADMIN/)
  assert.match(header, /command="share-images"/)
  assert.match(header, /v-if="isAdmin"/)
  assert.deepEqual(
    extractNamedImportsFrom(page, '@/utils/productShareImagePolicy').sort(),
    [
      'MAX_SHARE_IMAGES',
      'MAX_SHARE_IMAGE_FILE_SIZE_BYTES',
      'SUPPORTED_SHARE_IMAGE_TYPES',
    ].sort(),
  )
  assert.equal(policy.module.MAX_SHARE_IMAGES, 8)
  assert.equal(policy.module.MAX_SHARE_IMAGE_FILE_SIZE_BYTES, 10 * 1024 * 1024)
  assert.deepEqual(
    [...policy.module.SUPPORTED_SHARE_IMAGE_TYPES],
    ['image/png', 'image/jpeg', 'image/webp'],
  )
  assert.match(
    policy.source,
    /SUPPORTED_SHARE_IMAGE_TYPES:\s*ReadonlySet<string>\s*=\s*new Set/,
  )
  assert.match(page, /:accept="shareImageAccept"/)
  assert.doesNotMatch(page, /\baccept="image\/png,image\/jpeg,image\/webp"/)
  assert.match(
    page,
    /const shareImageAccept\s*=\s*\[\.\.\.SUPPORTED_SHARE_IMAGE_TYPES\]\.join\(['"],['"]\)/,
  )
  assert.match(page, /fetchAdminProductPage/)
  assert.match(page, /handleUpload/)
  assert.match(page, /handleDelete/)
  assert.match(page, /deleteProductShareImage/)
})
