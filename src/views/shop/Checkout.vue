<template>
    <main class="checkout commerce-page">
        <h2 class="title">{{ t('checkout.title') }}</h2>
        <div class="checkout-main commerce-panel">
            <div :class="['checkout-left', { 'checkout-left-bundle': isBundle }]">
                <template v-if="isBundle">
                    <PurchaseCard
                        type="bundle"
                        :title="checkoutBundleTitle"
                        :description="checkoutBundleDescription"
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
                        :image-url="getProductImageUrl(product as ProductVO)"
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
                <div class="checkout-panel-header">
                    <p class="checkout-eyebrow">{{ t('checkout.paymentDetails') }}</p>
                    <h3>{{ t('checkout.completeOrder') }}</h3>
                    <p>{{ t('checkout.deliveryNote') }}</p>
                </div>
                <label class="input-label">{{ t('checkout.emailForReceipt') }}</label>
                <input
                    v-model="email"
                    :class="['input', { 'email-input-highlight': shouldHighlightEmail }]"
                    :placeholder="t('cart.emailPlaceholder')"
                    :disabled="isEmailLocked"
                    type="email"
                    autocomplete="email"
                    aria-describedby="checkout-email-help checkout-email-error"
                />
                <div v-if="isEmailLocked" class="email-locked-hint">
                    {{ t('checkout.emailLockedHint') }}
                </div>
                <div v-else id="checkout-email-help" class="input-desc">{{ t('checkout.emailHelp') }}</div>
                <div v-if="emailError" id="checkout-email-error" class="input-error-text" role="alert">{{ emailError }}</div>
                <div class="payment-method-card">
                    <div class="payment-method-copy">
                        <div class="pay-method-title">{{ t('checkout.paymentMethod') }}</div>
                        <div class="pay-method-note">{{ t('checkout.paymentMethodNote') }}</div>
                    </div>
                    <el-icon class="payment-method-icon" aria-hidden="true"><CreditCard /></el-icon>
                </div>
                <button
                    type="button"
                    class="purchase-btn commerce-primary-action"
                    @click="() => handlePayment()"
                    :disabled="loading"
                    :aria-busy="loading"
                >
                    <span v-if="loading" class="loading-spinner"></span>
                    <el-icon v-else class="purchase-btn-lock" aria-hidden="true"><Lock /></el-icon>
                    <span class="purchase-btn-copy">
                        <span class="purchase-btn-title">{{ checkoutButtonText }}</span>
                        <span class="purchase-btn-subtitle">{{ loading ? t('checkout.openingPaddle') : t('checkout.encryptedCheckout') }}</span>
                    </span>
                    <el-icon v-if="!loading" class="purchase-btn-arrow" aria-hidden="true"><ArrowRight /></el-icon>
                </button>
                <div class="trust-list" :aria-label="t('checkout.protectionsAria')">
                    <span>
                        <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
                        {{ t('checkout.securePayment') }}
                    </span>
                    <span>
                        <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
                        {{ t('checkout.instantDelivery') }}
                    </span>
                    <span>
                        <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
                        {{ t('checkout.emailReceipt') }}
                    </span>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, onMounted, computed } from 'vue'
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
import { getProductImageUrl } from '@/utils/productImage'
import { initializePaddle } from '@/utils/paddle'
import { useI18n } from '@/i18n'
import { ArrowRight, CircleCheckFilled, CreditCard, Lock } from '@element-plus/icons-vue'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const userStore = useUserStore()
const { t } = useI18n()
const product = computed(() => store.selectedProduct as Bundle | ProductVO)

const request = computed(() => store.data?.request as PurchaseRequest | undefined)
const email = ref('')
const loading = ref(false)
const emailError = ref('')
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);
let paddleScriptPromise: Promise<void> | null = null
let checkoutOpening = false

const isBundle = computed(() => {
  return product.value && 'bundleId' in product.value
})

const normalizedBundleType = computed(() => {
  if (!isBundle.value) return ''
  return String((product.value as Bundle).bundleType || '').trim().toLowerCase()
})

const isWristoPremiumBundle = computed(() => {
  if (!isBundle.value) return false
  const bundle = product.value as Bundle
  const name = String(bundle.bundleName || '').toLowerCase()
  return name.includes('wristo premium') || normalizedBundleType.value === 'global'
})

const checkoutBundleTitle = computed(() => {
  if (!isBundle.value) return ''
  const bundle = product.value as Bundle
  return isWristoPremiumBundle.value ? t('purchase.premiumBundleName') : bundle.bundleName
})

