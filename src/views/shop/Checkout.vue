<template>
    <div class="checkout">
        <h2 class="title">Secure Checkout</h2>
        <div class="checkout-main">
            <div class="checkout-left">
                <template v-if="isBundle">
                    <PurchaseCard
                        type="bundle"
                        :title="(product as Bundle).bundleName"
                        :description="(product as Bundle).bundleDesc"
                        :bundle-items="bundleItemsForCard"
                        :original-price="bundleOriginalPrice"
                        :current-price="bundleCurrentPrice"
                        :discount="bundleDiscount"
                        :is-selected="true"
                        :currency-code="currencyCode"
                        :show-button="false"
                        button-text="Proceed to Checkout"
                        :app-count="(product as Bundle).appCount"
                        :app-total-price="(product as Bundle).appTotalPrice"
                        @buy="handlePayment"
                        @select="() => {}"
                    />
                </template>
                <template v-else>
                    <PurchaseCard
                        type="product"
                        :title="(product as ProductVO).name"
                        :description="(product as ProductVO).description"
                        :image-url="(product as ProductVO).garminImageUrl"
                        :original-price="productOriginalPrice"
                        :current-price="productCurrentPrice"
                        :discount="productDiscount"
                        :is-selected="true"
                        :currency-code="currencyCode"
                        :show-button="false"
                        button-text="Proceed to Checkout"
                        @buy="handlePayment"
                        @select="() => {}"
                    />
                </template>
            </div>
            <div class="checkout-right">
                <label class="input-label">Email for receipt</label>
                <input
                    v-model="email"
                    :class="['input', { 'email-input-highlight': shouldHighlightEmail }]"
                    placeholder="you@example.com"
                    :disabled="isEmailLocked"
                />
                <div v-if="isEmailLocked" class="email-locked-hint">
                    Your email is locked to your current account. To use a different email, please sign out and sign in (or create a new account) with the new email, then place the order again.
                </div>
                <div v-else class="input-desc">Please use a real email address. It will be used to receive your order and activation benefits — and it can also be used to sign in later. Sign in (or create an account) to manage your purchases.</div>
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
                    {{ loading ? 'Processing...' : 'Continue' }}
                </button>
                
                <div id="result-message" style="margin-top:16px;color:#e63946;"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import PurchaseCard from '@/components/PurchaseCard.vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import type { PaddleCheckoutCompletedEvent, Bundle, ProductBaseVO, ProductVO, PurchaseRequest } from '@/types'
import { checkPurchase } from '@/api/pay'
import type { CheckPurchaseRequest, CheckPurchaseResponse } from '@/types/purchase-check'
import { PurchaseOrigin } from '@/constant/purchaseOrigin'
import { checkBundleByEmail, purchaseCallback } from '@/api/purchase'
import type { PurchaseCallbackRequest, PurchaseRecordVO } from '@/types/purchase-check'
import { useUserStore } from '@/store/user'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const userStore = useUserStore()
const product = computed(() => store.selectedProduct as Bundle | ProductVO)

const request = computed(() => store.data?.request as PurchaseRequest | undefined)
const email = ref('')
const loading = ref(false)
const emailError = ref('')
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);

const isEmailLocked = computed(() => !!userStore.userInfo?.email)

const shouldHighlightEmail = computed(() => {
    return !isEmailLocked.value && !email.value
})

const isBundle = computed(() => {
  return product.value && 'bundleId' in product.value
})

const getPriceIdForCheckout = computed(() => {
  if (!product.value) return ''
  if (isBundle.value) return (product.value as any)?.paddlePriceId || ''
  return (product.value as ProductVO)?.payment?.paddlePriceId || ''
})

const discountInfo = computed(() => {
  const priceId = getPriceIdForCheckout.value
  if (!priceId) return null
  return (store as any).discountsByPriceId?.[priceId] || null
})

const currencyCode = computed(() => {
  return (discountInfo.value?.valid && discountInfo.value?.currency) ? String(discountInfo.value.currency) : 'USD'
})

const bundleItemsForCard = computed(() => {
    if (!isBundle.value) return []
    return (product.value as Bundle).products.map(p => ({
        id: String(p.appId),
        name: p.name,
        imageUrl: p.garminImageUrl,
    }))
})

