<template>
    <div class="success">
        <Logo />
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h2 class="success-title">Payment Successful</h2>
            <p class="success-message">Thank you for your purchase!</p>
            <div class="order-info">
                <div class="info-row">
                    <span>Order ID:</span>
                    <span>{{ referenceId }}</span>
                </div>
                <div class="info-row">
                    <span>Product:</span>
                    <span>{{ productName }}</span>
                </div>
                <div class="info-row">
                    <span>Amount:</span>
                    <span>${{ amount }}</span>
                </div>
                <div class="info-row">
                    <span>Payment Method:</span>
                    <span>{{ paymentSource === 'paypal' ? 'PayPal' : 'Credit Card' }}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="home-btn" @click="goHome">Return to Home</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
import Logo from '@/components/Logo.vue'

const router = useRouter()
const store = useShopOptionsStore()
const order = computed(() => store.order)
const referenceId = computed(() => order.value?.referenceId)
const productName = computed(() => order.value?.productName)

const paymentSource = computed(() => order.value?.paymentSource)
const paypalOrder = computed(() => order.value?.paypalOrder)
const amount = computed(() => {
    // 检查 paypalOrder 是否存在
    if (!paypalOrder.value) {
        return order.value?.amount
    }

    // 检查 purchase_units 是否存在
    if (!paypalOrder.value.purchase_units?.[0]) {
        return order.value?.amount
    }

    // 检查 payments 和 captures 是否存在
    const capture = paypalOrder.value.purchase_units[0].payments?.captures?.[0]
    if (!capture) {
        return order.value?.amount
    }

    // 返回 PayPal 捕获的金额或订单金额
    return capture.amount?.value || order.value?.amount
})

function goHome() {
    store.reset()
    router.push('/')
}
</script>

<style scoped>
.success {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 16px;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

.logo {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
}

.logo span {
    color: #6fcf97;
}

.success-content {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.success-icon {
    width: 64px;
    height: 64px;
    background: #6fcf97;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: white;
    font-size: 32px;
    font-weight: bold;
}

.success-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 16px;
    color: #1a1a1a;
}

.success-message {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 32px;
}

.order-info {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
    text-align: left;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 1.2rem;
}

.info-row:last-child {
    margin-bottom: 0;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.home-btn {
    background: #000;
    color: #fff;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 12px 32px;
    border-radius: 32px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
}

.home-btn:hover {
    background: #374151;
}
</style> 