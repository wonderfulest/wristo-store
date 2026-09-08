import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/api/purchase.ts', import.meta.url), 'utf8')
const fn = source.slice(source.indexOf('export const requireCheckoutAdmission')).replace('export ', '')
const script = ts.transpileModule(fn, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
function admission(post) {
  const context = vm.createContext({ instance: { post } })
  vm.runInContext(`${script}\nthis.admit = requireCheckoutAdmission`, context)
  return context.admit
}
test('checkout admission waits for explicit true before opening', async () => {
  let resolve, called = false
  const admit = admission(path => { assert.equal(path, '/public/purchase/checkout/admission'); return new Promise(r => { resolve = r }) })
  const checkout = async () => { await admit(); called = true }
  const pending = checkout()
  assert.equal(called, false)
  resolve(true); await pending; assert.equal(called, true)
})
test('HTTP rejection or invalid response blocks checkout', async () => {
  for (const value of [false, undefined, null, 'true']) {
    let opened = false
    await assert.rejects(async () => { await admission(async () => value)(); opened = true })
    assert.equal(opened, false)
  }
  const paused = Object.assign(new Error('Paused'), { response: { status: 503 } })
  await assert.rejects(admission(async () => { throw paused }), error => error === paused)
})
test('every direct Paddle checkout opener awaits admission', () => {
  for (const path of ['views/StudioMembership.vue', 'views/shop/CheckoutSubscription.vue', 'views/shop/Checkout.vue', 'composables/useCartCheckout.ts']) {
    const content = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')
    const gate = content.lastIndexOf('await requireCheckoutAdmission()')
    const open = content.indexOf('Paddle.Checkout.open(')
    assert.ok(gate > -1 && gate < open, `${path}: admission must precede open`)
  }
})

test('paused checkout exits locally and clears loading before SDK error handling', async () => {
  for (const path of ['views/StudioMembership.vue', 'views/shop/CheckoutSubscription.vue', 'views/shop/Checkout.vue', 'composables/useCartCheckout.ts']) {
    const content = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')
    const block = content.match(/try \{\s*await requireCheckoutAdmission\(\)\s*\} catch(?: \(error\))? \{[\s\S]*?\n\s*\}/)?.[0]
    assert.ok(block, `${path}: isolated admission error handler`)
    const context = vm.createContext({ requireCheckoutAdmission: async () => { throw Error('503') }, loading: { value: true }, loadingPlanCode: { value: 'plan' }, activeCheckout: {}, opened: false })
    await vm.runInContext(`(async () => { ${block}; opened = true })()`, context)
    assert.equal(context.opened, false, path)
    if (path.includes('StudioMembership')) assert.equal(context.loadingPlanCode.value, null)
    else assert.equal(context.loading.value, false)
    if (path.includes('useCartCheckout')) assert.equal(context.activeCheckout, null)
  }
})
