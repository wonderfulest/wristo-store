<template>
  <div class="category-detail-page">
    <div class="category-header" v-if="series">
      <img v-if="series.image" :src="series.image" :alt="series.name" class="category-image" />
      <h1 class="category-title">{{ series.name }}</h1>
    </div>
    <div v-if="products.length > 0" class="product-list">
      <product-card
        v-for="product in products"
        :key="product.appId"
        :product="product"
        class="product-item"
        @click="goToProduct(product)"
      />
    </div>
    <div v-else class="empty-tip">No products found in this series.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import { getProductsByCategory } from '@/api/product'
import type { ApiResponse, PageResult, ProductBaseVO, Series } from '@/types'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const series = ref<Series | null>(null)
const products = ref<ProductBaseVO[]>([])

const fetchSeriesAndProducts = async () => {
  const slug = route.params.slug as string
  // 获取所有系列，找到当前系列
  const allSeries = await productStore.getSeries()
  series.value = allSeries.find((s: Series) => s.slug === slug) || null
  // 获取该系列下的商品
  if (series.value) {
    const response: ApiResponse<PageResult<ProductBaseVO>> = await getProductsByCategory(slug)
    if (response.code === 0) {
      products.value = response.data?.list || []
    }
  } else {
    products.value = []
  }
}

const goToProduct = (product: ProductBaseVO) => {
  router.push({ name: 'product-detail', params: { id: product.appId } })
}

onMounted(() => {
  fetchSeriesAndProducts()
})

watch(() => route.params.slug, () => {
  fetchSeriesAndProducts()
})
</script>

<style scoped>
.category-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
}
.category-image {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
}
.category-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #222;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  padding: 20px 0;
}

.product-item {
  transition: transform 0.3s ease;
}

.product-item:hover {
  transform: translateY(-5px);
}

.empty-tip {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 60px 20px;
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .category-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .product-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .category-title {
    font-size: 1.75rem;
  }
}
</style>