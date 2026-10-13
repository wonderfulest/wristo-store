import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function loadApi(path) {
  const calls = []
  const instance = Object.fromEntries(['get', 'post'].map(method => [method, (...args) => {
    calls.push(args)
    return Promise.resolve({})
  }]))
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  const exports = {}
  vm.runInNewContext(outputText, { exports, require: () => ({ default: instance }) })
  return { api: exports, calls }
}

test('detail, checkout and cart requests expand only their required associations', async () => {
  const { api, calls } = loadApi('../src/api/product.ts')
  await api.getProductDetail('123')
  await api.getProductDetail('123', 'payment')
  await api.getProductDetail('123', '')
  assert.deepEqual(calls.map(([, config]) => config.params.populate), ['image,devices,categories', 'payment', ''])
  assert.ok(calls.every(([url]) => url === '/public/products/app/123'))
})

test('admin page forwards populate as URL params without changing the input filters', async () => {
  const { api, calls } = loadApi('../src/api/product.ts')
  const query = { pageNum: 2, pageSize: 20, name: 'A&B', populate: 'image' }
  await api.fetchAdminProductPage(query)
  await api.fetchAdminProductPage({ pageNum: 1, pageSize: 20 })
  assert.equal(calls[0][0], '/admin/products/page')
  assert.equal(calls[0][1].name, 'A&B')
  assert.equal(calls[0][1].populate, undefined)
  assert.equal(calls[0][2].params.populate, 'image')
  assert.equal(query.populate, 'image')
  assert.equal(calls[1][2].params.populate, undefined)
})

test('bundle retains products and device filtering without expanding unrelated associations', async () => {
  const { api, calls } = loadApi('../src/api/bundle.ts')
  await api.getBundleById(42, { device: 7 })
  assert.equal(calls[0][1].params.populate, 'products')
  assert.equal(calls[0][1].params.device, 7)
})
