import test from 'node:test'
import assert from 'node:assert/strict'
import { activationFeedback } from '../src/utils/activationFeedback.ts'

test('quota failures use translated messages and link to activation records', () => {
  assert.deepEqual(activationFeedback({ reason: 'SINGLE_DEVICE_LIMIT', message: 'server' }), { key: 'activation.singleDeviceLimit', manage: true })
  assert.deepEqual(activationFeedback({ code: 40950, msg: 'server' }), { key: 'activation.bundleDeviceLimit', manage: true })
})
test('missing purchases and unexpected errors retain meaningful feedback without a quota link', () => {
  assert.deepEqual(activationFeedback({ reason: 'PURCHASE_NOT_FOUND' }), { key: 'activation.errorNotFound', manage: false })
  assert.deepEqual(activationFeedback({ msg: 'Service unavailable' }), { message: 'Service unavailable', manage: false })
  assert.deepEqual(activationFeedback(null), { key: 'activation.errorNetwork', manage: false })
})
