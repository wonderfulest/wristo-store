<template>
  <main class="catalog-home">
    <HomeBanner premium-only />
    <HomeIntro />
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
import { onMounted, ref } from 'vue'
import { getNewProducts } from '@/api/product'
import type { ProductBaseVO } from '@/types'
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'
import HomeBanner from '@/views/home/components/HomeBanner.vue'
import HomeIntro from '@/views/home/components/HomeIntro.vue'
import HomeProductGrid from '@/views/home/components/HomeProductGrid.vue'

const pageSize = 24
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
.catalog-home { min-height: 100%; overflow: hidden; background: #f7f8f5; }
.premium-suite-section {
  width: min(960px, calc(100% - 32px));
  margin: 32px auto 64px;
}
@media (max-width: 768px) {
  .premium-suite-section {
    width: calc(100% - 24px);
    margin: 24px auto 40px;
  }
}
</style>