const checkoutBundleDescription = computed(() => {
  if (!isBundle.value) return ''
  const bundle = product.value as Bundle
  return isWristoPremiumBundle.value ? t('purchase.premiumBundleDesc') : bundle.bundleDesc
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
        imageUrl: getProductImageUrl(p),
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
    const base = Number((product.value as Bundle).price) || 0
    if (discountInfo.value?.valid) return Number(discountInfo.value.originalPrice)
    const total = Number((product.value as Bundle).appTotalPrice)
    if (Number.isFinite(total) && total > base) return total
    return base
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
    if (isBundle.value) return 0
    const base = Number((product.value as ProductVO)?.price) || 0
    if (discountInfo.value?.valid) return Number(discountInfo.value.originalPrice)
    return base
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

const accountEmail = computed(() => userStore.token ? normalizeEmail(userStore.userInfo?.email || '') : '')

const isEmailLocked = computed(() => !!accountEmail.value)

const shouldHighlightEmail = computed(() => {
    return !isEmailLocked.value && !email.value
})

const checkoutButtonText = computed(() => {
  return loading.value ? 'Processing...' : 'Continue to secure payment'
})

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
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
    if (!email.value && accountEmail.value) {
        email.value = accountEmail.value
    }
})

onBeforeUnmount(() => {
    if (typeof window !== "undefined" && window.Paddle?.Checkout?.close) {
        window.Paddle.Checkout.close()
    }
})

function loadPaddle() {
    if (typeof window === "undefined") {
        return Promise.reject(new Error('Window is not available'))
    }
    if (window.Paddle) {
        return Promise.resolve()
    }
    if (paddleScriptPromise) {
        return paddleScriptPromise
    }

    paddleScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
        script.async = true
        script.onload = () => {
            try {
                initializePaddle(
                window.Paddle,
                async function(data: any) {
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
                            console.warn('Payment completed but purchase sync failed:', error)
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
                        ElMessageBox.alert(t('checkout.paymentFailed'), t('checkout.errorTitle'))
                    }
                    if (data.name === 'checkout.updated') {
                        loading.value = false
                    }
                    if (data.name === 'checkout.items.updated') {
                        loading.value = false
                        const items = data.data.items || [];
                        const hasInvalidQuantity = items.some((item: any) => item.quantity > maxQuantity.value);

                        if (hasInvalidQuantity) {
                            if (window.Paddle && window.Paddle.Checkout) {
                                // Since we can't directly update the open checkout window,
                                // we will close it and reopen with the correct quantity.
                                window.Paddle.Checkout.close();

                                // Notify user that quantity has been reset
                                ElMessageBox.alert(t('checkout.quantityReset'), t('checkout.quantityLimitTitle'))
                                  .finally(() => {
                                      // Reopen checkout window with default quantity 1
                                      handlePayment(true);
                                  });
                            }
                        }
                    }
                }
                )
                resolve()
            } catch (error) {
                reject(error)
            }
        }
        script.onerror = () => reject(new Error('Paddle failed to load'))
        document.body.appendChild(script)
    })

    return paddleScriptPromise
}

