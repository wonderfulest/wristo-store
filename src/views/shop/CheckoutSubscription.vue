<template>
    <div class="checkout">
        <h2 class="title">Secure Checkout</h2>
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
                        <span class="label">Type:</span>
                        <span class="value">{{ getPlanType(subscription) }} Plan</span>
                    </div>
                    
                    <div class="subscription-duration" v-if="subscription.durationDays > 0">
                        <span class="label">Duration:</span>
                        <span class="value">{{ subscription.durationDays >= 365 ? subscription.durationDays/365 + ' Year' : subscription.durationDays/30 + ' Month' }}</span>
                    </div>
                    
                    <div class="subscription-features">
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>Access to 2000+ premium watch faces</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ subscription.durationDays === -1 ? 'Get all future watch faces automatically' : 'Get new watch faces monthly' }}</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>Ad-free experience</span>
                        </div>
                        <div class="feature-item" v-if="subscription.durationDays === -1">
                            <span class="check-icon">✓</span>
                            <span>Early access to new features</span>
                        </div>
                        <div class="feature-item">
                            <span class="check-icon">✓</span>
                            <span>{{ subscription.durationDays === -1 ? 'Priority customer support' : 
                                (subscription.durationDays >= 365 ? 'Standard customer support' : 'Basic customer support') }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="price-summary" v-if="subscription.discountPrice && subscription.discountPrice < subscription.originalPrice">
                    <div class="summary-row">
                        <span>Original Price</span>
                        <span>${{ subscription.originalPrice }}</span>
                    </div>
                    <div class="summary-row discount">
                        <span>Discount ({{ Math.round((1 - subscription.discountPrice / subscription.originalPrice) * 100) }}% OFF)</span>
                        <span>-${{ (subscription.originalPrice - subscription.discountPrice).toFixed(2) }}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>${{ subscription.discountPrice }}</span>
                    </div>
                </div>
            </div>
            
            <div class="checkout-right">
                <label class="input-label">Email for receipt</label>
                <input v-model="email" class="input" placeholder="" />
                <div class="input-desc">Only used for sending receipt.</div>
                <div v-if="emailError" class="input-error-text">{{ emailError }}</div>
                
                <div class="pay-method-title">Payment Method</div>
                <div class="pay-method-note">
                    Secure payment powered by Paddle
                </div>
                <button 
                    class="purchase-btn" 
                    @click="() => handlePayment()"
                    :disabled="loading"
                >
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? 'Processing...' : 'Proceed to Checkout' }}
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
import { purchaseCallback } from '@/api/pay'
import type { SubscriptionPlan } from '@/api/subscription'
import type { CheckPurchaseRequest, CheckPurchaseResponse, PurchaseCallbackRequest, PurchaseSuccessResponseVO } from '@/types/purchase-check'
import { checkPurchase } from '@/api/pay'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const subscription = computed(() => store.selectedSubscription as SubscriptionPlan)
const request = computed(() => store.data?.request as PurchaseRequest)

const email = ref('')
const loading = ref(false)
const emailError = ref('')
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
    loadPaddle()
})

function loadPaddle() {
    if (typeof window !== "undefined" && !window.Paddle) {
        const script = document.createElement("script")
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
        console.log('import.meta.env.VITE_PADDLE_ENVIRONMENT', import.meta.env.VITE_PADDLE_ENVIRONMENT)
        console.log('import.meta.env.VITE_PADDLE_CLIENT_TOKEN', import.meta.env.VITE_PADDLE_CLIENT_TOKEN)
        script.async = true
        script.onload = () => {
            window.Paddle.Environment.set(import.meta.env.VITE_PADDLE_ENVIRONMENT)
            window.Paddle.Initialize({ 
                token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
                eventCallback: async function(data: any) {
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
                            ElMessageBox.alert('Payment completed but sync failed. Please contact support.', 'Error')
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
                },
            })
        }
        document.body.appendChild(script)
    } else {
        console.log('Paddle already loaded')
    }
}

const handlePayment = async (isRetry = false) => {
    // 根据邮箱 + part_number 校验购买过的权益
    const checkPurchaseRequest: CheckPurchaseRequest = {
        email: email.value,
        appId: request.value.appid,
        accountToken: request.value.accounttoken,
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
                source: 'shop_code',
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
