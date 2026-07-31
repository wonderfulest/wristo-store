# Product Gallery External Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move product-gallery previous and next controls outside the main image without changing navigation behavior.

**Architecture:** Keep the existing component and event handlers. Change the stage into a three-column grid with reserved button columns and a square center image, then add a source-level regression test for the grid placement and narrow-screen overrides.

**Tech Stack:** Vue 3 single-file components, scoped CSS, Node test runner.

---

### Task 1: Add the external-control layout regression

**Files:**
- Modify: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Add a failing assertion**

Add assertions to the existing manual-navigation test requiring named grid areas,
the centered image area, and separate previous/next areas:

```js
assert.match(source, /grid-template-areas:\s*['"]previous image next['"]/)
assert.match(source, /\.product-gallery__watchface\s*\{[\s\S]*grid-area:\s*image/)
assert.match(source, /\.product-gallery__carousel-button--previous\s*\{[\s\S]*grid-area:\s*previous/)
assert.match(source, /\.product-gallery__carousel-button--next\s*\{[\s\S]*grid-area:\s*next/)
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
node --test --test-name-pattern="manual circular" tests/product-gallery.test.mjs
```

Expected: FAIL because `grid-template-areas` and `grid-area` declarations are absent.

### Task 2: Place controls outside the image

**Files:**
- Modify: `src/components/ProductImageGallery.vue`

- [ ] **Step 1: Implement the desktop grid**

Change `.product-gallery__stage` to:

```css
grid-template-columns: 42px minmax(0, 1fr) 42px;
grid-template-areas: 'previous image next';
gap: 12px;
```

Remove the stage square aspect ratio, assign the watchface and placeholder to
`grid-area: image`, and make carousel buttons normal grid items instead of
absolutely positioned overlays. Assign the previous and next modifiers to their
named grid areas.

- [ ] **Step 2: Implement the narrow-screen grid**

Inside the existing `max-width: 640px` media query, use:

```css
.product-gallery__stage {
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  gap: 6px;
}
```

Keep the buttons at `34px` square and remove obsolete left/right offsets.

- [ ] **Step 3: Run the focused test**

Run:

```bash
node --test --test-name-pattern="manual circular" tests/product-gallery.test.mjs
```

Expected: PASS.

### Task 3: Verify the component

**Files:**
- Verify: `src/components/ProductImageGallery.vue`
- Verify: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Run the complete gallery regression file**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Run the application build**

Run:

```bash
npm run build:app
```

Expected: TypeScript checking and the Vite production build complete successfully.

- [ ] **Step 3: Run static diff checks**

Run:

```bash
git diff --check
git diff -- src/components/ProductImageGallery.vue tests/product-gallery.test.mjs
```

Expected: no whitespace errors; the diff is limited to external navigation layout and its regression assertions.
