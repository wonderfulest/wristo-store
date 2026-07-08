<template>

  <div class="home">
    <!-- Home Banner -->
    <HomeBanner />

    <!-- Search Section -->
    <SearchSection 
      :initialSearchTerm="searchTerm"
      :submitOnFocus="true"
      @submit="handleSubmitSearch"
    />

    <!-- New Arrivals Carousel -->
    <NewArrivalsCarousel
      :new-products="newProducts"
      @product-click="goToProduct"
    />

    <!-- Series Section -->
    <SeriesSection 
      :series-list="seriesList"
      @series-click="goToSeries"
    />

    <!-- Brands Section -->
    <BrandsSection />
    
    <!-- Feature Section -->
    <FeatureSection />

    <!-- Hot Products Section -->
    <HotProductsSection 
      :hot-products="hotProducts"
      @product-click="goToProduct"
      @more-click="goToTopApps"
    />
  </div>
  <section class="premium-suite-section">
    <PremiumSuiteCard />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/store/product';
import type { ProductBaseVO, Series } from '@/types';
import HomeBanner from '@/views/home/components/HomeBanner.vue';
import SearchSection from '@/views/home/components/SearchSection.vue';
import BrandsSection from '@/views/brands/BrandsSection.vue';
import FeatureSection from '@/views/home/components/FeatureSection.vue';
import NewArrivalsCarousel from '@/views/home/components/NewArrivalsCarousel.vue';
import SeriesSection from '@/views/home/components/SeriesSection.vue';
import HotProductsSection from '@/views/home/components/HotProductsSection.vue';
import { addLocaleToPath, useLocaleStore } from '@/store/locale';
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue';

const productStore = useProductStore();
const router = useRouter();
const localeStore = useLocaleStore();

const searchTerm = ref('');
const seriesList = ref<Series[]>([]);
const hotProducts = ref<ProductBaseVO[]>([]);
const newProducts = ref<ProductBaseVO[]>([]);

const handleSubmitSearch = async (term: string) => {
  const q = term.trim()
  searchTerm.value = term
  const searchPath = addLocaleToPath('/search', localeStore.currentLocale)
  await router.push(q ? { path: searchPath, query: { q } } : { path: searchPath })
}

// Fetch initial data
onMounted(async () => {
  try {
    [seriesList.value, hotProducts.value, newProducts.value] = await Promise.all([
      productStore.getHotSeries(),
      productStore.getHotProducts(),
      productStore.getNewProducts(30)
    ]);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }
});

const goToProduct = (product: ProductBaseVO) => {
  router.push(addLocaleToPath(`/product/${product.appId}`, localeStore.currentLocale));
};

const goToTopApps = () => {
  router.push(addLocaleToPath('/top', localeStore.currentLocale));
};

const goToSeries = (series: Series) => {
  router.push(addLocaleToPath(`/categories/${series.slug}`, localeStore.currentLocale));
};

</script>

<style scoped>
.home {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, #fbfdfc 0%, #f4f7f6 34%, #ffffff 100%);
}
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
