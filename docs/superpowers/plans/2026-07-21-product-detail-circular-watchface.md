# Product Detail Circular Watchface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the product-detail gallery main image show only a polished circular watchface area while thumbnails continue to show the complete source image.

**Architecture:** Keep all gallery state and interactions inside the existing `ProductImageGallery.vue`. Add one presentation-only circular viewport around the main `el-image`; use scoped responsive CSS for clipping, border, highlight, shadow, and sizing, without changing data flow or thumbnail markup.

**Tech Stack:** Vue 3 SFC, TypeScript, scoped CSS, Node test runner.

---

### Task 1: Circular main-image viewport

**Files:**
- Modify: `src/components/ProductImageGallery.vue:18-32`
- Modify: `src/components/ProductImageGallery.vue:464-504`
- Modify: `src/components/ProductImageGallery.vue:736-749`
- Test: `tests/product-gallery.test.mjs`

- [ ] **Step 1: Write the failing source-contract test**

Add a test that reads `ProductImageGallery.vue` and asserts:

```js
test('product gallery clips only the main image into a circular watchface viewport', async () => {
  const source = await readFile(productImageGalleryUrl, 'utf8')

  assert.match(source, /class="product-gallery__watchface"/)
  assert.match(source, /\.product-gallery__watchface\s*\{[\s\S]*?aspect-ratio:\s*1;[\s\S]*?border-radius:\s*50%;[\s\S]*?overflow:\s*hidden;/)
  assert.match(source, /\.product-gallery__thumbnail img\s*\{[\s\S]*?object-fit:\s*contain;/)
  assert.doesNotMatch(source, /\.product-gallery__thumbnail img\s*\{[\s\S]*?border-radius:\s*50%;/)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="clips only the main image" tests/product-gallery.test.mjs`

Expected: FAIL because `.product-gallery__watchface` does not exist.

- [ ] **Step 3: Add the circular viewport markup**

Wrap only the main `el-image` in:

```vue
<div v-if="selectedItem" class="product-gallery__watchface">
  <el-image
    :key="selectedItem.key"
    ref="mainImageRef"
    class="product-gallery__main-image"
    :src="selectedItem.url"
    :alt="selectedItem.alt"
    :aria-label="`Preview ${selectedItem.alt} fullscreen`"
    fit="contain"
    :preview-src-list="previewSrcList"
    :initial-index="selectedIndex"
    preview-teleported
    @error="handleImageError(selectedItem)"
    @click="showPreview"
  />
</div>
```

Do not change thumbnail markup.

- [ ] **Step 4: Add restrained circular styling**

Add a centered `.product-gallery__watchface` with `width: min(78%, 430px)`, `aspect-ratio: 1`, `overflow: hidden`, and `border-radius: 50%`. Use a subtle translucent border, inset highlight, and layered shadow. Make `.product-gallery__main-image` fill the circle. Reduce the ambient stage backdrop opacity from `0.5` to `0.32` so the circle remains dominant.

In the existing mobile media query, set the circular viewport width to `76%` to preserve safe space around it.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test --test-name-pattern="clips only the main image" tests/product-gallery.test.mjs`

Expected: PASS.

- [ ] **Step 6: Run gallery regression tests**

Run: `node --test tests/product-gallery.test.mjs`

Expected: all gallery tests pass.

- [ ] **Step 7: Run the production build**

Run: `npm run build`

Expected: Vue TypeScript checks and Vite build exit successfully.

- [ ] **Step 8: Review the final diff**

Run: `git diff --check && git diff -- src/components/ProductImageGallery.vue tests/product-gallery.test.mjs`

Expected: no whitespace errors; changes are limited to the main-image viewport, its test, and responsive styling. Do not commit unless the user explicitly requests it.
