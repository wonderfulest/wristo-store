<template>
  <div class="auto-unlock-container">
    <!-- Header Section -->
    <header class="page-header">
      <div class="header-content">
        <!-- Animated Confetti Background -->
        <div class="confetti-container">
          <div class="confetti" v-for="n in 20" :key="n" :style="{ animationDelay: (n * 0.1) + 's' }"></div>
        </div>
        
        <!-- Main Celebration Icon with Animation -->
        <div class="celebration-main-icon">
          <div class="celebration-glow"></div>
          <div class="celebration-icon bounce-animation">
            🎉
          </div>
        </div>
        
        <!-- Floating Celebration Elements -->
        <div class="floating-elements">
          <div class="floating-element star-1">⭐</div>
          <div class="floating-element star-2">✨</div>
          <div class="floating-element star-3">🌟</div>
          <div class="floating-element party-1">🎊</div>
          <div class="floating-element party-2">🎈</div>
        </div>
        
        <h1 class="page-title celebration-title">
          <span class="title-word" style="animation-delay: 0s">Automatic</span>
          <span class="title-word" style="animation-delay: 0.2s">Unlock</span>
        </h1>
        <p class="celebration-subtitle first-line">
          Your watch face will activate automatically within 5 minutes.<br>
          Wait for the circle to close - that's when it unlocks!
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'steps-expanded': showSteps }">
      <!-- Process Steps -->
      <section class="process-section" @click="toggleSteps" :class="{ expanded: showSteps }">
        <div class="section-header-clickable">
          <div class="header-content-wrapper">
            <span class="section-icon">📋</span>
            <div class="header-text">
              <h3>Unlock Process Details</h3>
              <p>{{ showSteps ? 'Click to hide steps' : 'Click to view detailed steps' }}</p>
            </div>
            <svg class="expand-arrow" :class="{ rotated: showSteps }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>
        
        <div class="steps-content" v-show="showSteps">
        <div class="steps-container">
          <div class="step-item" v-for="(step, index) in steps" :key="index" :class="`step-${index + 1}`">
            <div class="step-indicator">
              <div class="step-icon-wrapper">
                <div class="step-icon">
                  <span v-if="index === 0">🚀</span>
                  <span v-else-if="index === 1">⌚</span>
                  <span v-else-if="index === 2">👤</span>
                </div>
                <div class="step-number">{{ index + 1 }}</div>
              </div>
              <div class="step-line" v-if="index < steps.length - 1">
                <div class="step-line-progress"></div>
              </div>
            </div>
            <div class="step-content">
              <div class="step-badge">Step {{ index + 1 }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
        </div>
      </section>
    </main>

    <!-- Footer Actions -->
    <footer class="page-footer">
      <div class="action-buttons">
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

const showSteps = ref(false)

const toggleSteps = () => {
  showSteps.value = !showSteps.value
}

const steps = ref([
  {
    title: 'Automatic Unlock Process Started',
    description: 'Your bundle purchase will automatically unlock this product. The process has already begun and is working in the background.'
  },
  {
    title: 'Keep Your Watch Connected',
    description: 'Ensure your smartwatch is connected to the Connect IQ app on your phone. The unlock will be completed within 5 minutes.'
  },
  {
    title: 'Register With Your Subscription Email',
    description: 'For the best membership experience, register using the same email address associated with your subscription to access all premium features.'
  }
])

onMounted(() => {
  // Redirect to home if no subscription or purchase info is available
  if (!subscriptionInfo.value && !purchaseInfo.value) {
    router.push('/')
  }
})

const goToHome = () => {
  router.push('/')
}

</script>

<style scoped>
/* Base Styles */
.auto-unlock-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  color: #1d1d1f;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Header Section */
.page-header {
  padding: 3rem 2rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Confetti Animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #f0932b, #eb4d4b, #6c5ce7);
  animation: confetti-fall 3s linear infinite;
}

.confetti:nth-child(odd) {
  background: linear-gradient(45deg, #a29bfe, #fd79a8, #fdcb6e, #55a3ff);
  border-radius: 50%;
}

.confetti:nth-child(even) {
  background: linear-gradient(45deg, #00b894, #e17055, #74b9ff, #fd79a8);
  transform: rotate(45deg);
}

.confetti:nth-child(3n) {
  width: 6px;
  height: 6px;
  background: #ffeaa7;
  border-radius: 50%;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Randomly position confetti */
.confetti:nth-child(1) { left: 10%; animation-duration: 3s; }
.confetti:nth-child(2) { left: 20%; animation-duration: 2.5s; animation-delay: 0.2s; }
.confetti:nth-child(3) { left: 30%; animation-duration: 3.5s; animation-delay: 0.4s; }
.confetti:nth-child(4) { left: 40%; animation-duration: 2.8s; animation-delay: 0.6s; }
.confetti:nth-child(5) { left: 50%; animation-duration: 3.2s; animation-delay: 0.8s; }
.confetti:nth-child(6) { left: 60%; animation-duration: 2.7s; animation-delay: 1s; }
.confetti:nth-child(7) { left: 70%; animation-duration: 3.1s; animation-delay: 1.2s; }
.confetti:nth-child(8) { left: 80%; animation-duration: 2.9s; animation-delay: 1.4s; }
.confetti:nth-child(9) { left: 90%; animation-duration: 3.3s; animation-delay: 1.6s; }
.confetti:nth-child(10) { left: 15%; animation-duration: 2.6s; animation-delay: 1.8s; }

/* Main Celebration Icon */
.celebration-main-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.celebration-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 50%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

.celebration-icon {
  font-size: 4rem;
  position: relative;
  z-index: 2;
  display: inline-block;
}

.bounce-animation {
  animation: celebration-bounce 1.5s ease-in-out infinite;
}

@keyframes celebration-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-20px) scale(1.1);
  }
  60% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes glow-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

/* Success Badge */
.success-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #30d158 0%, #28a745 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 20px rgba(48, 209, 88, 0.3);
  margin-bottom: 1.5rem;
  animation: success-slide-in 0.8s ease-out 0.5s both;
}

.success-checkmark {
  font-size: 1.2rem;
  animation: checkmark-pop 0.6s ease-out 1.3s both;
}

@keyframes success-slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  font-size: 1.5rem;
  animation: float-around 4s ease-in-out infinite;
}

