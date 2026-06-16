<template>
    <div class="checkout">
        <h2 class="title">{{ t('checkoutSubscription.title') }}</h2>
        <div class="checkout-main">
            <div class="checkout-left">
                <div class="card-header">
                    <h3 class="card-title">{{ subscription.name }}</h3>
                    <div class="price-info">
                        <span class="price">${{ subscription.discountPrice || subscription.originalPrice }}</span>
                        <span class="tax-tip">(Exc. tax)</span>
                    </div>
                </div>
                
                <div class="subscription-details">
                    <div class="subscription-type">
                        <span class="label">{{ t('checkoutSubscription.typeLabel') }}</span>
                        <span class="value">{{ getPlanType(subscription) }} {{ t('checkoutSubscription.planSuffix') }}</span>
                    </div>
                    
                    <div class="subscription-duration" v-if="subscription.durationDays > 0">
                        <span class="label">{{ t('checkoutSubscription.durationLabel') }}</span>
                        <span class="value">{{ subscription.durationDays >= 365 ? subscription.durationDays/365 + ' ' + t('checkoutSubscription.year') : subscription.durationDays/30 + ' ' + t('checkoutSubscription.month') }}</span>
                    </div>
                    
                    <div class="subscription-features">
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ t('checkoutSubscription.benefit1') }}</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ subscription.durationDays === -1 ? t('checkoutSubscription.benefit2Lifetime') : t('checkoutSubscription.benefit2Monthly') }}</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ t('checkoutSubscription.benefit3') }}</span>
                        </div>
                        <div class="feature-item" v-if="subscription.durationDays === -1">
                            <span class="check-icon">✓</span>
                            <span>{{ t('checkoutSubscription.benefit4') }}</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ subscription.durationDays === -1 ? t('checkoutSubscription.supportPriority') : 
                                (subscription.durationDays >= 365 ? t('checkoutSubscription.supportStandard') : t('checkoutSubscription.supportBasic')) }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="price-summary" v-if="subscription.discountPrice && subscription.discountPrice < subscription.originalPrice">
                    <div class="summary-row">
                        <span>{{ t('checkoutSubscription.originalPrice') }}</span>
                        <span>${{ subscription.originalPrice }}</span>
                    </div>
                    <div class="summary-row discount">
                        <span>{{ t('checkoutSubscription.discount', { rate: Math.round((1 - subscription.discountPrice / subscription.originalPrice) * 100) }) }}</span>
                        <span>-${{ (subscription.originalPrice - subscription.discountPrice).toFixed(2) }}</span>
                    </div>
                    <div class="summary-row total">
                        <span>{{ t('checkoutSubscription.total') }}</span>
                        <span>${{ subscription.discountPrice }}</span>
                    </div>
                </div>
            </div>
            
            <div class="checkout-right">
                <div class="email-input-container">
                    <label class="input-label">{{ t('checkoutSubscription.emailLabel') }}</label>
                    <div class="input-wrapper">
                        <input 
                            v-model="email" 
                            class="input" 
                            :placeholder="t('checkoutSubscription.emailPlaceholder')" 
                            @input="handleEmailInput"
                            @blur="validateEmailField" 
                            disabled
                        />
                        <div v-if="isEmailConfirmed" class="email-success-icon">✓</div>
                    </div>
                    <div class="input-desc">
                        <strong>{{ t('checkoutSubscription.emailHint') }}</strong>
                    </div>
                    
                    <div class="email-tips">
                        <div class="tips-header">
                            <div class="tips-icon">💡</div>
                            <span class="tips-title">{{ t('checkoutSubscription.tipsTitle') }}</span>
                        </div>
                        <div class="tips-content">
                            <div class="tips-subtitle">{{ t('checkoutSubscription.tipsSubtitle') }}</div>
                            <div class="tips-list">
                                <div class="tip-item">
                                    <div class="tip-icon">📧</div>
                                    <span>{{ t('checkoutSubscription.tip1') }}</span>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">⚙️</div>
                                    <span>{{ t('checkoutSubscription.tip2') }}</span>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">👤</div>
                                    <span>{{ t('checkoutSubscription.tip3') }} <span class="tip-highlight">{{ t('checkoutSubscription.tip3Highlight') }}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="emailError" class="input-error-text">{{ emailError }}</div>
                </div>
                
                <div v-if="showConfirmEmail && !isEmailConfirmed" class="email-confirm-container">
                    <label class="input-label">{{ t('checkoutSubscription.confirmEmailLabel') }}</label>
                    <input 
                        v-model="confirmEmail" 
                        class="input" 
                        :placeholder="t('checkoutSubscription.confirmEmailPlaceholder')" 
                        @input="handleConfirmEmailInput"
                        @blur="validateEmailMatch"
                        @paste.prevent
                    />
                    <div class="input-desc">{{ t('checkoutSubscription.confirmEmailDesc') }}</div>
                    <div v-if="confirmEmailError" class="input-error-text">{{ confirmEmailError }}</div>
                </div>
                
                <div class="pay-method-title">{{ t('checkoutSubscription.paymentMethod') }}</div>
                <div class="pay-method-note">
                    {{ t('checkoutSubscription.poweredByPaddle') }}
                </div>
                <button 
                    class="purchase-btn" 
                    @click="() => handlePayment()"
                    :disabled="loading"
                >
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? t('checkoutSubscription.processing') : t('checkoutSubscription.proceedToCheckout') }}
                </button>
                
                <div id="result-message" style="margin-top:16px;color:#e63946;"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import type { PaddleCheckoutCompletedEvent, PurchaseRequest } from '@/types'