const bundleCurrentPrice = computed(() => {
    if (!isBundle.value) return 0
    const base = Number((product.value as Bundle).price) || 0
    if (discountInfo.value?.valid) return Number(discountInfo.value.finalPrice)
    return base
})

const bundleOriginalPrice = computed(() => {
    if (!isBundle.value) return 0
    const total = Number((product.value as Bundle).appTotalPrice)
    const current = bundleCurrentPrice.value
    if (Number.isFinite(total) && total > current) return total
    return current
})

const bundleDiscount = computed(() => {
    const original = bundleOriginalPrice.value
    const current = bundleCurrentPrice.value
    if (!original || original <= current) return 0
    return Math.round(((original - current) / original) * 100)
})

const productCurrentPrice = computed(() => {
  if (isBundle.value) return 0
  const base = Number((product.value as ProductVO)?.price) || 0
  if (discountInfo.value?.valid) return Number(discountInfo.value.finalPrice)
  return base
})

const productOriginalPrice = computed(() => {
    const current = productCurrentPrice.value
    return current
})

const productDiscount = computed(() => {
    const original = productOriginalPrice.value
    const current = productCurrentPrice.value
    if (!original || original <= current) return 0
    return Math.round(((original - current) / original) * 100)
})

const isBundleTokenFlow = computed(() => {
  return isBundle.value && !request.value?.accounttoken
})

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

onBeforeMount(() => {
    console.log('store.data', store.data)
    if (!store.selectedProduct) {
        router.push('/')
        return
    }
    if (!store.data && !isBundle.value) {
        router.push('/')
        return
    }
})

