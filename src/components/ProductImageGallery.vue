<template>
  <section class="product-gallery" :aria-label="`${productName} image gallery`">
    <div
      class="product-gallery__stage"
      :style="galleryStageStyle"
      tabindex="0"
      role="group"
      aria-roledescription="carousel"
      aria-label="Product image carousel"
      @keydown.left.prevent="showPreviousImage"
      @keydown.right.prevent="showNextImage"
      @keydown.enter.self="showPreview"
      @keydown.space.self.prevent="showPreview"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    >
      <el-image
        v-if="selectedItem"
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

      <div
        v-else
        class="product-gallery__placeholder"
        role="img"
        :aria-label="`${productName} image unavailable`"
      >
        <span aria-hidden="true">W</span>
      </div>

      <template v-if="availableItems.length > 1">
        <button
          type="button"
          class="product-gallery__carousel-button product-gallery__carousel-button--previous"
          aria-label="Previous image"
          @click.stop="showPreviousImage"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          class="product-gallery__carousel-button product-gallery__carousel-button--next"
          aria-label="Next image"
          @click.stop="showNextImage"
        >
          <span aria-hidden="true">›</span>
        </button>
      </template>
    </div>

    <div
      v-if="editable || availableItems.length > 1"
      class="product-gallery__thumbnails"
      role="group"
      aria-label="Choose a product image"
    >
      <div
        v-for="item in availableItems"
        :key="item.key"
        :ref="(element) => setThumbnailRef(item.key, element)"
        class="product-gallery__thumbnail-item"
        :class="{
          'product-gallery__thumbnail-item--share': editable && item.kind === 'share',
          'product-gallery__thumbnail-item--dragging': draggedSourceId === item.sourceId,
        }"
        :draggable="editable && item.kind === 'share' && !busy"
        @dragstart="handleDragStart(item, $event)"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop.prevent="handleDrop(item)"
      >
        <span
          v-if="editable && item.kind === 'share'"
          class="product-gallery__drag-handle"
          aria-hidden="true"
        >
          ⋮⋮
        </span>
        <button
          type="button"
          class="product-gallery__thumbnail"
          :class="{ 'product-gallery__thumbnail--active': item.url === selectedUrl }"
          :aria-label="`View ${item.alt}`"
          :aria-current="item.url === selectedUrl ? 'true' : undefined"
          @click="selectImage(item)"
        >
          <img :src="item.url" :alt="item.alt" loading="lazy" @error="handleImageError(item)" />
        </button>

        <div
          v-if="editable && item.kind === 'share'"
          class="product-gallery__thumbnail-actions"
        >
          <button
            type="button"
            class="product-gallery__manage-button"
            aria-label="Move image left"
            :disabled="busy || isFirstShareImage(item)"
            @click.stop="moveImage(item, -1)"
          >
            ←
          </button>
          <button
            type="button"
            class="product-gallery__manage-button"
            aria-label="Move image right"
            :disabled="busy || isLastShareImage(item)"
            @click.stop="moveImage(item, 1)"
          >
            →
          </button>
          <button
            type="button"
            class="product-gallery__manage-button product-gallery__manage-button--delete"
            aria-label="Delete image"
            :aria-busy="deletingId === item.sourceId ? 'true' : undefined"
            :disabled="busy"
            @click.stop="deleteImage(item)"
          >
            ×
          </button>
        </div>
      </div>

      <div v-if="editable" class="product-gallery__add-item">
        <input
          ref="fileInputRef"
          class="product-gallery__file-input"
          type="file"
          multiple
          :accept="shareImageAccept"
          :disabled="busy || !canAddImages"
          tabindex="-1"
          aria-hidden="true"
          @change="handleFileSelection"
        />
        <button
          type="button"
          class="product-gallery__add-button"
          :aria-label="addImagesLabel"
          :disabled="busy || !canAddImages"
          @click="openFilePicker"
        >
          <span class="product-gallery__add-icon" aria-hidden="true">+</span>
          <span>{{ addImagesLabel }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type { ImageInstance } from 'element-plus'

import {
  createProductGalleryItems,
  moveShareImageIds,
  reorderShareImageIdsAtTarget,
  resolveAddImagesLabel,
  resolveAvailableGalleryItems,
  resolveCircularGalleryUrl,
  resolveGallerySelectedIndex,
  resolveGallerySwipeDirection,
  resolveSelectionAfterItemsChange,
  type ProductGalleryItem,
  type ProductShareImageSource,
} from '@/utils/productGallery'
import { SUPPORTED_SHARE_IMAGE_TYPES } from '@/utils/productShareImagePolicy'

const props = withDefaults(
  defineProps<{
    images: ProductShareImageSource[]
    fallbackImageUrl?: string | null
    productName: string
    editable?: boolean
    canAddImages?: boolean
    uploading?: boolean
    deletingId?: number | null
    reordering?: boolean
  }>(),
  {
    fallbackImageUrl: null,
    editable: false,
    canAddImages: true,
    uploading: false,
    deletingId: null,
    reordering: false,
  },
)

const emit = defineEmits<{
  'add-images': [files: File[]]
  'delete-image': [id: number]
  'reorder-images': [ids: number[]]
}>()

const failedUrls = ref<Set<string>>(new Set())
const selectedUrl = ref<string | null>(null)
const mainImageRef = ref<ImageInstance | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const thumbnailRefs = new Map<string, HTMLElement>()
const draggedSourceId = ref<number | null>(null)
const touchStart = ref<{ x: number; y: number } | null>(null)

const shareImageAccept = [...SUPPORTED_SHARE_IMAGE_TYPES].join(',')
const busy = computed(
  () => props.uploading || props.deletingId !== null || props.reordering,
)
const addImagesLabel = computed(() =>
  resolveAddImagesLabel(props.uploading, props.canAddImages),
)

const galleryItems = computed(() =>
  createProductGalleryItems(props.images, props.fallbackImageUrl, props.productName),
)

const availableItems = computed(() =>
  resolveAvailableGalleryItems(galleryItems.value, failedUrls.value),
)

const selectedItem = computed(
  () => availableItems.value.find((item) => item.url === selectedUrl.value) ?? null,
)

const galleryStageStyle = computed<CSSProperties>(() => ({
  '--gallery-backdrop-image': selectedItem.value
    ? `url(${JSON.stringify(selectedItem.value.url)})`
    : 'none',
}))

const previewSrcList = computed(() => availableItems.value.map((item) => item.url))

const selectedIndex = computed(() =>
  resolveGallerySelectedIndex(availableItems.value, selectedUrl.value),
)

const shareImageIds = computed(() =>
  props.images
    .map((image) => image.id)
    .filter((imageId): imageId is number => typeof imageId === 'number'),
)

const selectImage = (item: ProductGalleryItem) => {
  selectedUrl.value = item.url
}

const showAdjacentImage = (delta: -1 | 1) => {
  if (availableItems.value.length < 2) return
  selectedUrl.value = resolveCircularGalleryUrl(
    availableItems.value,
    selectedUrl.value,
    delta,
  )
}

const showPreviousImage = () => showAdjacentImage(-1)
const showNextImage = () => showAdjacentImage(1)

const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  touchStart.value = touch ? { x: touch.clientX, y: touch.clientY } : null
}

