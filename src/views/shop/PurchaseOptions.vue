<template>
  <div class="purchase-options">
    <Logo />
    <h2 class="title">Purchase Options</h2>
    <p class="desc">Choose your preferred option:</p>
    
    <div class="options-container">
      <!-- 多个 Bundle 选项 -->
      <div v-for="bundle in bundles" :key="bundle.bundleId" class="option-card bundle-card">
        <div class="card-header">
          <h3 class="card-title">{{ bundle.bundleName }}</h3>
          <div class="price-info">
            <span class="price">${{ bundle.price }}</span>
            <span class="original-price" v-if="bundle.products && bundle.products.length > 0 && bundle.products.reduce((sum, p) => sum + p.price, 0) > bundle.price">
              ${{ bundle.products.reduce((sum, p) => sum + p.price, 0) }}
            </span>
          </div>
        </div>
        
        <div class="bundle-images-container">
          <div class="bundle-images-scroll">
            <div 
              v-for="product in bundle.products" 
              :key="product.appId" 
              class="bundle-image-item"
              @click="selectBundleProduct(product as ProductVO)"
            >
              <img :src="product.garminImageUrl" :alt="product.name" />
              <div class="product-name">{{ product.name }}</div>
            </div>
          </div>
          <div class="scroll-indicator">
            <span class="scroll-text">← Scroll to view all products →</span>
          </div>
        </div>
        
        <div class="bundle-info">
          <div class="bundle-name">{{ bundle.bundleName }}</div>
          <div class="bundle-desc">{{ bundle.bundleDesc }}</div>
          <div class="product-count">{{ bundle.products.length }} products included</div>
        </div>
        
        <button class="buy-btn bundle-btn" @click="handleBuyBundle(bundle)">
          Buy Bundle for ${{ bundle.price }}
        </button>
      </div>
      
      <!-- Product 选项 -->
      <div v-if="product" class="option-card product-card">
        <div class="card-header">
          <h3 class="card-title">Single Product</h3>
          <div class="price-info">
            <span class="price">${{ product.price }}</span>
          </div>
        </div>
        
        <div class="product-image">
          <img :src="product.garminImageUrl" :alt="product.name" />
        </div>
        
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-id">ID: {{ product.designId }}</div>
        </div>
        
        <button class="buy-btn product-btn" @click="handleBuyProduct">
          Buy for ${{ product.price }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
import Logo from '@/components/Logo.vue'
import type { PurchaseData, ProductVO, BundleItem } from '@/types'

const router = useRouter()
const store = useShopOptionsStore()

// 直接使用 PurchaseData 类型
const purchaseData = computed<PurchaseData | null>(() => store.data as PurchaseData || null)

const product = computed(() => purchaseData.value?.product)
const bundles = computed(() => purchaseData.value?.bundles || [])

// 处理购买Bundle，传入 bundle
const handleBuyBundle = (bundle: BundleItem) => {
  if (bundle) {
    const bundleForStore = {
      bundleId: bundle.bundleId,
      userId: bundle.userId,
      paddleProductId: bundle.paddleProductId,
      paddlePriceId: bundle.paddlePriceId,
      bundleName: bundle.bundleName,
      bundleDesc: bundle.bundleDesc,
      price: bundle.price,
      isActive: bundle.isActive,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
      products: bundle.products
    }
    store.setSelectedProduct(bundleForStore)
    router.push({ name: 'Checkout' })
  }
}

// 处理购买单个产品
const handleBuyProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO)
    router.push({ name: 'Checkout' })
  }
}

// 选择Bundle中的产品（仅用于预览）
const selectBundleProduct = (selectedProduct: ProductVO) => {
  console.log('Selected bundle product:', selectedProduct)
}

onMounted(() => {
  // 检查是否有数据
  if (!purchaseData.value) {
    router.push('/code')
  }
})
</script>

<style scoped>
.purchase-options {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.desc {
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.options-container {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.option-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px 24px;
  width: 400px;
  /* min-height: 600px; */
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.price-info {
  text-align: right;
}

.price {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d6a4f;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

/* Bundle 卡片样式 */
.bundle-images-container {
  margin-bottom: 24px;
  position: relative;
}

.bundle-images-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.bundle-images-scroll::-webkit-scrollbar {
  height: 6px;
}

.bundle-images-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.bundle-image-item {
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  min-width: 120px;
}

.bundle-image-item:hover {
  transform: scale(1.05);
}

.bundle-image-item img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #eee;
  background: #fafafa;
  margin-bottom: 8px;
}

.bundle-image-item .product-name {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
}

.scroll-indicator {
  margin-top: 12px;
  text-align: center;
}

.scroll-text {
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}

.bundle-info {
  flex: 1;
  text-align: left;
  margin-bottom: 24px;
}

.bundle-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.bundle-desc {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.product-count {
  color: #2d6a4f;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Product 卡片样式 */
.product-image {
  margin-bottom: 24px;
  text-align: center;
}

.product-image img {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid #eee;
  background: #fafafa;
}

.product-info {
  flex: 1;
  text-align: left;
  margin-bottom: 24px;
}

.product-info .product-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.product-id {
  color: #999;
  font-size: 0.9rem;
  font-family: monospace;
}

/* 按钮样式 */
.buy-btn {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
}

.buy-btn:hover {
  background: #40916c;
  transform: translateY(-2px);
}

.buy-btn:active {
  transform: translateY(0);
}

.bundle-btn {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
}

.product-btn {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .options-container {
    flex-direction: column;
    align-items: center;
  }
  
  .option-card {
    width: 100%;
    max-width: 480px;
  }
}

@media (max-width: 768px) {
  .purchase-options {
    padding: 24px 12px 0 12px;
  }
  
  .option-card {
    padding: 24px 16px;
    min-height: 500px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .bundle-images-scroll {
    gap: 8px;
  }
  
  .bundle-image-item {
    min-width: 100px;
  }
  
  .bundle-image-item img {
    width: 60px;
    height: 60px;
  }
  
  .product-image img {
    width: 150px;
    height: 150px;
  }
}
</style> 