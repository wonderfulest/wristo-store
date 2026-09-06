import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { effectScope } from 'vue'

const compiled = await build({
  entryPoints: [new URL('../src/composables/useTagProducts.ts', import.meta.url).pathname],
  bundle: true, platform: 'node', format: 'esm', write: false,
  plugins: [{ name: 'vue', setup(builder) {
    builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }))
  } }],
})
const { useTagProducts } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`)
const page = (slug, pageNum = 1, ids = [1]) => ({
  pageNum, pageSize: 24, total: 50, pages: 3,
  list: ids.map(appId => ({ appId })), meta: { tag: { slug, name: slug } },
})
function harness(t) {
  const requests = []
  const scope = effectScope()
  const state = scope.run(() => useTagProducts((slug, sort, pageNum) => new Promise((resolve, reject) => {
    requests.push({ slug, sort, pageNum, resolve, reject })
  })))
  t.after(() => scope.stop())
  return { state, requests, scope }
}

test('switching tags or sorting ignores stale results and errors', async t => {
  const { state, requests } = harness(t)
  const old = state.reset('illustrated', 'popular')
  const latest = state.reset('minimal', 'latest', 2)
  requests[1].resolve(page('minimal', 2, [9]))
  await latest
  requests[0].reject({ code: 404 })
  await old
  assert.equal(state.tag.value.slug, 'minimal')
  assert.equal(state.currentPage.value, 2)
  assert.deepEqual(state.products.value.map(p => p.appId), [9])
  assert.equal(state.notFound.value, false)
  assert.equal(state.loading.value, false)
})

test('load more preserves results on error, retries the same page, and deduplicates', async t => {
  const { state, requests } = harness(t)
  const initial = state.reset('illustrated', 'popular')
  requests[0].resolve(page('illustrated', 1, [1, 2]))
  await initial
  const more = state.loadMore()
  state.loadMore()
  assert.equal(requests.length, 2)
  requests[1].reject(new Error('offline'))
  await more
  assert.equal(state.moreError.value, true)
  assert.equal(state.currentPage.value, 1)
  assert.equal(state.products.value.length, 2)
  const retry = state.loadMore()
  assert.equal(requests[2].pageNum, 2)
  requests[2].resolve(page('illustrated', 2, [2, 3, 3]))
  await retry
  assert.deepEqual(state.products.value.map(p => p.appId), [1, 2, 3])
  assert.equal(state.moreError.value, false)
})

test('reset clears old metadata and rejects a stale load-more response', async t => {
  const { state, requests } = harness(t)
  const initial = state.reset('illustrated', 'popular')
  requests[0].resolve(page('illustrated'))
  await initial
  const more = state.loadMore()
  const changed = state.reset('minimal', 'latest')
  assert.equal(state.tag.value, null)
  assert.equal(state.total.value, 0)
  assert.deepEqual(state.products.value, [])
  requests[1].resolve(page('illustrated', 2, [2]))
  await more
  assert.equal(state.loading.value, true)
  requests[2].resolve(page('minimal', 1, [5]))
  await changed
  assert.deepEqual(state.products.value.map(p => p.appId), [5])
})

test('missing tags differ from an empty valid tag and transient failures can retry', async t => {
  const { state, requests } = harness(t)
  let request = state.reset('missing', 'popular')
  requests[0].reject({ code: 404 })
  await request
  assert.equal(state.notFound.value, true)
  assert.equal(state.error.value, false)
  request = state.reset('empty', 'popular')
  requests[1].resolve({ ...page('empty', 1, []), total: 0, pages: 0 })
  await request
  assert.equal(state.notFound.value, false)
  assert.equal(state.tag.value.slug, 'empty')
  assert.equal(state.total.value, 0)
  request = state.reset('empty', 'latest')
  requests[2].reject(new Error('offline'))
  await request
  assert.equal(state.error.value, true)
  request = state.reset('empty', 'latest')
  requests[3].resolve(page('empty'))
  await request
  assert.equal(state.error.value, false)
})

test('unmounted page cannot commit a pending response', async t => {
  const { state, requests, scope } = harness(t)
  const pending = state.reset('illustrated', 'popular')
  scope.stop()
  requests[0].resolve(page('illustrated'))
  await pending
  assert.equal(state.tag.value, null)
})
