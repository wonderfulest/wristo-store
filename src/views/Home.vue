<template>
  <div class="home">
    <!-- 搜索区域 -->
    <section class="search-section bg-gradient-to-b from-blue-50 to-gray-50 py-12 mb-0 border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-center items-center">
          <div class="w-full max-w-2xl">
            <el-input
              v-model="searchTerm"
              placeholder="搜索表盘..."
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索结果 -->
    <section v-if="searchResults.length > 0" class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-3xl font-bold">搜索结果</h2>
          <span class="text-gray-500">{{ searchResults.length }} 个商品</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          <div v-for="product in searchResults" :key="product.id" class="flex justify-center">
            <product-card :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- 新品展示 -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex items-center mb-10">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <el-icon class="text-blue-600"><Plus /></el-icon>
          </div>
          <h2 class="text-3xl font-bold">新品上市</h2>
        </div>
        <div class="px-4 md:px-0">
          <el-carousel :interval="4000" type="card" height="400px" :autoplay="true">
            <el-carousel-item v-for="product in newProducts" :key="product.id" class="px-1 flex justify-center">
              <product-card :product="product" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </section>

    <!-- 特色区域 -->
    <section class="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div class="relative max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20 rounded-3xl shadow-lg overflow-hidden">
        <!-- 装饰元素 -->
        <div class="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 rounded-full opacity-50 translate-x-1/3 translate-y-1/3"></div>
        <div class="absolute top-1/4 right-10 w-8 h-8 bg-yellow-300 rounded-full opacity-70"></div>
        <div class="absolute bottom-1/4 left-10 w-10 h-10 bg-green-200 rounded-full opacity-60"></div>
        <div class="absolute top-3/4 right-1/4 w-6 h-6 bg-pink-200 rounded-full opacity-70"></div>
        
        <div class="relative text-center z-10">
          <div class="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6 transform hover:scale-105 transition-transform">
            提升您的智能手表体验
          </div>
          <h2 class="text-[36px] md:text-[48px] mb-8 font-bold leading-tight bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text">
            将您的手表变成艺术品
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div class="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
              <div class="flex-shrink-0 bg-blue-100 rounded-full p-3 mb-4 inline-block">
                <el-icon class="text-blue-600"><Star /></el-icon>
              </div>
              <h3 class="font-bold text-lg text-gray-900 mb-2">独特风格</h3>
              <p class="text-gray-600">展现您的个性，发现独一无二的设计</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
              <div class="flex-shrink-0 bg-green-100 rounded-full p-3 mb-4 inline-block">
                <el-icon class="text-green-600"><Check /></el-icon>
              </div>
              <h3 class="font-bold text-lg text-gray-900 mb-2">健康追踪</h3>
              <p class="text-gray-600">通过美观易读的显示界面监控您的健康数据</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
              <div class="flex-shrink-0 bg-purple-100 rounded-full p-3 mb-4 inline-block">
                <el-icon class="text-purple-600"><Lightning /></el-icon>
              </div>
              <h3 class="font-bold text-lg text-gray-900 mb-2">电池优化</h3>
              <p class="text-gray-600">优化的设计不会过度消耗手表电池</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 系列展示 -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex items-center mb-10">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <el-icon class="text-indigo-600"><Collection /></el-icon>
          </div>
          <h2 class="text-3xl font-bold">浏览系列</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
          <div v-for="series in seriesList" :key="series.id" class="flex justify-center">
            <series-card :series="series" />
          </div>
        </div>
      </div>
    </section>

    <!-- 热门商品 -->
    <section class="py-16 bg-white border-t border-gray-100">
      <div class="container mx-auto px-4">
        <div class="flex items-center mb-10">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span class="text-red-500 text-xl">🔥</span>
          </div>
          <h2 class="text-3xl font-bold">热门商品</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          <div v-for="product in hotProducts" :key="product.id" class="flex justify-center">
            <product-card :product="product" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Plus, Star, Check, Lightning, Collection, TrendCharts } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import { useProductStore } from '@/store/product'

interface Product {
  id: string | number
  [key: string]: any
}

interface Series {
  id: string | number
  [key: string]: any
}

const productStore = useProductStore()
const searchTerm = ref('')
const searchResults = ref<Product[]>([])
const newProducts = ref<Product[]>([])
const seriesList = ref<Series[]>([])
const hotProducts = ref<Product[]>([])

const handleSearch = async () => {
  if (searchTerm.value.length > 0) {
    searchResults.value = await productStore.searchProducts(searchTerm.value)
  } else {
    searchResults.value = []
  }
}

onMounted(async () => {
  // 获取新品
  newProducts.value = await productStore.getNewProducts()
  // 获取系列
  seriesList.value = await productStore.getSeries()
  // 获取热门商品
  hotProducts.value = await productStore.getHotProducts()
})
</script>

<style scoped>
.search-input {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  padding: 0 20px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.search-input:hover,
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 