# Store Role-Aware Count Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every visible app-count and download-count value in `wristo-store` is exact only for `ROLE_ADMIN` and fuzzy for every other identity.

**Architecture:** Add pure role-aware formatter functions beside the existing count formatters, then expose them through a Pinia-aware `useCountDisplay()` composable. Migrate count-rendering components to the composable so role checks and formatting policy have one source of truth, while admin-only management panels remain exact because they are not visible to non-admins.

**Tech Stack:** Vue 3 Composition API, TypeScript, Pinia, Node.js test runner, Vue SFC source assertions.

## Global Constraints

- Only users with `ROLE_ADMIN` may see exact app counts or download counts.
- Guests, ordinary users, merchants, and every other role must see fuzzy counts.
- Bundle and subscription app counts are included in the fuzzy-display rule.
- Existing fuzzy thresholds in `src/utils/downloadCount.ts` must not change.
- Ratings, prices, page numbers, pagination totals used only for control flow, and other non-app/download values must not change.
- API responses and database values must not change.
- Existing unrelated changes in `scripts/prerender-seo.mjs` and `tests/prerender-route-priority.test.mjs` must remain untouched.

---

### Task 1: Create the shared role-aware count policy

**Files:**
- Modify: `src/utils/downloadCount.ts`
- Create: `src/composables/useCountDisplay.ts`
- Create: `tests/role-aware-count-display.test.mjs`

**Interfaces:**
- Consumes: `formatExactCount`, `formatApproxAppCount`, and `formatApproxDownloadCount` from `src/utils/downloadCount.ts`; `useUserStore()` from `src/store/user.ts`.
- Produces: `formatRoleAwareAppCount(value: number | null | undefined, isAdmin: boolean): string`, `formatRoleAwareDownloadCount(value: number | null | undefined, isAdmin: boolean): string`, and `useCountDisplay(): { isAdmin: ComputedRef<boolean>; formatDisplayAppCount; formatDisplayDownloadCount }`.

- [ ] **Step 1: Write the failing formatter contract test**

Add a test that transpiles `src/utils/downloadCount.ts` with TypeScript and asserts the complete role split:

```js
test('role-aware count formatters expose exact values only to admins', async () => {
  const source = await read('../src/utils/downloadCount.ts')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const formatters = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )

  assert.equal(formatters.formatRoleAwareAppCount(42, true), '42')
  assert.equal(formatters.formatRoleAwareAppCount(42, false), '40+')
  assert.equal(formatters.formatRoleAwareDownloadCount(1234, true), '1,234')
  assert.equal(formatters.formatRoleAwareDownloadCount(1234, false), '1K+')
  assert.equal(formatters.formatRoleAwareAppCount(null, false), '0')
})
```

- [ ] **Step 2: Run the test and verify the missing policy fails**

Run: `node --test tests/role-aware-count-display.test.mjs`

Expected: FAIL because `formatRoleAwareAppCount` and `formatRoleAwareDownloadCount` do not exist.

- [ ] **Step 3: Implement the pure policy functions**

Append these exports to `src/utils/downloadCount.ts` without changing the existing thresholds:

```ts
export const formatRoleAwareAppCount = (
  value: number | null | undefined,
  isAdmin: boolean,
) => isAdmin ? formatExactCount(value) : (formatApproxAppCount(value) ?? '0')

export const formatRoleAwareDownloadCount = (
  value: number | null | undefined,
  isAdmin: boolean,
) => isAdmin ? formatExactCount(value) : formatApproxDownloadCount(value)
```

- [ ] **Step 4: Implement the Pinia-aware composable**

Create `src/composables/useCountDisplay.ts`:

```ts
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import {
  formatRoleAwareAppCount,
  formatRoleAwareDownloadCount,
} from '@/utils/downloadCount'

export const useCountDisplay = () => {
  const userStore = useUserStore()
  const isAdmin = computed(() => (
    userStore.userInfo?.roles?.some((role) => role.roleCode === 'ROLE_ADMIN') === true
  ))

  const formatDisplayAppCount = (value?: number | null) => (
    formatRoleAwareAppCount(value, isAdmin.value)
  )
  const formatDisplayDownloadCount = (value?: number | null) => (
    formatRoleAwareDownloadCount(value, isAdmin.value)
  )

  return { isAdmin, formatDisplayAppCount, formatDisplayDownloadCount }
}
```

