<template>
  <div class="purchase-options">
    <!-- <Logo /> -->
    <h2 class="title">Purchase Options</h2>
    <p class="desc">✨ Unlock More Watch Faces – Pick Your Plan Today!</p>
    
    <div class="cards-container">
      <!-- 单品盒子 -->
      <div class="box-container product-box">
        <h3 class="box-title">Single Product</h3>
        
        <div v-if="product" :class="['option-card', { active: isProductSelected }]" @click="selectProduct">
          <div class="card-header">
            <h3 class="card-title">{{ product.name }}</h3>
            <div class="price-info">
              <span class="price">${{ product.price }}</span>
            </div>
          </div>
          
          <div class="product-image">
            <img :src="product.garminImageUrl" :alt="product.name" />
          </div>
          
          <div class="product-info">
            <div class="product-id">ID: {{ product.designId }}</div>
            <div class="product-desc">{{ product.description }}</div>
          </div>
          
          <button class="buy-btn product-btn" @click="handleBuyProduct">
            Buy for ${{ product.price }}
          </button>
        </div>
      </div>
      
      <!-- 订阅盒子 -->
      <div class="box-container subscription-box">
        <h3 class="box-title">Subscription Plans</h3>
        
        <div v-if="isLoadingPlans" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading subscription plans...</p>
        </div>
        
        <div v-else-if="loadError" class="error-container">
          <p class="error-message">{{ loadError }}</p>
          <button class="retry-btn" @click="loadSubscriptionPlans">Retry</button>
        </div>
        
        <div v-else-if="subscriptionPlans.length === 0" class="no-plans-container">
          <p>No subscription plans available at the moment.</p>
        </div>
        
        <div v-else class="subscription-cards-container">
          <div 
            v-for="plan in subscriptionPlans" 
            :key="plan.id"
            :class="['subscription-card', getPlanClass(plan), { active: selectedPlan && selectedPlan.id === plan.id }]"
            @click="selectSubscriptionPlan(plan)"
          >
            <!-- 推荐标签 -->
            <div class="recommended-badge" v-if="plan.durationDays === -1">RECOMMENDED</div>
            
            <div class="card-header">
              <h3 class="card-title">
                {{ plan.durationDays === -1 ? 'Lifetime' : (plan.durationDays >= 365 ? 'Annual' : 'Monthly') }} Plan
              </h3>
              <div class="price-info">
                <span class="price">${{ plan.discountPrice || plan.originalPrice }}</span>
                <span class="original-price" v-if="plan.discountPrice && plan.discountPrice < plan.originalPrice">
                  ${{ plan.originalPrice }}
                </span>
                <span class="price-period" v-if="plan.durationDays > 0">
                  {{ plan.durationDays >= 365 ? '/year' : '/month' }}
                </span>
              </div>
            </div>
            
            <div class="plan-benefits">
              <ul>
                <li v-if="plan.durationDays === -1">
                  <span class="check-icon">✓</span> Access to 2000+ premium watch faces
                </li>
                <li v-else>
                  <span class="check-icon">✓</span> Access to 2000+ premium watch faces
                </li>
                <li>
                  <span class="check-icon">✓</span> 
                  {{ plan.durationDays === -1 ? 'Get all future watch faces automatically' : 'Get new watch faces monthly' }}
                </li>
                <li>
                  <span class="check-icon">✓</span> Ad-free experience
                </li>
                <li v-if="plan.durationDays === -1">
                  <span class="check-icon">✓</span> Early access to new features
                </li>
                <li>
                  <span class="check-icon">✓</span> 
                  {{ plan.durationDays === -1 ? 'Priority customer support' : 
                     (plan.durationDays >= 365 ? 'Standard customer support' : 'Basic customer support') }}
                </li>
              </ul>
            </div>
            
            <button 
              :class="['subscription-btn', getPlanButtonClass(plan)]"
              @click.stop="handleBuySubscription"
            >
              {{ plan.durationDays === -1 ? 'Get Lifetime Access' : 'Subscribe Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
// import Logo from '@/components/Logo.vue'
import type { PurchaseData, ProductVO } from '@/types'
import { getActivePlans } from '@/api/subscription'
import type { SubscriptionPlan } from '@/api/subscription'

const router = useRouter()
const store = useShopOptionsStore()

// 订阅计划相关
const subscriptionPlans = ref<SubscriptionPlan[]>([])
const selectedPlan = ref<SubscriptionPlan | null>(null)
const isLoadingPlans = ref(false)
const loadError = ref('')

// 直接使用 PurchaseData 类型
const purchaseData = computed<PurchaseData | null>(() => store.data as PurchaseData || null)

const product = computed(() => purchaseData.value?.product as ProductVO)

// 判断产品是否被选中
const isProductSelected = computed(() => {
  console.log(222, product.value, store.selectedProduct, selectedPlan.value)
  // 确保产品存在且已被选中（而不是订阅被选中）
  if (!product.value || !store.selectedProduct || selectedPlan.value) return false;
  
  // 如果是ProductVO类型，比较designId
  if ('designId' in store.selectedProduct && 'designId' in product.value) {
    return store.selectedProduct.designId === product.value.designId;
  }
  
  return false;
});

// 选择单个产品
const selectProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO);
    selectedPlan.value = null;
  }
};

