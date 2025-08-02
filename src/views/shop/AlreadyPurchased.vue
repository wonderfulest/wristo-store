<template>
  <div class="already-purchased-page">
    <div class="content-container">
      <div class="header-section">
        <h1 class="title">Activate Your Purchase</h1>
        <p class="desc">Enter your purchase email and the code shown on your smartwatch to unlock your products.</p>
      </div>
      
      <div class="tip-card">
        <div class="tip-icon">⌚</div>
        <div class="tip-content">
          <strong>Code:</strong> The 6-digit code will appear on your smartwatch after installing a clockface or app.
        </div>
      </div>
      
      <form class="activation-form" @submit.prevent="handleActivation">
        <div class="input-group">
          <label class="input-label">Purchase Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your purchase email address" 
            class="email-input" 
            required 
            @input="clearMessages"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">Code</label>
          <input 
            v-model="activationCode" 
            type="text" 
            maxlength="6" 
            placeholder="000000" 
            class="code-input" 
            required 
            @input="clearMessages"
          />
          <div class="input-desc">
            The code shown on your smartwatch
            <br>
            <span class="help-inline">
              Not seeing your code? 
              <button type="button" class="help-link-inline" @click="handleResendCode">Learn more</button>
            </span>
          </div>
        </div>
        
        <button class="activation-btn" :disabled="loading || !isFormValid">
          <span v-if="loading">Activating...</span>
          <span v-else>Activate Purchase</span>
        </button>
      </form>
      
      <div v-if="error" class="message error-message">
        <div class="message-icon">⚠️</div>
        <div class="message-text">{{ error }}</div>
      </div>
      
      <div v-if="success" class="message success-message">
        <div class="message-icon">✅</div>
        <div class="message-text">{{ successMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activatePurchase } from '@/api/pay'
import { ElMessage } from 'element-plus'
import type { CheckPurchaseResponse } from '@/types/purchase-check'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const email = ref('')
const activationCode = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const successMessage = ref('')

const isFormValid = computed(() => {
  return email.value.trim() && activationCode.value.length === 6
})

function clearMessages() {
  error.value = ''
  success.value = false
}

// 如果用户已登录，自动填入用户邮箱
onMounted(() => {
  if (userStore.userInfo && userStore.userInfo.email) {
    email.value = userStore.userInfo.email
  }
})

async function handleActivation() {
  error.value = ''
  success.value = false
  
  if (!email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }
  
  if (activationCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit smartwatch code'
    return
  }
  
  loading.value = true
  try {
    const purchaseResult: CheckPurchaseResponse = await activatePurchase(email.value, activationCode.value)
    if (purchaseResult && purchaseResult.isPurchase) {
      success.value = true
      
      // 根据返回值判断激活类型
      if (purchaseResult.subscription) {
        // 通过订阅计划激活
        const subscriptionName = purchaseResult.subscription.name || 'Subscription Plan'
        successMessage.value = `Your purchase has been successfully activated through ${subscriptionName}!`
        ElMessage.success(`Activated via ${subscriptionName}!`)
      } else if (purchaseResult.purchase) {
        // 通过产品购买激活
        successMessage.value = 'Your purchase has been successfully activated through product purchase!'
        ElMessage.success('Activated via product purchase!')
      } else {
        // 默认激活成功消息
        successMessage.value = 'Your purchase has been successfully activated!'
        ElMessage.success('Purchase activated successfully!')
      }
    } else {
      error.value = 'Failed to activate purchase. Please check your email and code. If you have already activated, please go to the home page.'
    }
  } catch (e: any) {
    if (e && typeof e === 'object' && 'code' in e && 'msg' in e && typeof e.msg === 'string') {
      error.value = e.msg
    } else {
      error.value = 'Network error, please try again later.'
    }
  } finally {
    loading.value = false
  }
}

function handleResendCode() {
  // Show help information about smartwatch codes
  ElMessage.info({
    message: 'After installing the clock face or app, there will be a short trial period. Once the trial ends, a 6-digit code will appear on your smartwatch screen for activation. If no code appears, it means the watch face has been automatically unlocked—feel free to continue using it.',
    duration: 8000
  })
}
</script>

<style scoped>
.already-purchased-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 480px;
  min-height: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.header-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.desc {
  color: #86868b;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
}

.tip-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 50px;
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-content {
  color: #0c4a6e;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.activation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.email-input,
.code-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  background: #fff;
  color: #1d1d1f;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.email-input:focus,
.code-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.email-input::placeholder,
.code-input::placeholder {
  color: #86868b;
}

.code-input {
  letter-spacing: 4px;
}

.input-desc {
  font-size: 0.85rem;
  color: #86868b;
  margin-top: 4px;
  line-height: 1.4;
}

.help-inline {
  font-size: 0.8rem;
  color: #86868b;
  margin-top: 6px;
  display: inline-block;
}

.help-link-inline {
  background: none;
  border: none;
  color: #007aff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
  padding: 0;
  margin-left: 2px;
}

.help-link-inline:hover {
  color: #0056cc;
}

.activation-btn {
  background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  width: 100%;
  margin-top: auto;
  margin-bottom: 16px;
}

.activation-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.activation-btn:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  height: 60px;
  justify-content: center;
}

.message-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-text {
  margin: 0;
  line-height: 1.4;
}

.error-message {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-message {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

@media (max-width: 480px) {
  .content-container {
    padding: 32px 24px;
    gap: 16px;
    width: 90%;
    min-height: 400px;
    max-height: 95vh;
  }
  
  .tip-card {
    min-height: auto;
    padding: 12px;
  }
  
  .activation-form {
    gap: 12px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .desc {
    font-size: 1rem;
  }
  
  .email-input,
  .code-input {
    padding: 14px 16px;
    font-size: 1.3rem;
  }
  
  .activation-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
}
</style> 