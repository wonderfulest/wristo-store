<template>
  <main class="catalog-home">
    <div class="home-promotions" :class="{ 'home-promotions--studio-only': hasPremiumAccess }">
      <StudioPromo />
      <HomeBanner v-if="!hasPremiumAccess" premium-only />
    </div>
    <HomeIntro />
    <WatchfaceDiscovery />
    <HomeProductGrid
      :products="newProducts"
      :loading="loading"
      :error="loadError"
      :loading-more="loadingMore"
      :load-more-error="loadMoreError"
      :has-more="hasMore"
      :infinite-scroll-enabled="infiniteScrollEnabled"
      @load-more="enableInfiniteScroll"
      @retry="loadMore"
      @reach-end="loadMore"
    />
    <PremiumSuiteCard class="premium-suite-section" />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getNewProducts } from '@/api/product'
import { useUserStore } from '@/store/user'
import type { ProductBaseVO } from '@/types'
import { hasPremiumEntitlement } from '@/utils/entitlements'
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'
import HomeBanner from '@/views/home/components/HomeBanner.vue'
import WatchfaceDiscovery from '@/components/discovery/WatchfaceDiscovery.vue'
import StudioPromo from '@/views/home/components/StudioPromo.vue'
import HomeIntro from '@/views/home/components/HomeIntro.vue'
import HomeProductGrid from '@/views/home/components/HomeProductGrid.vue'

const pageSize = 24
const userStore = useUserStore()
const hasPremiumAccess = computed(() => hasPremiumEntitlement(userStore.userInfo))
const newProducts = ref<ProductBaseVO[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const loadError = ref(false)
const loadMoreError = ref(false)
const hasMore = ref(true)
const infiniteScrollEnabled = ref(false)

const loadInitialProducts = async () => {
  try {
    newProducts.value = await getNewProducts(pageSize)
    hasMore.value = newProducts.value.length === pageSize
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  loadMoreError.value = false
  const requestedLimit = newProducts.value.length + pageSize
  try {
    const products = await getNewProducts(requestedLimit)
    newProducts.value = Array.from(new Map(products.map((product) => [product.appId, product])).values())
    hasMore.value = products.length === requestedLimit
  } catch {
    loadMoreError.value = true
  } finally {
    loadingMore.value = false
  }
}

const enableInfiniteScroll = () => {
  infiniteScrollEnabled.value = true
  void loadMore()
}

onMounted(loadInitialProducts)
</script>

<style scoped>
.catalog-home {
  --home-content-width: 1200px;
  --home-gutter: clamp(16px, 3.3vw, 48px);
  min-height: 100%;
  overflow: hidden;
  background: #f7f8f5;
}

/* One content edge for promotions, search, discovery and the catalog. */
.catalog-home :deep(.storefront-container) {
  width: min(var(--home-content-width), calc(100% - var(--home-gutter) * 2));
  padding-inline: 0;
}
.catalog-home :deep(.catalog-intro) { padding-top: 28px; }
.catalog-home :deep(.catalog-intro__search) {
  min-height: 132px;
  border: 1px solid var(--color-line);
  border-radius: 24px;
}
.catalog-home :deep(.catalog-intro__search .search-bar-outer) {
  margin-block: 24px;
  padding-inline: 24px;
}
.catalog-home :deep(.catalog-intro__search .search-bar-inner) {
  width: min(820px, 100%);
  min-width: 0;
}
.catalog-home :deep(.discovery-entry) { padding-top: 24px; padding-bottom: 0; }
.catalog-home :deep(.catalog-products) { padding-block: 48px; }

.premium-suite-section {
  width: min(var(--home-content-width), calc(100% - var(--home-gutter) * 2));
  margin: 32px auto 64px;
}
@media (max-width: 768px) {
  .premium-suite-section {
    margin: 24px auto 40px;
  }
}

.home-promotions {
  width: min(var(--home-content-width), calc(100% - var(--home-gutter) * 2));
  margin: 28px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 20px;
}
.home-promotions--studio-only { grid-template-columns: minmax(0, 1fr); }
.home-promotions :deep(.studio-promo) { width: 100%; margin: 0; }
.home-promotions :deep(.studio-promo__body) { height: 100%; grid-template-columns: minmax(0, 1fr) 180px; }
.home-promotions :deep(.studio-promo__copy) { padding: 28px 0 28px 28px; }
.home-promotions :deep(.studio-promo__eyebrow) { margin-bottom: 16px; }
.home-promotions :deep(.studio-promo h2) { font-size: 32px; }
.home-promotions :deep(.studio-promo__description) { margin: 16px 0 20px; font-size: 14px; line-height: 1.6; }
.home-promotions :deep(.studio-promo__art) { padding: 0 12px 0 0; }
.home-promotions :deep(.studio-promo__art-label),
.home-promotions :deep(.studio-promo__steps) { display: none; }
.home-promotions :deep(.home-banner--premium) { padding: 0; min-width: 0; }
.home-promotions :deep(.home-banner--premium .banner-shell) { width: 100%; height: 100%; }
.home-promotions :deep(.home-banner--premium .banner-content) { height: 100%; grid-template-columns: minmax(0, 1fr) 130px; gap: 18px; padding: 28px; }
.home-promotions :deep(.home-banner--premium .banner-content.theme-store .banner-title) { font-size: 32px; margin: 16px 0; }
.home-promotions :deep(.home-banner--premium .banner-desc) { font-size: 14px; line-height: 1.6; }
.home-promotions :deep(.home-banner--premium .banner-stage--poster) { width: 130px; }
.home-promotions :deep(.home-banner--premium .banner-primary) { gap: 12px; }
@media (max-width: 1150px) {
  .home-promotions :deep(.studio-promo__body) { grid-template-columns: minmax(0, 1fr); }
  .home-promotions :deep(.studio-promo__copy) { padding: 28px; }
  .home-promotions :deep(.studio-promo__art) { display: none; }
}
@media (max-width: 1023px), (hover: none) and (pointer: coarse) {
  .home-promotions { grid-template-columns: minmax(0, 1fr); }
  .home-promotions--studio-only { display: none; }
}
@media (max-width: 600px) {
  .catalog-home { --home-gutter: 16px; }
  .catalog-home :deep(.catalog-intro) { padding-top: 20px; }
  .catalog-home :deep(.catalog-intro__search) { min-height: 100px; border-radius: 20px; }
  .catalog-home :deep(.catalog-intro__search .search-bar-outer) { margin-block: 20px; padding-inline: 12px; }
  .catalog-home :deep(.discovery-entry) { padding-top: 20px; }
  .catalog-home :deep(.catalog-products) { padding-block: 32px; }
  .home-promotions { margin-top: 16px; }
  .home-promotions :deep(.home-banner--premium .banner-content) { grid-template-columns: minmax(0, 1fr); padding: 24px; }
  .home-promotions :deep(.home-banner--premium .banner-stage--poster) { display: none; }
}
</style>
