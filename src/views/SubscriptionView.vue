<template>
  <div class="subscription-view">
    <div class="subscription-container">
      <div class="subscription-content">
        <h1 class="page-title">Unlock Premium Access</h1>
        <p class="page-subtitle">Get unlimited access to all premium watch faces and features</p>
        
        <!-- 加载中状态 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8z" opacity=".5"/>
              <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2v2a8 8 0 0 1 8 8z">
                <animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate"/>
              </path>
            </svg>
          </div>
          <p>Loading subscription plans...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="loadError" class="no-plans-container">
          <p>{{ loadError }}</p>
          <el-button type="primary" @click="loadSubscriptionPlans">Try Again</el-button>
        </div>
        
        <!-- 没有计划状态 -->
        <div v-else-if="subscriptionPlans.length === 0" class="no-plans-container">
          <p>No subscription plans available at the moment.</p>
          <el-button type="primary" @click="loadSubscriptionPlans">Refresh</el-button>
        </div>
        
        <!-- 订阅计划选择 -->
        <div v-else class="subscription-plans-container">
          <div class="plans-wrapper">
            <div 
              v-for="plan in subscriptionPlans" 
              :key="plan.id"
              :class="['plan-card', { active: selectedPlan?.id === plan.id }]"
              @click="selectedPlan = plan"
            >
              <div class="plan-header">
                <h3 class="plan-name">{{ plan.name }}</h3>
                <span v-if="plan.durationDays === -1" class="plan-duration">Lifetime</span>
                <span v-else class="plan-duration">{{ plan.durationDays }} days</span>
              </div>
              
              <div class="plan-pricing">
                <span v-if="plan.originalPrice !== plan.discountPrice" class="original-price">${{ plan.originalPrice.toFixed(2) }}</span>
                <span class="current-price">${{ plan.discountPrice.toFixed(2) }}</span>
                <span v-if="plan.originalPrice !== plan.discountPrice" class="discount-badge">
                  {{ Math.round(((plan.originalPrice - plan.discountPrice) / plan.originalPrice) * 100) }}% OFF
                </span>
              </div>
              
              <el-button 
                type="primary" 
                class="select-plan-button"
                @click.stop="handleSubscribe(plan)"
              >
                Select Plan
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="feature-grid">
          <div v-for="(feature, index) in features" :key="index" class="feature-card">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
        
        <div class="faq-section">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <el-collapse v-model="activeFaqs" accordion>
            <el-collapse-item 
              v-for="(faq, index) in faqs" 
              :key="index"
              :name="index"
              :title="faq.question"
            >
              <div>{{ faq.answer }}</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
    
    <!-- Checkout Modal -->
    <SubscriptionCheckoutModal 
      v-model="showCheckoutModal"
      :is-mobile="isMobile"
      :selected-plan="selectedPlan"
      @success="handleSubscriptionSuccess"
      @cancel="handleSubscriptionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCollapse, ElCollapseItem } from 'element-plus';
import { 
  Timer,
  Download,
  BellFilled,
  Headset,
  Refresh,
  Key
} from '@element-plus/icons-vue';

// Components
import SubscriptionCheckoutModal from '@/components/subscription/SubscriptionCheckoutModal.vue';

// API
import { getActivePlans, type SubscriptionPlan } from '@/api/subscription';

const route = useRoute();
const router = useRouter();
// State
const showCheckoutModal = ref(false);
const activeFaqs = ref(['0']);
const isMobile = ref(window.innerWidth < 768);
const isLoading = ref(false);
const subscriptionPlans = ref<SubscriptionPlan[]>([]);
const selectedPlan = ref<SubscriptionPlan | null>(null);
const loadError = ref<string>('');

