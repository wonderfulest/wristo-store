<template>
  <div class="home bg-white">
    <!-- 搜索区域 -->
    <section class="search-section search-section-gradient">
      <div class="search-bar-outer">
        <div class="search-bar-inner flex items-center">
          <el-icon class="search-icon"><Search /></el-icon>
          <el-input
            v-model="searchTerm"
            placeholder='Try "Elegant" ...'
            class="search-bar-input"
            @input="handleSearch"
            :border="false"
          />
          <el-button class="search-bar-btn" type="primary" round>Search</el-button>
        </div>
      </div>
    </section>

    <!-- 搜索结果 -->
    <section v-if="searchResults.length > 0" class="py-16 bg-white">
      <div class="w-full px-4">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-3xl font-bold">搜索结果</h2>
          <span class="text-gray-500">{{ searchResults.length }} 个商品</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
          <div v-for="product in searchResults" :key="product.appId" class="flex justify-center">
            <product-card :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- 新品展示 -->
    <section class="new-section">
      <div class="new-container">
        <div class="new-header">
          <div class="new-header-icon">
            <el-icon class="new-header-icon-inner"><Plus /></el-icon>
          </div>
          <h2 class="new-title">New Arrivals</h2>
        </div>
        <div class="new-carousel-wrap">
          <el-carousel :interval="2000" type="card" height="400px" :autoplay="true">
            <el-carousel-item v-for="product in newProducts" :key="product.appId" class="flex flex-col items-center justify-center" @click="goToProduct(product)">
              <div class="product-circle-img">
                <img
                  :src="product.heroFile?.url || product.garminImageUrl"
                  :alt="product.name"
                  class="circle-img"
                />
              </div>
              <div class="mt-6 text-center">
                <div class="font-medium text-lg">{{ product.name }}</div>
                <div class="text-gray-500 text-base mt-1">${{ product.price.toFixed(2) }}</div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </section>

    <!-- 特色区域 -->
    <section class="feature-section">
      <div class="feature-bg">
        <!-- 背景圆形装饰 -->
        <div class="feature-circle feature-circle-1"></div>
        <div class="feature-circle feature-circle-2"></div>
        <div class="feature-circle feature-circle-3"></div>
        <div class="feature-circle feature-circle-4"></div>
        <div class="feature-circle feature-circle-5"></div>
        <div class="feature-circle feature-circle-6"></div>
        <div class="feature-badge">ELEVATE YOUR GARMIN EXPERIENCE</div>
        <h2 class="feature-title">Transform Your Watch Into A Masterpiece</h2>
        <div class="feature-desc">
          Discover our curated collection of premium watch faces designed exclusively for Garmin devices. Each design balances stunning aesthetics with practical functionality, giving you:
        </div>
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon feature-icon-blue"><el-icon><Plus /></el-icon></div>
            <div class="feature-card-title">Unique Style</div>
            <div class="feature-card-desc">Express your personality with designs you won't find anywhere else</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon feature-icon-green"><el-icon><Check /></el-icon></div>
            <div class="feature-card-title">Health Tracking</div>
            <div class="feature-card-desc">Monitor your vitals with beautiful, easy-to-read displays</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon feature-icon-purple"><el-icon><Lightning /></el-icon></div>
            <div class="feature-card-title">Battery Efficient</div>
            <div class="feature-card-desc">Optimized designs that won't drain your watch battery</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 系列展示 -->
    <section class="series-section">
      <div class="series-container">
        <div class="series-header">
          <div class="series-header-icon">
            <el-icon class="series-header-icon-inner"><Collection /></el-icon>
          </div>
          <h2 class="series-title">Browse by Series</h2>
        </div>
        <div class="series-grid">
          <div v-for="series in seriesList" :key="series.id" class="series-item">
            <div class="series-img-wrap">
              <img :src="series.image" :alt="series.name" class="series-img" />
            </div>
            <div class="series-name-row">
              <span class="series-name">{{ series.name }}</span>
              <span class="series-arrow">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门商品 -->
    <section class="hot-section">
      <div class="hot-container">
        <div class="hot-header">
          <div class="hot-header-icon">
            <span class="hot-header-icon-inner">🔥</span>
          </div>
          <h2 class="hot-title">Trending Now</h2>
        </div>
        <div class="hot-grid">
          <div v-for="product in hotProducts" :key="product.appId" class="hot-item" @click="goToProduct(product)">
            <div class="hot-img-wrap">
              <img :src="product.heroFile?.url" :alt="product.name" class="hot-img" />
            </div>
            <div class="hot-name">{{ product.name }}</div>
            <div class="hot-price">${{ product.price.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Plus, Check, Lightning, Collection } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/store/product'
import { useRouter } from 'vue-router'
import type { ProductBaseVO, Series } from '@/types'

const productStore = useProductStore()
const searchTerm = ref('')
const searchResults = ref<ProductBaseVO[]>([])
const newProducts = ref<ProductBaseVO[]>([])
const seriesList = ref<Series[]>([])
const hotProducts = ref<ProductBaseVO[]>([])
const router = useRouter()

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
  seriesList.value = await productStore.getHotSeries()
  // 获取热门商品
  hotProducts.value = await productStore.getHotProducts()
})

function goToProduct(product: ProductBaseVO) {
  router.push({ name: 'product-detail', params: { id: product.appId } })
}
</script>