import { purchaseCallback } from '@/api/purchase'
import type { SubscriptionPlan } from '@/api/subscription'
import type { CheckPurchaseRequest, CheckPurchaseResponse, PurchaseCallbackRequest, PurchaseSuccessResponseVO } from '@/types/purchase-check'
import { checkPurchase } from '@/api/pay'
import { PurchaseOrigin } from '@/constant/purchaseOrigin'
import { initializePaddle } from '@/utils/paddle'
import { useI18n } from '@/i18n'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const userStore = useUserStore()
const subscription = computed(() => store.selectedSubscription as SubscriptionPlan)
const request = computed(() => store.data?.request as PurchaseRequest)
const { t } = useI18n()

const email = ref('')
const confirmEmail = ref('')
const loading = ref(false)
const emailError = ref('')
const confirmEmailError = ref('')
const showConfirmEmail = ref(false)
const isEmailConfirmed = ref(false)
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);
const accountEmail = computed(() => userStore.token ? normalizeEmail(userStore.userInfo?.email || '') : '')

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function validateEmailField() {
  emailError.value = ''
  email.value = accountEmail.value
  if (!email.value.trim()) {
    emailError.value = t('cart.error.loginRequired')
    redirectToSsoLogin('store', 600)
    return false
  }
  if (!validateEmail(email.value)) {
    emailError.value = t('checkoutSubscription.invalidEmail')
    return false
  }
  return true
}

function validateEmailMatch() {
  confirmEmailError.value = ''
  if (!confirmEmail.value.trim()) {
    confirmEmailError.value = t('checkoutSubscription.confirmRequired')
    return false
  }
  if (email.value !== confirmEmail.value) {
    confirmEmailError.value = t('checkoutSubscription.emailMismatch')
    return false
  }
  return true
}

function validateAllEmails() {
  const isEmailValid = validateEmailField()
  
  // 如果邮箱已经确认，直接返回成功
  if (isEmailConfirmed.value) {
    return isEmailValid
  }
  
  // 如果显示了确认输入框，需要验证匹配
  if (showConfirmEmail.value) {
    const isConfirmValid = validateEmailMatch()
    return isEmailValid && isConfirmValid
  }
  
  return isEmailValid
}

function handleEmailInput() {
  emailError.value = ''
  isEmailConfirmed.value = false
  
  // 如果邮箱不为空且格式正确，显示确认输入框
  if (email.value.trim() && validateEmail(email.value)) {
    showConfirmEmail.value = true
  } else {
    showConfirmEmail.value = false
    confirmEmail.value = ''
    confirmEmailError.value = ''
  }
}

function handleConfirmEmailInput() {
  confirmEmailError.value = ''
  
  // 检查两次输入是否一致
  if (confirmEmail.value && email.value === confirmEmail.value) {
    isEmailConfirmed.value = true
    showConfirmEmail.value = false
  } else {
    isEmailConfirmed.value = false
  }
}

// 获取计划类型
const getPlanType = (plan: SubscriptionPlan): string => {
  if (plan.durationDays === -1) return 'Lifetime';
  if (plan.durationDays >= 365) return 'Annual';
  return 'Monthly';
};

onBeforeMount(() => {
    console.log('store.selectedSubscription', store.selectedSubscription)
    if (!store.selectedSubscription) {
        router.push('/code')
        return
    }
})

onMounted(() => {
    if (accountEmail.value) {
        email.value = accountEmail.value
        isEmailConfirmed.value = true
        showConfirmEmail.value = false
    }
    loadPaddle()
})

