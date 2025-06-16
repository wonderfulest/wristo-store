<template>
    <div class="checkout">
        <Logo />
        <h2 class="title">Secure Checkout</h2>
        <div class="checkout-main">
            <div class="checkout-left">
                <label class="input-label">Email for receipt</label>
                <input v-model="email" class="input" placeholder="" />
                <div class="input-desc">Only used for sending receipt.</div>
                <div v-if="emailError" class="input-error-text">{{ emailError }}</div>
                <div class="pay-method-title">Payment Method</div>
                <div class="pay-method-note">
                    Note: Paying with Credit/Debit cards has a $0.30 processing fee.
                    <!-- Apple Pay, Google Pay or  -->
                </div>
                <div class="pay-methods">
                    <label class="pay-radio">
                        <input type="radio" v-model="payMethod" value="paypal" />
                        <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                            style="height: 24px;vertical-align: middle;margin-right: 4px;" />
                        <span style="font-weight:bold;color:#253b80;">PayPal</span>
                    </label>
                    <label class="pay-radio">
                        <input type="radio" v-model="payMethod" value="card" />
                        <span style="font-weight:bold;">Credit/Debit Card</span>
                        <span v-if="payMethod === 'card'" style="color: #666; margin-left: 8px;">+$0.30 processing
                            fee</span>
                    </label>
                </div>
                <div id="paypal-button-container" style="margin-top:24px;"></div>
                <!-- <button class="purchase-btn" @click="onPurchase">Continue with Purchase</button> -->
                <div id="result-message" style="margin-top:16px;color:#e63946;"></div>
            </div>
            <div class="checkout-right">
                <div class="summary-row">
                    <span>{{ product?.productName || 'Product' }}</span>
                    <span>${{ product?.price || '0.00' }}</span>
                </div>
                <div v-if="payMethod === 'card'" class="summary-row">
                    <span>Processing Fee</span>
                    <span>$0.30</span>
                </div>
                <hr />
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${{ priceTotal.toFixed(2) }}</span>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { createPaypalOrder, capturePaypalOrder } from '@/api/pay'
import { BizErrorCode } from '@/constant/errorCode'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import Footer from '@/components/Footer.vue'

declare global {
  interface Window {
    paypal?: any
  }
}

const router = useRouter()
const store = useShopOptionsStore()
const product = computed(() => store.selectedProduct)

const email = ref('')
const payMethod = ref('paypal')
const emailError = ref('')

const priceTotal = computed(() => {
    if (!product.value?.price) return 0
    if (payMethod.value === 'card') {
        return Number(product.value.price) + 0.30
    }
    return Number(product.value.price)
})

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

const request = computed(() => store.data.request)

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

onBeforeMount(() => {
    console.log('store.data', store.data)
    if (!store.data || !store.selectedProduct) {
        router.push('/')
        return
    }
    email.value = store.data.email || ''
    payMethod.value = store.data.payMethod || 'paypal'
})

onMounted(() => {
    if (!(window as any).paypal) {
        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
        script.onload = loadPaypal
        document.body.appendChild(script)
    } else {
        loadPaypal()
    }
})

function loadPaypal() {
    if (!(window as any).paypal) return
    (window as any).paypal.Buttons({
        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
        },
        async createOrder(data: any, actions: any) {
            if (!email.value) {
                emailError.value = 'We need your email to send receipt.'
                throw new Error(emailError.value)
            }
            if (!validateEmail(email.value)) {
                emailError.value = 'Please enter a valid email address'
                throw new Error(emailError.value)
            }
            emailError.value = ''
            console.log('fundingSource', data)
            const paymentSource = data.paymentSource
            payMethod.value = data.paymentSource
            // const  console.log('用户选择的支付方式:', data.fundingSource); // 'paypal' 或 'card'
            console.log('create order', data, actions, request.value)
            // 这里可以传递 product 信息
            const orderData = await createPaypalOrder({
                ...request.value,
                paymentSource,
                email: email.value,
                price: priceTotal.value,
            })
            console.log('create order', orderData)
            if (orderData.code !== BizErrorCode.SUCCESS) {
                ElMessageBox.alert(orderData.message || 'Order create failed', 'Error')
                throw new Error(orderData.message || 'Order create failed')
            }
            return orderData.data.id
        },
        async onApprove(data: any, actions: any) {
            console.log('onApprove', data, actions)
            const orderData = await capturePaypalOrder(data.orderID)
            console.log('capture order', orderData)
            if (orderData.code !== BizErrorCode.SUCCESS) {
                ElMessageBox.alert(orderData.message || 'Order create failed', 'Error')
                throw new Error(orderData.message || 'Order create failed')
            }
            store.order = orderData.data
            router.push('/shop/success')
        }
    }).render('#paypal-button-container')
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
    margin-bottom: 12px;
}

.pay-methods {
    margin-bottom: 24px;
}

.pay-radio {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    margin-bottom: 12px;
    gap: 8px;
}

.purchase-btn {
    width: 100%;
    background: #000;
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 18px 0;
    border-radius: 32px;
    border: none;
    margin-top: 24px;
    cursor: pointer;
    transition: background 0.2s;
}

.purchase-btn:hover {
    background: #374151;
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

footer {
    margin-top: 48px;
    color: #888;
    font-size: 0.98rem;
    text-align: center;
}

footer a {
    color: #888;
    text-decoration: underline;
    margin: 0 4px;
}

.input-error-text {
  color: #e63946;
  margin-top: 4px;
  font-size: 0.98rem;
}
</style>
