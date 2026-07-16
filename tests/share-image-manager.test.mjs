import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

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
  const [routes, router, header, page] = await Promise.all([
    read('../src/router/routes.ts'),
    read('../src/router/index.ts'),
    read('../src/components/Header.vue'),
    read('../src/views/admin/ShareImageManager.vue'),
  ])

  assert.match(routes, /path:\s*'\/admin\/share-images'/)
  assert.match(routes, /requiresAdmin:\s*true/)
  assert.match(router, /requiresAdmin/)
  assert.match(router, /ROLE_ADMIN/)
  assert.match(header, /command="share-images"/)
  assert.match(header, /v-if="isAdmin"/)
  assert.match(page, /MAX_SHARE_IMAGES\s*=\s*8/)
  assert.match(page, /fetchAdminProductPage/)
  assert.match(page, /handleUpload/)
  assert.match(page, /handleDelete/)
  assert.match(page, /deleteProductShareImage/)
})
