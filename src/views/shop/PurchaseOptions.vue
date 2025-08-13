<template>
  <div class="purchase-options">
    <!-- <Logo /> -->
    <h2 class="title">Decision Time</h2>
    <p class="desc">✨ Unlock More Watch Faces – Pick Your Plan Today!</p>
    
    <div class="cards-container">
      <!-- 套餐卡片 -->
      <PurchaseCard
        v-for="bundleItem in bundles"
        :key="bundleItem.bundleId"
        v-if="bundles.length > 0"
        type="bundle"
        :title="bundleItem.bundleName"
        :description="bundleItem.bundleDesc"
        :bundle-items="getBundleItems(bundleItem)"
        :original-price="getBundleOriginalPrice(bundleItem)"
        :current-price="getBundleCurrentPrice(bundleItem)"
        :discount="getBundleDiscount(bundleItem)"
        :is-selected="isBundleSelected(bundleItem)"
        :button-text="`Buy Bundle for $${getBundleCurrentPrice(bundleItem).toFixed(2)}`"
        @select="() => selectBundle(bundleItem)"
        @buy="() => handleBuyBundle(bundleItem)"
      />
    
      <!-- 单品卡片 -->
      <PurchaseCard
        v-if="product"
        type="product"
        :title="product.name"
        :description="product.description"
        :image-url="product.garminImageUrl"
        :original-price="productOriginalPrice"
        :current-price="productCurrentPrice"
        :discount="productDiscount"
        :is-selected="isProductSelected"
        :button-text="`Buy for $${productCurrentPrice.toFixed(2)}`"
        @select="selectProduct"
        @buy="handleBuyProduct"
      />
    
      <!-- 订阅盒子 -->
      <!-- <div class="box-container subscription-box">
        <div class="box-header">
          <h3 class="box-title">Subscription Plans</h3>
          <p class="lifetime-benefits">🔓 <strong>Subscribe to unlock ALL products & Permanently unlock the Single: {{ product.name }}!</strong></p>
        </div>
        <SubscriptionPlans
          :show-title="false"
          @plan-selected="selectSubscriptionPlan"
          @subscribe="handleBuySubscription"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
import PurchaseCard from '@/components/PurchaseCard.vue'
import type { PurchaseData, ProductVO, Bundle } from '@/types'
import type { SubscriptionPlan } from '@/api/subscription'

const router = useRouter()
const store = useShopOptionsStore()

// 订阅计划相关
const selectedPlan = ref<SubscriptionPlan | null>(null)

// 直接使用 PurchaseData 类型
const purchaseData = computed<PurchaseData | null>(() => store.data as PurchaseData || null)

const product = computed(() => purchaseData.value?.product as ProductVO)
const bundles = computed(() => {
  const bundlesList = purchaseData.value?.bundles || []
  // 按实际金额从大到小排序
  return bundlesList.sort((a, b) => {
    const priceA = parseFloat(String(a.price))
    const priceB = parseFloat(String(b.price))
    return priceB - priceA
  })
})

// 价格计算 - 产品
const productOriginalPrice = computed(() => {
  if (!product.value) return 0
  return parseFloat(String(product.value.price))
})

const productCurrentPrice = computed(() => {
  if (!product.value) return 0
  return parseFloat(String(product.value.price))
})

const productDiscount = computed(() => {
  if (productOriginalPrice.value <= productCurrentPrice.value) return 0
  return Math.round(((productOriginalPrice.value - productCurrentPrice.value) / productOriginalPrice.value) * 100)
})

// 保留第一个bundle的引用用于向后兼容，但移除未使用的computed属性

// 多个套餐的价格计算函数
const getBundleOriginalPrice = (bundleItem: Bundle) => {
  if (!bundleItem) return 0
  let bundlePrice = 0
  for (const product of bundleItem.products) {
    bundlePrice += parseFloat(String(product.price))
  }
  return bundlePrice
}

const getBundleCurrentPrice = (bundleItem: Bundle) => {
  if (!bundleItem) return 0
  return parseFloat(String(bundleItem.price))
}

