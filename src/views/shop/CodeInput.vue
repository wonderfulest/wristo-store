<template>
  <div class="code-input-page">
    <div class="content-container">
      <Logo />
      <div class="header-section">
        <p class="eyebrow">Unlock your watch face</p>
        <h1 class="title">Enter your 6-digit code</h1>
        <p class="desc">Type the six numbers shown on your Garmin watch.</p>
      </div>

      <form class="code-form" @submit.prevent="handleContinue">
        <div class="input-group">
          <label class="input-label" for="watch-code">6-digit code</label>
          <input 
            id="watch-code"
            v-model="code" 
            type="text" 
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6" 
            placeholder="000000" 
            class="code-input" 
            required 
            autocomplete="one-time-code"
            aria-describedby="watch-code-help"
            @input="handleInput"
          />
          <div id="watch-code-help" class="input-desc">
            Enter numbers only.
            <span class="help-inline">
              Not seeing your code? 
              <button type="button" class="help-link-inline" @click="handleLearnMore">Learn more</button>
            </span>
          </div>
        </div>
        <!-- <div class="coupon-toggle-row">
          <button
            v-if="!showCouponInput"
            type="button"
            class="coupon-toggle-link"
            @click="showCouponInput = true"
          >
            Have a coupon code (optional)?
          </button>
        </div> -->

        <div
          v-if="showCouponInput"
          class="input-group"
        >
          <label class="input-label">Coupon (optional)</label>
          <input
            v-model="coupon"
            type="text"
            placeholder="Enter coupon code if you have one"
            class="code-input coupon-input"
            @input="handleInput"
          />
          <div class="input-desc">
            If you received a special coupon or invite code, enter it here.
          </div>
        </div>
        
        <div v-if="error" class="message error-message">
          <el-icon class="message-icon" aria-hidden="true"><WarningFilled /></el-icon>
          <div class="message-text">{{ error }}</div>
        </div>
        
        <div v-if="success" class="message success-message">
          <el-icon class="message-icon" aria-hidden="true"><CircleCheckFilled /></el-icon>
          <div class="message-text">{{ success }}</div>
        </div>
        
        <div class="button-group">
          <div class="btn-with-note">
            <button type="button" class="btn outline" @click="handleAlreadyPurchased">
              <el-icon aria-hidden="true"><Lock /></el-icon>
              <span>Already Purchased</span>
            </button>
            <div class="helper-note">For users who already purchased bundle or this watch face.</div>
          </div>
          <div class="btn-with-note">
            <button type="submit" class="btn primary" :disabled="loading" :aria-busy="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <el-icon v-else aria-hidden="true"><ArrowRight /></el-icon>
              <span>{{ loading ? 'Checking code...' : 'Continue' }}</span>
            </button>
            <div class="helper-note">For users who do not have a bundle or have not purchased this watch face yet.</div>
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
import { ElMessageBox } from 'element-plus'
import type { PurchaseData } from '@/types/purchase'
import type { CheckPurchaseResponse } from '@/types/purchase-check'
import { ArrowRight, CircleCheckFilled, Lock, WarningFilled } from '@element-plus/icons-vue'

const code = ref('')
const coupon = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const showCouponInput = ref(false)
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
    if (coupon.value.trim()) {
      // 将口令码保存到全局 discountCode，后续 PurchaseOptions / Checkout 统一使用
      store.setDiscountCode(coupon.value.trim())
      router.push({
        name: 'PurchaseOptions',
        query: { discountCode: coupon.value.trim() }
      })
    } else {
      router.push({ name: 'PurchaseOptions' })
    }
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
  code.value = code.value.replace(/\D/g, '').slice(0, 6)
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
  ElMessageBox.alert('After installing the clock face or app, there will be a short trial period. Once the trial ends, a 6-digit code will appear on your smartwatch screen for activation. If no code appears, it means the watch face has been automatically unlocked—feel free to continue using it.', {
    title: 'Smartwatch Code',
    confirmButtonText: 'OK',
    showClose: false
  })
}

