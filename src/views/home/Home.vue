<template>
  <main class="catalog-home">
    <HomeBanner v-if="!hasPremiumAccess" premium-only />
    <StudioPromoDialog />
    <HomeIntro />
    <CuratedEntrances />
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
import CuratedEntrances from '@/components/CuratedEntrances.vue'
import { getNewProducts } from '@/api/product'
import { useUserStore } from '@/store/user'
import type { ProductBaseVO } from '@/types'
import { hasPremiumEntitlement } from '@/utils/entitlements'
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'
import HomeBanner from '@/views/home/components/HomeBanner.vue'
import StudioPromoDialog from '@/views/home/components/StudioPromoDialog.vue'
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

/* One content edge for promotions, search and the catalog. */
.catalog-home :deep(.storefront-container) {
  width: min(var(--home-content-width), calc(100% - var(--home-gutter) * 2));
  padding-inline: 0;
}
.catalog-home :deep(.catalog-intro) { padding-top: 28px; }
.catalog-home :deep(.catalog-intro__search) {
  min-height: 112px;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  background: var(--color-surface);
}
.catalog-home :deep(.catalog-intro__search .search-bar-outer) {
  margin-block: 24px;
  padding-inline: 24px;
}
.catalog-home :deep(.catalog-intro__search .search-bar-inner) {
  width: 100%;
  max-width: none;
  min-width: 0;
  min-height: 60px;
  padding: 7px 8px 7px 18px;
  border-radius: 12px;
  border-color: #dce3d4;
  background: #f7f8f5;
  box-shadow: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.catalog-home :deep(.catalog-intro__search .search-bar-inner:focus-within) {
  border-color: #6f8752;
  box-shadow: 0 0 0 3px rgb(111 135 82 / 12%);
}
.catalog-home :deep(.catalog-intro__search .search-icon) {
  width: 24px;
  height: 24px;
  color: #5f7650;
  margin-right: 12px;
}
.catalog-home :deep(.catalog-intro__search .search-bar-input .el-input__inner) {
  font-size: 16px;
  font-weight: 400;
}
.catalog-home :deep(.catalog-intro__search .search-bar-input .el-input__inner::placeholder) {
  font-size: 14px;
  color: #677360 !important;
}
.catalog-home :deep(.catalog-intro__search .search-submit-btn) {
  border-radius: 8px;
  background: #294c3b;
  font-size: 14px;
  font-weight: 600;
}
.catalog-home :deep(.catalog-intro__search .search-submit-btn:hover:not(:disabled)) {
  background: #183a28;
  transform: none;
}
.catalog-home :deep(.catalog-intro__search .search-submit-btn:disabled) {
  background: #e4e9df;
  color: #66745e;
  opacity: 1;
}
.catalog-home :deep(.catalog-intro__search .search-submit-btn:focus-visible) {
  outline: 2px solid #294c3b;
  outline-offset: 3px;
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

@media (max-width: 600px) {
  .catalog-home { --home-gutter: 16px; }
  .catalog-home :deep(.catalog-intro) { padding-top: 20px; }
  .catalog-home :deep(.catalog-intro__search) { min-height: 100px; border-radius: 20px; }
  .catalog-home :deep(.catalog-intro__search .search-bar-outer) { margin-block: 20px; padding-inline: 12px; }
  .catalog-home :deep(.discovery-entry) { padding-top: 20px; }
  .catalog-home :deep(.catalog-products) { padding-block: 32px; }
}
</style>
