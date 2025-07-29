<template>
  <el-dialog
    v-model="visible"
    :title="isMobile ? 'Complete Subscription' : 'Confirm Your Subscription'"
    width="90%"
    :fullscreen="isMobile"
    :show-close="!isMobile"
    :close-on-click-modal="!isMobile"
    :close-on-press-escape="!isMobile"
    class="subscription-modal"
  >
    <div class="modal-content">
      <div class="subscription-summary">
        <h3 class="summary-title">{{ planTitle }}</h3>
        <div class="price-display">
          <span v-if="displayOriginalPrice !== displayDiscountPrice" class="original-price">${{ displayOriginalPrice }}</span>
          <span class="current-price">${{ displayDiscountPrice }}</span>
          <span v-if="displayOriginalPrice !== displayDiscountPrice" class="discount-badge">{{ displayDiscountPercentage }}% OFF</span>
        </div>
        <div class="billing-note">
          One-time payment · 
          <span v-if="selectedPlan?.durationDays === -1">Lifetime access</span>
          <span v-else-if="selectedPlan">{{ selectedPlan.durationDays }} days access</span>
          <span v-else>Lifetime access</span>
        </div>
      </div>

      <div class="benefits-section">
        <h4>What's Included</h4>
        <ul class="benefits-list">
          <li v-for="(benefit, index) in benefits" :key="index" class="benefit-item">
            <el-icon class="check-icon"><Check /></el-icon>
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </div>

      <div class="payment-section">
        <h4>Payment Method</h4>
        <div class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            :class="['payment-method', { active: selectedMethod === method.id }]"
            @click="selectPaymentMethod(method.id)"
          >
            <img :src="method.icon" :alt="method.name" class="method-icon" />
            <span class="method-name">{{ method.name }}</span>
            <el-icon v-if="selectedMethod === method.id" class="selected-icon"><Check /></el-icon>
          </div>
        </div>
      </div>

      <div class="terms-section">
        <el-checkbox v-model="agreedToTerms" class="terms-checkbox">
          I agree to the <a href="/terms" target="_blank" class="terms-link">Terms of Service</a> and 
          <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
        </el-checkbox>
      </div>

      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large" 
          class="confirm-button" 
          :disabled="!agreedToTerms || isProcessing"
          :loading="isProcessing"
          @click="handlePayment"
        >
          Confirm Payment ${{ displayDiscountPrice }}
        </el-button>
        <el-button 
          class="cancel-button" 
          :disabled="isProcessing"
          @click="closeModal"
        >
          Cancel
        </el-button>
      </div>

      <div class="security-note">
        <el-icon><Lock /></el-icon>
        <span>Secure payment · Encrypted transmission</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check, Lock } from '@element-plus/icons-vue';
import { ElButton, ElCheckbox, ElDialog, ElIcon } from 'element-plus';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

import { type SubscriptionPlan } from '@/api/subscription';

interface Props {
  modelValue: boolean;
  isMobile?: boolean;
  selectedPlan?: SubscriptionPlan | null;
  originalPrice?: number;
  discountPrice?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isMobile: false,
  originalPrice: 19.99,
  discountPrice: 9.99
});

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const selectedMethod = ref('paddle');
const agreedToTerms = ref(false);
const isProcessing = ref(false);

const benefits = [
  'Access to 2000+ premium watch faces',
  'Get all future watch faces automatically',
  'Ad-free experience',
  'Early access to new features',
  'Priority customer support',
];

const paymentMethods: PaymentMethod[] = [
  { id: 'paddle', name: 'Credit/Debit Card', icon: '/images/payment/credit-card.svg' },
  { id: 'paypal', name: 'PayPal', icon: '/images/payment/paypal.svg' },
  { id: 'apple-pay', name: 'Apple Pay', icon: '/images/payment/apple-pay.svg' },
  { id: 'google-pay', name: 'Google Pay', icon: '/images/payment/google-pay.svg' },
];

// 计算属性：显示的计划标题
const planTitle = computed(() => {
  if (props.selectedPlan?.paddleProduct?.name) {
    return props.selectedPlan.paddleProduct.name;
  }
  return props.selectedPlan?.name || 'Premium Subscription';
});

