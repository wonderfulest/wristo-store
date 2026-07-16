# Product Share Image Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display each application's existing Share images as a public main-image gallery with thumbnails and full-screen preview on the Store product detail page.

**Architecture:** `wristo-api` exposes a read-only public Share image endpoint that first applies the existing public-product visibility guard and then filters inactive or unusable image records without changing their order. `wristo-store` resolves the response into a small gallery model, renders it in a focused `ProductImageGallery.vue` component, and falls back to the existing product cover whenever no usable Share images remain.

**Tech Stack:** Spring Boot, Java, JUnit 5, MockMvc, Vue 3, TypeScript, Element Plus, Vite, Node test runner

---

## File map

### `wristo-api`

- Create `src/test/java/com/wukong/face/modules/products/ProductShareImagesPublicControllerTest.java`: public route, filtering, visibility-guard ordering, and read-only contract.
- Modify `src/main/java/com/wukong/face/modules/products/controller/pub/ProductPublicController.java`: expose the public GET route and sanitize the public response.

### `wristo-store`

- Modify `src/types/product.ts`: define the shared Share image response type.
- Modify `src/api/product-share-images.ts`: import the shared type used by the administrator manager.
- Modify `src/api/product.ts`: add the public Share image request.
- Create `src/utils/productGallery.ts`: resolve URLs, filter invalid records, deduplicate URLs, and apply the cover fallback.
- Create `src/components/ProductImageGallery.vue`: main image, full-screen preview, thumbnail selection, failed-image handling, and responsive layout.
- Modify `src/views/products/ProductDetail.vue`: fetch public Share images and replace the single-image block with the gallery.
- Create `tests/product-gallery.test.mjs`: executable utility tests plus source-contract checks for the component and page wiring.

---

### Task 1: Add the read-only public Share image endpoint

**Files:**
- Create: `/Users/mac/workspace/wristo/wristo-api/src/test/java/com/wukong/face/modules/products/ProductShareImagesPublicControllerTest.java`
- Modify: `/Users/mac/workspace/wristo/wristo-api/src/main/java/com/wukong/face/modules/products/controller/pub/ProductPublicController.java:20-25,69-78`

- [ ] **Step 1: Write the failing controller test**

Create the complete test class:

```java
package com.wukong.face.modules.products;

import com.wukong.face.modules.products.controller.pub.ProductPublicController;
import com.wukong.face.modules.products.orchestrator.ProductOrchestrator;
import com.wukong.face.modules.products.vo.ProductImageVO;
import com.wukong.face.modules.products.vo.ProductVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProductShareImagesPublicControllerTest {

    private ProductOrchestrator orchestrator;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        orchestrator = mock(ProductOrchestrator.class);
        ProductPublicController controller = new ProductPublicController();
        ReflectionTestUtils.setField(controller, "productOrchestrator", orchestrator);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void listsOnlyActiveShareImagesAfterCheckingPublicProductVisibility() throws Exception {
        ProductVO publicProduct = new ProductVO();
        publicProduct.setAppId(1009L);

        ProductImageVO visible = image(7L, 1, "https://cdn.wristo.io/share/one.png");
        ProductImageVO inactive = image(8L, 0, "https://cdn.wristo.io/share/two.png");
        ProductImageVO missingUrl = image(9L, 1, "  ");

        when(orchestrator.getProductByAppId(1009L)).thenReturn(publicProduct);
        when(orchestrator.getShareImages(1009L)).thenReturn(List.of(visible, inactive, missingUrl));

        mockMvc.perform(get("/api/public/products/app/1009/share-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(7))
                .andExpect(jsonPath("$.data[0].imageUrl")
                        .value("https://cdn.wristo.io/share/one.png"));

        InOrder order = inOrder(orchestrator);
        order.verify(orchestrator).getProductByAppId(1009L);
        order.verify(orchestrator).getShareImages(1009L);
    }

    @Test
    void doesNotExposeAWriteRouteForPublicShareImages() throws Exception {
        mockMvc.perform(post("/api/public/products/app/1009/share-images"))
                .andExpect(status().isMethodNotAllowed());
    }

    private ProductImageVO image(Long id, int isActive, String imageUrl) {
        ProductImageVO image = new ProductImageVO();
        image.setId(id);
        image.setType("share");
        image.setIsActive(isActive);
        image.setImageUrl(imageUrl);
        return image;
    }
}
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
cd /Users/mac/workspace/wristo/wristo-api
mvn -Dtest=ProductShareImagesPublicControllerTest test
```

