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
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading more apps...</p>
    </div>
    
    <!-- Load more button -->
    <div v-if="hasMore && !loading" class="load-more-container">
      <button class="load-more-btn" @click="loadMore">
        Load More Apps
      </button>
    </div>
    
    <!-- No more data tip -->
    <div v-if="!hasMore && products.length > 0" class="no-more-tip">
      <p>You've reached the end! 🎉</p>
    </div>
    
    <div v-else-if="products.length === 0 && !loading" class="empty-tip">No products found in this series.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import { getProductsByCategory } from '@/api/product'
import type { PageResult, ProductBaseVO, Series } from '@/types'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const series = ref<Series | null>(null)
const products = ref<ProductBaseVO[]>([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const pageSize = 24
let scrollTimeout: number | null = null

const fetchSeriesAndProducts = async (reset = true) => {
  const slug = route.params.slug as string
  
  if (reset) {
    // 重置状态
    products.value = []
    currentPage.value = 1
    hasMore.value = true
  }
  
  loading.value = true
  
  try {
    // 获取所有系列，找到当前系列
    const allSeries = await productStore.getSeries()
    series.value = allSeries.find((s: Series) => s.slug === slug) || null
    
    // 获取该系列下的商品
    if (series.value) {
      const response: PageResult<ProductBaseVO> = await getProductsByCategory(
        slug, 
        currentPage.value, 
        pageSize
      )
      
      if (reset) {
        products.value = response.list || []
      } else {
        products.value = [...products.value, ...(response.list || [])]
      }
      
      // 检查是否还有更多数据
      hasMore.value = (response.list?.length || 0) === pageSize
    } else {
      products.value = []
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    if (reset) {
      products.value = []
    }
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  currentPage.value++
  await fetchSeriesAndProducts(false)
}

// 滚动到底部自动加载更多
const handleScroll = () => {
  // 清除之前的定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  // 防抖处理，100ms后执行
  scrollTimeout = window.setTimeout(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // 计算滚动进度
    const scrollProgress = (scrollTop + windowHeight) / documentHeight
    
    // 当滚动到80%时触发加载，或者距离底部200px时触发
    const shouldLoad = scrollProgress >= 0.8 || (scrollTop + windowHeight >= documentHeight - 200)
    
    if (shouldLoad && !loading.value && hasMore.value) {
      console.log('Triggering load more:', { scrollProgress, scrollTop, windowHeight, documentHeight })
      loadMore()
    }
  }, 100)
}

const goToProduct = (product: ProductBaseVO) => {
  router.push({ name: 'product-detail', params: { id: product.appId } })
}

onMounted(() => {
  fetchSeriesAndProducts()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

watch(() => route.params.slug, () => {
  fetchSeriesAndProducts(true)
})

// 清理滚动监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  // 清理定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
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

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Load more button */
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.load-more-btn {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* No more data tip */
.no-more-tip {
  text-align: center;
  padding: 40px 20px;
}

.no-more-tip p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .category-title {
    font-size: 2rem;
  }
  
  .load-more-btn {
    padding: 14px 28px;
    font-size: 0.95rem;
  }
  
  .loading-container {
    padding: 30px 20px;
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
  
  .load-more-btn {
    padding: 12px 24px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 280px;
  }
  
  .loading-container {
    padding: 20px;
  }
  
  .category-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}
</style>