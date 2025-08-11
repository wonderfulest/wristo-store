<template>
  <div class="home bg-white">
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

    <!-- Feature Section -->
    <FeatureSection />

    <!-- Series Section -->
    <SeriesSection 
      :series-list="seriesList"
      @series-click="goToSeries"
    />
    <Newsletter />
    <!-- Hot Products Section with Infinite Scroll -->
    <section class="hot-products-infinite">
      <div class="hot-container">
        <div class="hot-header">
          <div class="hot-header-icon">
            <span class="hot-header-icon-inner">🔥</span>
          </div>
          <h2 class="hot-title">Trending Now</h2>
        </div>
        
        <div v-if="hotProducts.length > 0" class="hot-grid">
          <div 
            v-for="product in hotProducts" 
            :key="product.appId" 
            class="hot-item" 
            @click="goToProduct(product)"
          >
            <div class="hot-img-wrap">
              <img :src="product.garminImageUrl" :alt="product.name" class="hot-img" />
            </div>
            <div class="hot-name">{{ product.name }}</div>
            <div class="hot-price">${{ product.price.toFixed(2) }}</div>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="hotLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading more trending apps...</p>
        </div>
        
        <!-- No more data tip -->
        <div v-if="!hotHasMore && hotProducts.length > 0" class="no-more-tip">
          <p>You've seen all trending apps! 🎉</p>
        </div>
        
        <div v-else-if="hotProducts.length === 0 && !hotLoading" class="empty-tip">No trending apps found.</div>
      </div>
    </section>
  </div>
 
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/store/product';
import { getHotProductsPaged } from '@/api/product';
import type { ProductBaseVO, Series, PageResult } from '@/types';
import Newsletter from '@/components/Newsletter.vue';
import SearchSection from './home/components/SearchSection.vue';
import SearchResultsSection from './home/components/SearchResultsSection.vue';
import NewArrivalsCarousel from './home/components/NewArrivalsCarousel.vue';
import FeatureSection from './home/components/FeatureSection.vue';
import SeriesSection from './home/components/SeriesSection.vue';

const productStore = useProductStore();
const router = useRouter();

const searchTerm = ref('');
const searchResults = ref<ProductBaseVO[]>([]);
const newProducts = ref<ProductBaseVO[]>([]);
const seriesList = ref<Series[]>([]);
const hotProducts = ref<ProductBaseVO[]>([]);

// 热门产品无限滚动状态
const hotLoading = ref(false);
const hotCurrentPage = ref(1);
const hotHasMore = ref(true);
const hotPageSize = 24;
let hotScrollTimeout: number | null = null;

const handleSearch = async (term: string) => {
  searchTerm.value = term;
  if (term.length > 0) {
    searchResults.value = await productStore.searchProducts(term);
  } else {
    searchResults.value = [];
  }
};

// 获取热门产品（分页）
const fetchHotProducts = async (reset = true) => {
  if (reset) {
    hotProducts.value = [];
    hotCurrentPage.value = 1;
    hotHasMore.value = true;
  }
  
  hotLoading.value = true;
  
  try {
    const response: PageResult<ProductBaseVO> = await getHotProductsPaged(
      hotCurrentPage.value,
      hotPageSize
    );
    
    if (reset) {
      hotProducts.value = response.list || [];
    } else {
      hotProducts.value = [...hotProducts.value, ...(response.list || [])];
    }
    
    // 检查是否还有更多数据
    hotHasMore.value = (response.list?.length || 0) === hotPageSize;
  } catch (error) {
    console.error('Failed to fetch hot products:', error);
    if (reset) {
      hotProducts.value = [];
    }
    hotHasMore.value = false;
  } finally {
    hotLoading.value = false;
  }
};

// 加载更多热门产品
const loadMoreHotProducts = async () => {
  if (hotLoading.value || !hotHasMore.value) return;
  
  hotCurrentPage.value++;
  await fetchHotProducts(false);
};

// 热门产品滚动监听
const handleHotProductsScroll = () => {
  if (hotScrollTimeout) {
    clearTimeout(hotScrollTimeout);
  }
  
  hotScrollTimeout = window.setTimeout(() => {
    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    );
    
    const scrollProgress = (scrollTop + windowHeight) / documentHeight;
    const remainingHeight = documentHeight - (scrollTop + windowHeight);
    
    // 当滚动到60%时触发加载，或者距离底部400px时触发
    const shouldLoad = scrollProgress >= 0.6 || remainingHeight <= 400;
    
    if (shouldLoad && !hotLoading.value && hotHasMore.value) {
      console.log('🔥 Auto loading more hot products');
      loadMoreHotProducts();
    }
  }, 100);
};

// Fetch initial data
onMounted(async () => {
  try {
    // 并行加载初始数据
    const [newProductsData, seriesListData] = await Promise.all([
      productStore.getNewProducts(),
      productStore.getHotSeries()
    ]);
    
    newProducts.value = newProductsData;
    seriesList.value = seriesListData;
    
    // 加载热门产品（分页）
    await fetchHotProducts();
    
    // 添加滚动监听
    window.addEventListener('scroll', handleHotProductsScroll, { passive: true });
    document.addEventListener('scroll', handleHotProductsScroll, { passive: true });
    
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

// 清理滚动监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleHotProductsScroll);
  document.removeEventListener('scroll', handleHotProductsScroll);
  
  if (hotScrollTimeout) {
    clearTimeout(hotScrollTimeout);
    hotScrollTimeout = null;
  }
});
</script>

<style scoped>
.home {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* Hot Products Infinite Scroll Styles */
.hot-products-infinite {
  padding: 64px 0;
  background: #fff;
  border-top: 2px solid #f3f4f6;
}

.hot-container {
  width: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  max-width: 100%;
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
  margin: 0;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 48px 24px;
  justify-items: center;
  align-items: start;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
  place-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hot-item:hover {
  transform: translateY(-5px);
}

.hot-img-wrap {
  width: 100%;
  max-width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hot-item:hover .hot-img-wrap {
  transform: scale(1.05);
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.15);
}

.hot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: transform 0.5s ease;
}

.hot-item:hover .hot-img {
  transform: scale(1.1);
}

.hot-name {
  font-size: 1.18rem;
  font-weight: 600;
  color: #222;
  margin-top: 22px;
  text-align: center;
  transition: color 0.3s ease;
}

.hot-item:hover .hot-name {
  color: #4a3aff;
}

.hot-price {
  font-size: 1.1rem;
  color: #888;
  margin-top: 6px;
  text-align: center;
  font-weight: 500;
  transition: color 0.3s ease;
}

.hot-item:hover .hot-price {
  color: #4a3aff;
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

.empty-tip {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  padding: 60px 20px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .hot-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 36px 20px;
  }

  .hot-img-wrap {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .hot-products-infinite {
    padding: 48px 0;
  }

  .hot-header {
    margin-bottom: 32px;
  }

  .hot-title {
    font-size: 2rem;
  }

  .hot-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px 16px;
  }

  .hot-img-wrap {
    height: 240px;
  }

  .loading-container {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .hot-products-infinite {
    padding: 32px 0;
  }

  .hot-header {
    margin-bottom: 24px;
    flex-direction: column;
    gap: 12px;
  }

  .hot-header-icon {
    margin-right: 0;
  }

  .hot-title {
    font-size: 1.75rem;
  }

  .hot-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 24px 12px;
  }

  .hot-img-wrap {
    height: 200px;
  }

  .hot-name {
    font-size: 1rem;
    margin-top: 16px;
  }

  .hot-price {
    font-size: 1rem;
  }

  .loading-container {
    padding: 20px;
  }
}
</style>