Expected: FAIL because `GET /api/public/products/app/1009/share-images` is not mapped.

- [ ] **Step 3: Implement the minimal public endpoint**

Add `ProductImageVO` to the controller imports and add these methods immediately after `getByAppId`:

```java
import com.wukong.face.modules.products.vo.ProductImageVO;

@GetMapping("/app/{appId}/share-images")
public Result<List<ProductImageVO>> getShareImages(@PathVariable Long appId) {
    productOrchestrator.getProductByAppId(appId);
    List<ProductImageVO> images = productOrchestrator.getShareImages(appId);
    if (images == null || images.isEmpty()) {
        return Result.success(List.of());
    }
    return Result.success(images.stream()
            .filter(this::isPublicShareImage)
            .toList());
}

private boolean isPublicShareImage(ProductImageVO image) {
    if (image == null || !Integer.valueOf(1).equals(image.getIsActive())) {
        return false;
    }
    if (image.getImageUrl() != null && !image.getImageUrl().isBlank()) {
        return true;
    }
    return image.getImage() != null
            && image.getImage().getUrl() != null
            && !image.getImage().getUrl().isBlank();
}
```

The stream preserves the order returned by `getShareImages`, while the existing `getProductByAppId` call rejects deleted, inactive, unpublished, and hidden products.

- [ ] **Step 4: Run the controller test and verify GREEN**

Run:

```bash
mvn -Dtest=ProductShareImagesPublicControllerTest test
```

Expected: `Tests run: 2, Failures: 0, Errors: 0` and exit code `0`.

- [ ] **Step 5: Commit the backend endpoint**

```bash
git add src/main/java/com/wukong/face/modules/products/controller/pub/ProductPublicController.java \
  src/test/java/com/wukong/face/modules/products/ProductShareImagesPublicControllerTest.java
git commit -m "feat: expose product share images publicly"
```

---

### Task 2: Add the Store Share image model, public API, and gallery normalization

**Files:**
- Modify: `/Users/mac/workspace/wristo/wristo-store/src/types/product.ts:11-30`
- Modify: `/Users/mac/workspace/wristo/wristo-store/src/api/product-share-images.ts:1-17`
- Modify: `/Users/mac/workspace/wristo/wristo-store/src/api/product.ts:1-3,110-120`
- Create: `/Users/mac/workspace/wristo/wristo-store/src/utils/productGallery.ts`
- Create: `/Users/mac/workspace/wristo/wristo-store/tests/product-gallery.test.mjs`

- [ ] **Step 1: Write failing normalization tests**

Create `tests/product-gallery.test.mjs` with these executable tests:

```js
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createProductGalleryItems,
  resolveProductShareImageUrl,
} from '../src/utils/productGallery.ts'

test('resolves, filters, deduplicates and preserves share image order', () => {
  const images = [
    { id: 2, sortOrder: 20, altText: 'Second', imageUrl: ' https://cdn/second.png ' },
    { id: 1, sortOrder: 10, altText: 'First', image: { id: 11, url: 'https://cdn/first.png' } },
    { id: 3, sortOrder: 30, imageUrl: 'https://cdn/second.png' },
    { id: 4, sortOrder: 40, imageUrl: '   ' },
  ]

  assert.equal(resolveProductShareImageUrl(images[1]), 'https://cdn/first.png')
  assert.deepEqual(createProductGalleryItems(images, 'https://cdn/cover.png', 'Ocean Dial'), [
    { key: 'share-2', url: 'https://cdn/second.png', alt: 'Second' },
    { key: 'share-1', url: 'https://cdn/first.png', alt: 'First' },
  ])
})

test('uses the existing product cover only when no share image is usable', () => {
  assert.deepEqual(
    createProductGalleryItems([{ id: 4, imageUrl: '' }], ' https://cdn/cover.png ', 'Ocean Dial'),
    [{ key: 'fallback', url: 'https://cdn/cover.png', alt: 'Ocean Dial' }],
  )
  assert.deepEqual(createProductGalleryItems([], '', 'Ocean Dial'), [])
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
cd /Users/mac/workspace/wristo/wristo-store
node --test tests/product-gallery.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/utils/productGallery.ts`.

- [ ] **Step 3: Define the shared response type**

Add this type after `HeroFile` in `src/types/product.ts`:

```ts
export interface ProductShareImageVO {
  id: number
  productId: number
  imageId: number
  type: 'share'
  sortOrder: number
  altText?: string | null
  imageUrl?: string | null
  fileName?: string | null
  isActive?: number | null
  image?: {
    id: number
    name?: string | null
    url?: string | null
  } | null
}
```

