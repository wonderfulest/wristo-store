import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const fixture = (name = 'checkout.completed') => ({ name, data: {
  id: 'che_test', transaction_id: 'txn_test', currency_code: 'USD',
  customer: { email: 'private@example.com' }, custom_data: { email: 'private@example.com' },
  totals: { total: 21.6, tax: 3.6, subtotal: 20, discount: 2 },
  items: [{ price_id: 'pri_face', product: { id: 'pro_face', name: 'Watch Face' }, quantity: 2,
    totals: { total: 21.6, tax: 3.6, subtotal: 20, discount: 2 } }],
} })
function harness(storage = new Map(), gtag) {
  const calls = []
  const path = new URL('../src/utils/paddleAnalytics.ts', import.meta.url)
  const source = existsSync(path) ? readFileSync(path, 'utf8') : 'export async function trackPaddleEvent() {}'
  const context = vm.createContext({ exports: {}, setTimeout, clearTimeout, console,
    window: { gtag: gtag ?? ((...args) => { calls.push(args); args[2]?.event_callback?.() }),
      localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v) } } })
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context)
  return { track: context.exports.trackPaddleEvent, calls, context }
}
test('completed checkout sends discounted tax-exclusive purchase with no personal data', async () => {
  const h = harness(); await h.track(fixture())
  assert.equal(h.calls.length, 1)
  const [command, name, p] = h.calls[0]
  assert.equal(command, 'event'); assert.equal(name, 'purchase')
  assert.equal(p.transaction_id, 'txn_test'); assert.equal(p.currency, 'USD')
  assert.equal(p.value, 18); assert.equal(p.tax, 3.6)
  assert.equal(p.items[0].price, 9); assert.equal(p.items[0].quantity, 2)
  assert.ok(!JSON.stringify(p).includes('private@example.com'))
})
test('loaded checkout sends begin only once, updates/closed/errors never imply purchase', async () => {
  const h = harness()
  for (const name of ['checkout.loaded','checkout.loaded','checkout.updated','checkout.closed','checkout.error']) await h.track(fixture(name))
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0][1], 'begin_checkout')
})
test('purchase deduplicates concurrent callbacks and reloads but allows another transaction', async () => {
  const storage = new Map(); const h = harness(storage)
  await Promise.all([h.track(fixture()), h.track(fixture())])
  assert.equal(h.calls.length, 1)
  const next = harness(storage); await next.track(fixture()); assert.equal(next.calls.length, 0)
  const other = fixture(); other.data.transaction_id = 'txn_other'; await next.track(other)
  assert.equal(next.calls.length, 1)
})
test('invalid payloads do not invent revenue or a transaction ID', async () => {
  const h = harness()
  for (const mutate of [d => delete d.transaction_id, d => delete d.currency_code,
    d => d.items = [], d => d.totals.total = NaN, d => d.items[0].quantity = 0]) {
    const e = fixture(); mutate(e.data); await h.track(e)
  }
  assert.equal(h.calls.length, 0)
})
test('missing or throwing GA and unavailable storage do not break checkout', async () => {
  const h = harness(); h.context.window.gtag = undefined; await h.track(fixture())
  h.context.window.gtag = () => { throw Error('blocked') }; await h.track(fixture())
  h.context.window.localStorage = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
  h.context.window.gtag = (...args) => { h.calls.push(args); args[2].event_callback?.() }
  await h.track(fixture()); assert.equal(h.calls.length, 1)
})
test('purchase waits for GA callback, with a bounded fallback for blocked transport', async () => {
  let params; const h = harness(new Map(), (...args) => { params = args[2] })
  let done = false; const p = h.track(fixture()).then(() => { done = true })
  await Promise.resolve(); assert.equal(done, false)
  assert.equal(typeof params.event_callback, 'function'); params.event_callback(); await p
  const blocked = harness(new Map(), () => {}); await blocked.track(fixture())
})
test('multi-item cart and zero-decimal currency preserve Paddle.js major units', async () => {
  const h = harness(); const e = fixture()
  e.data.currency_code = 'JPY'
  e.data.items = [
    {price_id:'pri_a',quantity:2,totals:{total:2200,tax:200}},
    {price_id:'pri_b',quantity:1,totals:{total:550,tax:50}},
  ]
  e.data.totals = {total:2750,tax:250}
  await h.track(e)
  const p = h.calls[0][2]
  assert.equal(p.value,2500); assert.equal(p.items[0].price,1000); assert.equal(p.items[1].price,500)
})
test('fully discounted purchase records zero revenue rather than falling back to list price', async () => {
  const h = harness(); const e = fixture()
  e.data.totals = {total:0,tax:0}; e.data.items[0].totals = {total:0,tax:0}
  await h.track(e); assert.equal(h.calls[0][2].value,0); assert.equal(h.calls[0][2].items[0].price,0)
})
test('both Paddle initialization paths await analytics before business callbacks', async () => {
  for (const path of ['utils/paddle.ts','views/StudioMembership.vue']) {
    const source = readFileSync(new URL(`../src/${path}`, import.meta.url),'utf8')
    const callback = source.match(/eventCallback: async \(event: any\) => \{[\s\S]*?\n    \}/)?.[0]
    assert.ok(callback, path)
    let release; const sequence = []
    const context = vm.createContext({ trackPaddleEvent: () => new Promise(r => {release=r}),
      eventCallback: e => sequence.push(e.name), handlePaddleEvent: e => sequence.push(e.name) })
    const expression = callback.replace('eventCallback: ', '')
    const js = ts.transpileModule(`const callback = ${expression}; globalThis.callback = callback`, {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInContext(js,context)
    const pending = context.callback(fixture()); assert.equal(sequence.length,0)
    release(); await pending; assert.deepEqual(sequence,['checkout.completed'])
  }
})
