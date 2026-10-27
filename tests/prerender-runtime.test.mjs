import test from 'node:test'
import assert from 'node:assert/strict'
import { mapConcurrent, createResponseCache } from '../scripts/prerender-runtime.mjs'

test('bounded workers overlap jobs without losing results', async () => {
  let active = 0
  let peak = 0
  const result = await mapConcurrent([1, 2, 3, 4], 2, async value => {
    peak = Math.max(peak, ++active)
    await new Promise(resolve => setTimeout(resolve, 10))
    active--
    return value * 2
  })
  assert.equal(peak, 2)
  assert.deepEqual(result, [2, 4, 6, 8])
})

test('failed worker drains active jobs and rejects without starting more work', async () => {
  const started = []
  let finished = false
  await assert.rejects(mapConcurrent([1, 2, 3], 2, async value => {
    started.push(value)
    if (value === 1) throw new Error('broken page')
    await new Promise(resolve => setTimeout(resolve, 10))
    finished = true
  }), /broken page/)
  assert.deepEqual(started, [1, 2])
  assert.equal(finished, true)
})

test('cache deduplicates in-flight responses and separates language keys', async () => {
  const cached = createResponseCache()
  let requests = 0
  const fetchResponse = async () => { requests++; return { status: 200, body: '{"code":0,"data":[]}' } }
  await Promise.all([cached('en:/categories', fetchResponse), cached('en:/categories', fetchResponse)])
  await cached('en:/categories', fetchResponse)
  await cached('zh:/categories', fetchResponse)
  assert.equal(requests, 2)
})

test('failed HTTP, business and network responses never poison retries', async () => {
  for (const response of [{ status: 502, body: '{}' }, { status: 200, body: '{"code":500}' }]) {
    const cached = createResponseCache()
    await cached('key', async () => response)
    assert.equal((await cached('key', async () => ({ status: 200, body: '{"code":0}' }))).body, '{"code":0}')
  }
  const cached = createResponseCache()
  await assert.rejects(cached('key', async () => { throw new Error('offline') }))
  assert.equal((await cached('key', async () => ({ status: 200, body: '{}' }))).status, 200)
})
