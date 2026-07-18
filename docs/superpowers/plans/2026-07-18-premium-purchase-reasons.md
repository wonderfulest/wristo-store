# Premium Purchase Reasons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long Premium sales copy with three concise lifetime-access reasons and visually distinguish each reason label from its explanation.

**Architecture:** Keep `purchase.premiumBundleDesc` as the shared source for Purchase Options and Checkout. Parse each rendered description line inside `PurchaseCard.vue` into a heading, a label/explanation pair split at the first ` - `, or a backward-compatible plain line; style the resulting spans without changing purchase or API behavior.

**Tech Stack:** Vue 3, TypeScript, Vite, CSS, Node.js built-in test runner.

---

### Task 1: Lock the Premium copy and rendering contract with a failing test

**Files:**
- Create: `tests/premium-purchase-reasons.test.mjs`
- Reference: `src/i18n.ts`
- Reference: `src/components/PurchaseCard.vue`

- [ ] **Step 1: Write the failing source-contract test**

Create a Node test that reads both source files and asserts the exact English copy, the absence of the old closing slogan, and the presence of structured reason spans:

```js
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
```

- [ ] **Step 2: Run the test and verify the new contract fails**

Run: `node --test tests/premium-purchase-reasons.test.mjs`

Expected: both tests fail because the old copy and unstructured paragraph rendering are still present.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/premium-purchase-reasons.test.mjs
git commit -m "test premium purchase reasons"
```

### Task 2: Replace the Premium descriptions in every supported locale

**Files:**
- Modify: `src/i18n.ts`
- Test: `tests/premium-purchase-reasons.test.mjs`

- [ ] **Step 1: Replace the English translation with the approved text**

Set `purchase.premiumBundleDesc` to exactly:

```ts
'purchase.premiumBundleDesc': 'Why Go Premium?\nOne-Time Purchase, Lifetime Access - Pay once and enjoy Wristo Premium forever. No subscription fees.\nThousands of Premium Apps - Unlock thousands of premium apps with one upgrade.\nFuture Releases Included - New premium apps are automatically included at no extra cost.',
```

- [ ] **Step 2: Synchronize the existing translated values**

For every other `purchase.premiumBundleDesc` entry in `src/i18n.ts`, preserve the locale's heading and reduce the body to the same three semantic lines: one-time purchase/lifetime access/no subscription, thousands of Premium apps, and future Premium releases at no extra cost. Keep ` - ` as the exact label/detail separator in every locale so rendering remains deterministic.

- [ ] **Step 3: Run the copy contract test**

Run: `node --test tests/premium-purchase-reasons.test.mjs`

Expected: the copy test passes; the structured-rendering test still fails.

- [ ] **Step 4: Commit the localized copy**

```bash
git add src/i18n.ts
git commit -m "simplify premium purchase reasons"
```

### Task 3: Render reason labels and explanations with distinct emphasis

**Files:**
- Modify: `src/components/PurchaseCard.vue:72-79`
- Modify: `src/components/PurchaseCard.vue:186-194`
- Modify: `src/components/PurchaseCard.vue:782-813`
- Test: `tests/premium-purchase-reasons.test.mjs`

- [ ] **Step 1: Change the description template to render structured spans**

Replace the paragraph contents with:

```vue
<p
  v-for="(line, index) in descriptionLines"
  :key="`${line.text}-${index}`"
  :class="{ 'description-heading': line.kind === 'heading' }"
>
  <template v-if="line.kind === 'reason'">
    <span class="description-reason-label">{{ line.label }}</span>
    <span class="description-reason-separator" aria-hidden="true">—</span>
    <span class="description-reason-detail">{{ line.detail }}</span>
  </template>
  <template v-else>{{ line.text }}</template>
</p>
```

- [ ] **Step 2: Parse only the first separator and preserve fallback lines**

Replace `descriptionLines` with:

```ts
const descriptionLines = computed(() => {
  if (!props.description) return []

  return props.description
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n+/)
    .map(line => stripLeadingDisplayMarks(line))
    .filter(Boolean)
    .map((text, index) => {
      if (index === 0) return { kind: 'heading' as const, text }

      const separatorIndex = text.indexOf(' - ')
      if (separatorIndex < 0) return { kind: 'plain' as const, text }

      return {
        kind: 'reason' as const,
        text,
        label: text.slice(0, separatorIndex).trim(),
        detail: text.slice(separatorIndex + 3).trim(),
      }
    })
})
```

- [ ] **Step 3: Add the visual hierarchy styles**

Add:

```css
.description-reason-label {
  color: #171717;
  font-weight: 750;
}

.description-reason-separator {
  margin: 0 0.45em;
  color: rgba(87, 83, 78, 0.48);
}

.description-reason-detail {
  color: #57534e;
  font-weight: 400;
}
```

Keep the paragraph flow inline so the explanation wraps naturally on narrow screens.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/premium-purchase-reasons.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 5: Run existing storefront contract tests**

Run: `node --test tests/storefront-visual-system.test.mjs tests/final-review-fixes.test.mjs`

Expected: all tests pass.

- [ ] **Step 6: Commit the structured rendering**

```bash
git add src/components/PurchaseCard.vue tests/premium-purchase-reasons.test.mjs
git commit -m "emphasize premium purchase reasons"
```

### Task 4: Verify the production build and final scope

**Files:**
- Verify: `src/i18n.ts`
- Verify: `src/components/PurchaseCard.vue`
- Verify: `tests/premium-purchase-reasons.test.mjs`

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: TypeScript, Vite production build, and SEO prerender finish successfully.

- [ ] **Step 2: Check formatting and repository scope**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and no unrelated files changed.

- [ ] **Step 3: Review the final diff**

Run: `git log --oneline -4 && git show --stat --oneline HEAD`

Expected: focused commits cover the approved spec, plan, tests, copy, and PurchaseCard presentation only.
