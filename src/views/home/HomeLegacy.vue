<template>
  <div class="home">
    <HomeBanner />
    <SearchSection :initial-search-term="searchTerm" :submit-on-focus="true" @submit="handleSubmitSearch" />
    <NewArrivalsCarousel :new-products="newProducts" :loading="loading" :error="sectionErrors.newest" @product-click="goToProduct" />
    <SeriesSection :series-list="seriesList" :loading="loading" :error="sectionErrors.series" @series-click="goToSeries" />
    <BrandsSection />
    <FeatureSection />
    <HotProductsSection :hot-products="hotProducts" :loading="loading" :error="sectionErrors.hot" @more-click="goToTopApps" />
  </div>
  <PremiumSuiteCard class="premium-suite-section" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import type { ProductBaseVO, Series } from '@/types'
import HomeBanner from '@/views/home/components/HomeBanner.vue'
import SearchSection from '@/views/home/components/SearchSection.vue'
import BrandsSection from '@/views/brands/BrandsSection.vue'
import FeatureSection from '@/views/home/components/FeatureSection.vue'
import NewArrivalsCarousel from '@/views/home/components/NewArrivalsCarousel.vue'
import SeriesSection from '@/views/home/components/SeriesSection.vue'
import HotProductsSection from '@/views/home/components/HotProductsSection.vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'

const productStore = useProductStore()
const router = useRouter()
const localeStore = useLocaleStore()
const searchTerm = ref('')
const seriesList = ref<Series[]>([])
const hotProducts = ref<ProductBaseVO[]>([])
const newProducts = ref<ProductBaseVO[]>([])
const loading = ref(true)
const sectionErrors = ref({ series: false, hot: false, newest: false })

const handleSubmitSearch = async (term: string) => {
  const q = term.trim()
  searchTerm.value = term
  const path = addLocaleToPath('/search', localeStore.currentLocale)
  await router.push(q ? { path, query: { q } } : { path })
}

onMounted(async () => {
  const [series, hot, newest] = await Promise.allSettled([
    productStore.getHotSeries(10),
    productStore.getHotProducts(),
    productStore.getNewProducts(60),
  ])
  if (series.status === 'fulfilled') seriesList.value = series.value
  else sectionErrors.value.series = true
  if (hot.status === 'fulfilled') hotProducts.value = hot.value
  else sectionErrors.value.hot = true
  if (newest.status === 'fulfilled') newProducts.value = newest.value
  else sectionErrors.value.newest = true
  loading.value = false
})

const goToProduct = (product: ProductBaseVO) => router.push(addLocaleToPath(`/product/${product.appId}`, localeStore.currentLocale))
const goToTopApps = () => router.push(addLocaleToPath('/top', localeStore.currentLocale))
const goToSeries = (series: Series) => router.push(addLocaleToPath(`/categories/${series.slug}`, localeStore.currentLocale))
</script>

<style scoped>
.home { width: 100%; max-width: 100vw; overflow-x: hidden; background: var(--color-canvas); }
.premium-suite-section { width: min(960px, calc(100% - 32px)); margin: 32px auto 64px; }
@media (max-width: 768px) {
  .premium-suite-section { width: calc(100% - 24px); margin: 24px auto 40px; }
}
</style>
