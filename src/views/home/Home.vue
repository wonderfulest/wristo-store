<template>

  <div class="home bg-white">
    <!-- Home Banner -->
    <HomeBanner />

    <!-- Search Section -->
    <SearchSection 
      @search="handleSearch" 
      :initialSearchTerm="searchTerm"
    />

    <!-- Search Results -->
    <SearchResultsSection 
      v-if="searchResults.length > 0" 
      :search-results="searchResults"
    />

    <!-- New Arrivals Carousel -->
    <NewArrivalsCarousel 
      :new-products="newProducts"
      @product-click="goToProduct"
    />
    
    <!-- Brands Section -->
    <BrandsSection />
    
    <!-- Feature Section -->
    <FeatureSection />

    <!-- Series Section -->
    <SeriesSection 
      :series-list="seriesList"
      @series-click="goToSeries"
    />

    <!-- Hot Products Section -->
    <HotProductsSection 
      :hot-products="hotProducts"
      @product-click="goToProduct"
    />
  </div>
  <div class="newsletter-wrap">
    <Newsletter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/store/product';
import type { ProductBaseVO, Series } from '@/types';
import Newsletter from '@/components/Newsletter.vue';
import HomeBanner from '@/views/home/components/HomeBanner.vue';
import SearchSection from '@/views/home/components/SearchSection.vue';
import SearchResultsSection from '@/views/home/components/SearchResultsSection.vue';
import NewArrivalsCarousel from '@/views/home/components/NewArrivalsCarousel.vue';
import BrandsSection from '@/views/brands/BrandsSection.vue';
import FeatureSection from '@/views/home/components/FeatureSection.vue';
import SeriesSection from '@/views/home/components/SeriesSection.vue';
import HotProductsSection from '@/views/home/components/HotProductsSection.vue';

const productStore = useProductStore();
const router = useRouter();

const searchTerm = ref('');
const searchResults = ref<ProductBaseVO[]>([]);
const newProducts = ref<ProductBaseVO[]>([]);
const seriesList = ref<Series[]>([]);
const hotProducts = ref<ProductBaseVO[]>([]);

const handleSearch = async (term: string) => {
  searchTerm.value = term;
  if (term.length > 0) {
    searchResults.value = await productStore.searchProducts(term);
  } else {
    searchResults.value = [];
  }
};

// Fetch initial data
onMounted(async () => {
  try {
    [newProducts.value, seriesList.value, hotProducts.value] = await Promise.all([
      productStore.getNewProducts(),
      productStore.getHotSeries(),
      productStore.getHotProducts()
    ]);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }
});

const goToProduct = (product: ProductBaseVO) => {
  router.push({ name: 'product-detail', params: { id: product.appId } });
};

const goToSeries = (series: Series) => {
  router.push(`/categories/${series.slug}`);
};
</script>

<style scoped>
.home {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
.newsletter-wrap {
  margin-bottom: 64px;
}
@media (max-width: 768px) {
  .newsletter-wrap { margin-bottom: 40px; }
}
</style>