const handlePayment = async (isRetry = false) => {
    if (checkoutOpening) return

    try {
    const checkoutEmail = accountEmail.value || normalizeEmail(email.value)
    if (!validateEmail(checkoutEmail)) {
        email.value = checkoutEmail
        emailError.value = checkoutEmail ? t('cart.error.emailInvalid') : t('cart.error.emailRequired')
        return
    }
    checkoutOpening = true
    email.value = checkoutEmail
    emailError.value = ''
    if (isBundleTokenFlow.value && email.value) {
        const bundleId = (product.value as Bundle).bundleId

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
    if (!isBundleTokenFlow.value && email.value) {
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
        if (userSelectedQuantity.value > maxQuantity.value) {
            ElMessageBox.alert(t('checkout.quantityMax', { count: maxQuantity.value }), t('checkout.errorTitle'))
            return
        }
        if (!isBundleTokenFlow.value && !request.value?.accounttoken) {
            ElMessageBox.alert(t('checkout.codeRequired'), t('checkout.errorTitle'))
            router.push('/code')
            return
        }
        emailError.value = ''
        loading.value = true
    }

    await loadPaddle()
    
    if (typeof window !== "undefined" && window.Paddle) {
        const checkoutOptions: Record<string, any> = {
            settings: { displayMode: 'overlay' },
            items: [
                {
                    priceId: (product.value as ProductVO).payment?.paddlePriceId || (product.value as Bundle)?.paddlePriceId,
                    quantity: userSelectedQuantity.value,
                },
            ],
            discountCode: discountInfo.value?.valid ? (discountInfo.value.discountCode || (store as any).discountCode || '') : '',
            customData: {
                isSubscription: false,
                source: (discountInfo.value?.valid || (store as any).discountCode)
                    ? PurchaseOrigin.PROMOTION
                    : (isBundleTokenFlow.value ? PurchaseOrigin.STORE : PurchaseOrigin.CODE),
                code: request?.value?.purchaseCode,
                accessToken: request?.value?.accounttoken,
                appId: request?.value?.appid,
                bundleId: isBundle.value ? (product.value as Bundle).bundleId : '',
                isBundle: isBundle.value,
                email: email.value,
                discountCode: discountInfo.value?.valid ? (discountInfo.value.discountCode || (store as any).discountCode || '') : '',
            },
        }
        if (email.value) {
            checkoutOptions.customer = { email: email.value }
        }
        window.Paddle.Checkout.open(checkoutOptions)
        loading.value = false
    } else {
        ElMessageBox.alert(t('checkout.paddleLoadFailed'), t('checkout.errorTitle'))
        loading.value = false
    }
    } catch (error) {
        console.error('Paddle checkout failed:', error)
        ElMessageBox.alert(t('checkout.paddleLoadFailed'), t('checkout.errorTitle'))
        loading.value = false
    } finally {
        checkoutOpening = false
    }
}

</script>

<style scoped>
.checkout {
    max-width: 1040px;
    margin: 0 auto 80px;
    padding: 32px 20px 0 20px;
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
    font-size: clamp(1.75rem, 3vw, 2.4rem);
    font-weight: 800;
    margin: 32px 0 24px 0;
    text-align: center;
    color: #0f172a;
    letter-spacing: 0;
}

.checkout-main {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
    margin-top: 32px;
    justify-content: center;
    align-items: flex-start;
}

.checkout-right {
    width: 100%;
    min-width: 0;
    padding: 28px;
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

.checkout-panel-header {
    margin-bottom: 24px;
}

.checkout-eyebrow {
    margin: 0 0 8px;
    color: #0f6b68;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
}

.checkout-panel-header h3 {
    margin: 0 0 8px;
    color: #0f172a;
    font-size: 1.45rem;
    line-height: 1.2;
}

.checkout-panel-header p:last-child {
    margin: 0;
    color: #475467;
    font-size: 0.98rem;
    line-height: 1.55;
}


.input-label {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 8px;
    display: block;
    color: #0f172a;
}

.input {
    width: 100%;
    font-size: 1rem;
    padding: 16px 16px;
    border-radius: 14px;
    border: 1.5px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.9);
    outline: none;
    min-height: 52px;
    color: #0f172a;
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
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
    border-color: #0f6b68;
    box-shadow: 0 0 0 4px rgba(15, 107, 104, 0.14);
}

.email-input-highlight {
    border-color: rgba(15, 107, 104, 0.55);
    box-shadow:
        0 0 0 4px rgba(15, 107, 104, 0.12),
        0 14px 34px rgba(15, 107, 104, 0.14);
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 250, 0.92) 100%);
    animation: email-attention-pulse 2.2s ease-in-out infinite;
}

.email-input-highlight:focus {
    animation: none;
    border-color: rgba(15, 107, 104, 0.72);
    box-shadow:
        0 0 0 4px rgba(15, 107, 104, 0.18),
        0 18px 44px rgba(15, 107, 104, 0.18);
}

.input:disabled.email-input-highlight {
    animation: none;
    box-shadow: none;
}

@keyframes email-attention-pulse {
    0%,
    100% {
        box-shadow:
            0 0 0 4px rgba(15, 107, 104, 0.10),
            0 14px 34px rgba(15, 107, 104, 0.12);
    }
    50% {
        box-shadow:
            0 0 0 6px rgba(15, 107, 104, 0.14),
            0 18px 44px rgba(15, 107, 104, 0.16);
    }
}

.input-desc {
    padding: 10px 12px;
    margin-top: 12px;
    margin-bottom: 24px;
    border-radius: 12px;
    border: 1px solid rgba(15, 107, 104, 0.14);
    background: rgba(15, 107, 104, 0.06);
    color: #475467;
    font-size: 0.92rem;
    line-height: 1.5;
}

.email-locked-hint {
    color: #4a5568;
    margin-top: 12px;
    margin-bottom: 18px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(15, 107, 104, 0.14);
    background: rgba(15, 107, 104, 0.06);
    color: #475467;
    font-size: 0.92rem;
    line-height: 1.5;
}

