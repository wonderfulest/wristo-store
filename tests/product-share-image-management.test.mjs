import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'

import { build } from 'esbuild'
import { effectScope, nextTick, ref } from 'vue'

const sourceRoot = new URL('../src/', import.meta.url).pathname
const composablePath = new URL(
  '../src/composables/useProductShareImageManagement.ts',
  import.meta.url,
).pathname
const vueModuleUrl = import.meta.resolve('vue')
const result = await build({
  entryPoints: [composablePath],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'es2020',
  write: false,
  external: [vueModuleUrl],
  plugins: [
    {
      name: 'product-share-image-management-alias',
      setup(esbuild) {
        esbuild.onResolve({ filter: /^vue$/ }, () => ({
          path: vueModuleUrl,
          external: true,
        }))
        esbuild.onResolve({ filter: /^@\// }, ({ path }) => ({
          path: `${sourceRoot}${path.slice(2)}.ts`,
        }))
      },
    },
  ],
})
const moduleUrl =
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
const { useProductShareImageManagement } = await import(moduleUrl)

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

const flush = async () => {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
}

const makeImage = (id, label = String(id)) => ({
  id,
  imageUrl: `${label}.png`,
})

const createHarness = (overrides = {}) => {
  const appId = ref(overrides.appId ?? 42)
  const isAdmin = ref(overrides.isAdmin ?? true)
  const messages = { warning: [], success: [], error: [] }
  const warnings = []
  let confirmDelete = overrides.confirmDelete ?? (() => Promise.resolve())
  const dependencies = {
    fetchPublicImages: overrides.fetchPublicImages ?? (() => Promise.resolve([])),
    fetchAdminImages: overrides.fetchAdminImages ?? (() => Promise.resolve([])),
    uploadImages: overrides.uploadImages ?? (() => Promise.resolve([])),
    deleteImage: overrides.deleteImage ?? (() => Promise.resolve()),
    reorderImages: overrides.reorderImages ?? (() => Promise.resolve([])),
    confirmDelete: (...args) => confirmDelete(...args),
    message: {
      warning: (message) => messages.warning.push(message),
      success: (message) => messages.success.push(message),
      error: (message) => messages.error.push(message),
    },
    logWarning: (...args) => warnings.push(args),
  }
  const scope = effectScope()
  const management = scope.run(() =>
    useProductShareImageManagement({ appId, isAdmin }, dependencies),
  )

  return {
    appId,
    isAdmin,
    management,
    messages,
    warnings,
    setConfirmDelete: (nextConfirm) => {
      confirmDelete = nextConfirm
    },
    stop: () => scope.stop(),
  }
}

test('identity changes load the matching list and stale public or admin responses cannot overwrite it', async (t) => {
  const publicRequests = []
  const adminRequests = []
  const harness = createHarness({
    isAdmin: false,
    fetchPublicImages: () => {
      const request = deferred()
      publicRequests.push(request)
      return request.promise
    },
    fetchAdminImages: () => {
      const request = deferred()
      adminRequests.push(request)
      return request.promise
    },
  })
  t.after(harness.stop)

  assert.equal(publicRequests.length, 1)
  harness.isAdmin.value = true
  await flush()
  assert.equal(adminRequests.length, 1)

  publicRequests[0].resolve([makeImage(1, 'late-public')])
  await flush()
  assert.deepEqual(harness.management.shareImages.value, [])

  adminRequests[0].resolve([makeImage(2, 'admin')])
  await flush()
  assert.deepEqual(harness.management.shareImages.value, [makeImage(2, 'admin')])

  const pendingAdminReload = harness.management.loadProductShareImages()
  assert.equal(adminRequests.length, 2)
  harness.isAdmin.value = false
  await flush()
  assert.equal(publicRequests.length, 2)

  adminRequests[1].resolve([makeImage(3, 'late-admin')])
  await pendingAdminReload
  assert.deepEqual(harness.management.shareImages.value, [makeImage(2, 'admin')])

  publicRequests[1].resolve([makeImage(4, 'public')])
  await flush()
  assert.deepEqual(harness.management.shareImages.value, [makeImage(4, 'public')])

  harness.appId.value = 99
  await flush()
  assert.equal(publicRequests.length, 3)
  publicRequests[2].resolve([makeImage(5, 'next-app')])
  await flush()
  assert.deepEqual(harness.management.shareImages.value, [makeImage(5, 'next-app')])
})

