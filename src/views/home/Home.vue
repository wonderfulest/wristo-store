<template>
  <main class="catalog-home">
    <HomeIntro />
    <HomeProductGrid :products="newProducts" :loading="loading" :error="sectionErrors.newest" />
    <SeriesSection class="catalog-series" :series-list="seriesList" :loading="loading" :error="sectionErrors.series" @series-click="goToSeries" />
    <HomeGuides />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import type { ProductBaseVO, Series } from '@/types'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import HomeIntro from '@/views/home/components/HomeIntro.vue'
import HomeProductGrid from '@/views/home/components/HomeProductGrid.vue'
import SeriesSection from '@/views/home/components/SeriesSection.vue'
import HomeGuides from '@/views/home/components/HomeGuides.vue'

const productStore = useProductStore()
const router = useRouter()
const localeStore = useLocaleStore()
const seriesList = ref<Series[]>([])
const newProducts = ref<ProductBaseVO[]>([])
const loading = ref(true)
const sectionErrors = ref({ series: false, newest: false })

onMounted(async () => {
  const [series, newest] = await Promise.allSettled([
    productStore.getHotSeries(8),
    productStore.getNewProducts(24),
  ])
  if (series.status === 'fulfilled') seriesList.value = series.value
  else sectionErrors.value.series = true
  if (newest.status === 'fulfilled') newProducts.value = newest.value
  else sectionErrors.value.newest = true
  loading.value = false
})

const goToSeries = (series: Series) => {
  router.push(addLocaleToPath(`/categories/${series.slug}`, localeStore.currentLocale))
}
</script>

<style scoped>
.catalog-home { min-height: 100%; overflow: hidden; background: #f7f8f5; }
.catalog-series { border-top: 1px solid var(--color-line); }
</style>