// Check if the viewport is mobile
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 加载有效的订阅计划
const loadSubscriptionPlans = async () => {
  isLoading.value = true;
  loadError.value = '';
  
  try {
    const response = await getActivePlans();
    if (response.code === 0 && response.data) {
      subscriptionPlans.value = response.data;
      
      // 默认选择第一个计划（如果有）
      if (subscriptionPlans.value.length > 0) {
        selectedPlan.value = subscriptionPlans.value[0];
      }
    } else {
      loadError.value = response.msg || 'Failed to load subscription plans';
    }
  } catch (error) {
    console.error('Error loading subscription plans:', error);
    loadError.value = 'Failed to load subscription plans. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Check for mobile on mount and add/remove event listener
onMounted(() => {
  window.addEventListener('resize', checkIfMobile);
  
  // 加载订阅计划
  loadSubscriptionPlans();
  
  // Check for subscription parameter in URL
  if (route.query.subscribe === 'true') {
    showCheckoutModal.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
});

// Features list
const features = [
  {
    icon: Timer,
    title: '2000+ Watch Faces',
    description: 'Unlock access to our entire collection of premium watch faces.'
  },
  {
    icon: Download,
    title: 'Instant Download',
    description: 'Download and use your new watch faces immediately after purchase.'
  },
  {
    icon: BellFilled,
    title: 'New Content Alerts',
    description: 'Be the first to know when we release new watch faces.'
  },
  {
    icon: Key,
    title: 'Secure Payment',
    description: 'Your payment information is always protected and encrypted.'
  },
  {
    icon: Refresh,
    title: 'Free Updates',
    description: 'All future updates to your watch faces are included at no extra cost.'
  },
  {
    icon: Headset,
    title: 'Priority Support',
    description: 'Get help from our dedicated support team whenever you need it.'
  }
];

// FAQ data
const faqs = [
  {
    question: 'What\'s included in the premium access?',
    answer: 'Get lifetime access to 2000+ premium watch faces, all future updates, and exclusive features for a one-time payment of $9.99.'
  },
  {
    question: 'Is this a one-time payment or a subscription?',
    answer: 'This is a one-time payment of $9.99 for lifetime access. No subscriptions, no recurring charges.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 14-day money-back guarantee if you\'re not completely satisfied with your purchase.'
  },
  {
    question: 'Do I need an account?',
    answer: 'Yes, you\'ll need an account to access your purchased watch faces across all your devices.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay.'
  }
];

// Handle subscribe button click
const handleSubscribe = (plan?: SubscriptionPlan) => {
  if (plan) {
    selectedPlan.value = plan;
  }
  showCheckoutModal.value = true;
};

// Handle successful subscription
const handleSubscriptionSuccess = () => {
  showCheckoutModal.value = false;
  // Redirect to success page or show success message
  router.push({ name: 'subscription-success' });
};

// Handle subscription cancellation
const handleSubscriptionCancel = () => {
  showCheckoutModal.value = false;
  // Any cleanup or additional logic can go here
};


</script>

<style scoped>
.subscription-view {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding: 32px 0 64px;
}

.subscription-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-title {
  font-size: 40px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
  margin-bottom: 12px;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 18px;
  color: #86868b;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.5;
}

.subscription-card-wrapper {
  margin: 0 auto 64px;
  max-width: 420px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.feature-icon {
  width: 36px;
  height: 36px;
  background: #f5f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #0071e3;
  padding: 16px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.feature-description {
  font-size: 14px;
  color: #86868b;
  line-height: 1.5;
  margin: 0;
}

.faq-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
  margin-bottom: 24px;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 16px;
    padding: 0 16px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .subscription-card-wrapper {
    margin-bottom: 48px;
  }
  
  .section-title {
    font-size: 24px;
  }
}

/* Animation for the subscription card */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subscription-card-wrapper {
  animation: fadeInUp 0.6s ease-out forwards;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #86868b;
}

.loading-icon {
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.no-plans-container {
  text-align: center;
  padding: 40px 0;
  color: #86868b;
}

.subscription-plans-container {
  margin-bottom: 64px;
}

.plans-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin: 0 auto;
  max-width: 1000px;
}

.plan-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 280px;
  flex: 1;
  max-width: 320px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.plan-card.active {
  border-color: #0071e3;
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.15);
  transform: translateY(-4px);
}

.plan-card.active::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 40px 40px 0;
  border-color: transparent #0071e3 transparent transparent;
}

.plan-card.active::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.plan-header {
  margin-bottom: 16px;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.plan-duration {
  display: inline-block;
  font-size: 14px;
  color: #86868b;
  background: #f5f5f7;
  padding: 4px 10px;
  border-radius: 12px;
}

.plan-pricing {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 16px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.discount-badge {
  background: #ffebee;
  color: #e53935;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

.select-plan-button {
  width: 100%;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.select-plan-button:hover {
  background: #0077ed;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .plans-wrapper {
    flex-direction: column;
    align-items: center;
  }
  
  .plan-card {
    width: 100%;
    max-width: 100%;
  }
}

/* Styling for the collapse component */
:deep(.el-collapse) {
  --el-collapse-header-height: 64px;
  --el-collapse-header-bg-color: #fff;
  --el-collapse-content-bg-color: #fff;
  --el-collapse-border-color: rgba(0, 0, 0, 0.06);
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  padding: 0 20px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

:deep(.el-collapse-item__header:hover) {
  background-color: #f5f5f7;
}

:deep(.el-collapse-item__content) {
  padding: 16px 20px;
  font-size: 14px;
  color: #515154;
  line-height: 1.6;
}
</style>