function loadPaddle() {
    if (typeof window !== "undefined" && !window.Paddle) {
        const script = document.createElement("script")
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
        script.async = true
        script.onload = () => {
            initializePaddle(
                window.Paddle,
                async function(data: any) {
                    console.log('Paddle event:', data)
                    if (data.name === 'checkout.completed') {
                        const eventData = data as PaddleCheckoutCompletedEvent;
                        
                        loading.value = false
                        
                        // Sync to backend
                        const orderData: PurchaseCallbackRequest = {
                            transaction_id: eventData.data.transaction_id,
                        }
                        
                        try {
                            const purchaseResponse: PurchaseSuccessResponseVO = await purchaseCallback(orderData)
                      
                            // Save order info to store
                            store.setOrder({
                                referenceId: purchaseResponse?.txnId || eventData.data.id || `PADDLE_${Date.now()}`,
                                productName: purchaseResponse?.productName || subscription.value.name,
                                amount: purchaseResponse?.grandTotal ? parseFloat(purchaseResponse?.grandTotal) : subscription.value.discountPrice || subscription.value.originalPrice,
                                paymentSource: 'paddle',
                                currencyCode: purchaseResponse?.currencyCode || 'USD',
                                paddleOrder: eventData.data
                            })
                            
                            // Force redirect to success page, override Paddle default
                            setTimeout(() => {
                                window.location.href = '/payment/success'
                            }, 1000)
                        } catch (error) {
                            console.warn('Payment completed but purchase sync failed:', error)
                            store.setOrder({
                                referenceId: eventData.data.id || `PADDLE_${Date.now()}`,
                                productName: subscription.value.name,
                                amount: subscription.value.discountPrice || subscription.value.originalPrice,
                                paymentSource: 'paddle',
                                currencyCode: 'USD',
                                paddleOrder: eventData.data
                            })
                            setTimeout(() => {
                                window.location.href = '/payment/success'
                            }, 1000)
                        }
                    }
                    if (data.name === 'checkout.closed') {
                        loading.value = false
                    }
                    if (data.name === 'checkout.error') {
                        loading.value = false
                        ElMessageBox.alert('Payment failed. Please try again.', 'Error')
                    }
                    if (data.name === 'checkout.items.updated') {
                        const items = data.data.items || [];
                        const hasInvalidQuantity = items.some((item: any) => item.quantity > maxQuantity.value);

                        if (hasInvalidQuantity) {
                            if (window.Paddle && window.Paddle.Checkout) {
                                // Since we can't directly update the open checkout window,
                                // we will close it and reopen with the correct quantity.
                                window.Paddle.Checkout.close();

                                // Notify user that quantity has been reset
                                ElMessageBox.alert('You can only purchase one item at a time. The quantity will be reset to 1.', 'Quantity Limit')
                                  .finally(() => {
                                      // Reopen checkout window with default quantity 1
                                      handlePayment(true);
                                  });
                            }
                        }
                    }
                }
            )
        }
        document.body.appendChild(script)
    } else {
        console.log('Paddle already loaded')
    }
}

const handlePayment = async (isRetry = false) => {
    // 验证邮箱
    if (!validateAllEmails()) {
        return
    }
    email.value = accountEmail.value
    
    // 根据邮箱 + part_number 校验购买过的权益
    const checkPurchaseRequest: CheckPurchaseRequest = {
        email: email.value,
        appId: request?.value?.appid,
        accountToken: request?.value?.accounttoken,
        isSubscription: true,
    }
    const checkPurchaseResponse: CheckPurchaseResponse = await checkPurchase(checkPurchaseRequest)
    console.log('checkPurchaseResponse', checkPurchaseResponse)
    if (checkPurchaseResponse.isPurchase) {
        // 存储购买和订阅信息到 store 中
        if (checkPurchaseResponse.subscription) {
            store.setSubscriptionInfo(checkPurchaseResponse.subscription);
        }
        // 跳转到自动解锁页面
        router.push({ name: 'AutoUnlock' });
        return;
    }
    if (!isRetry) {
        if (userSelectedQuantity.value > maxQuantity.value) {
            ElMessageBox.alert('You can only select up to ' + maxQuantity.value + ' items', 'Error')
            return
        }
    }
    if (!email.value) {
        emailError.value = 'We need your email to send receipt.'
        return
    }
    if (!validateEmail(email.value)) {
        emailError.value = 'Please enter a valid email address'
        return
    }
    
    emailError.value = ''
    loading.value = true
    
    if (typeof window !== "undefined" && window.Paddle) {
        console.log('subscription.value', subscription.value)
        window.Paddle.Checkout.open({
            settings: {
                displayMode: 'overlay',
            },
            items: [
                {
                    priceId: subscription.value.paddlePriceId,
                    quantity: userSelectedQuantity.value,
                },
            ],
            customer: { email: email.value },
            customData: {
                isSubscription: true,
                source: PurchaseOrigin.CODE,
                planId: subscription.value.id,
                planCode: subscription.value.planCode,
                email: email.value,
                accessToken: request?.value?.accounttoken,
                appId: request?.value?.appid,
                code: request?.value?.purchaseCode,
            },
        })
    } else {
        ElMessageBox.alert('Paddle failed to load, please refresh the page and try again.', 'Error')
        loading.value = false
    }
}
</script>