- [ ] **Step 5: Verify the formatter contract passes**

Run: `node --test tests/role-aware-count-display.test.mjs`

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 6: Commit the shared policy**

```bash
git add src/utils/downloadCount.ts src/composables/useCountDisplay.ts tests/role-aware-count-display.test.mjs
git commit -m "centralize role-aware count display"
```

---

### Task 2: Migrate existing metrics surfaces to the shared policy

**Files:**
- Modify: `src/components/Header.vue`
- Modify: `src/components/ProductCard.vue`
- Modify: `src/views/brands/Brands.vue`
- Modify: `src/views/brands/MerchantDetail.vue`
- Modify: `src/views/products/ProductDetail.vue`
- Modify: `tests/role-aware-count-display.test.mjs`

**Interfaces:**
- Consumes: `useCountDisplay()` from Task 1.
- Produces: shared role-aware rendering for header category counts, merchant app/download stats, product-card downloads, and product-detail downloads.

- [ ] **Step 1: Add a failing migration test for current metrics surfaces**

Add a source-level test that reads the five Vue files and asserts each imports/calls `useCountDisplay`, while rejecting direct imports of `formatExactCount`, `formatApproxAppCount`, and `formatApproxDownloadCount`:

```js
test('all existing metrics surfaces consume the shared count policy', async () => {
  const paths = [
    '../src/components/Header.vue',
    '../src/components/ProductCard.vue',
    '../src/views/brands/Brands.vue',
    '../src/views/brands/MerchantDetail.vue',
    '../src/views/products/ProductDetail.vue',
  ]
  for (const path of paths) {
    const source = await read(path)
    assert.match(source, /useCountDisplay/)
    assert.doesNotMatch(source, /import\s*\{[^}]*format(?:Exact|ApproxApp|ApproxDownload)Count/)
  }
})
```

- [ ] **Step 2: Run the test and verify it fails on local role branches**

Run: `node --test tests/role-aware-count-display.test.mjs`

Expected: FAIL because these components still import and combine the low-level formatters locally.

- [ ] **Step 3: Migrate the five metrics surfaces**

In each file, replace low-level count formatter imports and local `formatDisplay...` implementations with:

```ts
import { useCountDisplay } from '@/composables/useCountDisplay'

const { isAdmin, formatDisplayAppCount, formatDisplayDownloadCount } = useCountDisplay()
```

Destructure only the members each component uses. Preserve `isAdmin` in `Header.vue`, `ProductCard.vue`, and `ProductDetail.vue` because it also guards admin-only UI and data requests. Remove duplicate local `isAdmin` only where the composable replaces it exactly.

Keep `Header.vue`'s English `app/apps` suffix helper, but obtain its numeric label through `formatDisplayAppCount(count)`.

- [ ] **Step 4: Verify the migrated metrics surfaces**

Run: `node --test tests/role-aware-count-display.test.mjs`

Expected: PASS with both formatter and metrics migration tests passing.

- [ ] **Step 5: Commit the metrics migration**

```bash
git add src/components/Header.vue src/components/ProductCard.vue src/views/brands/Brands.vue src/views/brands/MerchantDetail.vue src/views/products/ProductDetail.vue tests/role-aware-count-display.test.mjs
git commit -m "use shared count policy for Store metrics"
```

---

### Task 3: Cover series, bundle, and subscription app counts

**Files:**
- Modify: `src/components/SeriesCard.vue`
- Modify: `src/components/PurchaseCard.vue`
- Modify: `src/components/subscription/SubscriptionCard.vue`
- Modify: `tests/role-aware-count-display.test.mjs`

**Interfaces:**
- Consumes: `useCountDisplay()` from Task 1 and existing `series.appCount`, `appCount`, and `productCount` props.
- Produces: fuzzy non-admin and exact admin app-count labels on series cards, bundle purchase cards, and subscription cards.

- [ ] **Step 1: Add a failing test for previously exact commerce and series counts**