const getBundleDiscount = (bundleItem: Bundle) => {
  const originalPrice = getBundleOriginalPrice(bundleItem)
  const currentPrice = getBundleCurrentPrice(bundleItem)
  if (originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

// 获取套餐项目数据
const getBundleItems = (bundleItem: Bundle) => {
  if (!bundleItem?.products) return []
  return bundleItem.products.map(p => ({
    id: String(p.appId),
    name: p.name,
    imageUrl: p.garminImageUrl
  }))
}

// 判断产品是否被选中
const isProductSelected = computed(() => {
  // 确保产品存在且已被选中（而不是订阅被选中）
  if (!product.value || !store.selectedProduct || selectedPlan.value) return false;
  
  // 如果是ProductVO类型，比较designId
  if ('designId' in store.selectedProduct && 'designId' in product.value) {
    return store.selectedProduct.designId === product.value.designId;
  }
  
  return false;
});

// 移除未使用的 computed 属性，使用函数版本

// 判断特定套餐是否被选中
const isBundleSelected = (bundleItem: Bundle) => {
  // 确保套餐存在且已被选中（而不是订阅被选中）
  if (!bundleItem || !store.selectedProduct || selectedPlan.value) return false;
  
  // 如果是Bundle类型，比较bundleId
  if ('bundleId' in store.selectedProduct && 'bundleId' in bundleItem) {
    return store.selectedProduct.bundleId === bundleItem.bundleId;
  }
  
  return false;
};

// 选择单个产品
const selectProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO);
    selectedPlan.value = null;
  }
};

// 选择套餐
const selectBundle = (bundleItem?: Bundle) => {
  const targetBundle = bundleItem
  if (targetBundle) {
    store.setSelectedProduct(targetBundle)
    selectedPlan.value = null // 清除订阅选择
  }
};

// 处理购买单个产品
const handleBuyProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO)
    router.push({ name: 'Checkout' })
  }
}

// 处理购买套餐
const handleBuyBundle = (bundleItem?: Bundle) => {
  const targetBundle = bundleItem
  if (targetBundle) {
    store.setSelectedProduct(targetBundle)
    router.push({ name: 'Checkout' })
  }
}

// // 处理订阅计划购买
// const handleBuySubscription = (plan: SubscriptionPlan) => {
//   if (plan) {
//     console.log('selectedPlan.value', plan)
//     selectedPlan.value = plan
//     setTimeout(() => {
//       // 设置选中的订阅计划
//       store.setSelectedSubscription(plan);
//       router.push({ name: 'CheckoutSubscription' });
//     }, 200);
//   }
// };

// // 处理订阅计划选择
// const selectSubscriptionPlan = (plan: SubscriptionPlan) => {
//   selectedPlan.value = plan;
// };

onMounted(() => {
  // 检查是否有数据
  if (!purchaseData.value) {
    router.push('/code');
  }
})
</script>

