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
            @input="handleInput"
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
        
        <div v-if="success" class="message success-message">
          <div class="message-icon">✅</div>
          <div class="message-text">{{ success }}</div>
        </div>
        
        <div class="button-group">
          <div class="btn-with-note">
            <button type="button" class="btn outline" @click="handleAlreadyPurchased">Already Purchased</button>
            <div class="helper-note">For users who already purchased bundle or this watch face.</div>
          </div>
          <div class="btn-with-note">
            <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Loading...' : 'Continue' }}</button>
            <div class="helper-note">For users who don’t have a bundle or haven’t purchased this watch face yet.</div>
          </div>
        </div>
        
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { purchaseByCode, checkPurchaseByToken, continuePurchase } from '@/api/pay'
import { useShopOptionsStore } from '@/store/shopOptions'
import { useUserStore } from '@/store/user'
import Logo from '@/components/Logo.vue'
import { ElMessage } from 'element-plus'
import type { PurchaseData } from '@/types/purchase'
import type { CheckPurchaseResponse } from '@/types/purchase-check'

const code = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const store = useShopOptionsStore()
const userStore = useUserStore()

// 检查用户是否已登录
const isLoggedIn = computed(() => !!userStore.userInfo)

// 处理自动解锁逻辑
const handleAutoUnlock = (purchaseResult: CheckPurchaseResponse) => {
  if (purchaseResult.subscription) {
    // 通过订阅计划激活
    const subscriptionName = purchaseResult.subscription.name || 'Subscription Plan'
    success.value = `Your purchase has been successfully activated through ${subscriptionName}!`
  } else if (purchaseResult.purchase) {
    // 通过产品购买激活
    success.value = 'Your purchase has been successfully activated through product purchase!'
  } else {
    // 默认激活成功消息
    success.value = 'Your purchase has been successfully activated!'
  }
}

const handleContinue = async () => {
  if (code.value.length !== 6) {
    error.value = 'Please enter a 6-digit code.'
    return
  }
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    // 如果用户已登录，先检查购买状态
    if (isLoggedIn.value) {
      try {
        const purchaseResult: CheckPurchaseResponse = await checkPurchaseByToken(code.value)
        if (purchaseResult && purchaseResult.isPurchase) {
          // 已购买，自动解锁
          handleAutoUnlock(purchaseResult)
          return
        }
      } catch (purchaseCheckError) {
        // 购买检查失败，继续正常流程
        console.log('Purchase check failed, continuing with normal flow:', purchaseCheckError)
      }
    }
    
    // 正常流程：获取产品信息并跳转到购买页面
    const purchaseData: PurchaseData = await purchaseByCode(code.value)
    store.setData(purchaseData)
    router.push({ name: 'PurchaseOptions' })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && 'msg' in e && typeof (e as any).msg === 'string') {
      error.value = (e as any).msg
    } else {
      error.value = 'Network error, please try again later.'
    }
  } finally {
    loading.value = false
  }
}

const clearMessages = () => {
  if (error.value) {
    error.value = ''
  }
  if (success.value) {
    success.value = ''
  }
}

const handleInput = () => {
  clearMessages()
  
  // 当输入6位数字时自动提交
  // if (code.value.length === 6) {
  //   // 添加短暂延迟，让用户看到输入完成
  //   setTimeout(() => {
  //     handleContinue()
  //   }, 300)
  // }
}

const handleAlreadyPurchased = () => {
  router.push({ path: '/already-purchased', query: { code: code.value || '' } })
}

const handleLearnMore = () => {
  // Show help information about smartwatch codes
  ElMessage.info({
    message: 'After installing the clock face or app, there will be a short trial period. Once the trial ends, a 6-digit code will appear on your smartwatch screen for activation. If no code appears, it means the watch face has been automatically unlocked—feel free to continue using it.',
    duration: 8000
  })
}