<style scoped>
.search-bar-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 32px;
  margin-bottom: 32px;
}

.search-bar-inner {
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 0 24px 0 20px;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  height: 64px;
  display: flex;
  align-items: center;
}

.search-icon {
  color: #b0b7c3;
  font-size: 26px;
  margin-right: 12px;
}

.search-bar-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  font-size: 1.3rem;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 1.3rem;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner)::placeholder {
  color: #b0b7c3 !important;
  opacity: 1;
}

.search-bar-btn {
  margin-left: 18px;
  height: 44px;
  min-width: 110px;
  font-size: 1.1rem;
  border-radius: 999px !important;
  background: #347cff;
  border: none;
  box-shadow: 0 2px 8px 0 rgba(52,124,255,0.08);
}

:deep(.el-carousel__item) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  box-shadow: none;
}

.product-circle-img {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
}
.circle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.search-section-gradient {
  min-height: 220px;
  background: linear-gradient(135deg, #eaf3ff 0%, #f5faff 100%);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
}

.feature-section {
  width: 100%;
  background: linear-gradient(135deg, #eaf1ff 0%, #f6f7fb 100%);
  padding: 20px 0;
  margin: 0;
}
.feature-bg {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 36px;
  background: rgba(255,255,255,0.55);
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.08);
  padding: 64px 24px 56px 24px;
  position: relative;
  margin-top: 48px;
  margin-bottom: 48px;
  overflow: hidden;
}
.feature-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  z-index: 1;
  pointer-events: none;
}
.feature-circle-1 {
  width: 160px;
  height: 160px;
  left: -60px;
  top: -60px;
  background: #bcdcff;
}
.feature-circle-2 {
  width: 100px;
  height: 100px;
  right: -40px;
  top: 40px;
  background: #e6edfd;
}
.feature-circle-3 {
  width: 80px;
  height: 80px;
  left: 60px;
  bottom: -30px;
  background: #e6f9ed;
}
.feature-circle-4 {
  width: 120px;
  height: 120px;
  right: 80px;
  bottom: -50px;
  background: #f3eafd;
}
.feature-circle-5 {
  width: 70px;
  height: 70px;
  left: 32%;
  top: 58%;
  background: #e6edfd;
}
.feature-circle-6 {
  width: 90px;
  height: 90px;
  right: 28%;
  top: 38%;
  background: #f3eafd;
}
.feature-badge {
  display: inline-block;
  background: #e6edfd;
  color: #4a6cf7;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 6px 22px;
  margin-bottom: 24px;
  letter-spacing: 1px;
}
.feature-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #4a3aff;
  text-align: center;
  margin-bottom: 28px;
  letter-spacing: 1px;
}
.feature-desc {
  font-size: 1.25rem;
  color: #444;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 44px auto;
  line-height: 1.7;
}
.feature-cards {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 36px;
  margin-top: 0;
  flex-wrap: nowrap;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}
.feature-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  padding: 24px 20px 32px 20px;
  min-width: 180px;
  max-width: 220px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}
.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 18px;
}
.feature-icon-blue {
  background: #e6edfd;
  color: #4a6cf7;
}
.feature-icon-green {
  background: #e6f9ed;
  color: #34c759;
}
.feature-icon-purple {
  background: #f3eafd;
  color: #a259ff;
}
.feature-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}
.feature-card-desc {
  font-size: 1.05rem;
  color: #444;
  line-height: 1.6;
  text-align: left;
}
.series-section {
  padding: 64px 0;
  background: #fff;
}
.series-container {
  width: 100%;
  padding: 0 16px;
}
.series-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  justify-content: center;
}
.series-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ede9fe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.series-header-icon-inner {
  color: #a78bfa;
  font-size: 24px;
}
.series-title {
  font-size: 2rem;
  font-weight: bold;
  color: #222;
}
.series-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 36px 24px;
  justify-items: center;
  align-items: start;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.series-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 210px;
}
.series-img-wrap {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}
.series-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
.series-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  gap: 8px;
}
.series-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #222;
}
.series-arrow {
  font-size: 1.3rem;
  color: #b0b7c3;
  margin-left: 2px;
  font-weight: 400;
}
.hot-section {
  padding: 64px 0;
  background: #fff;
  border-top: 2px solid #f3f4f6;
}
.hot-container {
  width: 100%;
  padding: 0 16px;
}
.hot-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  justify-content: center;
}
.hot-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffedd5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.hot-header-icon-inner {
  color: #fb923c;
  font-size: 24px;
}
.hot-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
}
.hot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 24px;
  justify-items: center;
  align-items: start;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 320px;
}
.hot-img-wrap {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
.hot-name {
  font-size: 1.18rem;
  font-weight: 600;
  color: #222;
  margin-top: 22px;
  text-align: center;
}
.hot-price {
  font-size: 1.1rem;
  color: #888;
  margin-top: 6px;
  text-align: center;
}
.new-section {
  padding: 32px 0;
  background: #fff;
}
.new-container {
  width: 80%;
  margin: 0 auto;
  padding: 0 16px;
}
.new-header {
  display: flex;
  align-items: center;
  justify-content: center;
}
.new-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.new-header-icon-inner {
  color: #2563eb;
  font-size: 24px;
}
.new-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
}
.new-carousel-wrap {
  padding: 0 16px;
}
</style> 