Remove the local interface from `src/api/product-share-images.ts` and replace it with:

```ts
import instance from '@/config/axios'
import type { ProductShareImageVO } from '@/types'

export type { ProductShareImageVO }
```

Keep the three existing administrator API functions unchanged below those imports.

- [ ] **Step 4: Add the public Store API method**

Add `ProductShareImageVO` to the type import in `src/api/product.ts`, then add after `getProductDetail`:

```ts
export const getProductShareImages = (
  appId: string | number,
): Promise<ProductShareImageVO[]> => {
  return instance.get(`/public/products/app/${appId}/share-images`)
}
```

- [ ] **Step 5: Implement the tested normalization utility**

Create `src/utils/productGallery.ts`:

```ts
export interface ProductShareImageSource {
  id: number
  altText?: string | null
  imageUrl?: string | null
  image?: {
    url?: string | null
  } | null
}

export interface ProductGalleryItem {
  key: string
  url: string
  alt: string
}

export const resolveProductShareImageUrl = (image: ProductShareImageSource): string => {
  return (image.imageUrl || image.image?.url || '').trim()
}

export const createProductGalleryItems = (
  images: ProductShareImageSource[] | null | undefined,
  fallbackImageUrl: string | null | undefined,
  productName: string,
): ProductGalleryItem[] => {
  const seen = new Set<string>()
  const items: ProductGalleryItem[] = []

  for (const image of images || []) {
    const url = resolveProductShareImageUrl(image)
    if (!url || seen.has(url)) continue
    seen.add(url)
    items.push({
      key: `share-${image.id}`,
      url,
      alt: image.altText?.trim() || productName,
    })
  }

  if (items.length > 0) return items

  const fallback = (fallbackImageUrl || '').trim()
  return fallback
    ? [{ key: 'fallback', url: fallback, alt: productName }]
    : []
}
```

- [ ] **Step 6: Run the utility tests and verify GREEN**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: `2` tests pass and exit code `0`.

- [ ] **Step 7: Commit the Store data layer**

```bash
git add src/types/product.ts src/api/product-share-images.ts src/api/product.ts \
  src/utils/productGallery.ts tests/product-gallery.test.mjs
git commit -m "feat: add public product gallery data"
```

---

### Task 3: Build the accessible responsive gallery component

**Files:**
- Create: `/Users/mac/workspace/wristo/wristo-store/src/components/ProductImageGallery.vue`
- Modify: `/Users/mac/workspace/wristo/wristo-store/tests/product-gallery.test.mjs`

- [ ] **Step 1: Add a failing component contract test**

Append to `tests/product-gallery.test.mjs`:

```js
import { readFile } from 'node:fs/promises'

test('gallery exposes full-screen preview, selectable thumbnails and image failure handling', async () => {
  const source = await readFile(
    new URL('../src/components/ProductImageGallery.vue', import.meta.url),
    'utf8',
  )

  assert.match(source, /preview-src-list/)
  assert.match(source, /initial-index/)
  assert.match(source, /aria-current/)
  assert.match(source, /selectImage/)
  assert.match(source, /handleImageError/)
  assert.match(source, /overflow-x:\s*auto/)
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: FAIL with `ENOENT` for `ProductImageGallery.vue`.

- [ ] **Step 3: Create the gallery component**

Create `src/components/ProductImageGallery.vue` with this complete implementation:

```vue
<template>
  <section class="product-gallery" :aria-label="`${productName} image gallery`">
    <div class="product-gallery-main">
      <el-image
        v-if="activeItem"
        :key="activeItem.url"
        :src="activeItem.url"
        :alt="activeItem.alt"
        fit="contain"
        class="product-gallery-image"
        :preview-src-list="previewUrls"
        :initial-index="selectedIndex"
        preview-teleported
        @error="handleImageError(activeItem.url)"
      >
        <template #error>
          <div class="product-gallery-fallback" aria-hidden="true">W</div>
        </template>
      </el-image>
      <div v-else class="product-gallery-fallback" aria-hidden="true">W</div>
    </div>

    <div v-if="availableItems.length > 1" class="product-gallery-thumbnails" role="list">
      <button
        v-for="item in availableItems"
        :key="item.key"
        type="button"
        class="product-gallery-thumbnail"
        :class="{ active: item.url === activeItem?.url }"
        :aria-label="`View ${item.alt}`"
        :aria-current="item.url === activeItem?.url ? 'true' : undefined"
        role="listitem"
        @click="selectImage(item.url)"
      >
        <img
          :src="item.url"
          :alt="item.alt"
          loading="lazy"
          @error="handleImageError(item.url)"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProductShareImageVO } from '@/types'
