<template>
    <div class="checkout">
        <!-- <Logo /> -->
        <h2 class="title">Secure Checkout</h2>
        <div class="checkout-main">
            <div class="checkout-left">
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
            <div class="checkout-right">
                <div class="summary-row">
                    <span>{{ product?.productName || 'Product' }}</span>
                    <span>${{ product?.price || '0.00' }}</span>
                </div>
                <hr />
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${{ product?.price || '0.00' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
// import Logo from '@/components/Logo.vue'
import type { PaddleCheckoutCompletedEvent } from '@/types'

declare global {
  interface Window {
    Paddle?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const product = computed(() => store.selectedProduct)

const request = computed(() => store.data?.request)
const email = ref('')
const loading = ref(false)
const emailError = ref('')
const maxQuantity = ref(1)
const userSelectedQuantity = ref(1);

// Paddle 配置
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_4b257319dff941c8459510c962c'

const PADDLE_PRICE_ITEM = import.meta.env.VITE_PADDLE_PRICE_ITEM || 'pri_01jyajjjaw2wp1xd872tr5r885'
const PADDLE_PRICE_WHOLE = import.meta.env.VITE_PADDLE_PRICE_WHOLE || 'pri_01jyafqgtrk6jg228s54n9kkx4'

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
        script.async = true
        script.onload = () => {
            window.Paddle.Environment.set("sandbox")
            window.Paddle.Initialize({ 
                token: PADDLE_CLIENT_TOKEN,
                eventCallback: function(data: any) {
                    console.log('Paddle event:', data)
                    if (data.name === 'checkout.completed') {
                        const eventData = data as PaddleCheckoutCompletedEvent;
                        
                        // 现在你可以安全地访问 eventData.data 中的所有属性了
                        console.log(eventData.data.transaction_id);
                        console.log(eventData.data.customer.email);
                        
                        // 支付成功后的逻辑
                        loading.value = false
                        console.log('Payment completed successfully:', data)
                        
                        // 同步给后端
                        const orderData = {
                            transaction_id: eventData.data.transaction_id,
                            customerEmail: eventData.data.customer.email,
                        }

                        // 保存订单信息到store
                        store.setOrder({
                            referenceId: eventData.data.id || `PADDLE_${Date.now()}`,
                            productName: product.value?.productName || 'Product',
                            amount: product.value?.price || 0,
                            paymentSource: 'paddle',
                            paddleOrder: eventData.data

                        })
                        
                        // 强制跳转到成功页面，覆盖Paddle的默认行为
                        // setTimeout(() => {
                        //     window.location.href = '/payment/success'
                        // }, 1000)
                    }
                    if (data.name === 'checkout.closed') {
                        loading.value = false
                        console.log('Checkout closed')
                    }
                    if (data.name === 'checkout.error') {
                        loading.value = false
                        console.error('Checkout error:', data)
                        ElMessageBox.alert('Payment failed. Please try again.', 'Error')
                    }
                    if (data.name === 'checkout.updated') {
                        console.log('Checkout updated:', data)
                    }
                    if (data.name === 'checkout.items.updated') {
                        const items = data.data.items || [];
                        const hasInvalidQuantity = items.some((item: any) => item.quantity > maxQuantity.value);

                        if (hasInvalidQuantity) {
                            if (window.Paddle && window.Paddle.Checkout) {
                                // 由于无法直接更新已打开的结账窗口，
                                // 我们将关闭它，然后以正确的数量重新打开。
                                window.Paddle.Checkout.close();

                                // 告知用户数量已被重置
                                ElMessageBox.alert('You can only purchase one item at a time. The quantity will be reset to 1.', 'Quantity Limit')
                                  .finally(() => {
                                      // 重新打开结账窗口，此时将使用默认数量 1
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
                    priceId: product.value?.isBundle ? PADDLE_PRICE_WHOLE : PADDLE_PRICE_ITEM,
                    quantity: userSelectedQuantity.value,
                },
            ],
            customer: { email: email.value },
            customData: {
                code: request?.value?.purchaseCode,
                accessToken: request?.value?.accounttoken,
                appId: product.value?.appId,
                productName: product.value?.productName,
                productPrice: product.value?.price,
                productIsBundle: product.value?.isBundle,
                productImage: product.value?.imageUrl,
                isBundle: product.value?.isBundle,
                email: email.value,
            },
        })
    } else {
        ElMessageBox.alert('Paddle 加载失败，请刷新页面重试', 'Error')
        loading.value = false
    }
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

.checkout-left {
    flex: 1.2;
    min-width: 340px;
}

.checkout-right {
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

.checkout-right .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    margin-bottom: 12px;
}

.checkout-right .total {
    font-weight: bold;
    font-size: 1.2rem;
}

.input-error-text {
  color: #e63946;
  margin-top: 4px;
  font-size: 0.98rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .checkout-main {
        flex-direction: column;
        gap: 24px;
    }
    
    .checkout-right {
        border-left: none;
        border-top: 2px solid #e5e7eb;
        padding-left: 0;
        padding-top: 24px;
        margin-top: 0;
    }
}
</style>
