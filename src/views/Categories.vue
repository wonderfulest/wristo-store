<template>
  <div class="category-detail-page">
    <div class="category-header" v-if="series">
      <img v-if="series.image" :src="series.image" :alt="series.name" class="category-image" />
      <h1 class="category-title">{{ series.name }}</h1>
    </div>
    <div v-if="products.length > 0" class="product-list">
      <div v-for="product in products" :key="product.appId" class="product-card" @click="goToProduct(product)">
        <div class="product-img-wrap">
          <img :src="product.heroFile?.url || product.garminImageUrl" :alt="product.name" class="product-img" />
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">${{ product.price.toFixed(2) }}</div>
        </div>
      </div>
    </div>
    <div v-else class="empty-tip">No products found in this series.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import { getProductsByCategory, type Series } from '@/api/product'
import type { ProductBaseVO } from '@/types'

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
    const response = await getProductsByCategory(slug)
    if (response.code === 0) {
      products.value = response.data.list || []
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
  padding: 40px 16px 64px 16px;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}
.product-card {
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 32px 16px 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.product-card:hover {
  box-shadow: 0 4px 24px 0 rgba(52,124,255,0.12);
}
.product-img-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 18px;
  background: #f4f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-info {
  text-align: center;
}
.product-name {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: #222;
}
.product-price {
  color: #347cff;
  font-size: 1rem;
  font-weight: bold;
}
.empty-tip {
  text-align: center;
  color: #aaa;
  font-size: 1.2rem;
  margin-top: 64px;
}
</style> 