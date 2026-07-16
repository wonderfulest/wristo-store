# Product Gallery Ambient Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace harsh gallery letterboxing with a restrained image-derived ambient backdrop and give the thumbnail list a deliberate filmstrip surface.

**Architecture:** Keep all behavior and data flow in `ProductImageGallery.vue`. Expose the selected image URL to scoped CSS through an inline custom property, use pseudo-elements for decorative backdrop layers, and preserve the existing Element Plus contained image as the foreground.

**Tech Stack:** Vue 3, TypeScript, scoped CSS, Element Plus, Node test runner

---

### Task 1: Lock the visual contract with a failing test

**Files:**
- Modify: `tests/product-gallery.test.mjs`
- Test: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Add a source-contract test**

Add a test that asserts the stage binds a `--gallery-backdrop-image` custom property from `selectedItem.url`, the stage uses `::before` and `::after` decorative layers, the backdrop uses `background-size: cover` and blur, the foreground remains `fit="contain"`, the thumbnail row has a surface and border, and reduced motion disables new transitions.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="ambient backdrop" tests/product-gallery.test.mjs`

Expected: FAIL because the dynamic backdrop and layered filmstrip styles do not exist yet.

### Task 2: Implement the ambient stage and filmstrip

**Files:**
- Modify: `src/components/ProductImageGallery.vue`
- Test: `tests/product-gallery.test.mjs`
- Test: `tests/product-gallery-component.test.mjs`

- [ ] **Step 1: Bind the selected image to CSS**

Add a stage style binding that sets `--gallery-backdrop-image` to `url("<escaped selected image URL>")`, and falls back to `none` when no image is selected.

- [ ] **Step 2: Add the ambient decorative layers**

Use `::before` for a cover-sized, enlarged, blurred image copy and `::after` for a light neutral veil. Keep both non-interactive and place the foreground image and carousel controls above them with explicit stacking.

- [ ] **Step 3: Refine the foreground and thumbnail rail**

Keep `object-fit: contain`, add a subtle foreground drop shadow, and wrap the thumbnails in a tinted surface with border, radius, inset highlight, and intentional padding.

- [ ] **Step 4: Preserve mobile and reduced-motion behavior**

Reduce blur/padding at `640px` and ensure all new transitions are disabled under `prefers-reduced-motion`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/product-gallery.test.mjs tests/product-gallery-component.test.mjs`

Expected: 46 or more tests pass with zero failures.

### Task 3: Verify the finished gallery

**Files:**
- Verify: `src/components/ProductImageGallery.vue`
- Verify: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Run all Store Node tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

- [ ] **Step 2: Build the Store application**

Run: `npm run build:app`

Expected: TypeScript and Vite build pass; the existing chunk-size warning is acceptable.

- [ ] **Step 3: Verify the live page at desktop and mobile widths**

Open `http://localhost:3000/product/139993`, select portrait and landscape thumbnails, and capture screenshots at 1280px and 375px widths. Confirm the image remains uncropped, ambient bars are restrained, controls meet the existing touch target, and the thumbnail rail does not overflow the viewport.
