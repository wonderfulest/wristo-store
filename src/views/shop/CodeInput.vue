<template>
  <div class="code-input-page">
    <div class="content-container">
      <div class="header-section">
        <Logo />
        <div class="title">Enter Code</div>
        <p class="desc">
          Please enter the code shown on your smartwatch or device. A code will only appear after you install a clockface or app.
        </p>
      </div>
      
      <div class="tip-card">
        <div class="tip-icon">⌚</div>
        <div class="tip-content">
          <strong>Code:</strong> The 6-digit code will appear on your smartwatch after installing a clockface or app.
        </div>
      </div>
      
      <form class="code-form" @submit.prevent="handleContinue">
        <div class="input-group">
          <label class="input-label">Code</label>
          <input 
            v-model="code" 
            type="text" 
            maxlength="6" 
            placeholder="000000" 
            class="code-input" 
            required 
            @input="clearError"
          />
          <div class="input-desc">
            The code shown on your smartwatch
            <br>
            <span class="help-inline">
              Not seeing your code? 
              <button type="button" class="help-link-inline" @click="handleLearnMore">Learn more</button>
            </span>
          </div>
        </div>
        
        <div v-if="error" class="message error-message">
          <div class="message-icon">⚠️</div>
          <div class="message-text">{{ error }}</div>
        </div>
        
        <div class="button-group">
          <button type="button" class="btn outline" @click="handleAlreadyPurchased">Already Purchased</button>
          <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Loading...' : 'Continue' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { purchaseByCode } from '@/api/pay'
import { useShopOptionsStore } from '@/store/shopOptions'
import Logo from '@/components/Logo.vue'
import { ElMessage } from 'element-plus'
import type { PurchaseData } from '@/types/purchase'

const code = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const store = useShopOptionsStore()

const handleContinue = async () => {
  if (code.value.length !== 6) {
    error.value = 'Please enter a 6-digit code.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const purchaseData: PurchaseData = await purchaseByCode(code.value)
    store.setData(purchaseData)
    // 跳转到购买选项页面
    router.push({ name: 'PurchaseOptions' })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && 'msg' in e && typeof e.msg === 'string') {
      error.value = e.msg
    } else {
      error.value = 'Network error, please try again later.'
    }
  } finally {
    loading.value = false
  }
}

const clearError = () => {
  if (error.value) {
    error.value = ''
  }
}

const handleAlreadyPurchased = () => {
  router.push('/already-purchased')
}

const handleLearnMore = () => {
  // Show help information about smartwatch codes
  ElMessage.info({
    message: 'After installing the clock face or app, there will be a short trial period. Once the trial ends, a 6-digit code will appear on your smartwatch screen for activation. If no code appears, it means the watch face has been automatically unlocked—feel free to continue using it.',
    duration: 8000
  })
}
</script>

<style scoped>
.code-input-page {
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

.code-form {
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

.code-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 4px;
  text-align: center;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  background: #fff;
  color: #1d1d1f;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.code-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.code-input::placeholder {
  color: #86868b;
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

.button-group {
  display: flex;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
}

.btn {
  flex: 1;
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
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.btn:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.outline {
  background: #fff;
  color: #007aff;
  border: 2px solid #007aff;
}

.btn.outline:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.2);
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
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

@media (max-width: 480px) {
  .content-container {
    padding: 32px 24px;
    gap: 16px;
    width: 90%;
    min-height: 400px;
    max-height: 95vh;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .desc {
    font-size: 1rem;
  }
  
  .tip-card {
    min-height: auto;
    padding: 12px;
  }
  
  .code-form {
    gap: 12px;
  }
  
  .code-input {
    padding: 14px 16px;
    font-size: 1.3rem;
  }
  
  .button-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
}
</style> 