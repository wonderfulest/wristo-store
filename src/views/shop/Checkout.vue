<template>
    <div class="checkout">
        <h2 class="title">Secure Checkout</h2>
        <div class="checkout-main">
            <div class="checkout-left">
                <template v-if="isBundle">
                    <div class="card-header">
                        <h3 class="card-title">{{ (product as Bundle).bundleName }}</h3>
                        <div class="price-info">
                            <span class="price">${{ (product as Bundle).price }}</span>
                            <span class="tax-tip">(Exc. tax)</span>
                        </div>
                    </div>
                    <div class="bundle-images-container">
                        <div class="bundle-images-scroll" ref="bundleScrollContainer">
                            <div v-for="p in (product as Bundle).products" :key="p.appId" class="bundle-image-item">
                                <img :src="p.garminImageUrl" :alt="p.name" />
                            </div>
                        </div>
                        <div class="scroll-indicator">
                            <span class="scroll-text">← Scroll to view all products →</span>
                        </div>
                    </div>
                    <div class="bundle-info">
                        <div class="bundle-name">{{ (product as Bundle).bundleName }}</div>
                        <div class="bundle-desc" v-html="formatDescription((product as Bundle).bundleDesc)"></div>
                        <div class="product-count">Total {{ (product as Bundle).products.length }} apps</div>
                    </div>
                </template>
                <template v-else>
                    <div class="card-header">
                        <h3 class="card-title">Single App</h3>
                        <div class="price-info">
                            <span class="price">${{ (product as ProductVO).price }}</span>
                            <span class="tax-tip">(Exc. tax)</span>
                        </div>
                    </div>
                    <div class="product-image">
                        <img :src="(product as ProductVO).garminImageUrl" :alt="(product as ProductVO).name" />
                    </div>
                    <div class="product-info">
                        <div class="product-name">{{ (product as ProductVO).name }}</div>
                        <div class="product-id">ID: {{ (product as ProductVO).designId }}</div>
                    </div>
                </template>
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
import { ref, onBeforeMount, onMounted, onUnmounted, computed } from 'vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import type { PaddleCheckoutCompletedEvent, Bundle, ProductBaseVO, ProductVO, PurchaseRequest } from '@/types'
import { checkPurchase, purchaseCallback } from '@/api/pay'
import type { CheckPurchaseRequest, CheckPurchaseResponse, PurchaseCallbackRequest } from '@/types/purchase-check'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const product = computed(() => store.selectedProduct as Bundle | ProductVO)

const request = computed(() => store.data?.request as PurchaseRequest)
const email = ref('')
const loading = ref(false)
const emailError = ref('')
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

onBeforeMount(() => {
    console.log('store.data', store.data)
    if (!store.data || !store.selectedProduct) {
        router.push('/')
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
                        
                        // 同步到后端
                        const orderData: PurchaseCallbackRequest = {
                            transaction_id: eventData.data.transaction_id,
                        }
                        
                        try {
                            // 同步到后端
                            await purchaseCallback(orderData)
                         
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
    // 根据邮箱 + part_number 校验购买过的权益
    const checkPurchaseRequest: CheckPurchaseRequest = {
        email: email.value,
        appId: request.value.appid,
        accountToken: request.value.accounttoken,
        isSubscription: false,
    }
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
        if (!request.value.accounttoken) {
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
            customData: {
                isSubscription: false,
                source: 'shop_code',
                code: request?.value?.purchaseCode,
                accessToken: request?.value?.accounttoken,
                appId: request?.value?.appid,
                bundleId: isBundle.value ? (product.value as Bundle).bundleId : '',
                isBundle: isBundle.value,
                email: email.value,
            },
        })
    } else {
        ElMessageBox.alert('Paddle failed to load, please refresh the page and try again.', 'Error')
        loading.value = false
    }
}

const isBundle = computed(() => {
  return product.value && 'bundleId' in product.value
})

// 格式化描述，支持换行
const formatDescription = (description: string) => {
  if (!description) return ''
  return description.replace(/\n/g, '<br>')
}

// Bundle图片自动滚动功能
const bundleScrollContainer = ref<HTMLElement | null>(null)
let autoScrollInterval: number | null = null

const startAutoScroll = () => {
  if (!bundleScrollContainer.value || !isBundle.value) return
  
  autoScrollInterval = window.setInterval(() => {
    if (bundleScrollContainer.value) {
      const container = bundleScrollContainer.value
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      const currentScroll = container.scrollLeft
      
      // 如果滚动到末尾，回到开始
      if (currentScroll >= scrollWidth - clientWidth) {
        container.scrollLeft = 0
      } else {
        container.scrollLeft += 1
      }
    }
  }, 30) // 每30ms滚动1px
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

// 启动自动滚动
if (isBundle.value) {
  onMounted(() => {
    // 延迟启动自动滚动，确保DOM已渲染
    setTimeout(() => {
      startAutoScroll()
    }, 1000)
  })
  
  onUnmounted(() => {
    stopAutoScroll()
  })
}
</script>

<style scoped>
.checkout {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 16px 0 16px;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
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
    border-left: 2px solid #e5e7eb;
    padding-left: 32px;
    margin-top: 24px;
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

.checkout-left {
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
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    /* border: 2px solid #eee; */
    background: #fafafa;
    margin-bottom: 8px;
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
    color: #999;
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
    color: #333;
    margin-bottom: 8px;
}
.bundle-desc {
    color: #666;
    margin-bottom: 12px;
    line-height: 1.4;
}
.product-count {
    color: #2d6a4f;
    font-weight: 500;
    font-size: 0.95rem;
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
}
.product-info {
    flex: 1;
    text-align: left;
    margin-bottom: 24px;
}
.product-info .product-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}
.product-id {
    color: #999;
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

/* Responsive design */
@media (max-width: 768px) {
    .checkout-main {
        flex-direction: column;
        gap: 24px;
    }
    
    .checkout-left {
        border-left: none;
        border-top: 2px solid #e5e7eb;
        padding-left: 0;
        padding-top: 24px;
        margin-top: 0;
    }
}
</style>
