<template>
  <div class="subscription-plans-component">
    <h3 class="plans-title" v-if="showTitle">{{ title }}</h3>
    
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
    
    <div v-else class="subscription-cards-container" :class="{ 'has-current-subscription': hasCurrentSubscription }">
      <div 
        v-for="plan in subscriptionPlans" 
        :key="plan.id"
        :class="['subscription-card', getPlanClass(plan), { 
          active: selectedPlan && selectedPlan.id === plan.id,
          'current-subscription': isCurrentSubscription(plan),
          'other-plan': hasCurrentSubscription && !isCurrentSubscription(plan)
        }]"
        @click="selectPlan(plan)"
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
            <li>
              <span class="check-icon">✓</span> 
              {{ plan.durationDays === -1 ? 'Full access to all watch faces forever' : 
                 (plan.durationDays >= 365 ? 'Full access to all watch faces for 1 year' : 'Full access to all watch faces for 1 month') }}
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
          @click.stop="handleSubscribe(plan)"
          :disabled="hasCurrentSubscription"
        >
          {{ plan.durationDays === -1 ? 'Get Lifetime Access' : 'Subscribe Now' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import { getActivePlans } from '@/api/subscription'
import type { SubscriptionPlan } from '@/api/subscription'

// Props
interface Props {
  title?: string
  showTitle?: boolean
  autoSelectLifetime?: boolean
  currentPlanCode?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Subscription Plans',
  showTitle: true,
  autoSelectLifetime: true,
  currentPlanCode: null
})

// Emits
const emit = defineEmits<{
  planSelected: [plan: SubscriptionPlan]
  subscribe: [plan: SubscriptionPlan]
}>()

// State
const subscriptionPlans = ref<SubscriptionPlan[]>([])
const selectedPlan = ref<SubscriptionPlan | null>(null)
const isLoadingPlans = ref(false)
const loadError = ref('')

// Methods
const loadSubscriptionPlans = async () => {
  isLoadingPlans.value = true
  loadError.value = ''
  
  try {
    const response: SubscriptionPlan[] = await getActivePlans()
    subscriptionPlans.value = response
    
    // 默认选中终身访问计划
    if (props.autoSelectLifetime && subscriptionPlans.value.length > 0) {
      const lifetimePlan = subscriptionPlans.value.find(plan => plan.durationDays === -1)
      selectedPlan.value = lifetimePlan || subscriptionPlans.value[0]
      if (selectedPlan.value) {
        emit('planSelected', selectedPlan.value)
      }
    }
    isLoadingPlans.value = false
  } catch (error) {
    console.error('Failed to load subscription plans:', error)
    loadError.value = 'Failed to load subscription plans. Please try again.'
    isLoadingPlans.value = false
  }
}

const selectPlan = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan
  emit('planSelected', plan)
}

const handleSubscribe = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan
  emit('subscribe', plan)
}

// 获取计划类型
const getPlanType = (plan: SubscriptionPlan): 'monthly' | 'yearly' | 'lifetime' => {
  if (plan.durationDays === -1) return 'lifetime'
  if (plan.durationDays >= 365) return 'yearly'
  return 'monthly'
}

// 获取计划样式类
const getPlanClass = (plan: SubscriptionPlan): string => {
  const type = getPlanType(plan)
  return `plan-${type}`
}

// 获取计划按钮样式类
const getPlanButtonClass = (plan: SubscriptionPlan): string => {
  const type = getPlanType(plan)
  return `button-${type}`
}

// 检查是否为当前用户的订阅计划
const isCurrentSubscription = (plan: SubscriptionPlan): boolean => {
  if (!props.currentPlanCode) return false
  return plan.planCode === props.currentPlanCode
}

// 检查是否存在当前订阅
const hasCurrentSubscription = computed(() => {
  return !!props.currentPlanCode
})

// 暴露方法给父组件
defineExpose({
  loadSubscriptionPlans,
  selectedPlan
})

// 初始化
onMounted(() => {
  loadSubscriptionPlans()
})
</script>

<style scoped>
.subscription-plans-component {
  width: 100%;
  text-align: left;
}

.plans-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1d1d1f;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container,
.no-plans-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: #666;
}

.error-message {
  color: #ff3b30;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #0056b3;
}

.subscription-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 10rem;
  align-items: stretch;
}

.subscription-card {
  background: transparent;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.subscription-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.subscription-card.active {
  box-shadow: 0 8px 30px rgba(0, 122, 255, 0.2);
}

.subscription-card.plan-lifetime {
  border-color: #e9ecef;
}

.subscription-card.plan-lifetime.active {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.subscription-card.plan-yearly {
  border-color: #e9ecef;
}

.subscription-card.plan-yearly.active {
  border-color: #f093fb;
  box-shadow: 0 8px 30px rgba(240, 147, 251, 0.3);
}

.subscription-card.plan-monthly {
  border-color: #e9ecef;
}

.subscription-card.plan-monthly.active {
  border-color: #4facfe;
  box-shadow: 0 8px 30px rgba(79, 172, 254, 0.3);
}

.subscription-card.current-subscription {
  border-color: #30d158 !important;
  box-shadow: 0 8px 30px rgba(48, 209, 88, 0.3) !important;
  position: relative;
}

.subscription-card.current-subscription::before {
  content: 'Current Plan';
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: #30d158;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
}

/* 当存在当前订阅时，其他卡片显示为灰色 */
.subscription-card.other-plan {
  opacity: 0.6;
  filter: grayscale(0.3);
  border-color: #d1d5db !important;
}

.subscription-card.other-plan:hover {
  opacity: 0.8;
  filter: grayscale(0.1);
}

.subscription-card.other-plan .subscription-btn {
  background-color: #9ca3af !important;
  color: white !important;
}

.subscription-card.other-plan .subscription-btn:hover {
  background-color: #6b7280 !important;
}

.subscription-card.other-plan .card-title,
.subscription-card.other-plan .price {
  color: #6b7280 !important;
}

.subscription-card.other-plan .check-icon {
  background-color: #9ca3af !important;
}

.recommended-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  background-color: #ff6b6b;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0 16px 0 16px;
  letter-spacing: 0.5px;
}

.card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1d1d1f;
}

.price-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.price {
  font-size: 2rem;
  font-weight: 800;
  color: #1d1d1f;
}

.original-price {
  font-size: 1.2rem;
  color: #8e8e93;
  text-decoration: line-through;
}

.price-period {
  font-size: 1rem;
  color: #8e8e93;
  font-weight: 500;
}

.plan-benefits {
  margin-bottom: 2rem;
  flex: 1;
}

.plan-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-benefits li {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #30d158;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.subscription-btn {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: auto;
}

.button-lifetime {
  background-color: #667eea;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.button-lifetime:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.button-yearly {
  background-color: #f093fb;
  color: white;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
}

.button-yearly:hover {
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
}

.button-monthly {
  background-color: #4facfe;
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.button-monthly:hover {
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscription-cards-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .subscription-card {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1.3rem;
  }
  
  .price {
    font-size: 1.8rem;
  }
}
</style>