test('shared busy blocks other mutations and deletion confirmation always clears pending state', async (t) => {
  const uploadRequest = deferred()
  let uploadCalls = 0
  let deleteCalls = 0
  let reorderCalls = 0
  const harness = createHarness({
    uploadImages: () => {
      uploadCalls += 1
      return uploadRequest.promise
    },
    deleteImage: () => {
      deleteCalls += 1
      return Promise.resolve()
    },
    reorderImages: () => {
      reorderCalls += 1
      return Promise.resolve([])
    },
  })
  t.after(harness.stop)
  await flush()

  const uploadPromise = harness.management.addShareImages([
    { type: 'image/png', size: 100, name: 'valid.png' },
  ])
  assert.equal(harness.management.shareImagesBusy.value, true)
  await harness.management.deleteShareImage(1)
  await harness.management.reorderShareImages([])
  assert.equal(deleteCalls, 0)
  assert.equal(reorderCalls, 0)
  uploadRequest.resolve([])
  await uploadPromise
  assert.equal(uploadCalls, 1)
  assert.equal(harness.management.shareImagesBusy.value, false)

  const cancelRequest = deferred()
  harness.setConfirmDelete(() => cancelRequest.promise)
  const cancelPromise = harness.management.deleteShareImage(1)
  assert.equal(harness.management.shareImageDeletingId.value, 1)
  assert.equal(harness.management.shareImagesBusy.value, true)
  await harness.management.addShareImages([
    { type: 'image/png', size: 100, name: 'blocked.png' },
  ])
  await harness.management.reorderShareImages([])
  assert.equal(uploadCalls, 1)
  assert.equal(reorderCalls, 0)
  cancelRequest.reject('cancel')
  await cancelPromise
  assert.equal(harness.management.shareImageDeletingId.value, null)
  assert.equal(harness.warnings.length, 0)

  harness.setConfirmDelete(() => Promise.reject('close'))
  await harness.management.deleteShareImage(1)
  assert.equal(harness.management.shareImageDeletingId.value, null)
  assert.equal(harness.warnings.length, 0)

  harness.setConfirmDelete(() => Promise.reject(new Error('confirm failed')))
  await harness.management.deleteShareImage(1)
  assert.equal(harness.management.shareImageDeletingId.value, null)
  assert.equal(harness.warnings.length, 1)
  assert.match(harness.warnings[0][0], /confirm/i)
  assert.equal(deleteCalls, 0)
})

test('ordinary users cannot mutate and invalid admin uploads never call the API', async (t) => {
  let uploadCalls = 0
  let deleteCalls = 0
  let reorderCalls = 0
  const harness = createHarness({
    isAdmin: false,
    fetchPublicImages: () => Promise.resolve([makeImage(1, 'public')]),
    uploadImages: () => {
      uploadCalls += 1
      return Promise.resolve([])
    },
    deleteImage: () => {
      deleteCalls += 1
      return Promise.resolve()
    },
    reorderImages: () => {
      reorderCalls += 1
      return Promise.resolve([])
    },
  })
  t.after(harness.stop)
  await flush()

  await harness.management.addShareImages([{ type: 'image/png', size: 1, name: 'public.png' }])
  await harness.management.deleteShareImage(1)
  await harness.management.reorderShareImages([1])
  assert.deepEqual([uploadCalls, deleteCalls, reorderCalls], [0, 0, 0])

  harness.isAdmin.value = true
  await flush()
  harness.management.shareImages.value = Array.from({ length: 8 }, (_, index) => makeImage(index + 1))
  await harness.management.addShareImages([{ type: 'image/png', size: 1, name: 'over-limit.png' }])
  harness.management.shareImages.value = []
  await harness.management.addShareImages([{ type: 'image/gif', size: 1, name: 'wrong.gif' }])
  await harness.management.addShareImages([
    { type: 'image/png', size: 10 * 1024 * 1024 + 1, name: 'large.png' },
  ])

  assert.equal(uploadCalls, 0)
  assert.equal(harness.messages.warning.length, 3)
  for (const message of harness.messages.warning) assert.match(message, /^[A-Z]/)
})

