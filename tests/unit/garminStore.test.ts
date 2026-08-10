import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveGarminStoreOpenMode } from '../../src/utils/garminStore.ts'

test('requires confirmation on a narrow touch device', () => {
  assert.equal(
    resolveGarminStoreOpenMode({
      viewportWidth: 390,
      maxTouchPoints: 5,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile',
    }),
    'confirm',
  )
})

test('keeps the Garmin bridge flow on desktop', () => {
  assert.equal(
    resolveGarminStoreOpenMode({
      viewportWidth: 1440,
      maxTouchPoints: 0,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    }),
    'bridge',
  )
})

test('requires confirmation in a narrow responsive viewport without touch metadata', () => {
  assert.equal(
    resolveGarminStoreOpenMode({
      viewportWidth: 767,
      maxTouchPoints: 0,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    }),
    'confirm',
  )
})

test('treats a touch tablet as mobile even with a wider viewport', () => {
  assert.equal(
    resolveGarminStoreOpenMode({
      viewportWidth: 820,
      maxTouchPoints: 5,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    }),
    'confirm',
  )
})
