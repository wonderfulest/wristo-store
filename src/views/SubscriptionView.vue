<template>
  <div class="subscription-view">
    <div class="subscription-container">
      <div class="hero-content">
        <h1 class="page-title">Unlock Premium Access</h1>
        <p class="page-subtitle">Get unlimited access to all premium watch faces and features</p>
        
        <!-- 当前订阅状态 -->
        <div v-if="hasActiveSubscription" class="current-subscription-banner">
          <div class="banner-content">
            <el-icon class="success-icon"><Check /></el-icon>
            <div class="subscription-info">
              <h3>You have an active subscription</h3>
              <p>{{ userStore.userInfo?.subscription?.name }} - Expires {{ formatDate(userStore.userInfo?.subscription?.endTime) }}</p>
            </div>
            <el-button type="primary" @click="router.push('/subscription-management')">
              Manage Subscription
            </el-button>
          </div>
        </div>
        
        <!-- 订阅计划选择 -->
        <div class="subscription-plans-container">
          <SubscriptionPlans 
            :show-title="false"
            :current-plan-code="currentSubscriptionPlanCode"
            @plan-selected="handlePlanSelected"
            @subscribe="handleSubscribe"
          />
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
  Key,
  Check
} from '@element-plus/icons-vue';

// Components
import SubscriptionCheckoutModal from '@/components/subscription/SubscriptionCheckoutModal.vue';
import SubscriptionPlans from '@/components/SubscriptionPlans.vue';

// API
import type { SubscriptionPlan } from '@/api/subscription';
import { useUserStore } from '@/store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// State
const showCheckoutModal = ref(false);
const activeFaqs = ref(['0']);
const isMobile = ref(window.innerWidth < 768);
const selectedPlan = ref<SubscriptionPlan | null>(null);

// 检查用户是否有有效订阅
const hasActiveSubscription = computed(() => {
  if (!userStore.userInfo?.subscription) return false;
  const endTime = new Date(userStore.userInfo.subscription.endTime);
  const now = new Date();
  return endTime > now;
});

// 获取当前用户的订阅计划代码
const currentSubscriptionPlanCode = computed(() => {
  return userStore.userInfo?.subscription?.planCode || null;
});

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};





// Check if the viewport is mobile
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};



// Check for mobile on mount and add/remove event listener
onMounted(() => {
  window.addEventListener('resize', checkIfMobile);
  
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

// Handle plan selection
const handlePlanSelected = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan;
};

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
  font-size: 20px;
  color: #86868b;
  margin-bottom: 48px;
  line-height: 1.4;
}

.current-subscription-banner {
  background: linear-gradient(135deg, #30d158 0%, #28a745 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(48, 209, 88, 0.2);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.success-icon {
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.subscription-info {
  flex: 1;
}

.subscription-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: white;
}

.subscription-info p {
  font-size: 0.9rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
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
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .subscription-info h3 {
    font-size: 1.1rem;
  }
  
  .subscription-info p {
    font-size: 0.85rem;
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
  gap: 24px;
  margin: 32px 0;
  flex-wrap: nowrap;
  justify-content: center;
}

.plan-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 320px;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.plan-card.active {
  border-color: #4f46e5;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
}

.plan-monthly {
  background: linear-gradient(to bottom right, #ffffff, #f5f5f5);
  border: 2px solid #e0e0e0;
}

.plan-monthly:hover {
  border-color: #d0d0d0;
}

.plan-monthly.active {
  border-color: #6366f1;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.plan-yearly {
  background: linear-gradient(to bottom right, #ffffff, #f0f7ff);
  border: 2px solid #d4e6f9;
}

.plan-yearly:hover {
  border-color: #b8d4f5;
}

.plan-yearly.active {
  border-color: #4f46e5;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
}

.plan-lifetime {
  background: linear-gradient(to bottom right, #ffffff, #f0f9ff);
  border: 2px solid #e6f7ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.plan-lifetime:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.plan-lifetime.active {
  border-color: #1890ff;
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
}

.recommended-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #1890ff;
  color: white;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-bottom-right-radius: 8px;
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
  margin-top: 16px;
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

.button-monthly {
  background-color: #6366f1;
}

.button-monthly:hover {
  background-color: #5258e4;
}

.button-yearly {
  background-color: #3b82f6;
}

.button-yearly:hover {
  background-color: #2563eb;
}

.button-lifetime {
  background-color: #1890ff;
  font-weight: 600;
}

.button-lifetime:hover {
  background-color: #0c7ad9;
}

.plan-benefits {
  margin: 16px 0;
  padding: 0;
  flex-grow: 1;
  min-height: 150px;
}

.plan-benefit-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}

.plan-benefit-item .check-icon {
  color: #10b981;
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
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
