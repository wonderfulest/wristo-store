# Product Detail Large Circle Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the product detail gallery's visible square stage with one large circular product image while preserving all gallery interactions.

**Architecture:** Keep the existing `ProductImageGallery.vue` component, state, and event handling unchanged. Express the new presentation entirely in its scoped CSS, and update the source-contract test so the required full-width circle and absence of the decorative square backdrop remain regression-tested.

**Tech Stack:** Vue 3 single-file components, scoped CSS, Node.js built-in test runner, Vite, vue-tsc

---

### Task 1: Lock the large-circle presentation contract

**Files:**
- Modify: `tests/product-gallery.test.mjs:20-40,450-490`
- Modify: `src/components/ProductImageGallery.vue:443-535,770-785`

- [x] **Step 1: Replace the old square-stage assertions with the new circle contract**

Update the gallery source test so it requires a transparent, borderless, shadowless stage; a full-width circular watchface; and no decorative stage pseudo-elements:

```js
assert.match(
  source,
  /\.product-gallery__stage\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
)
assert.match(
  source,
  /\.product-gallery__watchface\s*\{[\s\S]*?width:\s*100%;[\s\S]*?aspect-ratio:\s*1;[\s\S]*?border-radius:\s*50%;[\s\S]*?overflow:\s*hidden;/,
)
assert.doesNotMatch(source, /\.product-gallery__stage::before/)
assert.doesNotMatch(source, /\.product-gallery__stage::after/)
```

Remove assertions that require `--gallery-backdrop-image`, the stage backdrop pseudo-elements, the square-stage background, and reduced-motion handling for the deleted backdrop transition.

- [x] **Step 2: Run the targeted test and verify it fails against the current design**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: FAIL because the stage still has a border/background/shadow, the watchface width is `min(78%, 430px)`, and stage pseudo-elements still exist.

- [x] **Step 3: Implement the minimal scoped CSS change**

In `src/components/ProductImageGallery.vue`:

1. Remove `galleryStageStyle` from the stage template, remove the `CSSProperties` import, and remove the `galleryStageStyle` computed value.
2. Change the stage presentation to:

```css
.product-gallery__stage {
  position: relative;
  display: grid;
  aspect-ratio: 1;
  min-width: 0;
  overflow: visible;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
  place-items: center;
  touch-action: pan-y pinch-zoom;
}
```

3. Delete `.product-gallery__stage::before`, `.product-gallery__stage::after`, and their declarations.
4. Change the main circle to fill the stage:

```css
.product-gallery__watchface {
  position: relative;
  z-index: 2;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: 50%;
  overflow: hidden;
  background: rgb(255 255 255 / 42%);
  box-shadow:
    0 28px 56px rgb(20 56 54 / 20%),
    0 8px 18px rgb(20 56 54 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
}
```

5. Remove the mobile-only stage radius, backdrop styling, and `width: 76%` watchface override. Remove `.product-gallery__stage::before` from the reduced-motion transition list.

- [x] **Step 4: Run the targeted test and verify it passes**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: all tests in `product-gallery.test.mjs` PASS.

### Task 2: Verify component behavior and production compilation

**Files:**
- Verify: `src/components/ProductImageGallery.vue`
- Verify: `tests/product-gallery-component.test.mjs`
- Verify: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Run both gallery regression suites**

  Targeted large-circle tests pass (3/3) and component interaction tests pass (4/4). The complete `product-gallery.test.mjs` currently has 10 unrelated baseline contract failures, so the combined suite is not fully green.

Run:

```bash
node --test tests/product-gallery.test.mjs tests/product-gallery-component.test.mjs
```

Expected: all gallery utility/source-contract and component interaction tests PASS.

- [x] **Step 2: Run the application build**

Run:

```bash
npm run build:app
```

Expected: `vue-tsc` and the production Vite build complete successfully.

- [x] **Step 3: Inspect the final diff**

Run:

```bash
git diff --check
git diff -- src/components/ProductImageGallery.vue tests/product-gallery.test.mjs docs/superpowers/specs/2026-07-21-product-detail-large-circle-image-design.md docs/superpowers/plans/2026-07-21-product-detail-large-circle-image.md
```

Expected: no whitespace errors; the diff is limited to the approved gallery style, its regression contract, and the two design/plan documents. Do not commit unless the user explicitly requests it.
