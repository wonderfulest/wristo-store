# Product Detail Preview Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the product detail page so it always displays the product preview image instead of a runtime canvas preview.

**Architecture:** `ProductDetail.vue` already resolves the preferred image through `productPreviewFallback`. The page will render that URL directly and retain its existing empty-image placeholder. The separate `ProductCanvasPreview` component stays unchanged.

**Tech Stack:** Vue 3, TypeScript, Vite

---

### Task 1: Render the configured preview image in product details

**Files:**
- Modify: `src/views/products/ProductDetail.vue:4-25,296,889-894`
- Test: `npm run build`

- [ ] **Step 1: Remove the runtime preview component from the page template and imports**

Replace the preview branch with the existing image branch as the first branch:

```vue
<img
  v-if="productPreviewFallback"
  :src="productPreviewFallback"
  :alt="product?.name || t('product.previewAlt')"
  class="product-image"
  loading="eager"
/>
<div v-else class="product-image-fallback">W</div>
```

Remove the `ProductCanvasPreview` import and `.product-dynamic-preview` style, because the detail page no longer renders that component.

- [ ] **Step 2: Inspect the scoped diff**

Run: `git diff --check -- src/views/products/ProductDetail.vue`

Expected: exit code `0` with no whitespace errors.

- [ ] **Step 3: Build the Store frontend**

Run: `npm run build`

Expected: exit code `0` and Vite emits production assets.