Add this source-level test:

```js
test('series bundle and subscription app counts use the shared count policy', async () => {
  const paths = [
    '../src/components/SeriesCard.vue',
    '../src/components/PurchaseCard.vue',
    '../src/components/subscription/SubscriptionCard.vue',
  ]
  for (const path of paths) {
    const source = await read(path)
    assert.match(source, /useCountDisplay/)
    assert.match(source, /formatDisplayAppCount/)
  }

  const purchaseCard = await read('../src/components/PurchaseCard.vue')
  const subscriptionCard = await read('../src/components/subscription/SubscriptionCard.vue')
  assert.doesNotMatch(purchaseCard, /const formatCountPlus/)
  assert.doesNotMatch(subscriptionCard, /\{\{\s*productCount\s*\}\}\s*watch faces/)
})
```

- [ ] **Step 2: Run the test and verify exact-count surfaces fail**

Run: `node --test tests/role-aware-count-display.test.mjs`

Expected: FAIL because the three components do not yet use the shared policy.

- [ ] **Step 3: Migrate series and commerce components**

Import and initialize the composable in each component:

```ts
import { useCountDisplay } from '@/composables/useCountDisplay'

const { formatDisplayAppCount } = useCountDisplay()
```

Apply it as follows:

- `SeriesCard.vue`: format `series.appCount` before passing it to `series.appCount.one/other`; select singular only when the formatted label is exactly `'1'`.
- `PurchaseCard.vue`: replace both `formatCountPlus(appCount)` calls with `formatDisplayAppCount(appCount)` and delete `formatCountPlus`.
- `SubscriptionCard.vue`: replace raw `{{ productCount }}` with `{{ formatDisplayAppCount(productCount) }}`.

- [ ] **Step 4: Run focused policy and existing localization tests**

Run: `node --test tests/role-aware-count-display.test.mjs tests/final-review-fixes.test.mjs`

Expected: PASS with 0 failures; the existing series localization contract remains intact.

- [ ] **Step 5: Commit the remaining surfaces**

```bash
git add src/components/SeriesCard.vue src/components/PurchaseCard.vue src/components/subscription/SubscriptionCard.vue tests/role-aware-count-display.test.mjs
git commit -m "fuzz Store app counts for non-admins"
```

---

### Task 4: Audit and verify the complete Store behavior

**Files:**
- Modify only if the audit finds an omitted visible app/download count: the directly affected `src/**/*.vue` file and `tests/role-aware-count-display.test.mjs`.

**Interfaces:**
- Consumes: all role-aware formatting behavior from Tasks 1-3.
- Produces: verified Store build and an explicit rendered-validation result.

- [ ] **Step 1: Audit visible source references**

Run:

```bash
rg -n "appCount|productCount|totalDownloads|\\.download\\b|downloads\\b|formatCountPlus|formatExactCount|formatApprox(App|Download)Count" src --glob '*.vue' --glob '*.ts' --glob '!content/**' --glob '!i18n.ts'
```

Expected: visible app/download count renderers use `useCountDisplay`; raw values remain only for control flow, sorting, API data, or admin-only panels guarded by `isAdmin`.

- [ ] **Step 2: Run all repository Node tests**

Run: `node --test tests/*.test.mjs`

Expected: 0 failures.

- [ ] **Step 3: Run the application build**

Run: `npm run build:app`

Expected: `vue-tsc` and Vite both exit 0.

- [ ] **Step 4: Validate the rendered flow**

The flow under test is: Store page with a visible app/download count -> compare non-admin and `ROLE_ADMIN` sessions -> non-admin sees a fuzzy label and admin sees the exact source value.

Use the available in-app Browser workflow first. Verify page identity, non-blank content, no framework overlay, console health, screenshot evidence, and one count-rendering interaction or navigation. If both identities cannot be established from the local environment, record the unavailable identity state explicitly and do not claim that rendered role was verified.

- [ ] **Step 5: Review the final diff and preserve unrelated changes**

Run:

```bash
git diff --check
git status --short
git diff -- src tests/role-aware-count-display.test.mjs
```

Expected: no whitespace errors; unrelated SEO files remain present and unmodified by this implementation.