.payment-method-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    margin-top: 8px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.78);
}

.payment-method-copy {
    min-width: 0;
}

.pay-method-title {
    font-weight: 800;
    font-size: 0.98rem;
    margin: 0 0 4px 0;
    color: #0f172a;
}

.pay-method-note {
    color: #667085;
    font-size: 0.9rem;
    margin: 0;
}

.payment-method-icon {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    color: #0f6b68;
    background: rgba(15, 107, 104, 0.10);
}

.payment-method-icon :deep(svg) {
    width: 22px;
    height: 22px;
}

.purchase-btn {
    width: 100%;
    background:
        linear-gradient(135deg, #0f6b68 0%, #0b827d 52%, #f59e0b 100%);
    color: rgba(255, 255, 255, 0.98);
    font-size: 1rem;
    font-weight: 800;
    padding: 14px 18px;
    border-radius: 16px;
    border: none;
    margin-top: 18px;
    cursor: pointer;
    transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    box-shadow:
        0 18px 42px rgba(15, 107, 104, 0.26),
        0 10px 24px rgba(245, 158, 11, 0.20),
        0 0 0 1px rgba(255, 255, 255, 0.22) inset;
    letter-spacing: 0;
    min-height: 60px;
    text-align: left;
}

.purchase-btn:hover:not(:disabled) {
    box-shadow:
        0 22px 56px rgba(15, 107, 104, 0.30),
        0 16px 34px rgba(245, 158, 11, 0.24),
        0 0 0 1px rgba(255, 255, 255, 0.28) inset;
    transform: translateY(-2px);
    filter: saturate(1.05);
}

.purchase-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow:
        0 12px 30px rgba(15, 107, 104, 0.22),
        0 8px 18px rgba(245, 158, 11, 0.18),
        0 0 0 1px rgba(255, 255, 255, 0.18) inset;
}

.purchase-btn:focus-visible {
    outline: 3px solid rgba(15, 107, 104, 0.28);
    outline-offset: 4px;
}

.purchase-btn:disabled {
    background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
    cursor: progress;
    transform: none;
    box-shadow: none;
}

.purchase-btn-lock,
.purchase-btn-arrow {
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
}

.purchase-btn-lock :deep(svg),
.purchase-btn-arrow :deep(svg) {
    width: 22px;
    height: 22px;
}

.purchase-btn-copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
}

.purchase-btn-title {
    font-size: 1rem;
    line-height: 1.2;
}

.purchase-btn-subtitle {
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.2;
}

.trust-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
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
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    margin-top: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 0;
    box-sizing: border-box;
}

.checkout-left :deep(.purchase-card) {
    width: 100%;
}

.checkout-left-bundle :deep(.purchase-card) {
    max-width: none;
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
        padding: 24px 20px 32px 20px;
    }
    
    .title {
        font-size: 1.8rem;
        margin: 24px 0 20px 0;
    }
    
    .checkout-main {
        grid-template-columns: 1fr;
        gap: 24px;
        margin-top: 24px;
    }
    
    .checkout-left {
        border-left: none;
        border-top: none;
        padding: 0;
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
        min-width: 0;
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
        padding: 16px 16px 32px 16px;
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
        padding: 0;
        border-radius: 16px;
        margin: 0;
        width: 100%;
        max-width: 100%;
        box-shadow: none;
        box-sizing: border-box;
        overflow: visible;
    }
    
    .checkout-right {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 20px;
        border-radius: 20px;
    }

    .checkout-panel-header {
        margin-bottom: 20px;
    }

    .checkout-panel-header h3 {
        font-size: 1.25rem;
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
        font-size: 0.92rem;
    }
    
    .input {
        font-size: 1rem;
        padding: 14px 16px;
    }
    
    .purchase-btn {
        font-size: 1rem;
        padding: 13px 16px;
        margin-top: 16px;
        min-height: 58px;
    }
    
    .pay-method-title {
        font-size: 0.95rem;
    }
    
    .pay-method-note {
        font-size: 0.84rem;
    }

    .payment-method-card {
        padding: 14px;
    }

    .trust-list {
        gap: 8px;
    }

    .trust-list span {
        flex: 1 1 calc(50% - 8px);
        justify-content: center;
    }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
    .checkout {
        padding: 12px 12px 0 12px;
    }
    
    .checkout-left {
        padding: 0;
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
        padding: 12px 14px;
        min-height: 48px;
    }

    .purchase-btn-subtitle {
        display: none;
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
