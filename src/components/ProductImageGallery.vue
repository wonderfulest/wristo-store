<template>
  <section class="product-gallery" :aria-label="`${productName} image gallery`">
    <div class="product-gallery__stage">
      <el-image
        v-if="selectedItem"
        :key="selectedItem.key"
        class="product-gallery__main-image"
        :src="selectedItem.url"
        :alt="selectedItem.alt"
        fit="contain"
        :preview-src-list="previewSrcList"
        :initial-index="selectedIndex"
        preview-teleported
        @error="handleImageError(selectedItem)"
      />

      <div
        v-else
        class="product-gallery__placeholder"
        role="img"
        :aria-label="`${productName} image unavailable`"
      >
        <span aria-hidden="true">W</span>
      </div>
    </div>

    <div
      v-if="availableItems.length > 1"
      class="product-gallery__thumbnails"
      aria-label="Choose a product image"
    >
      <button
        v-for="item in availableItems"
        :key="item.key"
        type="button"
        class="product-gallery__thumbnail"
        :class="{ 'product-gallery__thumbnail--active': item.key === selectedKey }"
        :aria-label="`View ${item.alt}`"
        :aria-current="item.key === selectedKey ? 'true' : undefined"
        @click="selectImage(item)"
      >
        <img :src="item.url" :alt="item.alt" loading="lazy" @error="handleImageError(item)" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { ProductShareImageVO } from '@/types'
import {
  createProductGalleryItems,
  type ProductGalleryItem,
} from '@/utils/productGallery'

const props = withDefaults(
  defineProps<{
    images: ProductShareImageVO[]
    fallbackImageUrl?: string | null
    productName: string
  }>(),
  {
    fallbackImageUrl: null,
  },
)

const failedUrls = ref<Set<string>>(new Set())
const selectedKey = ref<string | null>(null)

const galleryItems = computed(() =>
  createProductGalleryItems(props.images, props.fallbackImageUrl, props.productName),
)

const shareItems = computed(() =>
  createProductGalleryItems(props.images, null, props.productName),
)

const fallbackItems = computed(() =>
  createProductGalleryItems([], props.fallbackImageUrl, props.productName),
)

const availableItems = computed(() => {
  const availableSourceItems = galleryItems.value.filter(
    (item) => !failedUrls.value.has(item.url),
  )

  if (availableSourceItems.length > 0 || shareItems.value.length === 0) {
    return availableSourceItems
  }

  return fallbackItems.value.filter((item) => !failedUrls.value.has(item.url))
})

const selectedItem = computed(
  () => availableItems.value.find((item) => item.key === selectedKey.value) ?? null,
)

const previewSrcList = computed(() => availableItems.value.map((item) => item.url))

const selectedIndex = computed(() => {
  const index = availableItems.value.findIndex((item) => item.key === selectedKey.value)
  return index >= 0 ? index : 0
})

const selectImage = (item: ProductGalleryItem) => {
  selectedKey.value = item.key
}

const handleImageError = (item: ProductGalleryItem) => {
  failedUrls.value = new Set([...failedUrls.value, item.url])
}

watch(
  availableItems,
  (items) => {
    if (!items.some((item) => item.key === selectedKey.value)) {
      selectedKey.value = items[0]?.key ?? null
    }
  },
  { immediate: true },
)

watch(
  [() => props.images, () => props.fallbackImageUrl],
  () => {
    failedUrls.value = new Set()
  },
  { deep: true },
)
</script>

<style scoped>
.product-gallery {
  --gallery-accent: #0f9f9a;
  --gallery-accent-soft: #e8f8f6;
  --gallery-border: #e6eceb;

  display: grid;
  gap: 14px;
  min-width: 0;
  width: 100%;
}

.product-gallery__stage {
  aspect-ratio: 1;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--gallery-border);
  border-radius: 18px;
  background: linear-gradient(145deg, #ffffff 15%, #f7faf9 100%);
  box-shadow:
    0 18px 48px rgb(31 70 68 / 8%),
    0 2px 8px rgb(31 70 68 / 5%);
}

.product-gallery__main-image {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.product-gallery__placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--gallery-accent);
  background:
    radial-gradient(circle at 50% 42%, rgb(15 159 154 / 10%), transparent 38%),
    #f8fbfa;
}

.product-gallery__placeholder span {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid rgb(15 159 154 / 24%);
  border-radius: 22px;
  background: rgb(255 255 255 / 76%);
  box-shadow: 0 10px 28px rgb(15 159 154 / 10%);
  font-size: 32px;
  font-weight: 650;
  letter-spacing: -0.08em;
}

.product-gallery__thumbnails {
  display: flex;
  gap: 10px;
  max-width: 100%;
  padding: 2px 2px 6px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: thin;
  scrollbar-color: rgb(15 159 154 / 32%) transparent;
}

.product-gallery__thumbnail {
  flex: 0 0 66px;
  width: 66px;
  height: 66px;
  overflow: hidden;
  padding: 3px;
  border: 1px solid var(--gallery-border);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.product-gallery__thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: contain;
}

.product-gallery__thumbnail:hover {
  border-color: rgb(15 159 154 / 56%);
  transform: translateY(-1px);
}

.product-gallery__thumbnail:focus-visible {
  outline: 3px solid rgb(15 159 154 / 22%);
  outline-offset: 2px;
  border-color: var(--gallery-accent);
}

.product-gallery__thumbnail--active {
  border-color: var(--gallery-accent);
  background: var(--gallery-accent-soft);
  box-shadow: 0 5px 14px rgb(15 159 154 / 16%);
}

@media (max-width: 640px) {
  .product-gallery {
    gap: 10px;
    max-width: 100%;
  }

  .product-gallery__stage {
    border-radius: 14px;
  }

  .product-gallery__thumbnails {
    width: 100%;
    padding-bottom: 4px;
  }

  .product-gallery__thumbnail {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-gallery__thumbnail {
    transition: none;
  }
}
</style>
