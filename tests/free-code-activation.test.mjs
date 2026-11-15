import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function page({ activated = false, loggedIn = false, invalid = false } = {}) {
  const component = readFileSync(new URL('../src/views/shop/CodeInput.vue', import.meta.url), 'utf8')
  const source = component.split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import .*\n/gm, '')
  const routes = [], stored = [], calls = []
  const context = vm.createContext({
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), onMounted: () => {},
    useRouter: () => ({ push: value => routes.push(value) }), useRoute: () => ({ query: {} }),
    useShopOptionsStore: () => ({ setData: data => stored.push(data), setDiscountCode: () => {} }),
    useUserStore: () => ({ userInfo: loggedIn ? { id: 1 } : null }),
    useLocaleStore: () => ({ currentLocale: 'en' }), useI18n: () => ({ t: key => key }),
    addLocaleToPath: path => path, activationFeedback: () => ({}),
    checkPurchaseByToken: async code => { calls.push(['check', code]); return { isPurchase: activated } },
    purchaseByCode: async code => {
      calls.push(['purchase', code])
      if (invalid) throw { code: 400, msg: 'Invalid code' }
      return { activated, product: {}, bundles: [], request: {} }
    }, console,
  })
  vm.runInContext(ts.transpileModule(source + '\nglobalThis.page = { code, success, error, loading, handleContinue };', {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText, context)
  context.page.code.value = '012345'
  return { ...context.page, routes, stored, calls }
}

test('anonymous free code displays success and does not enter checkout', async () => {
  const view = page({ activated: true })
  await view.handleContinue()
  assert.equal(view.success.value, 'code.successDefault')
  assert.deepEqual(view.calls, [['purchase', '012345']])
  assert.equal(view.routes.length, 0)
  assert.equal(view.stored.length, 0)
  assert.equal(view.loading.value, false)
})

test('signed-in free activation stops after successful entitlement response', async () => {
  const view = page({ activated: true, loggedIn: true })
  await view.handleContinue()
  assert.equal(view.success.value, 'code.successDefault')
  assert.deepEqual(view.calls, [['check', '012345']])
  assert.equal(view.routes.length, 0)
})

test('paid code still opens purchase options', async () => {
  const view = page()
  await view.handleContinue()
  assert.equal(view.routes[0].path, '/purchase-options')
  assert.equal(view.stored.length, 1)
  assert.equal(view.success.value, '')
})

test('invalid code displays error without success or navigation', async () => {
  const view = page({ invalid: true })
  await view.handleContinue()
  assert.equal(view.error.value, 'Invalid code')
  assert.equal(view.success.value, '')
  assert.equal(view.routes.length, 0)
})