test('upload and delete API failures preserve the list without duplicate error toasts', async (t) => {
  const originalImages = [makeImage(1), makeImage(2)]
  const harness = createHarness({
    fetchAdminImages: () => Promise.resolve(originalImages),
    uploadImages: () => Promise.reject(new Error('upload failed')),
    deleteImage: () => Promise.reject(new Error('delete failed')),
  })
  t.after(harness.stop)
  await flush()

  await harness.management.addShareImages([
    { type: 'image/png', size: 100, name: 'valid.png' },
  ])
  assert.deepEqual(harness.management.shareImages.value, originalImages)
  assert.equal(harness.management.shareImagesUploading.value, false)

  await harness.management.deleteShareImage(1)

  assert.deepEqual(harness.management.shareImages.value, originalImages)
  assert.equal(harness.management.shareImageDeletingId.value, null)
  assert.equal(harness.messages.error.length, 0)
  assert.equal(harness.warnings.length, 2)
})

test('reorder failure rolls back, reloads admin truth, and ignores an older recovery response', async (t) => {
  const initialImages = [makeImage(1), makeImage(2), makeImage(3)]
  const recoveryReload = deferred()
  const newestReload = deferred()
  let adminFetchCalls = 0
  const harness = createHarness({
    fetchAdminImages: () => {
      adminFetchCalls += 1
      if (adminFetchCalls === 1) return Promise.resolve(initialImages)
      if (adminFetchCalls === 2) return recoveryReload.promise
      return newestReload.promise
    },
    reorderImages: () => Promise.reject(new Error('reorder failed')),
  })
  t.after(harness.stop)
  await flush()

  const reorderPromise = harness.management.reorderShareImages([3, 1, 2])
  assert.deepEqual(harness.management.shareImages.value, [
    initialImages[2],
    initialImages[0],
    initialImages[1],
  ])
  await flush()
  assert.deepEqual(harness.management.shareImages.value, initialImages)
  assert.equal(adminFetchCalls, 2)
  assert.equal(harness.management.shareImagesReordering.value, true)

  const latestReloadPromise = harness.management.loadProductShareImages()
  assert.equal(adminFetchCalls, 3)
  recoveryReload.resolve([makeImage(9, 'stale-recovery')])
  await reorderPromise
  assert.deepEqual(harness.management.shareImages.value, initialImages)

  const serverImages = [makeImage(3, 'server-three'), makeImage(2, 'server-two')]
  newestReload.resolve(serverImages)
  await latestReloadPromise
  assert.deepEqual(harness.management.shareImages.value, serverImages)
  assert.equal(harness.management.shareImagesReordering.value, false)
  assert.equal(harness.messages.error.length, 0)
  assert.equal(harness.warnings.length, 1)
})

test('failed reorder recovery reload preserves the rolled-back snapshot', async (t) => {
  const snapshot = [makeImage(1), makeImage(2), makeImage(3)]
  let adminFetchCalls = 0
  const harness = createHarness({
    fetchAdminImages: () => {
      adminFetchCalls += 1
      return adminFetchCalls === 1
        ? Promise.resolve(snapshot)
        : Promise.reject(new Error('recovery reload failed'))
    },
    reorderImages: () => Promise.reject(new Error('reorder failed')),
  })
  t.after(harness.stop)
  await flush()

  await harness.management.reorderShareImages([3, 1, 2])

  assert.equal(adminFetchCalls, 2)
  assert.deepEqual(harness.management.shareImages.value, snapshot)
  assert.equal(harness.management.shareImagesBusy.value, false)
  assert.equal(harness.management.shareImagesReordering.value, false)
  assert.equal(harness.messages.error.length, 0)
})

test('ordinary reload failure keeps the default clear-on-error behavior', async (t) => {
  let adminFetchCalls = 0
  const harness = createHarness({
    fetchAdminImages: () => {
      adminFetchCalls += 1
      return adminFetchCalls === 1
        ? Promise.resolve([makeImage(1)])
        : Promise.reject(new Error('ordinary reload failed'))
    },
  })
  t.after(harness.stop)
  await flush()
  assert.deepEqual(harness.management.shareImages.value, [makeImage(1)])

  await harness.management.loadProductShareImages()

  assert.deepEqual(harness.management.shareImages.value, [])
})
