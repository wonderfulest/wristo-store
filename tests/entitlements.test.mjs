import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  hasActiveSubscription,
  hasBundleStoreEntryAccess,
  hasPremiumEntitlement,
} from '../src/utils/entitlements.ts'

const now = new Date('2026-07-18T00:00:00.000Z')

test('an unexpired membership grants Store premium entitlement without a bundle purchase', () => {
  const userInfo = {
    subscription: {
      endTime: '2026-08-18T00:00:00.000Z',
    },
    userProfile: {
      hasBundle: 0,
    },
  }

  assert.equal(hasActiveSubscription(userInfo, now), true)
  assert.equal(hasPremiumEntitlement(userInfo, now), true)
})

test('an expired membership without a bundle does not grant Store premium entitlement', () => {
  const userInfo = {
    subscription: {
      endTime: '2026-06-18T00:00:00.000Z',
    },
    userProfile: {
      hasBundle: 0,
    },
  }

  assert.equal(hasActiveSubscription(userInfo, now), false)
  assert.equal(hasPremiumEntitlement(userInfo, now), false)
})

test('an active bundle remains a Store premium entitlement without a membership', () => {
  const userInfo = {
    userProfile: {
      hasBundle: 1,
    },
  }

  assert.equal(hasPremiumEntitlement(userInfo, now), true)
})

test('Store Studio and FAQ entries require an active bundle specifically', () => {
  assert.equal(hasBundleStoreEntryAccess({ userProfile: { hasBundle: 1 } }), true)
  assert.equal(
    hasBundleStoreEntryAccess({
      subscription: { endTime: '2026-08-18T00:00:00.000Z' },
      userProfile: { hasBundle: 0 },
    }),
    false,
  )
  assert.equal(hasBundleStoreEntryAccess({ userProfile: { hasBundle: 0 } }), false)
  assert.equal(hasBundleStoreEntryAccess(null), false)
})

test('all Store bundle purchase surfaces use the shared premium entitlement', async () => {
  const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')
  const [premiumCard, purchaseOptions, productCard, productDetail] = await Promise.all([
    read('../src/components/PremiumSuiteCard.vue'),
    read('../src/views/shop/PurchaseOptions.vue'),
    read('../src/components/ProductCard.vue'),
    read('../src/views/products/ProductDetail.vue'),
  ])

  assert.match(premiumCard, /hasPremiumEntitlement/)
  assert.match(purchaseOptions, /hasPremiumEntitlement/)
  assert.match(productCard, /hasPremiumEntitlement/)
  assert.match(productDetail, /hasPremiumEntitlement/)
})