import { createProductGalleryItems } from '@/utils/productGallery'

const props = defineProps<{
  images: ProductShareImageVO[]
  fallbackImageUrl?: string | null
  productName: string
}>()

const failedUrls = ref<Set<string>>(new Set())
const selectedUrl = ref('')

const sourceItems = computed(() => createProductGalleryItems(
  props.images,
  props.fallbackImageUrl,
  props.productName,
))

const fallbackItem = computed(() => createProductGalleryItems(
  [],
  props.fallbackImageUrl,
  props.productName,
)[0] || null)

const availableItems = computed(() => {
  const remaining = sourceItems.value.filter(item => !failedUrls.value.has(item.url))
  if (remaining.length > 0) return remaining

  const fallback = fallbackItem.value
  return fallback && !failedUrls.value.has(fallback.url) ? [fallback] : []
})

const activeItem = computed(() => {
  return availableItems.value.find(item => item.url === selectedUrl.value)
    || availableItems.value[0]
    || null
})

const previewUrls = computed(() => availableItems.value.map(item => item.url))
const selectedIndex = computed(() => Math.max(
  0,
  previewUrls.value.indexOf(activeItem.value?.url || ''),
))

const selectImage = (url: string) => {
  selectedUrl.value = url
}

const handleImageError = (url: string) => {
  failedUrls.value = new Set([...failedUrls.value, url])
}

watch(
  () => [props.images, props.fallbackImageUrl],
  () => {
    failedUrls.value = new Set()
  },
  { deep: true },
)

watch(
  availableItems,
  (items) => {
    if (!items.some(item => item.url === selectedUrl.value)) {
      selectedUrl.value = items[0]?.url || ''
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.product-gallery {
  display: grid;
  gap: 12px;
  width: 100%;
}

.product-gallery-main {
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 320px;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.98), rgba(236, 244, 242, 0.92));
  box-shadow: var(--shadow-lg);
}

.product-gallery-image {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.product-gallery-image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  padding: 12px;
}

.product-gallery-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--color-brand);
  font-size: 4rem;
  font-weight: 900;
}

.product-gallery-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 8px;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}

.product-gallery-thumbnail {
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  overflow: hidden;
  padding: 3px;
  border: 1px solid var(--color-line);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  scroll-snap-align: start;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.product-gallery-thumbnail:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 107, 104, 0.42);
}

.product-gallery-thumbnail.active {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px rgba(15, 107, 104, 0.16);
}

.product-gallery-thumbnail:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.28);
  outline-offset: 2px;
}

.product-gallery-thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}