const handleTouchEnd = (event: TouchEvent) => {
  const start = touchStart.value
  const touch = event.changedTouches[0]
  touchStart.value = null
  if (!start || !touch) return

  const direction = resolveGallerySwipeDirection(
    start.x,
    start.y,
    touch.clientX,
    touch.clientY,
  )
  if (direction === 1) showNextImage()
  else if (direction === -1) showPreviousImage()
}

const handleTouchCancel = () => {
  touchStart.value = null
}

const handleImageError = (item: ProductGalleryItem) => {
  failedUrls.value = new Set([...failedUrls.value, item.url])
}

const showPreview = () => {
  mainImageRef.value?.showPreview()
}

const setThumbnailRef = (key: string, element: unknown) => {
  if (element instanceof HTMLElement) thumbnailRefs.set(key, element)
  else thumbnailRefs.delete(key)
}

const scrollActiveThumbnailIntoView = async () => {
  await nextTick()
  if (typeof window === 'undefined') return
  const item = selectedItem.value
  if (!item) return

  const thumbnail = thumbnailRefs.get(item.key)
  if (!thumbnail || typeof thumbnail.scrollIntoView !== 'function') return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  thumbnail.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'nearest',
  })
}

const openFilePicker = () => {
  if (!props.editable || busy.value || !props.canAddImages) return
  fileInputRef.value?.click()
}

const handleFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!props.editable || busy.value || !props.canAddImages || files.length === 0) return
  emit('add-images', files)
}

const deleteImage = (item: ProductGalleryItem) => {
  if (!props.editable || busy.value || item.kind !== 'share') return
  if (typeof item.sourceId !== 'number') return
  emit('delete-image', item.sourceId)
}

const emitReorder = (reorderedIds: number[]) => {
  if (reorderedIds.every((id, index) => id === shareImageIds.value[index])) return
  emit('reorder-images', reorderedIds)
}

const moveImage = (item: ProductGalleryItem, delta: -1 | 1) => {
  if (!props.editable || busy.value || item.kind !== 'share') return
  if (typeof item.sourceId !== 'number') return
  emitReorder(moveShareImageIds(shareImageIds.value, item.sourceId, delta))
}

const isFirstShareImage = (item: ProductGalleryItem) =>
  typeof item.sourceId !== 'number' || shareImageIds.value.indexOf(item.sourceId) <= 0

const isLastShareImage = (item: ProductGalleryItem) => {
  if (typeof item.sourceId !== 'number') return true
  return shareImageIds.value.indexOf(item.sourceId) === shareImageIds.value.length - 1
}

const handleDragStart = (item: ProductGalleryItem, event: DragEvent) => {
  if (!props.editable || busy.value || item.kind !== 'share') {
    event.preventDefault()
    return
  }
  if (typeof item.sourceId !== 'number') {
    event.preventDefault()
    return
  }

  draggedSourceId.value = item.sourceId
  event.dataTransfer?.setData('text/plain', String(item.sourceId))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const handleDragEnd = () => {
  draggedSourceId.value = null
}

const handleDrop = (targetItem: ProductGalleryItem) => {
  const sourceId = draggedSourceId.value
  draggedSourceId.value = null
  if (!props.editable || busy.value || sourceId === null || targetItem.kind !== 'share') return
  if (typeof targetItem.sourceId !== 'number' || sourceId === targetItem.sourceId) return

  const reorderedIds = reorderShareImageIdsAtTarget(
    shareImageIds.value,
    sourceId,
    targetItem.sourceId,
  )
  emitReorder(reorderedIds)
}

watch(
  availableItems,
  (items, beforeItems) => {
    selectedUrl.value = resolveSelectionAfterItemsChange(
      beforeItems ?? [],
      items,
      selectedUrl.value,
    )
  },
  { immediate: true, flush: 'sync' },
)

watch(selectedUrl, scrollActiveThumbnailIntoView, { flush: 'post' })

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
  position: relative;
  isolation: isolate;
  aspect-ratio: 1;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--gallery-border);
  border-radius: 18px;
  background: var(--color-stage);
  box-shadow:
    0 18px 48px rgb(31 70 68 / 8%),
    0 2px 8px rgb(31 70 68 / 5%);
  touch-action: pan-y pinch-zoom;
}

.product-gallery__stage::before,
.product-gallery__stage::after {
  position: absolute;
  pointer-events: none;
  content: '';
}

.product-gallery__stage::before {
  z-index: 0;
  inset: -26px;
  background-image: var(--gallery-backdrop-image);
  background-position: center;
  background-size: cover;
  filter: blur(22px) saturate(0.82);
  opacity: 0.5;
  transform: scale(1.08);
  transition: opacity 180ms ease;
}

.product-gallery__stage::after {
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 58%), rgb(244 249 248 / 36%)),
    radial-gradient(circle at 50% 48%, transparent 38%, rgb(255 255 255 / 22%) 100%);
}

.product-gallery__stage:focus-visible,
.product-gallery button:focus-visible {
  outline: 3px solid rgb(15 159 154 / 30%);
  outline-offset: 2px;
}

.product-gallery__stage:focus-visible {
  outline-offset: -4px;
}