<style scoped>
.checkout {
    text-align: left;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 16px 0 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

.title {
    font-size: 2rem;
    font-weight: bold;
    margin: 32px 0 24px 0;
    text-align: center;
}

.checkout-main {
    display: flex;
    gap: 48px;
    margin-top: 32px;
    justify-content: center;
}

.checkout-right {
    flex: 1.2;
    min-width: 340px;
}

.checkout-left {
    flex: 1;
    min-width: 220px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 32px 24px;
    width: 400px;
    display: flex;
    flex-direction: column;
    margin-top: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
}

.card-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.price-info {
    text-align: right;
}

.price {
    font-size: 1.6rem;
    font-weight: 700;
    color: #2d6a4f;
}

.tax-tip {
    font-size: 0.9rem;
    color: #999;
    display: block;
}

.input-label {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 8px;
    display: block;
}

.input {
    width: 100%;
    font-size: 1.2rem;
    padding: 14px 12px;
    border: 3px solid #cbd5e1;
    border-radius: 12px;
    margin-bottom: 4px;
    box-sizing: border-box;
    outline: none;
}

.input:focus {
    border-color: #64748b;
}

.input-desc {
    color: #6b7280;
    font-size: 0.98rem;
    margin-bottom: 24px;
    line-height: 1.5;
}

.email-tips {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin: 12px 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tips-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
}

.tips-icon {
    font-size: 1.1rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.tips-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #1e293b;
    letter-spacing: 0.025em;
}

.tips-content {
    color: #475569;
}

.tips-subtitle {
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 10px;
}

.tips-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tip-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: #475569;
    padding: 4px 0;
}

.tip-item .tip-icon {
    font-size: 1rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    box-shadow: none;
}

.tip-highlight {
    color: #3b82f6;
    font-weight: 600;
    background: rgba(59, 130, 246, 0.1);
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.85rem;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.input-desc strong {
    color: #f59e0b;
    font-weight: 600;
}

.highlight-text {
    color: #2563eb;
    font-weight: 700;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9rem;
}

.email-input-container {
    margin-bottom: 20px;
}

.email-confirm-container {
    margin-bottom: 20px;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.email-success-icon {
    position: absolute;
    right: 12px;
    color: #10b981;
    font-size: 1.2rem;
    font-weight: bold;
    background: #ecfdf5;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #10b981;
    animation: checkmark 0.3s ease-out;
}

@keyframes checkmark {
    from {
        opacity: 0;
        transform: scale(0.5);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.input-error-text {
    color: #e63946;
    font-size: 0.9rem;
    margin-top: -20px;
    margin-bottom: 24px;
}

.pay-method-title {
    font-weight: bold;
    font-size: 1.1rem;
    margin: 24px 0 8px 0;
}

.pay-method-note {
    color: #444;
    font-size: 0.98rem;
    margin-bottom: 24px;
}

.purchase-btn {
    width: 100%;
    background: #2d6a4f;
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 18px 0;
    border-radius: 12px;
    border: none;
    margin-top: 24px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
}

.purchase-btn:hover:not(:disabled) {
    background: #40916c;
    transform: translateY(-2px);
}

.purchase-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 订阅详情样式 */
.subscription-details {
    margin-bottom: 24px;
}

.subscription-type, .subscription-duration {
    margin-bottom: 12px;
    display: flex;
}

.label {
    font-weight: 600;
    color: #666;
    width: 80px;
}

.value {
    color: #333;
    font-weight: 500;
}

.subscription-features {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
}

.check-icon {
    color: #34c759;
    font-weight: bold;
    margin-right: 8px;
    flex-shrink: 0;
}

/* 价格摘要 */
.price-summary {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.95rem;
    color: #666;
}

.summary-row.discount {
    color: #e63946;
}

.summary-row.total {
    font-weight: 700;
    color: #333;
    font-size: 1.1rem;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

@media (max-width: 768px) {
    .checkout-main {
        flex-direction: column;
        align-items: center;
    }
    
    .checkout-left, .checkout-right {
        width: 100%;
    }
}
</style>
