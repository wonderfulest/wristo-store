<template>
  <section v-if="searchResults.length > 0" class="search-results-section">
    <div class="search-results-container">
      <div class="section-header">
        <h2 class="section-title">Search Results</h2>
        <span class="results-count">{{ searchResults.length }} items</span>
      </div>
      <div class="products-grid">
        <div 
          v-for="product in searchResults" 
          :key="product.appId" 
          class="product-item"
        >
          <product-card :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import type { ProductBaseVO } from '@/types';

defineProps<{
  searchResults: ProductBaseVO[];
}>();
</script>

<style scoped>
.search-results-section {
  width: 100%;
  padding: 80px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
}

.search-results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 10px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: #1d1d1f;
  margin: 0;
}

.results-count {
  font-size: 15px;
  color: #86868b;
  font-weight: 400;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 0 10px;
}

.product-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1068px) {
  .search-results-container {
    padding: 0 30px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 735px) {
  .search-results-section {
    padding: 60px 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 30px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0;
  }
}

@media (max-width: 480px) {
  .search-results-container {
    padding: 0 16px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .results-count {
    font-size: 14px;
  }
}
</style>
