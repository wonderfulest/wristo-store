import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const source = fs.readFileSync(new URL('../src/utils/paddle.ts', import.meta.url), 'utf8')
  .replace("import { trackPaddleEvent } from './paddleAnalytics'", 'const trackPaddleEvent = async () => {}')
  .replaceAll('import.meta.env.VITE_WRISTO_PADDLE_CLIENT_TOKEN', "'test_token'")
  .replaceAll('import.meta.env.VITE_WRISTO_PADDLE_ENVIRONMENT', "'sandbox'")
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const context = { exports: {} }; vm.runInNewContext(code, context)
test('reopening checkout updates the callback without reinitializing Paddle', async () => {
  let initializations = 0, updates = 0, called = 0, callback
  const paddle = { Initialized: false, Environment: { set() {} }, Initialize(options) { assert.equal(this.Initialized, false); this.Initialized = true; initializations++; callback = options.eventCallback }, Update(options) { updates++; callback = options.eventCallback } }
  context.exports.initializePaddle(paddle, async () => { called += 1 })
  context.exports.initializePaddle(paddle, async () => { called += 10 })
  await callback({ name: 'checkout.completed' })
  assert.equal(initializations, 1); assert.equal(updates, 1); assert.equal(called, 10)
})
