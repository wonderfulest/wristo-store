import assert from 'node:assert/strict'
import test from 'node:test'
import { hasActiveBundle, hasBundleStoreEntryAccess, hasPremiumEntitlement } from '../src/utils/entitlements.ts'

for (const lifetime of [true, false]) {
  test(`API Premium grants access without legacy fields (lifetime=${lifetime})`, () => {
    const user = { premium: { active: true, lifetime, expiresAt: lifetime ? null : '2026-11-30T00:00:00Z' } }
    assert.equal(hasPremiumEntitlement(user), true)
    assert.equal(hasActiveBundle(user), true)
    assert.equal(hasBundleStoreEntryAccess(user), true)
  })
}
test('legacy bundles and subscriptions cannot override missing or revoked Premium', () => {
  for (const premium of [undefined, null, { active: false, lifetime: false, expiresAt: null }]) {
    const user = { premium, userProfile: { hasBundle: 1 }, subscription: { planCode: 'lifetime', endTime: null } }
    assert.equal(hasPremiumEntitlement(user), false)
    assert.equal(hasBundleStoreEntryAccess(user), false)
  }
  assert.equal(hasPremiumEntitlement(null), false)
})
test('administrators and merchants can enter Studio without gaining paid Store rights', () => {
  for (const roleCode of ['ROLE_ADMIN', 'ROLE_MERCHANT']) {
    const user = { roles: [{ roleCode }] }
    assert.equal(hasBundleStoreEntryAccess(user), true)
    assert.equal(hasPremiumEntitlement(user), false)
  }
})
