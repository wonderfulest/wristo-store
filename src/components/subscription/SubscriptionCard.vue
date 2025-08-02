<template>
  <div class="subscription-card">
    <div class="subscription-card__header">
      <h3 class="subscription-card__title">Unlock All Content</h3>
      <div class="subscription-card__badge">Limited Time Offer</div>
    </div>
    
    <ul v-if="showFeatures" class="subscription-card__benefits">
      <li v-for="(feature, index) in features" :key="index" class="benefit-item">
        <el-icon class="benefit-icon"><Check /></el-icon>
        <span>{{ feature }}</span>
      </li>
    </ul>
    
    <div v-if="showPrice" class="subscription-card__pricing">
      <div class="price-tag">
        <span class="original-price">${{ originalPrice.toFixed(2) }}</span>
        <span class="current-price">${{ discountPrice.toFixed(2) }}</span>
        <span v-if="showDiscount" class="discount">{{ discountPercentage }}% OFF</span>
      </div>
      <div class="price-note">One-time payment · Lifetime access</div>
      <div v-if="productCount > 0" class="value-proposition">
        {{ productCount }} watch faces · Total value ${{ totalValue }}
      </div>
    </div>
    
    <el-button 
      type="primary" 
      size="large" 
      class="subscription-button" 
      :loading="isSubscribing"
      @click="handleSubscribe"
    >
      {{ buttonText }}
    </el-button>
    
    <div v-if="showNote" class="subscription-note">
      <el-tooltip
        effect="light"
        content="Get all future updates at no additional cost"
        placement="bottom"
      >
        <span class="note-text">Includes all future updates</span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElButton, ElTooltip, ElIcon } from 'element-plus';
import { Check } from '@element-plus/icons-vue';

interface Props {
  showFeatures?: boolean;
  buttonText?: string;
  showPrice?: boolean;
  showDiscount?: boolean;
  showNote?: boolean;
  variant?: 'default' | 'minimal';
  productCount?: number;
  totalValue?: number;
  plan?: {
    durationDays: number;
  } | null;
}

const props = withDefaults(defineProps<Props>(), {
  showFeatures: true,
  buttonText: 'Subscribe Now',
  showPrice: true,
  showDiscount: true,
  showNote: true,
  variant: 'default',
  productCount: 0,
  totalValue: 0,
  plan: null
});

const userStore = useUserStore();
const router = useRouter();
const isSubscribing = ref(false);

const isLoggedIn = computed(() => !!userStore.userInfo);
// Temporarily disable isSubscribed check until user type is properly extended
const isSubscribed = ref(false);

const originalPrice = 19.99;
const discountPrice = 9.99;
const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

const emit = defineEmits<{
  (e: 'show-checkout'): void;
}>();

const handleSubscribe = () => {
  if (!isLoggedIn.value) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?returnUrl=${returnUrl}`;
    return;
  }

  if (isSubscribed.value) {
    // Already subscribed, redirect to account page
    router.push('/account/subscription');
    return;
  }

  // Emit event to parent to show checkout modal
  emit('show-checkout');};

// Features list - computed based on plan
const features = computed(() => {
  const durationDays = props.plan?.durationDays;
  
  const baseFeatures = [
    durationDays === -1 
      ? 'Full access to all watch faces forever'
      : durationDays && durationDays >= 365
        ? 'Full access to all watch faces for 1 year'
        : 'Full access to all watch faces for 1 month',
    durationDays === -1 
      ? 'Get all future watch faces automatically' 
      : 'Get new watch faces monthly',
    'Ad-free experience'
  ];
  
  if (durationDays === -1) {
    baseFeatures.push('Early access to new features');
    baseFeatures.push('Priority customer support');
  } else if (durationDays && durationDays >= 365) {
    baseFeatures.push('Standard customer support');
  } else {
    baseFeatures.push('Basic customer support');
  }
  
  return baseFeatures;
});
</script>

<style scoped>
.subscription-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.subscription-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.subscription-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.subscription-card__badge {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 8px;
}

.subscription-card__benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #4a4a4a;
  font-size: 15px;
}

.benefit-icon {
  color: #10b981;
  margin-right: 10px;
  font-size: 18px;
}

.subscription-card__pricing {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.price-tag {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 8px;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  margin-right: 8px;
  font-size: 16px;
}

.current-price {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  margin-right: 12px;
}

.discount {
  background: #ffebee;
  color: #e53935;
  font-size: 14px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.price-note {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.value-proposition {
  color: #10b981;
  font-weight: 500;
  font-size: 14px;
}

.subscription-button {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.subscription-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.subscription-button:active {
  transform: translateY(0);
}

.subscription-note {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

.note-text {
  border-bottom: 1px dashed #9ca3af;
  cursor: help;
  padding-bottom: 1px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .subscription-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .subscription-card__title {
    font-size: 20px;
  }
  
  .benefit-item {
    font-size: 14px;
  }
  
  .current-price {
    font-size: 28px;
  }
}
</style>