// 如果 URL 中带有 _ptxn，则请求后端获取 6 位代码并自动继续
onMounted(async () => {
  const initialCode = route.query.code as string | undefined
  if (initialCode) {
    const six = (initialCode || '').toString().replace(/\D/g, '').slice(0, 6)
    if (six.length === 6) {
      code.value = six
    }
  }

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
  font-size: 1.6rem;
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

.coupon-toggle-row {
  margin-top: 4px;
  margin-bottom: 4px;
}

.coupon-toggle-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.coupon-toggle-link:hover {
  color: #0056cc;
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

/* Polished checkout-aligned layout */
.code-input-page {
  align-items: stretch;
  overflow: visible;
  background:
    radial-gradient(circle at 18% 0%, rgba(15, 107, 104, 0.12), transparent 28rem),
    radial-gradient(circle at 92% 8%, rgba(245, 158, 11, 0.14), transparent 24rem),
    linear-gradient(180deg, #fbfdfc 0%, #f4f7f6 100%);
}

.code-input-page::before,
.code-input-page::after {
  display: none;
}

.content-container {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
  align-items: stretch;
  gap: 24px;
  max-width: 1040px;
  min-height: auto;
  max-height: none;
  padding: 0;
  overflow: visible;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.code-hero-panel,
.code-form {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.code-hero-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
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
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 3.35rem);
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1;
}

.desc {
  max-width: 34rem;
  color: #475467;
  font-size: 1rem;
  line-height: 1.6;
}

.tip-card {
  min-height: 0;
  margin-top: auto;
  padding: 16px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: 16px;
  background: rgba(15, 107, 104, 0.06);
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
  font-size: 1rem;
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
}

.tip-content strong {
  color: #0f172a;
  font-size: 0.98rem;
}

.trust-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #475467;
  font-size: 0.82rem;
  font-weight: 700;
}

.trust-list span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 107, 104, 0.07);
}

.trust-list .el-icon {
  color: #0f6b68;
}

.code-form {
  padding: 28px;
  gap: 20px;
  flex: none;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.form-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #0f6b68;
  background: rgba(15, 107, 104, 0.10);
}

.form-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.form-header h2 {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 1.45rem;
  line-height: 1.2;
}

.form-header p {
  margin: 0;
  color: #667085;
  font-size: 0.92rem;
}

.input-label {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.code-input {
  min-height: 64px;
  padding: 16px 18px;
  border: 1.5px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  background: rgba(255, 255, 255, 0.92);
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.coupon-input {
  min-height: 52px;
  font-family: inherit;
  font-size: 1rem;
  letter-spacing: 0.02em;
  text-align: left;
}

.code-input:focus {
  border-color: #0f6b68;
  box-shadow:
    0 0 0 4px rgba(15, 107, 104, 0.14),
    0 14px 34px rgba(15, 107, 104, 0.10);
}

.code-input::placeholder {
  color: #98a2b3;
}

.input-desc {
  color: #667085;
  font-size: 0.88rem;
  line-height: 1.45;
}

.help-inline {
  color: #667085;
  font-size: 0.88rem;
}

.help-link-inline {
  min-height: 28px;
  color: #0f6b68;
  font-size: 0.88rem;
  font-weight: 800;
  text-decoration: none;
  border-radius: 8px;
}

.help-link-inline:hover,
.help-link-inline:focus-visible {
  color: #064e4b;
  background: rgba(15, 107, 104, 0.08);
}

.button-group {
  gap: 14px;
  margin-top: auto;
  padding-top: 8px;
}

.btn-with-note {
  min-width: 0;
}

.btn {
  width: 100%;
  min-height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, background 180ms ease;
}

.btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.btn.primary {
  background:
    linear-gradient(135deg, #0f6b68 0%, #0b827d 52%, #f59e0b 100%);
  box-shadow:
    0 18px 42px rgba(15, 107, 104, 0.26),
    0 10px 24px rgba(245, 158, 11, 0.20),
    0 0 0 1px rgba(255, 255, 255, 0.22) inset;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.05);
}

.btn.primary:hover:not(:disabled) {
  box-shadow:
    0 22px 56px rgba(15, 107, 104, 0.30),
    0 16px 34px rgba(245, 158, 11, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}

.btn:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.28);
  outline-offset: 4px;
}

.btn:disabled {
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  cursor: progress;
}

.btn.outline {
  color: #0f6b68;
  border: 1px solid rgba(15, 107, 104, 0.22);
  background: rgba(255, 255, 255, 0.88);
}

.btn.outline:hover:not(:disabled) {
  border-color: rgba(15, 107, 104, 0.32);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(15, 107, 104, 0.10) inset;
}

.helper-note {
  color: #667085;
  font-size: 0.82rem;
  line-height: 1.4;
}

.message {
  border-radius: 14px;
  font-size: 0.92rem;
}

.message-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  font-size: 1rem;
}

.message-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.error-message {
  background: #fff7ed;
  border-color: rgba(234, 88, 12, 0.22);
  color: #9a3412;
}

.success-message {
  background: rgba(15, 107, 104, 0.07);
  border-color: rgba(15, 107, 104, 0.18);
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

@media (max-width: 900px) {
  .content-container {
    grid-template-columns: 1fr;
    max-width: 640px;
  }

  .code-hero-panel {
    padding: 28px;
  }

  .tip-card {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .code-input-page {
    padding: 20px;
    min-height: 100vh;
  }

  .content-container {
    padding: 0;
    gap: 18px;
  }

  .title {
    font-size: clamp(2rem, 12vw, 3rem);
  }

  .code-form {
    padding: 24px;
  }

  .button-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .code-input-page {
    padding: 16px;
  }

  .code-hero-panel,
  .code-form {
    border-radius: 20px;
  }

  .code-hero-panel {
    padding: 22px;
  }

  .code-form {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 1.25rem;
  }

  .code-input {
    min-height: 58px;
    padding: 14px 14px;
    font-size: 1.45rem;
    letter-spacing: 0.22em;
  }

  .trust-list span {
    flex: 1 1 calc(50% - 8px);
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .code-input-page {
    padding: 12px;
  }

  .code-hero-panel,
  .code-form {
    padding: 18px;
  }

  .code-input {
    font-size: 1.25rem;
    letter-spacing: 0.18em;
  }
}

/* Simplified single-card code entry */
.code-input-page {
  align-items: center;
  justify-content: center;
}

.content-container {
  display: flex;
  max-width: 520px;
  width: 100%;
  gap: 24px;
  padding: 36px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.94));
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-section {
  padding: 0;
  text-align: center;
}

.eyebrow {
  margin: 0 0 10px;
}

.title {
  max-width: 11ch;
  margin: 0 auto;
  font-size: clamp(2.2rem, 6vw, 3.65rem);
  line-height: 0.96;
}

.desc {
  max-width: 26rem;
  margin: 14px auto 0;
  font-size: 1rem;
}

.code-form {
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.input-group {
  gap: 10px;
}

.input-label {
  text-align: center;
}

.code-input {
  min-height: 76px;
  font-size: 2.35rem;
  letter-spacing: 0.34em;
}

.input-desc {
  text-align: center;
}

.button-group {
  margin-top: 4px;
}

.helper-note {
  display: none;
}

@media (max-width: 768px) {
  .code-input-page {
    padding: 20px;
    height: calc(100dvh - 120px);
    min-height: auto;
    overflow: hidden;
  }

  .content-container {
    max-width: 100%;
    padding: 28px 22px;
    border-radius: 22px;
  }

  .title {
    font-size: clamp(2rem, 12vw, 3.1rem);
  }

  .code-input {
    min-height: 70px;
    font-size: 1.9rem;
    letter-spacing: 0.28em;
  }
}

@media (max-width: 480px) {
  .code-input-page {
    padding: 10px;
  }

  .content-container {
    padding: 18px 16px;
    gap: 14px;
  }

  .title {
    font-size: clamp(1.8rem, 10vw, 2.45rem);
  }

  .desc {
    margin-top: 8px;
    font-size: 0.94rem;
  }

  .code-input {
    min-height: 56px;
    font-size: 1.45rem;
    letter-spacing: 0.18em;
  }

  .button-group {
    flex-direction: row;
    gap: 10px;
    padding-top: 0;
  }

  .btn {
    min-height: 50px;
    padding: 10px 12px;
    font-size: 0.92rem;
  }
}

@media (max-width: 360px) {
  .content-container {
    padding: 16px 14px;
  }

  .code-input {
    font-size: 1.32rem;
    letter-spacing: 0.14em;
  }

  .btn {
    font-size: 0.84rem;
    padding: 9px 8px;
  }
}
</style>
