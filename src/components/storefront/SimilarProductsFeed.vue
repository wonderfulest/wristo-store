<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ProductBaseVO } from '@/types'
import { useProductStore } from '@/store/product'
import { useLocaleStore } from '@/store/locale'
import { addLocaleToPath } from '@/store/locale'
import { getProductImageUrl } from '@/utils/productImage'
import { appendRecentlyViewed } from '@/utils/productRecommendations'
import { useI18n } from '@/i18n'

const props = defineProps<{ appId: number }>()
const router = useRouter()
const productStore = useProductStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const items = ref<ProductBaseVO[]>([])
const loading = ref(false)
const failed = ref(false)
const pageNum = ref(1)
const hasMore = ref(true)
const sentinel = ref<HTMLElement | null>(null)
const recentlyViewed = ref<number[]>([])
let observer: IntersectionObserver | null = null

const excluded = computed(() => new Set([props.appId, ...recentlyViewed.value]))

const load = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  failed.value = false
  try {
    const page = await productStore.getProductRecommendations(
      String(props.appId),
      pageNum.value,
      [...excluded.value],
    )
    const next = page.list || []
    const existing = new Set(items.value.map((item) => item.appId))
    for (const item of next) {
      if (!excluded.value.has(item.appId) && !existing.has(item.appId)) items.value.push(item)
    }
    hasMore.value = pageNum.value < page.pages
    pageNum.value += 1
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

const observe = async () => {
  await nextTick()
  observer?.disconnect()
  if (!sentinel.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void load()
  }, { rootMargin: '500px' })
  observer.observe(sentinel.value)
}

const openProduct = async (item: ProductBaseVO) => {
  recentlyViewed.value = appendRecentlyViewed(recentlyViewed.value, props.appId)
  await router.push(addLocaleToPath(`/app/${item.appId}`, localeStore.currentLocale))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => props.appId, async () => {
  recentlyViewed.value = appendRecentlyViewed(recentlyViewed.value, props.appId)
  items.value = []
  pageNum.value = 1
  hasMore.value = true
  await load()
  await observe()
}, { immediate: true })

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="similar-products" aria-labelledby="similar-products-title">
    <header>
      <p>{{ t('recommendations.keepExploring') }}</p>
      <h2 id="similar-products-title">{{ t('recommendations.similarTitle') }}</h2>
    </header>
    <div class="similar-products-grid">
      <article v-for="item in items" :key="item.appId" class="similar-product-card">
        <button type="button" class="similar-product-open" @click="openProduct(item)">
          <img :src="getProductImageUrl(item)" :alt="item.name" loading="lazy" />
          <span class="similar-product-copy"><strong>{{ item.name }}</strong><span>${{ item.price.toFixed(2) }}</span></span>
        </button>
      </article>
    </div>
    <button v-if="failed" type="button" class="similar-products-retry" @click="load">{{ t('recommendations.retry') }}</button>
    <div ref="sentinel" class="similar-products-sentinel" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
.similar-products { width: min(100%, 980px); margin: 24px auto 0; padding: 0 12px 80px; }
.similar-products header p { margin: 0; color: var(--color-brand-strong); font-weight: 800; }
.similar-products h2 { margin: 4px 0 16px; color: var(--color-ink); font-size: clamp(1.5rem, 6vw, 2.2rem); }
.similar-products-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.similar-product-card { position: relative; min-width: 0; overflow: hidden; border: 1px solid var(--color-line); border-radius: 20px; background: #fff; }
.similar-product-open { width: 100%; padding: 0; border: 0; color: inherit; text-align: left; background: none; cursor: pointer; }
.similar-product-open img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; background: var(--color-stage); }
.similar-product-copy { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 12px; }
.similar-product-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.similar-product-copy span { color: var(--color-stage-muted); font-weight: 750; }
.similar-products-retry { min-height: 44px; margin-top: 16px; }
.similar-products-sentinel { height: 1px; }
@media (min-width: 760px) { .similar-products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
</style>