<style scoped>
.purchase-options {
  max-width: 1400px;
  margin: 0px auto 40px;
  padding: 32px 16px 48px;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.desc {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.cards-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  justify-content: center;
  align-items: stretch;
  min-height: fit-content;
}

/* 统一卡片宽度 */
.cards-container > * {
  flex: 0 0 420px;
  width: 420px;
}

.box-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-box {
  padding: 0 30px 0 30px;
}

.bundle-box {
  padding: 0 30px 0 30px;
}

.subscription-box {
  padding: 0 30px 0 30px;
}

.box-header {
  text-align: center;
  margin-bottom: 24px;
}

.box-title {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #1d1d1f;
  font-weight: 600;
}

.lifetime-benefits {
  font-size: 0.9rem;
  color: #86868b;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

.lifetime-benefits strong {
  color: #007aff;
  font-weight: 600;
  background: linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.product-box {
  flex: 0 0 calc(25% - 1px);
  position: relative;
}

.bundle-box {
  flex: 0 0 calc(25% - 1px);
  position: relative;
}

.subscription-box {
  flex: 0 0 calc(75% - 1px);
  position: relative;
}

/* 分割线 */
/* .product-box::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: #e5e5e5;
  margin-right: -0.5px;
} */

.subscription-cards-container {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
}

/* 卡片容器样式保留用于布局 */

/* 统一按钮样式 */

/* 响应式设计 */
@media (max-width: 1024px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .product-box, .bundle-box, .subscription-box {
    flex: 1 1 100%;
    width: 100%;
    max-width: 800px;
    margin-bottom: 30px;
  }
  
  .product-box::after {
    display: none;
  }
  
  .subscription-cards-container {
    flex-wrap: wrap;
  }
  
  .subscription-card {
    flex: 1 1 calc(50% - 16px);
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .purchase-options {
    padding: 24px 12px 80px 12px;
  }
  
  .box-container {
    padding: 0 15px;
  }
  
  .option-card, .subscription-card {
    padding: 24px 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .subscription-cards-container {
    flex-direction: column;
  }
  
  .subscription-card {
    margin-bottom: 16px;
  }
  
  .product-image img {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .purchase-options {
    padding: 16px 8px 100px 8px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .desc {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .box-title {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  .box-container {
    padding: 0 10px;
  }
  
  .card-title {
    font-size: 1.2rem;
  }
}
/* 选项卡样式 */
.purchase-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  gap: 8px;
}

.tab-button {
  padding: 10px 24px;
  border: none;
  background-color: #f5f5f7;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #e8e8ed;
}

.tab-button.active {
  background-color: #0071e3;
  color: white;
}

/* 订阅容器样式 */
.subscription-container {
  width: 100%;
  margin-top: 20px;
}

.loading-container,
.error-container,
.no-plans-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 113, 227, 0.2);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #ff3b30;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
}

/* 订阅计划网格 */
.subscription-plans-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

/* 订阅卡片样式 */
.subscription-card {
  padding: 32px 24px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border: 2px solid transparent;
  width: 100%;
}

.subscription-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 订阅卡片选中状态 - 根据不同类型使用不同边框颜色 */
.subscription-card.active.plan-monthly {
  border-color: #5856d6;
}

.subscription-card.active.plan-yearly {
  border-color: #007aff;
}

.subscription-card.active.plan-lifetime {
  border-color: #34c759;
}

/* 计划类型特定样式 */
.plan-monthly {
  background: linear-gradient(to bottom right, #ffffff, #f9f9ff);
}

.plan-yearly {
  background: linear-gradient(to bottom right, #ffffff, #f0f7ff);
}

.plan-lifetime {
  background: linear-gradient(to bottom right, #ffffff, #f0fff7);
}

/* 推荐标签 */
.recommended-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #34c759;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-bottom-right-radius: 12px;
}

/* 价格信息 */
.price {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.original-price {
  font-size: 16px;
  color: #86868b;
  text-decoration: line-through;
  margin-left: 8px;
}

.price-period {
  font-size: 14px;
  color: #86868b;
}

/* 计划权益 */
.plan-benefits {
  margin: 24px 0;
  flex-grow: 1;
}

.plan-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.plan-benefits li {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.check-icon {
  color: #34c759;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

/* 订阅按钮 */
.subscription-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  margin-top: 24px;
}

/* 按钮颜色区分 */
.button-monthly {
  background-color: #5856d6;
}

.button-monthly:hover {
  background-color: #4a49b7;
  transform: translateY(-2px);
}

.button-yearly {
  background-color: #007aff;
}

.button-yearly:hover {
  background-color: #0066d6;
  transform: translateY(-2px);
}

.button-lifetime {
  background-color: #34c759;
}

.button-lifetime:hover {
  background-color: #28a745;
  transform: translateY(-2px);
}

.subscription-btn:active {
  transform: translateY(0);
}

/* 订阅提示样式 */
.subscription-prompt {
  margin-top: 24px;
  padding: 20px;
  background: rgba(0, 113, 227, 0.08);
  border-radius: 16px;
  text-align: center;
}

.subscription-prompt p {
  font-size: 16px;
  color: #1d1d1f;
  margin-bottom: 12px;
  font-weight: 500;
}

.subscription-prompt-btn {
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscription-prompt-btn:hover {
  background-color: #0077ed;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .cards-container {
    max-width: 1100px;
  }
  
  .subscription-card {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .cards-container {
    max-width: 900px;
  }
  
  .product-box {
    flex: 0 0 calc(30% - 18px);
  }
  
  .subscription-box {
    flex: 0 0 calc(70% - 18px);
  }
  
  .subscription-cards-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .subscription-card {
    width: calc(50% - 8px);
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .product-box,
  .subscription-box {
    flex: 0 0 100%;
    width: 100%;
    max-width: 500px;
  }
  
  .subscription-cards-container {
    flex-direction: column;
  }
  
  .subscription-card,
  .option-card {
    width: 100%;
  }
  
  .purchase-options {
    padding: 24px 12px 60px;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .desc {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
}
</style> 