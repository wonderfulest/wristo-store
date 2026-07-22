# Category Card Admin Studio Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only pencil button to every Store category product card that opens the corresponding design directly in Wristo Studio.

**Architecture:** `Categories.vue` explicitly opts its shared `ProductCard` instances into the edit affordance. `ProductCard.vue` owns the role/design guards, presentation, click isolation, and delegates navigation to the existing `openStudioDesign()` utility so current Studio URL and mobile-client behavior remain authoritative.

**Tech Stack:** Vue 3 SFC, TypeScript, Iconify, Node.js built-in test runner, Vite/vue-tsc

---

## File map

- Modify `src/views/products/Categories.vue`: enable the admin edit affordance for all category product cards.
- Modify `src/components/ProductCard.vue`: render, guard, style, and handle the Studio edit button.
- Create `tests/category-card-admin-studio-edit.test.mjs`: assert the page opt-in and the component's visibility/navigation contract.

### Task 1: Lock the category-card edit contract with a failing test

**Files:**
- Create: `tests/category-card-admin-studio-edit.test.mjs`
- Inspect: `src/views/products/Categories.vue`
- Inspect: `src/components/ProductCard.vue`

- [ ] **Step 1: Write the failing source-contract tests**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('all category product cards opt into the admin Studio edit entry', async () => {
  const source = await read('../src/views/products/Categories.vue')

  assert.match(source, /<product-card[\s\S]*v-for="product in filteredProducts"[\s\S]*show-admin-edit/)
})

test('ProductCard guards and isolates the admin Studio edit button', async () => {
  const source = await read('../src/components/ProductCard.vue')

  assert.match(source, /showAdminEdit\?: boolean/)
  assert.match(source, /const canEditInStudio = computed\(\(\) =>[\s\S]*props\.showAdminEdit[\s\S]*isAdmin\.value[\s\S]*designId/)
  assert.match(source, /v-if="canEditInStudio"[\s\S]*class="studio-edit-button"/)
  assert.match(source, /title="Edit in Studio"/)
  assert.match(source, /aria-label="Edit in Studio"/)
  assert.match(source, /@click\.stop="editInStudio"/)
  assert.match(source, /import\s*\{\s*openStudioDesign\s*\}\s*from\s*['"]@\/utils\/studio['"]/)
  assert.match(source, /openStudioDesign\(designId\)/)
})
```

- [ ] **Step 2: Run the test and verify the new contract fails**

Run:

```bash
node --test tests/category-card-admin-studio-edit.test.mjs
```

Expected: FAIL because `show-admin-edit`, `showAdminEdit`, and `studio-edit-button` do not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/category-card-admin-studio-edit.test.mjs
git commit -m "test category card Studio edit entry"
```

### Task 2: Enable and implement the admin Studio edit button

**Files:**
- Modify: `src/views/products/Categories.vue:159`
- Modify: `src/components/ProductCard.vue:1-150`
- Modify: `src/components/ProductCard.vue:354-450`
- Test: `tests/category-card-admin-studio-edit.test.mjs`

- [ ] **Step 1: Opt every category card into the affordance**

Add the boolean prop to the existing `product-card` usage in `Categories.vue`:

```vue
<product-card
  v-for="product in filteredProducts"
  :key="product.appId"
  :product="product"
  :admin-metrics="adminMetricsMap.get(product.appId) || null"
  :current-category-id="series?.id || null"
  show-admin-edit
  class="product-item"
  @admin-changed="handleAdminChanged"
  @removed-from-current-category="handleRemovedFromCurrentCategory"
/>
```

- [ ] **Step 2: Add the guarded edit button to `ProductCard.vue`**

Add the class binding to the card, and place the button before the existing activated badge:

```vue
<article
  class="product-card"
  :class="{ 'has-admin-edit': canEditInStudio }"
  role="button"
  tabindex="0"
  :aria-label="productAriaLabel"
  @click="handleClick"
  @keydown.enter.self.prevent="handleClick"
  @keydown.space.self.prevent="handleClick"
>
  <button
    v-if="canEditInStudio"
    type="button"
    class="studio-edit-button"
    title="Edit in Studio"
    aria-label="Edit in Studio"
    @click.stop="editInStudio"
  >
    <Icon icon="solar:pen-2-line-duotone" width="16" height="16" aria-hidden="true" />
  </button>
```

Extend the props without changing existing call sites:

```ts
const props = defineProps<{
  product: any
  adminMetrics?: ProductStoreMetricsVO | null
  currentCategoryId?: number | null
  showAdminEdit?: boolean
}>()
```

Import the existing navigation utility and add the guard/handler:

```ts
import { openStudioDesign } from '@/utils/studio'

const canEditInStudio = computed(() => {
  const designId = String(props.product?.designId || '').trim()
  return Boolean(props.showAdminEdit && isAdmin.value && designId)
})

const editInStudio = () => {
  const designId = String(props.product?.designId || '').trim()
  if (!designId) return
  openStudioDesign(designId)
}
```

- [ ] **Step 3: Style the overlay and avoid the Premium badge collision**

Add the following scoped CSS near `.product-activated-badge`:

```css
.studio-edit-button {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(15, 107, 104, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-brand-strong);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.studio-edit-button:hover,
.studio-edit-button:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(15, 107, 104, 0.42);
  background: var(--color-brand-soft);
}

.studio-edit-button:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.24);
  outline-offset: 2px;
}

.product-card.has-admin-edit .product-activated-badge {
  right: 54px;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
node --test tests/category-card-admin-studio-edit.test.mjs
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit the implementation**

```bash
git add src/views/products/Categories.vue src/components/ProductCard.vue
git commit -m "add category card Studio edit icon"
```

### Task 3: Verify the Store build and patch integrity

**Files:**
- Verify: `src/views/products/Categories.vue`
- Verify: `src/components/ProductCard.vue`
- Verify: `tests/category-card-admin-studio-edit.test.mjs`

- [ ] **Step 1: Run related Store tests**

Run:

```bash
node --test \
  tests/category-card-admin-studio-edit.test.mjs \
  tests/role-aware-count-display.test.mjs \
  tests/storefront-visual-system.test.mjs
```

Expected: all selected tests pass.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: `vue-tsc`, Vite production build, and SEO prerender complete successfully.

- [ ] **Step 3: Check whitespace and scope**

Run:

```bash
git diff --check HEAD~2..HEAD
git status --short
```

Expected: no whitespace errors; only the user's pre-existing `src/views/products/ProductDetail.vue` and `tests/product-gallery.test.mjs` changes remain uncommitted.

- [ ] **Step 4: Report manual verification guidance**

Open any localized or unlocalized `/categories/:slug` route as an administrator and verify the pencil appears at the top-right of each card with a valid `designId`; clicking it opens the matching Studio design in a new tab without navigating the Store card. Verify the icon is absent for a non-admin session and on non-category `ProductCard` surfaces.
