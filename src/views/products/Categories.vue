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
    // 兼容不同浏览器的滚动位置获取方式
    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    )
    
    // 计算滚动进度
    const scrollProgress = (scrollTop + windowHeight) / documentHeight
    const remainingHeight = documentHeight - (scrollTop + windowHeight)
    
    // 调试信息
    console.log('Scroll debug:', {
      scrollTop,
      windowHeight,
      documentHeight,
      scrollProgress: Math.round(scrollProgress * 100) + '%',
      remainingHeight: remainingHeight + 'px',
      loading: loading.value,
      hasMore: hasMore.value
    })
    
    // 更宽松的触发条件：滚动到60%时触发加载，或者距离底部400px时触发
    const shouldLoad = scrollProgress >= 0.6 || remainingHeight <= 400
    
    if (shouldLoad && !loading.value && hasMore.value) {
      console.log('🚀 Auto loading more apps triggered!')
      loadMore()
    }
  }, 100)
}

const goToProduct = (product: ProductBaseVO) => {
  router.push({ name: 'product-detail', params: { id: product.appId } })
}

onMounted(() => {
  fetchSeriesAndProducts()
  // 添加多种滚动监听，确保兼容性
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('scroll', handleScroll, { passive: true })
  
  // 添加触摸滚动监听（移动端）
  window.addEventListener('touchmove', handleScroll, { passive: true })
  
  // 定期检查是否需要加载更多（备用方案）
  const checkInterval = setInterval(() => {
    if (!loading.value && hasMore.value) {
      const scrollTop = Math.max(
        window.pageYOffset,
        document.documentElement.scrollTop,
        document.body.scrollTop
      )
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      )
      
      const scrollProgress = (scrollTop + windowHeight) / documentHeight
      const remainingHeight = documentHeight - (scrollTop + windowHeight)
      
      if (scrollProgress >= 0.6 || remainingHeight <= 400) {
        console.log('🔄 Interval check triggered loading')
        loadMore()
      }
    }
  }, 5000) // 每5秒检查一次
  
  // 保存定时器引用以便清理
  ;(window as any).scrollCheckInterval = checkInterval
})

watch(() => route.params.slug, () => {
  fetchSeriesAndProducts(true)
})

// 清理滚动监听
onBeforeUnmount(() => {
  // 清理所有滚动监听器
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchmove', handleScroll)
  
  // 清理防抖定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
  
  // 清理定期检查定时器
  if ((window as any).scrollCheckInterval) {
    clearInterval((window as any).scrollCheckInterval)
    ;(window as any).scrollCheckInterval = null
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