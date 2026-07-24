<template>
  <div class="code-input-page">
    <div class="content-container">
      <img class="code-logo" src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-logo-horizontal.svg" alt="Wristo" />
      <div class="header-section">
        <p class="eyebrow">{{ t('code.eyebrow') }}</p>
        <h1 class="title">{{ t('code.title') }}</h1>
        <p class="desc">{{ t('code.desc') }}</p>
      </div>

      <form class="code-form" @submit.prevent="handleContinue">
        <div class="input-group">
          <label class="input-label" for="watch-code">{{ t('code.label') }}</label>
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
            {{ t('code.helpNumbers') }}
            <span class="help-inline">
              {{ t('code.helpQuestion') }}
              <button type="button" class="help-link-inline" @click="handleLearnMore">{{ t('code.learnMore') }}</button>
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
          <label class="input-label">{{ t('code.couponLabel') }}</label>
          <input
            v-model="coupon"
            type="text"
            :placeholder="t('code.couponPlaceholder')"
            class="code-input coupon-input"
            @input="handleInput"
          />
          <div class="input-desc">
            {{ t('code.couponHelp') }}
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
              <span>{{ t('code.alreadyPurchased') }}</span>
            </button>
            <div class="helper-note">{{ t('code.alreadyPurchasedHelp') }}</div>
          </div>
          <div class="btn-with-note">
            <button type="submit" class="btn primary" :disabled="loading" :aria-busy="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <el-icon v-else aria-hidden="true"><ArrowRight /></el-icon>
              <span>{{ loading ? t('code.checking') : t('code.continue') }}</span>
            </button>
            <div class="helper-note">{{ t('code.continueHelp') }}</div>
          </div>
        </div>
        
      </form>
    </div>
    <SmartwatchCodeHelpModal v-model="showCodeHelpModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { purchaseByCode, checkPurchaseByToken, continuePurchase } from '@/api/pay'
import { useShopOptionsStore } from '@/store/shopOptions'
import { useUserStore } from '@/store/user'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import SmartwatchCodeHelpModal from '@/components/SmartwatchCodeHelpModal.vue'
import type { PurchaseData } from '@/types/purchase'
import type { CheckPurchaseResponse } from '@/types/purchase-check'
import { ArrowRight, CircleCheckFilled, Lock, WarningFilled } from '@element-plus/icons-vue'

const code = ref('')
const coupon = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const showCouponInput = ref(false)
const showCodeHelpModal = ref(false)
const router = useRouter()
const route = useRoute()
const store = useShopOptionsStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)

// 检查用户是否已登录
const isLoggedIn = computed(() => !!userStore.userInfo)

// 处理自动解锁逻辑
const handleAutoUnlock = (purchaseResult: CheckPurchaseResponse) => {
  if (purchaseResult.subscription) {
    // 通过订阅计划激活
    const subscriptionName = purchaseResult.subscription.name || t('code.subscriptionPlan')
    success.value = t('code.successSubscription').replace('{name}', subscriptionName)
  } else if (purchaseResult.purchase) {
    // 通过产品购买激活
    success.value = t('code.successPurchase')
  } else {
    // 默认激活成功消息
    success.value = t('code.successDefault')
  }
}

const handleContinue = async () => {
  if (code.value.length !== 6) {
    error.value = t('code.errorLength')
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
        path: localizedPath('/purchase-options'),
        query: { source: 'code', discountCode: coupon.value.trim() }
      })
    } else {
      router.push({ path: localizedPath('/purchase-options'), query: { source: 'code' } })
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && 'msg' in e && typeof (e as any).msg === 'string') {
      error.value = (e as any).msg
    } else {
      error.value = t('code.errorNetwork')
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
  router.push({ path: localizedPath('/activate'), query: { code: code.value || '' } })
}

const handleLearnMore = () => {
  showCodeHelpModal.value = true
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
      error.value = t('code.errorInvalidRetrieved')
      return
    }
    code.value = six
    // 等待下一个 tick 确保 v-model 更新，再自动继续
    setTimeout(() => {
      handleContinue()
    }, 100)
  } catch (err) {
    console.error('continuePurchase failed', err)
    error.value = t('code.errorContinuePurchase')
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

/* Refined single-card code entry */
.code-input-page {
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
}

.content-container {
  display: flex;
  max-width: 560px;
  width: 100%;
  gap: 22px;
  padding: 40px 42px 36px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.94));
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.11),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.code-logo {
  display: block;
  width: 86px;
  height: auto;
  margin: 0 auto 4px;
}

.header-section {
  padding: 0;
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.76rem;
  font-weight: 800;
  color: #0f6b68;
  letter-spacing: 0.04em;
}

.title {
  max-width: 16ch;
  margin: 0 auto;
  color: #0f172a;
  font-size: clamp(1.9rem, 4vw, 2.55rem);
  line-height: 1.04;
  font-weight: 820;
  letter-spacing: 0;
}

.desc {
  max-width: 25rem;
  margin: 12px auto 0;
  color: #475467;
  font-size: 1rem;
  line-height: 1.55;
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
  gap: 9px;
}

.input-label {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 750;
  text-align: center;
}

.code-input {
  min-height: 72px;
  padding: 14px 20px;
  border-radius: 18px;
  font-size: 2rem;
  letter-spacing: 0.24em;
  line-height: 1;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.input-desc {
  color: #667085;
  font-size: 0.88rem;
  line-height: 1.45;
  text-align: center;
}

.help-inline {
  display: block;
  margin-top: 4px;
}

.button-group {
  gap: 12px;
  margin-top: 2px;
  padding-top: 4px;
}

.helper-note {
  display: none;
}

.btn {
  min-height: 56px;
  border-radius: 16px;
  padding: 13px 16px;
  font-size: 0.98rem;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .code-input-page {
    min-height: calc(100dvh - 72px);
    padding: 22px 18px;
    overflow: visible;
  }

  .content-container {
    max-width: 100%;
    padding: 34px 26px 30px;
    border-radius: 20px;
  }

  .code-logo {
    width: 82px;
  }

  .title {
    font-size: clamp(1.85rem, 8vw, 2.35rem);
  }

  .code-input {
    min-height: 68px;
    font-size: 1.8rem;
    letter-spacing: 0.2em;
  }
}

@media (max-width: 480px) {
  .code-input-page {
    padding: 16px 12px;
  }

  .content-container {
    gap: 18px;
    padding: 26px 18px 22px;
  }

  .code-logo {
    width: 78px;
  }

  .title {
    font-size: clamp(1.7rem, 8.4vw, 2.05rem);
  }

  .desc {
    margin-top: 10px;
    font-size: 0.95rem;
  }

  .code-input {
    min-height: 62px;
    padding: 12px 14px;
    font-size: 1.48rem;
    letter-spacing: 0.15em;
  }

  .button-group {
    flex-direction: column;
    gap: 11px;
  }

  .btn {
    min-height: 52px;
    padding: 12px 14px;
    font-size: 0.96rem;
  }
}

@media (max-width: 360px) {
  .content-container {
    padding: 22px 14px 18px;
  }

  .code-logo {
    width: 72px;
  }

  .code-input {
    font-size: 1.32rem;
    letter-spacing: 0.12em;
  }

  .btn {
    font-size: 0.9rem;
    padding: 11px 10px;
  }
}
</style>
