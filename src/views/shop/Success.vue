<template>
    <div class="success">
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h2 class="success-title">Payment Successful</h2>
            <p class="success-message">Thank you for your purchase!</p>
            <div class="order-info">
                <div class="info-row">
                    <span>Order ID:</span>
                    <span>{{ referenceId || 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span>Product:</span>
                    <span>{{ productName || 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span>Amount:</span>
                    <span>{{ formatCurrency(amount, currencyCode) }}</span>
                </div>
                <div class="info-row">
                    <span>Payment Method:</span>
                    <span>Paddle</span>
                </div>
            </div>
            <!-- 未登录用户的注册引导 -->
            <div v-if="!isLoggedIn" class="registration-guide">
                <div class="guide-icon">🎉</div>
                <h3 class="guide-title">Create Your Account</h3>
                <p class="guide-message">
                    Register now to manage your purchases, track your orders, and get exclusive access to new watch faces!
                </p>
                <div class="guide-benefits">
                    <div class="benefit-item">
                        <span class="benefit-icon">✓</span>
                        <span>Manage all your purchases</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">✓</span>
                        <span>Track order history</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">✓</span>
                        <span>Get early access to new releases</span>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="home-btn" @click="goHome">Return to Home</button>
                <template v-if="!isLoggedIn">
                    <button class="register-btn" @click="goToRegister">Create Account</button>
                    <button class="login-btn" @click="goToLogin">Sign In</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
import { useUserStore } from '@/store/user'
// import Logo from '@/components/Logo.vue'

const router = useRouter()
const store = useShopOptionsStore()
const userStore = useUserStore()
const order = computed(() => store.order)
const referenceId = computed(() => order.value?.referenceId)
const productName = computed(() => order.value?.productName)
const amount = computed(() => order.value?.amount)
const currencyCode = computed(() => order.value?.currencyCode || 'USD')

// 检查用户登录状态
const isLoggedIn = computed(() => {
  return userStore.token && userStore.userInfo
})

const formatAmount = (amount: string | number) => {
    if (!amount) return '0.00'
    const numAmount = Number(amount) / 100.0
    return numAmount.toFixed(2)
}

const formatCurrency = (amount: string | number, currency: string = 'USD') => {
    if (!amount) return `${getCurrencySymbol(currency)} 0.00`
    const formattedAmount = formatAmount(amount)
    return `${getCurrencySymbol(currency)} ${formattedAmount}`
}

const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'CAD': 'C$',
        'AUD': 'A$'
    }
    return symbols[currency] || currency
}

onMounted(() => {
    console.log('Success page mounted, order data:', order.value)
    
    // 如果没有订单数据，重定向到首页
    if (!order.value) {
        console.warn('No order data found, redirecting to home')
        router.push('/')
    }
})

function goHome() {
    store.reset()
    router.push('/')
}

function goToRegister() {
    const ssoBaseUrl = import.meta.env.VITE_SSO_SIGNUP_URL
    const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
    window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}&mode=signup`
}

function goToLogin() {
    const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
    const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
    window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`
}
</script>

<style scoped>
.success {
    width: 680px;
    margin: 0 auto;
    padding: 32px 16px;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
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
    width: 680px;
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

.registration-guide {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
    border: 2px solid #e3f2fd;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    text-align: center;
}

.guide-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.guide-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.guide-message {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 24px;
    line-height: 1.6;
}

.guide-benefits {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
    max-width: 400px;
    margin: 0 auto;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1rem;
    color: #333;
}

.benefit-icon {
    width: 20px;
    height: 20px;
    background: #4caf50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.home-btn {
    background: #6c757d;
    color: #fff;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 12px 32px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.home-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
}

.register-btn {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: #fff;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 12px 32px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.register-btn:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.login-btn {
    background: #fff;
    color: #007bff;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 12px 32px;
    border-radius: 12px;
    border: 2px solid #007bff;
    cursor: pointer;
    transition: all 0.2s;
}

.login-btn:hover {
    background: #007bff;
    color: #fff;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .home-btn,
    .register-btn,
    .login-btn {
        width: 100%;
        max-width: 280px;
    }
}
</style> 