// 计算属性：显示的原始价格
const displayOriginalPrice = computed(() => {
  if (props.selectedPlan) {
    return props.selectedPlan.originalPrice.toFixed(2);
  }
  return props.originalPrice.toFixed(2);
});

// 计算属性：显示的折扣价格
const displayDiscountPrice = computed(() => {
  if (props.selectedPlan) {
    return props.selectedPlan.discountPrice.toFixed(2);
  }
  return props.discountPrice.toFixed(2);
});

// 计算属性：显示的折扣百分比
const displayDiscountPercentage = computed(() => {
  if (props.selectedPlan) {
    const originalPrice = props.selectedPlan.originalPrice;
    const discountPrice = props.selectedPlan.discountPrice;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  }
  return Math.round(((props.originalPrice - props.discountPrice) / props.originalPrice) * 100);
});

// 计算属性：获取 Paddle 产品 ID
const paddleProductId = computed(() => {
  return props.selectedPlan?.paddleProduct?.id || '';
});

// 计算属性：获取 Paddle 价格 ID
const paddlePriceId = computed(() => {
  return props.selectedPlan?.paddlePrice?.id || '';
});

const selectPaymentMethod = (methodId: string) => {
  selectedMethod.value = methodId;
};

const handlePayment = async () => {
  if (!agreedToTerms.value) return;
  
  isProcessing.value = true;
  
  try {
    // 使用 Paddle 产品和价格 ID 处理支付
    if (selectedMethod.value === 'paddle' && paddleProductId.value && paddlePriceId.value) {
      console.log('Processing payment with Paddle:', {
        productId: paddleProductId.value,
        priceId: paddlePriceId.value,
        planCode: props.selectedPlan?.planCode,
        planName: props.selectedPlan?.name
      });
      
      // TODO: 集成 Paddle Checkout API
      // 示例: await paddleCheckout(paddleProductId.value, paddlePriceId.value);
    } else {
      // 其他支付方式处理
      console.log('Processing payment with method:', selectedMethod.value);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟 API 调用
    
    // 支付成功
    emit('success');
    closeModal();
  } catch (error) {
    console.error('Payment failed:', error);
    // TODO: Show error message to user
  } finally {
    isProcessing.value = false;
  }
};

const closeModal = () => {
  visible.value = false;
  emit('cancel');
};
</script>

<style scoped>
.modal-content {
  padding: 0 8px;
}

.subscription-summary {
  text-align: center;
  margin-bottom: 24px;
}

.summary-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1a1a1a;
}

.price-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 18px;
}

.current-price {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
}

.discount-badge {
  background: #ffebee;
  color: #e53935;
  font-size: 14px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.billing-note {
  color: #6b7280;
  font-size: 14px;
}

.benefits-section {
  margin: 24px 0;
}

.benefits-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #374151;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #4b5563;
}

.check-icon {
  color: #10b981;
  margin-right: 10px;
  font-size: 16px;
}

.payment-section {
  margin: 24px 0;
}

.payment-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #374151;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.payment-method:hover {
  border-color: #9ca3af;
}

.payment-method.active {
  border-color: #4f46e5;
  background-color: #f5f3ff;
}

.method-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  object-fit: contain;
}

.method-name {
  font-size: 15px;
  color: #1f2937;
}

.selected-icon {
  margin-left: auto;
  color: #4f46e5;
  font-weight: bold;
}

.terms-section {
  margin: 20px 0;
  padding: 12px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.terms-checkbox {
  font-size: 13px;
  color: #6b7280;
}

.terms-link {
  color: #4f46e5;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.confirm-button {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-button:not(.disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.confirm-button.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.cancel-button {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #f9fafb;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 16px;
}

.security-note .el-icon {
  font-size: 14px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-right: 6px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    padding: 0 4px;
  }
  
  .current-price {
    font-size: 28px;
  }
  
  .original-price {
    font-size: 16px;
  }
  
  .payment-method {
    padding: 10px 12px;
  }
  
  .method-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