.product-gallery__main-image {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.product-gallery__main-image :deep(.el-image__inner) {
  filter: drop-shadow(0 12px 24px rgb(19 48 46 / 14%));
}

.product-gallery__placeholder {
  position: relative;
  z-index: 2;
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

.product-gallery__carousel-button {
  position: absolute;
  top: 50%;
  z-index: 3;
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgb(15 159 154 / 18%);
  border-radius: 50%;
  place-items: center;
  color: #156f6b;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 8px 22px rgb(31 70 68 / 14%);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.product-gallery__carousel-button:hover {
  color: #fff;
  background: var(--gallery-accent);
  box-shadow: 0 9px 24px rgb(15 159 154 / 24%);
}

.product-gallery__carousel-button span {
  margin-top: -3px;
  font-size: 34px;
  line-height: 1;
}

.product-gallery__carousel-button--previous {
  left: 14px;
}

.product-gallery__carousel-button--next {
  right: 14px;
}

.product-gallery__thumbnails {
  display: flex;
  gap: 10px;
  max-width: 100%;
  padding: 8px;
  overflow-x: auto;
  border: 1px solid rgb(31 70 68 / 8%);
  border-radius: 16px;
  background: rgb(255 255 255 / 68%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 82%),
    0 8px 24px rgb(31 70 68 / 5%);
  overscroll-behavior-inline: contain;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgb(15 159 154 / 32%) transparent;
}

.product-gallery__thumbnail-item,
.product-gallery__add-item {
  position: relative;
  flex: 0 0 72px;
  width: 72px;
}

.product-gallery__thumbnail-item--share {
  padding-top: 14px;
  cursor: grab;
}

.product-gallery__thumbnail-item--dragging {
  opacity: 0.55;
}

.product-gallery__drag-handle {
  position: absolute;
  top: -4px;
  left: 50%;
  color: #71918f;
  font-size: 15px;
  letter-spacing: -0.22em;
  line-height: 1;
  transform: translateX(-50%) rotate(90deg);
}

.product-gallery__thumbnail {
  display: block;
  width: 66px;
  height: 66px;
  overflow: hidden;
  margin: 0 auto;
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

.product-gallery__thumbnail--active {
  border-color: var(--gallery-accent);
  background: var(--gallery-accent-soft);
  box-shadow: 0 5px 14px rgb(15 159 154 / 16%);
}

.product-gallery__thumbnail-actions {
  display: flex;
  justify-content: center;
  gap: 3px;
  padding-top: 5px;
}

.product-gallery__manage-button {
  display: grid;
  width: 21px;
  height: 21px;
  padding: 0;
  border: 1px solid #dce9e7;
  border-radius: 6px;
  place-items: center;
  color: #277b77;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.product-gallery__manage-button:hover:not(:disabled) {
  border-color: rgb(15 159 154 / 55%);
  background: var(--gallery-accent-soft);
}

.product-gallery__manage-button--delete {
  color: #b34444;
}

.product-gallery button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.product-gallery__add-item {
  align-self: flex-start;
  padding-top: 14px;
}

.product-gallery__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.product-gallery__add-button {
  display: grid;
  width: 72px;
  min-height: 92px;
  padding: 8px 4px;
  border: 1px dashed rgb(15 159 154 / 48%);
  border-radius: 12px;
  place-content: center;
  gap: 3px;
  color: #277b77;
  background: rgb(232 248 246 / 62%);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  line-height: 1.15;
  text-align: center;
}

.product-gallery__add-button:hover:not(:disabled) {
  border-color: var(--gallery-accent);
  background: var(--gallery-accent-soft);
}

.product-gallery__add-icon {
  font-size: 23px;
  font-weight: 300;
  line-height: 1;
}

@media (max-width: 640px) {
  .product-gallery {
    gap: 10px;
    max-width: 100%;
  }

  .product-gallery__stage {
    border-radius: 14px;
  }

  .product-gallery__stage::before {
    inset: -20px;
    filter: blur(18px) saturate(0.82);
  }

  .product-gallery__carousel-button {
    width: 38px;
    height: 38px;
  }

  .product-gallery__carousel-button--previous {
    left: 10px;
  }

  .product-gallery__carousel-button--next {
    right: 10px;
  }

  .product-gallery__thumbnails {
    width: 100%;
    padding: 6px;
    border-radius: 14px;
  }

  .product-gallery__drag-handle {
    display: none;
  }

  .product-gallery__thumbnail-item--share,
  .product-gallery__add-item {
    padding-top: 0;
  }

  .product-gallery__thumbnail {
    width: 64px;
    height: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-gallery__thumbnails {
    scroll-behavior: auto;
  }

  .product-gallery__carousel-button,
  .product-gallery__thumbnail,
  .product-gallery__stage::before {
    transition: none;
  }
}
</style>
