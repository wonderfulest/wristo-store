import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import * as vue from 'vue'
const source = await readFile(new URL('../src/components/discovery/useDiscovery.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
function setup({ preferences = [], batches = [[{ appId: 3 }, { appId: 4 }]], account = 1, detailLoader } = {}) {
  const user = vue.reactive({ userInfo: account ? { id: account } : null })
  const requests = [], saves = [], details = []
  const deps = {
    vue,
    '@/store/user': { useUserStore: () => user },
    '@/api/discovery': { getDiscoveryRecommendations: async body => { requests.push(body); const batch = batches.shift() ?? []; return typeof batch === 'function' ? batch() : batch } },
    '@/api/product-preferences': { getProductPreferences: async () => preferences, setProductPreference: async (...args) => { saves.push(args) } },
    '@/api/product': { getProductDetail: async id => { details.push(id); return detailLoader ? detailLoader(id) : { appId: Number(id) } } },
  }
  const exports = {}
  new Function('require', 'exports', compiled)(name => deps[name], exports)
  const device = vue.ref(10)
  const state = exports.useDiscovery(device)
  return { state, device, user, requests, saves, details }
}
test('uses positive likes only as seeds and excludes both preferences; no eager details', async () => {
  const h = setup({ preferences: [{ appId: 1, preference: 'like' }, { appId: 2, preference: 'dislike' }] })
  await h.state.load()
  assert.deepEqual(h.requests[0].likedAppIds, [1])
  assert.deepEqual([...h.requests[0].excludedAppIds].sort(), [1, 2])
  assert.equal(h.state.likeCount.value, 1)
  assert.equal(h.details.length, 0)
  await h.state.loadLikes()
  assert.deepEqual(h.details, ['1'])
})
test('skip stays local, dislike advances, like refreshes and undo restores saved state', async () => {
  const h = setup({ batches: [[{ appId: 3 }, { appId: 4 }, { appId: 5 }], [{ appId: 6 }]] })
  await h.state.load()
  await h.state.choose(null)
  assert.equal(h.saves.length, 0)
  await h.state.choose('dislike')
  assert.equal(h.requests.length, 1)
  await h.state.choose('like')
  assert.deepEqual(h.requests[1].likedAppIds, [5])
  assert.ok(h.requests[1].excludedAppIds.includes(3))
  assert.equal(h.state.current.value.appId, 6)
  await h.state.undo()
  assert.deepEqual(h.saves.at(-1), [5, null])
  assert.equal(h.state.current.value.appId, 5)
  assert.equal(h.state.likeCount.value, 0)
})
test('undo invalidates in-flight recommendation responses', async () => {
  let resolve
  const pending = new Promise(r => { resolve = r })
  const h = setup({ batches: [[{ appId: 3 }], () => pending] })
  await h.state.load()
  const choosing = h.state.choose('like')
  await new Promise(r => setImmediate(r))
  await h.state.undo()
  resolve([{ appId: 99 }])
  await choosing
  assert.equal(h.state.current.value.appId, 3)
})
test('guest and invalid device make no requests; changing account discards old responses', async () => {
  const guest = setup({ account: null })
  await guest.state.load()
  assert.equal(guest.requests.length, 0)
  const invalid = setup()
  invalid.device.value = 0
  await invalid.state.load()
  assert.equal(invalid.requests.length, 0)
  let resolve
  const h = setup({ batches: [() => new Promise(r => { resolve = r })] })
  const loading = h.state.load()
  await new Promise(r => setImmediate(r))
  h.user.userInfo = { id: 2 }
  resolve([{ appId: 99 }])
  await loading
  assert.equal(h.state.current.value, undefined)
  assert.equal(h.state.loaded.value, false)
})
test('caps seed and exclusion sizes and bounds filtered-empty retries', async () => {
  const preferences = Array.from({ length: 1200 }, (_, i) => ({ appId: i + 1, preference: 'like' }))
  const h = setup({ preferences, batches: [[{ appId: 1 }], [{ appId: 2 }], [{ appId: 3 }]] })
  await h.state.load()
  assert.equal(h.requests.length, 3)
  assert.ok(h.requests.every(r => r.likedAppIds.length === 200 && r.excludedAppIds.length === 1000))
  await h.state.loadLikes()
  assert.equal(h.details.length, 12)
  assert.equal(h.state.likeCount.value, 1200)
  assert.equal(h.state.hasMoreLikes.value, true)
})

test('undo discards cards generated with the undone like and recomputes after the next choice', async () => {
  const h = setup({ batches: [[{ appId: 3 }], [{ appId: 6 }, { appId: 7 }], [{ appId: 8 }]] })
  await h.state.load()
  await h.state.choose('like')
  await h.state.undo()
  assert.deepEqual(h.state.round.value.map(product => product.appId), [3])
  await h.state.choose(null)
  assert.equal(h.requests.length, 3)
  assert.deepEqual(h.requests[2].likedAppIds, [])
  assert.equal(h.state.current.value.appId, 8)
})
test('failed liked details can be retried explicitly without repeating successful details', async () => {
  let failed = true
  const h = setup({ preferences: [{ appId: 1, preference: 'like' }, { appId: 2, preference: 'like' }],
    detailLoader: async id => { if (id === '1' && failed) throw new Error('temporary failure'); return { appId: Number(id) } } })
  await h.state.load()
  await h.state.loadLikes()
  assert.equal(h.state.hasMoreLikes.value, true)
  failed = false
  await h.state.loadLikes()
  assert.deepEqual(h.details, ['1', '2', '1'])
  assert.equal(h.state.liked.value.length, 2)
  assert.equal(h.state.hasMoreLikes.value, false)
})
