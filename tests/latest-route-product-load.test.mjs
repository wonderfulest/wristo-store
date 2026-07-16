import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'

import { build } from 'esbuild'
import { computed, effectScope, nextTick, ref, watch } from 'vue'

const composablePath = new URL(
  '../src/composables/useLatestRouteProductLoad.ts',
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
  plugins: [
    {
      name: 'latest-route-product-load-vue',
      setup(esbuild) {
        esbuild.onResolve({ filter: /^vue$/ }, () => ({
          path: vueModuleUrl,
          external: true,
        }))
      },
    },
  ],
})
const moduleUrl =
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
const { useLatestRouteProductLoad } = await import(moduleUrl)

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

const createHarness = () => {
  const routeId = ref('1')
  const product = ref(null)
  const downstreamValue = ref(null)
  const fetchRequests = []
  const downstreamRequests = []
  let resetCount = 0
  const scope = effectScope()
  let loader

  scope.run(() => {
    loader = useLatestRouteProductLoad({
      resetState: () => {
        resetCount += 1
        product.value = null
        downstreamValue.value = null
      },
      fetchProduct: (requestedRouteId) => {
        const request = deferred()
        fetchRequests.push({ routeId: requestedRouteId, request })
        return request.promise
      },
      commitProduct: (nextProduct) => {
        product.value = nextProduct
      },
      getCurrentAppId: () => product.value?.appId ?? null,
      loadDownstream: async (context) => {
        const request = deferred()
        downstreamRequests.push({ context, request })
        const value = await request.promise
        context.commit(() => {
          downstreamValue.value = value
        })
      },
      handleMissing: () => Promise.resolve(),
      logWarning: () => {},
    })
    watch(
      () => routeId.value,
      (nextRouteId) => {
        void loader.loadRouteProduct(nextRouteId)
      },
      { immediate: true, flush: 'sync' },
    )
  })

  return {
    routeId,
    product,
    downstreamValue,
    fetchRequests,
    downstreamRequests,
    loader,
    shareManagementAppId: computed(() => product.value?.appId ?? null),
    get resetCount() {
      return resetCount
    },
    stop: () => scope.stop(),
  }
}

test('a newer route detail response wins and a late older response cannot start downstream work', async (t) => {
  const harness = createHarness()
  t.after(harness.stop)

  assert.equal(harness.fetchRequests[0].routeId, '1')
  assert.equal(harness.loader.productDetailLoading.value, true)
  harness.routeId.value = '2'
  assert.equal(harness.fetchRequests[1].routeId, '2')
  assert.equal(harness.product.value, null)
  assert.equal(harness.loader.productDetailLoading.value, true)

  harness.fetchRequests[1].request.resolve({ appId: 2, name: 'Product 2' })
  await flush()
  assert.deepEqual(harness.product.value, { appId: 2, name: 'Product 2' })
  assert.equal(harness.downstreamRequests.length, 1)
  harness.downstreamRequests[0].request.resolve('downstream-2')
  await flush()
  assert.equal(harness.downstreamValue.value, 'downstream-2')
  assert.equal(harness.loader.productDetailLoading.value, false)

  harness.fetchRequests[0].request.resolve({ appId: 1, name: 'Late product 1' })
  await flush()
  assert.deepEqual(harness.product.value, { appId: 2, name: 'Product 2' })
  assert.equal(harness.downstreamRequests.length, 1)
  assert.equal(harness.shareManagementAppId.value, 2)
})

test('route reuse clears committed product immediately and stale downstream commits are ignored', async (t) => {
  const harness = createHarness()
  t.after(harness.stop)

  harness.fetchRequests[0].request.resolve({ appId: 1, name: 'Product 1' })
  await flush()
  assert.deepEqual(harness.product.value, { appId: 1, name: 'Product 1' })
  assert.equal(harness.downstreamRequests.length, 1)

  harness.routeId.value = '2'
  assert.equal(harness.product.value, null)
  assert.equal(harness.downstreamValue.value, null)
  assert.equal(harness.loader.productDetailLoading.value, true)
  assert.equal(harness.resetCount, 2)

  harness.fetchRequests[1].request.resolve({ appId: 2, name: 'Product 2' })
  await flush()
  assert.deepEqual(harness.product.value, { appId: 2, name: 'Product 2' })
  assert.equal(harness.downstreamRequests.length, 2)

  harness.downstreamRequests[0].request.resolve('late-downstream-1')
  await flush()
  assert.equal(harness.downstreamValue.value, null)
  assert.equal(harness.loader.productDetailLoading.value, true)

  harness.downstreamRequests[1].request.resolve('downstream-2')
  await flush()
  assert.equal(harness.downstreamValue.value, 'downstream-2')
  assert.equal(harness.loader.productDetailLoading.value, false)
  assert.equal(harness.shareManagementAppId.value, 2)
})