onMounted(() => {
    if (!email.value && userStore.userInfo?.email) {
        email.value = userStore.userInfo.email
    }
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
                        try {
                            if (isBundleTokenFlow.value) {
                                const orderData: PurchaseCallbackRequest = {
                                    transaction_id: eventData.data.transaction_id,
                                }
                                await purchaseCallback(orderData)
                                const bundleId = (product.value as Bundle).bundleId
                                const purchaseRecord: PurchaseRecordVO | null = await checkBundleByEmail({ email: email.value, bundleId })
                                if (purchaseRecord) {
                                    store.setPurchaseInfo(purchaseRecord)
                                }
                                setTimeout(() => {
                                    window.location.href = '/auto-unlock'
                                }, 600)
                                return
                            }

                            // // 同步到后端
                            // const orderData: PurchaseCallbackRequest = {
                            //     transaction_id: eventData.data.transaction_id,
                            // }
                            // const res = await purchaseCallback(orderData) 

                            // Save order info to store
                            store.setOrder({
                                referenceId: eventData.data.id || `PADDLE_${Date.now()}`,
                                productName: isBundle.value ? (product.value as Bundle).bundleName : (product.value as ProductBaseVO).name,
                                amount: product.value?.price,
                                paymentSource: 'paddle',
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
                    if (data.name === 'checkout.updated') {
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
    if (isBundleTokenFlow.value) {
        const bundleId = (product.value as Bundle).bundleId

        if (!email.value) {
            emailError.value = 'We need your email to send receipt.'
            return
        }
        if (!validateEmail(email.value)) {
            emailError.value = 'Please enter a valid email address'
            return
        }

        try {
            const existing: PurchaseRecordVO | null = await checkBundleByEmail({ email: email.value, bundleId })
            if (existing) {
                store.setPurchaseInfo(existing)
                router.push({ name: 'AutoUnlock' })
                return
            }
        } catch (e) {
        }
    }

    // 根据邮箱 + part_number 校验购买过的权益
    const checkPurchaseRequest: CheckPurchaseRequest = {
        email: email.value,
        appId: request.value?.appid as number,
        accountToken: request.value?.accounttoken as string,
        isSubscription: false,
    }
    if (!isBundleTokenFlow.value) {
        const checkPurchaseResponse: CheckPurchaseResponse = await checkPurchase(checkPurchaseRequest)
        console.log('checkPurchaseResponse', checkPurchaseResponse)
        if (checkPurchaseResponse.isPurchase) {
            // 存储购买和订阅信息到 store 中
            if (checkPurchaseResponse.subscription) {
                store.setSubscriptionInfo(checkPurchaseResponse.subscription);
            }
            if (checkPurchaseResponse.purchase) {
                store.setPurchaseInfo(checkPurchaseResponse.purchase);
            }
            // 跳转到自动解锁页面
            router.push({ name: 'AutoUnlock' });
            return;
        }
    }
    if (!isRetry) {
        if (!email.value) {
            emailError.value = 'We need your email to send receipt.'
            return
        }
        if (!validateEmail(email.value)) {
            emailError.value = 'Please enter a valid email address'
            return
        }
        if (userSelectedQuantity.value > maxQuantity.value) {
            ElMessageBox.alert('You can only select up to ' + maxQuantity.value + ' items', 'Error')
            return
        }
        if (!isBundleTokenFlow.value && !request.value?.accounttoken) {
            ElMessageBox.alert('Please enter your code first', 'Error')
            router.push('/code')
            return
        }
        emailError.value = ''
        loading.value = true
    }
    
    if (typeof window !== "undefined" && window.Paddle) {
        window.Paddle.Checkout.open({
            settings: {
                displayMode: 'overlay',
            },
            items: [
                {
                    priceId: (product.value as ProductVO).payment?.paddlePriceId || (product.value as Bundle)?.paddlePriceId,
                    quantity: userSelectedQuantity.value,
                },
            ],
            customer: { email: email.value },
            discountCode: discountInfo.value?.valid ? (discountInfo.value.discountCode || (store as any).discountCode || '') : '',
            customData: {
                isSubscription: false,
                source: isBundleTokenFlow.value ? PurchaseOrigin.STORE : PurchaseOrigin.CODE,
                code: request?.value?.purchaseCode,
                accessToken: request?.value?.accounttoken,
                appId: request?.value?.appid,
                bundleId: isBundle.value ? (product.value as Bundle).bundleId : '',
                isBundle: isBundle.value,
                email: email.value,
                discountCode: discountInfo.value?.valid ? (discountInfo.value.discountCode || (store as any).discountCode || '') : '',
                discountId: discountInfo.value?.valid ? (discountInfo.value.discountId || discountInfo.value.discount?.id || '') : '',
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
    margin: 0 auto 80px;
    padding: 32px 16px 0 16px;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    min-height: 100vh;
    box-sizing: border-box;
}

.logo {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
}

.logo span {
    color: #6fcf97;
}

.title {
    font-size: 2rem;
    font-weight: bold;
    margin: 32px 0 24px 0;
    text-align: center;
    color: #1a1a1a;
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


.input-label {
    font-weight: bold;
    font-size: 1.4rem;
    margin-bottom: 8px;
    display: block;
    color: #1a1a1a;
}

.input {
    width: 100%;
    font-size: 1.2rem;
    padding: 16px 16px;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.9);
    outline: none;
    transition: all 0.2s ease;
}

.input:disabled {
    background: rgba(243, 244, 246, 0.95);
    border-color: rgba(17, 24, 39, 0.12);
    color: rgba(17, 24, 39, 0.55);
    cursor: not-allowed;
}

.input:disabled::placeholder {
    color: rgba(17, 24, 39, 0.35);
}

.input:focus {
    border-color: #2d6a4f;
    box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
}

.email-input-highlight {
    border-color: rgba(0, 122, 255, 0.55);
    box-shadow:
        0 0 0 4px rgba(0, 122, 255, 0.14),
        0 14px 34px rgba(0, 122, 255, 0.18);
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.92) 100%);
    animation: email-attention-pulse 2.2s ease-in-out infinite;
}

.email-input-highlight:focus {
    animation: none;
    border-color: rgba(0, 122, 255, 0.72);
    box-shadow:
        0 0 0 4px rgba(0, 122, 255, 0.18),
        0 18px 44px rgba(0, 122, 255, 0.22);
}

.input:disabled.email-input-highlight {
    animation: none;
    box-shadow: none;
}

@keyframes email-attention-pulse {
    0%,
    100% {
        box-shadow:
            0 0 0 4px rgba(0, 122, 255, 0.12),
            0 14px 34px rgba(0, 122, 255, 0.14);
    }
    50% {
        box-shadow:
            0 0 0 6px rgba(0, 122, 255, 0.16),
            0 18px 44px rgba(0, 122, 255, 0.20);
    }
}

.input-desc {
    color: #4a5568;
    font-size: 0.98rem;
    padding: 10px 12px;
    margin-top: 12px;
    margin-bottom: 24px;
    border-radius: 12px;
    border: 1px solid rgba(0, 122, 255, 0.18);
    background: rgba(0, 122, 255, 0.06);
    color: rgba(17, 24, 39, 0.78);
    font-size: 0.92rem;
    line-height: 1.5;
}

.email-locked-hint {
    color: #4a5568;
    margin-top: 12px;
    margin-bottom: 18px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 122, 255, 0.18);
    background: rgba(0, 122, 255, 0.06);
    color: rgba(17, 24, 39, 0.78);
    font-size: 0.98rem;
    line-height: 1.5;
}

.pay-method-title {
    font-weight: bold;
    font-size: 1.4rem;
    margin: 24px 0 8px 0;
    color: #1a1a1a;
}

.pay-method-note {
    color: #2d3748;
    font-size: 0.98rem;
    margin-bottom: 24px;
}

.purchase-btn {
    width: 100%;
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.98) 0%, rgba(64, 156, 255, 0.94) 55%, rgba(0, 122, 255, 0.90) 100%);
    color: rgba(255, 255, 255, 0.98);
    font-size: 1.2rem;
    font-weight: 700;
    padding: 18px 0;
    border-radius: 14px;
    border: none;
    margin-top: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    box-shadow:
        0 18px 42px rgba(0, 122, 255, 0.30),
        0 14px 30px rgba(15, 23, 42, 0.16),
        0 0 0 1px rgba(255, 255, 255, 0.22) inset;
    letter-spacing: 0.4px;
    min-height: 56px;
}

.purchase-btn:hover:not(:disabled) {
    box-shadow:
        0 22px 56px rgba(0, 122, 255, 0.36),
        0 18px 48px rgba(15, 23, 42, 0.20),
        0 0 0 1px rgba(255, 255, 255, 0.28) inset;
    transform: translateY(-2px);
}

.purchase-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow:
        0 12px 30px rgba(0, 122, 255, 0.24),
        0 10px 26px rgba(0, 0, 0, 0.30),
        0 0 0 1px rgba(255, 255, 255, 0.18) inset;
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

.checkout-left {
    width: 400px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
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
    color: #1a1a1a;
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
.bundle-images-container {
    margin-bottom: 24px;
    position: relative;
}
.bundle-images-scroll {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 8px 0;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    /* 移动端性能优化 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: scroll-position;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    /* 禁用自动滚动在移动端 */
    pointer-events: auto;
}
.bundle-images-scroll::-webkit-scrollbar {
    height: 6px;
}
.bundle-images-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}
.bundle-images-scroll::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}
.bundle-images-scroll::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
.bundle-image-item {
    flex-shrink: 0;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
    min-width: 80px;
}
.bundle-image-item img {
    width: 90px;
    height: 90px;
    border-radius: 12px;
    object-fit: cover;
    /* border: 2px solid #eee; */
    background: #fafafa;
    margin-bottom: 8px;
    /* 图片性能优化 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: transform;
}
.bundle-image-item .product-name {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    line-height: 1.2;
}
.scroll-indicator {
    margin-top: 12px;
    text-align: center;
}
.scroll-text {
    font-size: 0.85rem;
    color: #718096;
    font-style: italic;
}
.bundle-info {
    flex: 1;
    text-align: left;
    margin-bottom: 24px;
}
.bundle-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
}
.bundle-desc {
    color: #4a5568;
    margin-bottom: 12px;
    line-height: 1.4;
}
.product-count {
    font-size: 0.9rem;
    color: #6b7280;
}
.product-count-main {
    font-weight: 500;
    color: #4b5563;
}
.product-count-sub {
    margin-left: 4px;
}
.product-count-original {
    text-decoration: line-through;
}
.product-image {
    margin-bottom: 24px;
    text-align: center;
}
.product-image img {
    width: 200px;
    height: 200px;
    border-radius: 16px;
    object-fit: cover;
    border: 3px solid #eee;
    background: #fafafa;
    max-width: 100%;
}
.product-info {
    flex: 1;
    text-align: left;
    margin-bottom: 24px;
}
.product-info .product-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
}
.product-id {
    color: #718096;
    font-size: 0.9rem;
    font-family: monospace;
}
.summary-row.total {
    font-weight: bold;
    font-size: 1.2rem;
}
.tax-tip {
    font-size: 0.95rem;
    color: #999;
    margin-left: 8px;
}

/* 错误消息样式 */
.input-error-text {
    color: #ef4444;
    font-size: 0.9rem;
    margin-top: 4px;
    margin-bottom: 16px;
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
    .checkout {
        padding: 24px 20px 0 20px;
    }
    
    .title {
        font-size: 1.8rem;
        margin: 24px 0 20px 0;
    }
    
    .checkout-main {
        flex-direction: column;
        gap: 32px;
        margin-top: 24px;
    }
    
    .checkout-left {
        border-left: none;
        border-top: none;
        padding: 28px 20px;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        order: 1;
        box-sizing: border-box;
    }
    
    .checkout-right {
        order: 2;
        max-width: 500px;
        margin: 0 auto;
        width: 100%;
    }
    
    .product-image img {
        width: 180px;
        height: 180px;
    }
    
    .bundle-image-item img {
        width: 100px;
        height: 100px;
    }
}

/* 手机端优化 */
@media (max-width: 480px) {
    .checkout {
        padding: 16px 16px 0 16px;
        min-height: 100vh;
    }
    
    .title {
        font-size: 1.6rem;
        margin: 20px 0 16px 0;
    }
    
    .checkout-main {
        gap: 24px;
        margin-top: 16px;
    }
    
    .checkout-left {
        padding: 20px 16px;
        border-radius: 16px;
        margin: 0;
        width: 100%;
        max-width: 100%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        overflow: hidden;
    }
    
    .checkout-right {
        width: 100%;
        max-width: none;
        margin: 0;
    }
    
    .card-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
    }
    
    .card-title {
        font-size: 1.3rem;
    }
    
    .price {
        font-size: 1.5rem;
    }
    
    .product-image {
        margin-bottom: 20px;
    }
    
    .product-image img {
        width: 160px;
        height: 160px;
        border-radius: 14px;
        max-width: calc(100vw - 64px);
    }
    
    .bundle-image-item {
        min-width: 90px;
    }
    
    .bundle-image-item img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
    }
    
    .bundle-name {
        font-size: 1.1rem;
    }
    
    .bundle-desc {
        font-size: 0.9rem;
        line-height: 1.5;
    }
    
    .product-info .product-name {
        font-size: 1.2rem;
    }
    
    .input-label {
        font-size: 1rem;
    }
    
    .input {
        font-size: 1.1rem;
        padding: 14px 16px;
    }
    
    .purchase-btn {
        font-size: 1.1rem;
        padding: 16px 0;
        margin-top: 20px;
        min-height: 52px;
    }
    
    .pay-method-title {
        font-size: 1rem;
        margin: 20px 0 6px 0;
    }
    
    .pay-method-note {
        font-size: 0.9rem;
        margin-bottom: 20px;
    }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
    .checkout {
        padding: 12px 12px 0 12px;
    }
    
    .checkout-left {
        padding: 18px 12px;
        margin: 0;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }
    
    .card-title {
        font-size: 1.2rem;
    }
    
    .price {
        font-size: 1.4rem;
    }
    
    .product-image img {
        width: 140px;
        height: 140px;
        max-width: calc(100vw - 48px);
    }
    
    .bundle-image-item img {
        width: 70px;
        height: 70px;
    }
    
    .purchase-btn {
        font-size: 1rem;
        padding: 14px 0;
        min-height: 48px;
    }
}

/* Chrome浏览器特殊优化 */
@supports (-webkit-appearance: none) {
    @media (max-width: 480px) {
        .checkout-left {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: transform;
        }
        
        .purchase-btn {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        .input {
            -webkit-appearance: none;
            appearance: none;
        }
        
        /* Bundle图片滚动优化 */
        .bundle-images-scroll {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: scroll-position;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            /* 移动端禁用自动滚动 */
            scroll-snap-type: x mandatory;
        }
        
        .bundle-image-item {
            scroll-snap-align: start;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
        
        .bundle-image-item img {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: transform;
            /* 减少重绘 */
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }
    }
}
</style>