@media (max-width: 900px) {
  .product-gallery-main {
    min-height: 0;
  }

  .product-gallery-thumbnail {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
  }
}
</style>
```

- [ ] **Step 4: Run the gallery tests and verify GREEN**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: `3` tests pass and exit code `0`.

- [ ] **Step 5: Commit the gallery component**

```bash
git add src/components/ProductImageGallery.vue tests/product-gallery.test.mjs
git commit -m "feat: add product image gallery"
```

---

### Task 4: Integrate the gallery into product details

**Files:**
- Modify: `/Users/mac/workspace/wristo/wristo-store/src/views/products/ProductDetail.vue:4-15,253-310,781-801,857-889`
- Modify: `/Users/mac/workspace/wristo/wristo-store/tests/product-gallery.test.mjs`

- [ ] **Step 1: Add a failing detail-page contract test**

Append to `tests/product-gallery.test.mjs`:

```js
test('product details load public share images into the gallery without using the admin API', async () => {
  const [page, productApi] = await Promise.all([
    readFile(new URL('../src/views/products/ProductDetail.vue', import.meta.url), 'utf8'),
    readFile(new URL('../src/api/product.ts', import.meta.url), 'utf8'),
  ])

  assert.match(productApi, /getProductShareImages/)
  assert.match(productApi, /\/public\/products\/app\/\$\{appId\}\/share-images/)
  assert.doesNotMatch(productApi, /getProductShareImages[\s\S]*\/admin\/products/)
  assert.match(page, /<ProductImageGallery/)
  assert.match(page, /:images="shareImages"/)
  assert.match(page, /loadProductShareImages/)
  assert.match(page, /loadProductShareImages\(\)/)
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: FAIL because `ProductDetail.vue` does not contain `ProductImageGallery` or `loadProductShareImages`.

- [ ] **Step 3: Replace the single-image template with the gallery**

Replace the existing `product-image-wrap` block at the start of `ProductDetail.vue` with:

```vue
<ProductImageGallery
  :images="shareImages"
  :fallback-image-url="productPreviewFallback"
  :product-name="product?.name || t('product.previewAlt')"
/>
```

- [ ] **Step 4: Add imports, state, and non-blocking loading**

Add the type and API imports:

```ts
import type {
  GarminDeviceBaseVO,
  ProductReviewVO,
  ProductShareImageVO,
  ProductStoreMetricsVO,
  ProductVO,
} from '@/types'
import {
  fetchAdminStoreMetrics,
  getMyProductRating,
  getProductRating,
  getProductReviews,
  getProductShareImages,
  updateProductRating,
} from '@/api/product'
import ProductImageGallery from '@/components/ProductImageGallery.vue'
```

Add the state beside the existing product state:

```ts
const product = ref<ProductVO | null>(null)
const shareImages = ref<ProductShareImageVO[]>([])
```

Add this loader near the existing rating/review loaders:

```ts
const loadProductShareImages = async () => {
  if (!product.value?.appId) {
    shareImages.value = []
    return
  }
  try {
    shareImages.value = await getProductShareImages(product.value.appId)
  } catch (error) {
    console.warn('[ProductDetail] share images unavailable', error)
    shareImages.value = []
  }
}
```

Extend the existing post-product-load `Promise.all`:

```ts
await Promise.all([
  loadRatingState(),
  loadProductReviews(),
  loadAdminMetrics(),
  loadProductShareImages(),
])
```

- [ ] **Step 5: Remove obsolete page-level image styles**

Delete the complete existing rule blocks for `.product-image-wrap`, `.product-image`, and `.product-image-fallback` from `ProductDetail.vue`.

Keep `.product-visual-wrap` unchanged so the gallery and Studio button retain the current left-column layout.

- [ ] **Step 6: Run tests and the TypeScript production build**

Run:

```bash
node --test tests/*.test.mjs
npm run build
```

Expected: all Node tests pass; `vue-tsc`, Vite, and SEO prerender finish with exit code `0`.

- [ ] **Step 7: Commit the detail-page integration**

```bash
git add src/views/products/ProductDetail.vue tests/product-gallery.test.mjs
git commit -m "feat: show share images in product details"
```

---

### Task 5: Run cross-repository verification and inspect the final scope

**Files:**
- Verify only; no planned source edits.

- [ ] **Step 1: Run all Store contract tests**

```bash
cd /Users/mac/workspace/wristo/wristo-store
node --test tests/*.test.mjs
```

Expected: all tests pass with `0` failures.

- [ ] **Step 2: Run the Store production build**

```bash
npm run build
```

Expected: `vue-tsc`, Vite build, and prerender complete with exit code `0`.

- [ ] **Step 3: Run focused backend tests**

```bash
cd /Users/mac/workspace/wristo/wristo-api
mvn -Dtest=ProductShareImagesPublicControllerTest,ProductShareImagesAdminControllerTest test
```

Expected: both test classes pass with `0` failures and `0` errors.

- [ ] **Step 4: Run the full backend suite when the local test environment is available**

```bash
mvn test
```

Expected: Maven exits `0`. If infrastructure-dependent tests fail, capture the first failing test and distinguish the environment failure from the focused controller-test result.

- [ ] **Step 5: Inspect repository state and diff quality**

```bash
git -C /Users/mac/workspace/wristo/wristo-api status --short
git -C /Users/mac/workspace/wristo/wristo-api diff --check HEAD~1..HEAD
git -C /Users/mac/workspace/wristo/wristo-store status --short
git -C /Users/mac/workspace/wristo/wristo-store diff --check HEAD~3..HEAD
```

Expected: only the planned files are present, and both `diff --check` commands exit `0`.

- [ ] **Step 6: Manually verify the public detail page**

Run the API and Store locally, then verify one application with multiple Share images and one without Share images:

- Multiple images: first Share image is the main image; every thumbnail is visible; selection changes the main image; clicking the main image opens the full preview list.
- Single image: no thumbnail rail is rendered.
- No images or failed public request: the existing product cover remains visible and purchase/install controls still work.
- Narrow viewport at `390px`: thumbnails scroll horizontally without widening the page.
- Hidden or inactive application: the public Share image route rejects the request through the existing product visibility guard.
