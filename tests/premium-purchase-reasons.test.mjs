import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Premium copy focuses on lifetime access, thousands of apps, and future releases', async () => {
  const i18n = await read('../src/i18n.ts')

  assert.match(i18n, /Why Go Premium\?\\nOne-Time Purchase, Lifetime Access - Pay once and enjoy Wristo Premium forever\. No subscription fees\.\\nThousands of Premium Apps - Unlock thousands of premium apps with one upgrade\.\\nFuture Releases Included - New premium apps are automatically included at no extra cost\./)
  assert.doesNotMatch(i18n, /Upgrade to Premium and elevate your wrist experience\./)
})

test('PurchaseCard separates each Premium reason label from its explanation', async () => {
  const purchaseCard = await read('../src/components/PurchaseCard.vue')

  assert.match(purchaseCard, /description-reason-label/)
  assert.match(purchaseCard, /description-reason-separator/)
  assert.match(purchaseCard, /description-reason-detail/)
  assert.match(purchaseCard, /indexOf\(' - '\)/)
})