.star-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.star-2 {
  top: 30%;
  right: 20%;
  animation-delay: 1s;
}

.star-3 {
  top: 60%;
  left: 10%;
  animation-delay: 2s;
}

.party-1 {
  top: 15%;
  right: 15%;
  animation-delay: 0.5s;
}

.party-2 {
  top: 70%;
  right: 25%;
  animation-delay: 1.5s;
}

@keyframes float-around {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-15px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
    opacity: 1;
  }
}

/* Title Styles */
.celebration-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
  position: relative;
  z-index: 3;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3em;
}

.title-word {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #f9ca24 75%, #f0932b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: word-entrance 0.8s ease-out both, title-rainbow 3s ease-in-out infinite 1s;
  background-size: 200% 200%;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  transform-origin: center bottom;
}

@keyframes word-entrance {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8) rotateX(-90deg);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.05) rotateX(0deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

.subtitle-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.celebration-subtitle {
  font-size: 1.1rem;
  color: #6e6e73;
  margin-top: 32px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.01em;
  line-height: 1.4;
  position: relative;
  z-index: 3;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.celebration-subtitle.first-line {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 122, 255, 0.2);
  animation: subtitle-fade-in 1s ease-out 1s both;
}

.celebration-subtitle.second-line {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%);
  border: 1px solid rgba(0, 122, 255, 0.3);
  color: #007AFF;
  font-weight: 600;
  animation: subtitle-fade-in 1s ease-out 1.3s both;
}

.celebration-subtitle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes title-rainbow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes subtitle-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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
  transition: padding-bottom 0.3s ease;
}

.main-content:not(.steps-expanded) {
  padding-bottom: 3rem;
}

.main-content.steps-expanded {
  padding-bottom: 0;
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
  color: #007AFF;
  background: rgba(0, 122, 255, 0.08);
}

.subscription-icon {
  background: rgba(0, 122, 255, 0.12);
}

.purchase-icon {
  background: rgba(0, 122, 255, 0.12);
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
  color: #fff;
}

.subscription-badge {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
}

.purchase-badge {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
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
  color: #007AFF;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-success {
  color: #30d158;
  font-weight: 600;
}

/* Clickable Section Header */
.section-header-clickable {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.section-header-clickable:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 122, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.process-section.expanded .section-header-clickable {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  border-color: transparent;
}

.process-section.expanded .section-header-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.header-content-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.header-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: inherit;
}

.header-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
  color: inherit;
}