// 处理购买单个产品
const handleBuyProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO)
    router.push({ name: 'Checkout' })
  }
}

// 处理订阅计划购买
const handleBuySubscription = () => {
  if (selectedPlan.value) {
    console.log('selectedPlan.value', selectedPlan.value)
    // 设置选中的订阅计划
    store.setSelectedSubscription(selectedPlan.value);
    router.push({ name: 'CheckoutSubscription' });
  }
};

// 加载有效的订阅计划
const loadSubscriptionPlans = async () => {
  isLoadingPlans.value = true;
  loadError.value = '';
  
  try {
    const response = await getActivePlans();
    if (response.code === 0 && response.data) {
      subscriptionPlans.value = response.data;
      
      // 默认选中终身访问计划
      if (subscriptionPlans.value.length > 0) {
        const lifetimePlan = subscriptionPlans.value.find(plan => plan.durationDays === -1);
        selectedPlan.value = lifetimePlan || subscriptionPlans.value[0];
      }
    }
    
    isLoadingPlans.value = false;
  } catch (error) {
    console.error('Failed to load subscription plans:', error);
    loadError.value = 'Failed to load subscription plans. Please try again.';
    isLoadingPlans.value = false;
  }
};

// 处理订阅计划选择
const selectSubscriptionPlan = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan;
};


// 获取计划类型
const getPlanType = (plan: SubscriptionPlan): 'monthly' | 'yearly' | 'lifetime' => {
  if (plan.durationDays === -1) return 'lifetime';
  if (plan.durationDays >= 365) return 'yearly';
  return 'monthly';
};

// 获取计划样式类
const getPlanClass = (plan: SubscriptionPlan): string => {
  const type = getPlanType(plan);
  return `plan-${type}`;
};

// 获取计划按钮样式类
const getPlanButtonClass = (plan: SubscriptionPlan): string => {
  const type = getPlanType(plan);
  return `button-${type}`;
};

onMounted(() => {
  // 检查是否有数据
  if (!purchaseData.value) {
    router.push('/code');
  }
  
  // 加载订阅计划
  loadSubscriptionPlans();
})
</script>

<style scoped>
.purchase-options {
  max-width: 1400px;
  margin: 0 auto;
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
  gap: 0;
  justify-content: center;
  align-items: stretch;
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

.subscription-box {
  padding: 0 30px 0 30px;
}

.box-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: #1d1d1f;
  text-align: center;
  font-weight: 600;
}

.product-box {
  flex: 0 0 calc(25% - 1px);
  position: relative;
}

.subscription-box {
  flex: 0 0 calc(75% - 1px);
  position: relative;
}

/* 分割线 */
.product-box::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: #e5e5e5;
  margin-right: -0.5px;
}

.subscription-cards-container {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
}

.option-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.option-card.active {
  border-color: #2d6a4f;
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
  background: #2d6a4f; /* 单品按钮颜色 */
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  width: 100%;
  margin-top: 24px;
}

.buy-btn:hover {
  background: #40916c;
  transform: translateY(-2px);
}

.buy-btn:active {
  transform: translateY(0);
}

/* 统一按钮样式 */

/* 响应式设计 */
@media (max-width: 1024px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .product-box, .subscription-box {
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
    padding: 24px 12px 0 12px;
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
    padding: 16px 8px;
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
    padding: 24px 12px 36px;
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