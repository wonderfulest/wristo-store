import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import axios from 'axios'

test('shared HTTP client sends web activation source for activation and checkout', async () => {
  const source = readFileSync(new URL('../src/config/axios.ts', import.meta.url), 'utf8')
    .replace(/^import .*\n/gm, '').replace('export default instance', 'globalThis.client = instance')
  const context = vm.createContext({ axios, ElMessage: {}, BizErrorCode: {},
    useUserStore: () => ({}), useLocaleStore: () => ({ currentLocale: 'en' }),
    localStorage: { getItem: () => null }, console })
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  for (const url of ['/public/trials/v1/activate-purchase', '/public/trials/v1/check-purchase', '/public/purchase/cart/checkout']) {
    context.client.defaults.adapter = async config => {
      assert.equal(config.headers.get('X-Wristo-Activation-Platform'), 'WRISTO_IO')
      assert.equal(config.headers.get('X-Wristo-Mini-Program'), undefined)
      return { data: { data: true }, status: 200, statusText: 'OK', headers: {}, config }
    }
    assert.equal(await context.client.post(url, {}), true)
  }
})