.expand-arrow {
  transition: transform 0.3s ease;
  stroke: currentColor;
  flex-shrink: 0;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

.steps-content {
  animation: steps-slide-down 0.4s ease-out;
}

/* Process Section */
.process-section {
  margin-bottom: 3rem;
  animation: steps-slide-down 0.4s ease-out;
}

@keyframes steps-slide-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: section-fade-in 1s ease-out 0.5s both;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #1d1d1f 0%, #007AFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header p {
  color: #6e6e73;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes section-fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.steps-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.steps-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b 0%, #4ecdc4 33%, #45b7d1 66%, #f9ca24 100%);
  border-radius: 24px 24px 0 0;
}

.step-item {
  display: flex;
  position: relative;
  margin-bottom: 2.5rem;
  animation: step-slide-in 0.8s ease-out both;
}

.step-1 { animation-delay: 0.8s; }
.step-2 { animation-delay: 1.0s; }
.step-3 { animation-delay: 1.2s; }

@keyframes step-slide-in {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-indicator {
  position: relative;
  margin-right: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  animation: icon-glow 2s ease-in-out infinite alternate;
}

.step-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
  border-radius: 22px;
  z-index: -1;
  opacity: 0;
  animation: border-glow 3s ease-in-out infinite;
}

@keyframes icon-glow {
  0% {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    transform: scale(1.02);
  }
}

@keyframes border-glow {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
}

.step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #30d158 0%, #28a745 100%);
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(48, 209, 88, 0.4);
  border: 2px solid white;
}

.step-line {
  width: 3px;
  height: 50px;
  background: linear-gradient(180deg, #E5E5EA 0%, #E5E5EA 100%);
  margin-top: 1rem;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.step-line-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 100%);
  border-radius: 2px;
  animation: line-progress 2s ease-out 1.5s both;
}

@keyframes line-progress {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0%);
  }
}

.step-content {
  flex: 1;
  padding-top: 0.5rem;
}

.step-badge {
  display: inline-block;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #1d1d1f;
  line-height: 1.3;
}

.step-content p {
  margin: 0 0 1rem 0;
  color: #6e6e73;
  line-height: 1.6;
  font-size: 1rem;
}

.step-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #007AFF;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #007AFF;
  border-radius: 50%;
  animation: status-pulse 1.5s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Footer */
.page-footer {
  padding: 2rem 1rem;
  text-align: center;
  margin-top: auto;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
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
  .auto-unlock-container {
    padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
  }
  
  .page-header {
    padding: 2rem 1rem 1.5rem;
  }
  
  .celebration-title {
    font-size: 1.8rem;
    line-height: 1.2;
    margin-bottom: 0.75rem;
    gap: 0.2em;
  }
  
  .title-word {
    font-size: inherit;
  }
  
  .subtitle-container {
    gap: 0.375rem;
  }
  
  .celebration-subtitle {
    font-size: 1rem;
    line-height: 1.5;
    padding: 0.4rem 0.8rem;
  }
  
  .main-content:not(.steps-expanded) {
    padding-bottom: 2rem;
  }
  
  .celebration-icon {
    font-size: 3rem;
  }
  
  .celebration-glow {
    width: 100px;
    height: 100px;
  }
  
  .success-badge {
    font-size: 1rem;
    padding: 0.6rem 1.2rem;
    margin-bottom: 1rem;
  }
  
  .floating-element {
    font-size: 1.2rem;
  }
  
  .confetti {
    width: 8px;
    height: 8px;
  }
  
  .confetti:nth-child(3n) {
    width: 5px;
    height: 5px;
  }
  
  .main-content {
    padding: 0 1rem;
    flex: 1;
  }
  
  .main-content:not(.steps-expanded) {
    padding-bottom: 2rem;
  }
  
  .status-card,
  .steps-container {
    padding: 1.5rem;
  }
  
  .step-indicator {
    margin-right: 1rem;
  }
  
  .step-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    border-radius: 16px;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
  
  .step-content h3 {
    font-size: 1.1rem;
  }
  
  .step-content p {
    font-size: 0.9rem;
  }
  
  .step-line {
    height: 40px;
  }
  
  .section-header-clickable {
    padding: 1rem 1.25rem;
  }
  
  .section-icon {
    font-size: 1.3rem;
  }
  
  .header-text h3 {
    font-size: 1rem;
  }
  
  .header-text p {
    font-size: 0.85rem;
  }
  
  .page-footer {
    padding: 0rem 1rem 5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    max-width: 100%;
  }
  
  .btn {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    min-height: 52px;
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

/* Legacy celebration icon styles - removed */

/* Unify all SVG icon stroke colors to Apple Blue */
.auto-unlock-container svg {
  stroke: #007AFF !important;
}

/* Ensure all button icons are blue regardless of text color */
.action-buttons .btn svg {
  stroke: #007AFF !important;
}
</style>
