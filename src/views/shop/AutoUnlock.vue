<template>
  <div class="auto-unlock-container">
    <!-- Header Section -->
    <header class="page-header">
      <div class="header-content">
        <div class="status-indicator">
          <div class="pulse-ring"></div>
          <div class="pulse-dot"></div>
        </div>
        <h1 class="page-title">Automatic Unlock</h1>
        <p class="page-subtitle">Your product access is being processed</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Status Card -->
      <section class="status-section">
        <!-- Subscription Status -->
        <div class="status-card subscription-card" v-if="subscriptionInfo">
          <div class="card-header">
            <div class="status-icon subscription-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            </div>
            <div class="card-title">
              <h2>Active Subscription</h2>
              <span class="status-badge subscription-badge">Premium</span>
            </div>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Plan</span>
                <span class="info-value">{{ subscriptionInfo.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Valid Period</span>
                <span class="info-value">{{ formatDate(subscriptionInfo.startTime) }} - {{ subscriptionInfo.endTime ? formatDate(subscriptionInfo.endTime) : 'Unlimited' }}</span>
              </div>
              <div class="info-item" v-if="subscriptionInfo.isGift">
                <span class="gift-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/>
                    <path d="M2 7h20v5H2z"/>
                    <path d="M12 22V7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                  Gift Subscription
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Purchase Status -->
        <div class="status-card purchase-card" v-if="purchaseInfo && !subscriptionInfo">
          <div class="card-header">
            <div class="status-icon purchase-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div class="card-title">
              <h2>Product Purchased</h2>
              <span class="status-badge purchase-badge">Permanent</span>
            </div>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Product ID</span>
                <span class="info-value">{{ purchaseInfo.appId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Purchase Date</span>
                <span class="info-value">{{ formatDate(purchaseInfo.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Amount</span>
                <span class="info-value">{{ (purchaseInfo.grandTotal / 100).toFixed(2) }} {{ purchaseInfo.currencyCode }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="status-success">{{ purchaseInfo.statusDesc }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Process Steps -->
      <section class="process-section">
        <div class="section-header">
          <h2>Unlock Process</h2>
          <p>Follow these steps to complete the automatic unlock</p>
        </div>
        
        <div class="steps-container">
          <div class="step-item" v-for="(step, index) in steps" :key="index">
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-line" v-if="index < steps.length - 1"></div>
            </div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer Actions -->
    <footer class="page-footer">
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="goToFAQ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          View FAQ
        </button>
        <button class="btn btn-primary" @click="goToHome">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Go to Home
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'

const router = useRouter()
const store = useShopOptionsStore()

const subscriptionInfo = computed(() => store.subscriptionInfo)
const purchaseInfo = computed(() => store.purchaseInfo)

const steps = ref([
  {
    title: 'Automatic Unlock Process Started',
    description: 'Your subscription plan will automatically unlock this product. The process has already begun.'
  },
  {
    title: 'Keep Your Watch Connected',
    description: 'Ensure your watch is connected to the Connect IQ app on your phone. The unlock will be completed within 5 minutes.'
  },
  {
    title: 'Register With Your Subscription Email',
    description: 'For the best membership experience, register using the same email address associated with your subscription.'
  }
])

onMounted(() => {
  // Redirect to home if no subscription or purchase info is available
  if (!subscriptionInfo.value && !purchaseInfo.value) {
    router.push('/')
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const goToHome = () => {
  router.push('/')
}

const goToFAQ = () => {
  router.push('/faq')
}
</script>

<style scoped>
/* Base Styles */
.auto-unlock-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  color: #1d1d1f;
}

/* Header Section */
.page-header {
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.status-indicator {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.pulse-ring {
  width: 60px;
  height: 60px;
  border: 3px solid #007AFF;
  border-radius: 50%;
  animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.pulse-dot {
  width: 20px;
  height: 20px;
  background: #007AFF;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }
  80%, 100% {
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
  }
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6e6e73;
  margin: 0;
  font-weight: 400;
}

/* Main Content */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Status Section */
.status-section {
  margin-bottom: 3rem;
}

.status-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
}

.subscription-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.purchase-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-title {
  flex: 1;
}

.card-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1d1d1f;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.subscription-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.purchase-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-content {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6e6e73;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 600;
  color: #1d1d1f;
  text-align: right;
}

.gift-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #30d158;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-success {
  color: #30d158;
  font-weight: 600;
}

/* Process Section */
.process-section {
  margin-bottom: 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1d1d1f;
}

.section-header p {
  color: #6e6e73;
  margin: 0;
  font-size: 1rem;
}

.steps-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.step-item {
  display: flex;
  position: relative;
  margin-bottom: 2rem;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-indicator {
  position: relative;
  margin-right: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.step-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, #007AFF 0%, #E5E5EA 100%);
  margin-top: 0.5rem;
}

.step-content {
  flex: 1;
  padding-top: 0.25rem;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1d1d1f;
}

.step-content p {
  margin: 0;
  color: #6e6e73;
  line-height: 1.6;
  font-size: 1rem;
}

/* Footer */
.page-footer {
  padding: 2rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  flex: 1;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
  backdrop-filter: blur(20px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 0 1rem;
  }
  
  .status-card,
  .steps-container {
    padding: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>
