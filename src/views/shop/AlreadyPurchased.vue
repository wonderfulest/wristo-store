<template>
  <div class="already-purchased-page">
    <div class="content-container">
      <div class="header-section">
        <p class="eyebrow">Already purchased</p>
        <h1 class="title">Activate your purchase</h1>
        <p class="desc">Enter your purchase email and the 6-digit code shown on your Garmin watch.</p>
      </div>
      
      <div class="tip-card">
        <div class="tip-icon" aria-hidden="true">
          <el-icon><QuartzWatch /></el-icon>
        </div>
        <div class="tip-content">
          <strong>Where to find it</strong>
          <span>The code appears after installing a clock face or app.</span>
        </div>
      </div>
      
      <form class="activation-form" @submit.prevent="handleActivation">
        <div class="input-group">
          <label class="input-label" for="purchase-email">Purchase email</label>
          <input 
            id="purchase-email"
            v-model="email" 
            type="email" 
            placeholder="you@example.com" 
            class="email-input" 
            required 
            autocomplete="email"
            @input="clearMessages"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label" for="activation-code">6-digit code</label>
          <input 
            id="activation-code"
            v-model="activationCode" 
            type="text" 
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6" 
            placeholder="000000" 
            class="code-input" 
            required 
            autocomplete="one-time-code"
            @input="handleCodeInput"
          />
          <div class="input-desc">
            Enter numbers only.
            <span class="help-inline">
              Not seeing your code? 
              <button type="button" class="help-link-inline" @click="handleResendCode">Learn more</button>
            </span>
          </div>
        </div>
        
        <button type="submit" class="activation-btn" :disabled="loading || !isFormValid" :aria-busy="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <el-icon v-else aria-hidden="true"><ArrowRight /></el-icon>
          <span v-if="loading">Activating...</span>
          <span v-else>Activate Purchase</span>
        </button>
      </form>
      
      <div v-if="error" class="message error-message">
        <el-icon class="message-icon" aria-hidden="true"><WarningFilled /></el-icon>
        <div class="message-text">{{ error }}</div>
      </div>
      
      <div v-if="success" class="message success-message">
        <el-icon class="message-icon" aria-hidden="true"><CircleCheckFilled /></el-icon>
        <div class="message-text">{{ successMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { activatePurchase } from '@/api/pay'
import { ElMessage } from 'element-plus'
import type { CheckPurchaseResponse } from '@/types/purchase-check'
import { useUserStore } from '@/store/user'
import { ArrowRight, CircleCheckFilled, QuartzWatch, WarningFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
const route = useRoute()
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

function handleCodeInput() {
  activationCode.value = activationCode.value.replace(/\D/g, '').slice(0, 6)
  clearMessages()
}

// 如果用户已登录，自动填入用户邮箱
onMounted(() => {
  if (userStore.userInfo && userStore.userInfo.email) {
    email.value = userStore.userInfo.email
  }
  const q = route.query.code as string | undefined
  const six = (q || '').toString().replace(/\D/g, '').slice(0, 6)
  if (six && six.length === 6) {
    activationCode.value = six
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
      error.value = 'Failed to activate purchase. No purchase record found for the provided email.';
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
  height: calc(100dvh - 132px);
  min-height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 18% 0%, rgba(15, 107, 104, 0.12), transparent 28rem),
    radial-gradient(circle at 92% 8%, rgba(245, 158, 11, 0.14), transparent 24rem),
    linear-gradient(180deg, #fbfdfc 0%, #f4f7f6 100%);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.content-container {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.94));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  padding: 36px;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-sizing: border-box;
}

.header-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  color: #0f6b68;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.title {
  max-width: 11ch;
  margin: 0 auto;
  font-size: clamp(2.1rem, 5vw, 3.35rem);
  font-weight: 850;
  color: #0f172a;
  line-height: 0.98;
  letter-spacing: 0;
}

.desc {
  color: #475467;
  font-size: 1rem;
  line-height: 1.6;
  margin: 4px 0 0;
}

.tip-card {
  background: rgba(15, 107, 104, 0.06);
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tip-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(15, 107, 104, 0.10);
  color: #0f6b68;
}

.tip-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #475467;
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0;
}

.tip-content strong {
  color: #0f172a;
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
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.email-input,
.code-input {
  width: 100%;
  min-height: 56px;
  padding: 15px 18px;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  border: 1.5px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  outline: none;
  box-sizing: border-box;
}

.email-input:focus,
.code-input:focus {
  border-color: #0f6b68;
  box-shadow:
    0 0 0 4px rgba(15, 107, 104, 0.14),
    0 14px 34px rgba(15, 107, 104, 0.10);
}

.email-input::placeholder,
.code-input::placeholder {
  color: #98a2b3;
}

.code-input {
  min-height: 70px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.3em;
}

.input-desc {
  font-size: 0.88rem;
  color: #667085;
  margin-top: 4px;
  line-height: 1.45;
  text-align: center;
}

.help-inline {
  font-size: 0.88rem;
  color: #667085;
  display: inline-block;
}

.help-link-inline {
  background: none;
  border: none;
  color: #0f6b68;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: color 180ms ease, background 180ms ease;
  padding: 0;
  margin-left: 2px;
  border-radius: 8px;
}

.help-link-inline:hover,
.help-link-inline:focus-visible {
  color: #064e4b;
  background: rgba(15, 107, 104, 0.08);
}

.activation-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 58px;
  background:
    linear-gradient(135deg, #0f6b68 0%, #0b827d 52%, #f59e0b 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, background 180ms ease;
  letter-spacing: 0;
  width: 100%;
  margin-top: auto;
  box-shadow:
    0 18px 42px rgba(15, 107, 104, 0.26),
    0 10px 24px rgba(245, 158, 11, 0.20),
    0 0 0 1px rgba(255, 255, 255, 0.22) inset;
}

.activation-btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.activation-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow:
    0 22px 56px rgba(15, 107, 104, 0.30),
    0 16px 34px rgba(245, 158, 11, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}

.activation-btn:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.28);
  outline-offset: 4px;
}

.activation-btn:disabled {
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 500;
  min-height: 60px;
  justify-content: center;
}

.message-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
}

.message-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.message-text {
  margin: 0;
  line-height: 1.4;
}

.error-message {
  background: #fff7ed;
  border: 1px solid rgba(234, 88, 12, 0.22);
  color: #9a3412;
}

.success-message {
  background: rgba(15, 107, 104, 0.07);
  border: 1px solid rgba(15, 107, 104, 0.18);
  color: #0f6b68;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.95);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .already-purchased-page {
    height: calc(100dvh - 120px);
    padding: 10px;
  }

  .content-container {
    padding: 18px 16px;
    gap: 12px;
    max-width: 100%;
    border-radius: 20px;
  }
  
  .tip-card {
    min-height: auto;
    padding: 10px;
  }
  
  .activation-form {
    gap: 10px;
  }
  
  .title {
    font-size: clamp(1.85rem, 10vw, 2.45rem);
  }
  
  .desc {
    font-size: 0.94rem;
    line-height: 1.45;
  }
  
  .email-input,
  .code-input {
    min-height: 50px;
    padding: 12px 14px;
  }

  .code-input {
    min-height: 56px;
    font-size: 1.45rem;
    letter-spacing: 0.18em;
  }
  
  .activation-btn {
    min-height: 50px;
    padding: 10px 14px;
    font-size: 0.94rem;
  }
}
</style> 
