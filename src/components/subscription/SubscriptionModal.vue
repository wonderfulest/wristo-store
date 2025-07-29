<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :fullscreen="isMobile"
    :class="['subscription-modal', { 'is-mobile': isMobile }]"
    @closed="handleClosed"
  >
    <!-- Header -->
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">Unlock Premium Access</h3>
        <button class="close-button" @click="closeModal">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>
    
    <!-- Content -->
    <div class="modal-content">
      <SubscriptionCard @subscribe="handleSubscribe" />
      
      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="index" class="feature-item">
          <el-icon class="feature-icon"><component :is="feature.icon" /></el-icon>
          <div class="feature-text">
            <h4 class="feature-title">{{ feature.title }}</h4>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="security-note">
        <el-icon><Lock /></el-icon>
        <span>Secure payment · Encrypted connection</span>
      </div>
    </div>
    
    <!-- Footer -->
    <template #footer v-if="!isMobile">
      <div class="modal-footer">
        <button class="secondary-button" @click="closeModal">
          Maybe later
        </button>
      </div>
    </template>
    
    <!-- Checkout Modal -->
    <SubscriptionCheckoutModal 
      v-model="showCheckoutModal"
      :is-mobile="isMobile"
      @success="handleSubscriptionSuccess"
      @cancel="handleSubscriptionCancel"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Close, Lock, Check, Star, Download, Zap, Clock, Shield } from 'lucide-vue-next';
import { useDisplay } from 'vuetify';
import SubscriptionCard from './SubscriptionCard.vue';
import SubscriptionCheckoutModal from './SubscriptionCheckoutModal.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  triggerElement: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'success', 'cancel']);

const { mobile } = useDisplay();
const isMobile = ref(false);
const showCheckoutModal = ref(false);
const isAnimating = ref(false);

// Features list for the modal
const features = [
  {
    icon: 'Check',
    title: 'All Watch Faces',
    description: 'Unlock access to our entire library of premium watch faces.'
  },
  {
    icon: 'Download',
    title: 'Instant Access',
    description: 'Download and use your new watch faces immediately.'
  },
  {
    icon: 'Zap',
    title: 'Future Updates',
    description: 'Get all new watch faces and updates at no extra cost.'
  },
  {
    icon: 'Shield',
    title: 'Secure Payment',
    description: 'Your payment information is always protected.'
  }
];

// Computed property for v-model
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Check if mobile view
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// Handle subscribe button click
const handleSubscribe = () => {
  showCheckoutModal.value = true;
};

// Handle successful subscription
const handleSubscriptionSuccess = () => {
  showCheckoutModal.value = false;
  closeModal();
  emit('success');
};

// Handle subscription cancellation
const handleSubscriptionCancel = () => {
  showCheckoutModal.value = false;
};

// Close the modal
const closeModal = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  visible.value = false;
};

// Handle modal closed event
const handleClosed = () => {
  isAnimating.value = false;
  emit('cancel');
};

// Handle click outside to close
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (visible.value && !target.closest('.el-dialog')) {
    closeModal();
  }
};

// Lifecycle hooks
onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  document.addEventListener('click', handleClickOutside);
  
  // Add click handler to trigger element if specified
  if (props.triggerElement) {
    const trigger = document.querySelector(props.triggerElement);
    if (trigger) {
      trigger.addEventListener('click', () => {
        visible.value = true;
      });
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
  document.removeEventListener('click', handleClickOutside);
  
  // Clean up event listener for trigger element
  if (props.triggerElement) {
    const trigger = document.querySelector(props.triggerElement);
    if (trigger) {
      trigger.removeEventListener('click', () => {
        visible.value = true;
      });
    }
  }
});
</script>

<style scoped>
/* Modal Overrides */
:deep(.el-dialog) {
  border-radius: 12px;
  max-width: 520px;
  width: 90%;
  margin: 20px auto;
  overflow: hidden;
  box-shadow: 0 10px 60px rgba(0, 0, 0, 0.1);
  background: #fff;
}

:deep(.el-dialog__header) {
  padding: 0;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* Mobile Styles */
:deep(.el-dialog.is-fullscreen) {
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
  max-width: none;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  font-family: 'SF Pro Display', -apple-system, sans-serif;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  margin: -8px;
  cursor: pointer;
  color: #86868b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Content */
.modal-content {
  padding: 0 24px 24px;
}

/* Features Grid */
.features-grid {
  margin: 24px 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.feature-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: #0071e3;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.feature-description {
  font-size: 13px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

/* Security Note */
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #86868b;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.security-note .el-icon {
  font-size: 14px;
}

/* Buttons */
.secondary-button {
  width: 100%;
  background: #f5f5f7;
  color: #1d1d1f;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'SF Pro Text', -apple-system, sans-serif;
}

.secondary-button:hover {
  background: #e5e5ea;
}

/* Mobile specific styles */
@media (max-width: 768px) {
  .modal-content {
    padding: 0 16px 20px;
  }
  
  .modal-header {
    padding: 16px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }
  
  .features-grid {
    margin: 16px 0;
  }
  
  .feature-item {
    padding: 10px;
  }
  
  .security-note {
    margin-top: 16px;
    padding-top: 12px;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

:deep(.el-dialog) {
  animation: slideUp 0.3s ease-out forwards;
}

:deep(.el-overlay) {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