// 如果 URL 中带有 _ptxn，则请求后端获取 6 位代码并自动继续
onMounted(async () => {
  const txnId = route.query._ptxn as string | undefined
  if (!txnId) return

  try {
    loading.value = true
    clearMessages()
    const codeStr = await continuePurchase(txnId)
    // 保护性处理，只保留前6位数字
    const six = (codeStr || '').toString().replace(/\D/g, '').slice(0, 6)
    if (!six || six.length !== 6) {
      error.value = 'Failed to retrieve a valid 6-digit code. Please try again.'
      return
    }
    code.value = six
    // 等待下一个 tick 确保 v-model 更新，再自动继续
    setTimeout(() => {
      handleContinue()
    }, 100)
  } catch (err) {
    console.error('continuePurchase failed', err)
    error.value = 'Failed to continue purchase. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.code-input-page {
  min-height: calc(100vh - 64px - 58px - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: #eef2ff;
  background-image:
    radial-gradient(at 88% 40%, rgba(255, 255, 255, 0.95) 0px, transparent 85%),
    radial-gradient(at 49% 30%, rgba(255, 255, 255, 0.90) 0px, transparent 85%),
    radial-gradient(at 14% 26%, rgba(255, 255, 255, 0.88) 0px, transparent 85%),
    radial-gradient(at 0% 64%, rgba(0, 122, 255, 0.26) 0px, transparent 80%),
    radial-gradient(at 41% 94%, rgba(175, 82, 222, 0.18) 0px, transparent 80%),
    radial-gradient(at 100% 99%, rgba(52, 199, 89, 0.16) 0px, transparent 85%);
  box-sizing: border-box;
  padding: 20px;
}

.code-input-page::before {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: -60%;
  z-index: 0;
  opacity: 0.26;
  filter: blur(8px);
  transform-origin: center;
  background-image: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: code-bg-band-rotate-1 14s linear infinite;
}

.code-input-page::after {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: -55%;
  z-index: 0;
  opacity: 0.18;
  filter: blur(10px);
  transform-origin: center;
  background-image: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: code-bg-band-rotate-2 20s linear infinite;
}

@keyframes code-bg-band-rotate-1 {
  to {
    transform: rotate(360deg);
  }
}

@keyframes code-bg-band-rotate-2 {
  to {
    transform: rotate(-360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .code-input-page::before {
    animation: none;
  }
  .code-input-page::after {
    animation: none;
  }
}

.content-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  min-height: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.header-section {
  padding-top: 20px;
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
  min-height: 80px;
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
  padding-bottom: 40px;
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

.btn-with-note {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.helper-note {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #6b7280;
  text-align: center;
  width: 100%;
}

.btn {
  flex: 1;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.98) 0%, rgba(64, 156, 255, 0.94) 55%, rgba(0, 122, 255, 0.90) 100%);
  color: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 14px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.4px;
  box-shadow:
    0 18px 42px rgba(0, 122, 255, 0.30),
    0 14px 30px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.22) inset;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 22px 56px rgba(0, 122, 255, 0.36),
    0 18px 48px rgba(15, 23, 42, 0.20),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}

.btn:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.outline {
  background: rgba(255, 255, 255, 0.88);
  color: rgba(0, 122, 255, 0.95);
  border: 1px solid rgba(0, 122, 255, 0.28);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.72) inset;
}

.btn.outline:hover {
  background: rgba(255, 255, 255, 0.94);
  transform: translateY(-2px);
  border-color: rgba(0, 122, 255, 0.34);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(0, 122, 255, 0.10) inset;
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

.success-message {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .code-input-page {
    padding: 16px;
    min-height: 100vh;
  }
  
  .content-container {
    padding: 32px 24px;
    gap: 18px;
    max-width: 100%;
    min-height: auto;
    max-height: none;
    border-radius: 20px;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .desc {
    font-size: 1.05rem;
  }
  
  .tip-card {
    padding: 14px;
    border-radius: 12px;
  }
  
  .code-input {
    padding: 15px 18px;
    font-size: 1.4rem;
    letter-spacing: 3px;
  }
  
  .button-group {
    gap: 14px;
    margin-top: 20px;
  }
  
  .btn {
    padding: 15px 22px;
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .code-input-page {
    padding: 12px;
  }
  
  .content-container {
    padding: 28px 20px;
    gap: 16px;
    border-radius: 16px;
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
  
  .desc {
    font-size: 1rem;
  }
  
  .tip-card {
    padding: 12px;
    gap: 10px;
  }
  
  .tip-icon {
    font-size: 1.3rem;
  }
  
  .tip-content {
    font-size: 0.9rem;
  }
  
  .code-form {
    gap: 14px;
  }
  
  .code-input {
    padding: 14px 16px;
    font-size: 1.3rem;
    letter-spacing: 2px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }
  
  .btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
  
  .message {
    padding: 14px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .code-input-page {
    padding: 8px;
  }
  
  .content-container {
    padding: 24px 16px;
    gap: 14px;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .desc {
    font-size: 0.95rem;
  }
  
  .code-input {
    padding: 12px 14px;
    font-size: 1.2rem;
  }
  
  .btn {
    padding: 12px 18px;
    font-size: 0.95rem;
  }
}
</style>