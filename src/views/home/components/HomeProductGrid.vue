<template>
  <section class="catalog-products" aria-labelledby="new-products-title">
    <div class="storefront-container">
      <SectionHeading id="new-products-title" :title="t('home.newArrivalsTitle')" />
      <ProductGridSkeleton v-if="loading" :count="8" class="catalog-products__grid" />
      <div v-else-if="error" class="catalog-products__state" role="status">
        <strong>{{ t('home.catalogErrorTitle') }}</strong>
        <span>{{ t('home.sectionUnavailable') }}</span>
      </div>
      <div v-else-if="products.length" class="catalog-products__grid">
        <ProductCard v-for="product in products" :key="product.appId" :product="product" />
      </div>
      <div v-else class="catalog-products__state" role="status">
        <strong>{{ t('home.catalogEmptyTitle') }}</strong>
        <span>{{ t('home.catalogEmptyDescription') }}</span>
      </div>
      <div v-if="products.length" class="catalog-products__more">
        <button
          v-if="hasMore && !infiniteScrollEnabled"
          type="button"
          class="catalog-products__more-button"
          @click="$emit('load-more')"
        >
          {{ t('home.loadMore') }}
        </button>
        <button
          v-else-if="loadMoreError"
          type="button"
          class="catalog-products__more-button"
          @click="$emit('retry')"
        >
          {{ t('home.loadMoreRetry') }}
        </button>
        <span v-else-if="loadingMore" class="catalog-products__more-status" role="status">
          {{ t('home.loadingMore') }}
        </span>
        <span v-else-if="!hasMore" class="catalog-products__more-status">
          {{ t('home.noMoreProducts') }}
        </span>
        <div v-if="infiniteScrollEnabled && hasMore" ref="loadMoreSentinel" class="catalog-products__sentinel" aria-hidden="true"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { ProductBaseVO } from '@/types'
import { useI18n } from '@/i18n'
import ProductCard from '@/components/ProductCard.vue'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'

const props = defineProps<{
  products: ProductBaseVO[]
  loading?: boolean
  error?: boolean
  loadingMore?: boolean
  loadMoreError?: boolean
  hasMore?: boolean
  infiniteScrollEnabled?: boolean
}>()
const emit = defineEmits<{
  (event: 'load-more'): void
  (event: 'retry'): void
  (event: 'reach-end'): void
}>()
const { t } = useI18n()
const loadMoreSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const observeSentinel = async () => {
  observer?.disconnect()
  observer = null
  if (!props.infiniteScrollEnabled || !props.hasMore) return

  await nextTick()
  if (!loadMoreSentinel.value) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !props.loadingMore && !props.loadMoreError) emit('reach-end')
  }, { rootMargin: '320px 0px' })
  observer.observe(loadMoreSentinel.value)
}

watch(() => [props.infiniteScrollEnabled, props.hasMore, props.loadingMore, props.loadMoreError], observeSentinel, { flush: 'post' })
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.catalog-products { padding: clamp(28px, 5vw, 64px) 0; background: #f7f8f5; }
.catalog-products :deep(.section-heading__title) { font-size: clamp(1.5rem, 2.2vw, 2rem); line-height: 1.15; }
.catalog-products__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16px, 2vw, 28px); margin-top: 18px; }
.catalog-products__state { display: grid; gap: 6px; margin-top: 30px; padding: 34px; border: 1px solid var(--color-line); color: var(--color-muted); background: var(--color-surface); }
.catalog-products__state strong { color: var(--color-ink); font-size: 1.1rem; }
.catalog-products__more { display: flex; min-height: 72px; align-items: center; justify-content: center; padding-top: 28px; }
.catalog-products__more-button { min-width: 132px; min-height: 44px; padding: 10px 24px; border: 1px solid var(--color-ink); border-radius: 999px; color: var(--color-surface); background: var(--color-ink); font: inherit; font-weight: 700; cursor: pointer; }
.catalog-products__more-button:hover { opacity: 0.86; }
.catalog-products__more-button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.catalog-products__more-status { color: var(--color-muted); font-size: 0.92rem; }
.catalog-products__sentinel { width: 100%; height: 1px; }
@media (max-width: 1024px) { .catalog-products__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .catalog-products__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .catalog-products__grid { grid-template-columns: 1fr; } }
</style>
