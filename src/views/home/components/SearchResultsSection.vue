<template>
  <section v-if="searchResults.length > 0" class="search-results-section">
    <div class="search-results-container">
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
import { defineProps } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import type { ProductBaseVO } from '@/types'

defineProps<{
  searchResults: ProductBaseVO[]
}>()
</script>

<style scoped>
.search-results-section {
  width: 100%;
  padding: 22px 0 18px;
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
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  padding: 10px 10px 10px;
  overflow: visible;
}

.product-item {
  min-width: 0;
  overflow: visible;
  animation: result-enter 220ms ease both;
}

.product-item:nth-child(2n) {
  animation-delay: 20ms;
}

.product-item:nth-child(3n) {
  animation-delay: 40ms;
}

@keyframes result-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1068px) {
  .search-results-container {
    padding: 0 30px;
  }
  
  .products-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 735px) {
  .search-results-section {
    padding: 26px 0 12px;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 0;
  }
}

@media (max-width: 480px) {
  .search-results-container {
    padding: 0 16px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .results-count {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-item {
    animation: none;
  }
}
</style>
