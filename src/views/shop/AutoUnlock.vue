<template>
  <div class="auto-unlock-container">
    <main class="auto-unlock-shell">
      <section class="unlock-card" aria-labelledby="auto-unlock-title">
        <div class="status-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <p class="eyebrow">Purchase confirmed</p>
        <h1 id="auto-unlock-title" class="page-title">Automatic unlock is in progress</h1>
        <p class="page-subtitle">
          Keep your watch connected. Most unlocks complete within 5 minutes after the progress circle closes on your device.
        </p>

        <div class="status-panel" aria-label="Unlock status">
          <div>
            <span class="status-label">Estimated time</span>
            <strong>Within 5 minutes</strong>
          </div>
          <div>
            <span class="status-label">Next action</span>
            <strong>Keep Connect IQ open</strong>
          </div>
        </div>

        <ol class="steps-list">
          <li v-for="(step, index) in steps" :key="step.title" class="step-item">
            <span class="step-number">{{ index + 1 }}</span>
            <div class="step-copy">
              <h2>{{ step.title }}</h2>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>

        <button class="primary-action" type="button" @click="goToHome">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>
          Go to Home
        </button>
      </section>
    </main>
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
    title: 'Unlock request received',
    description: 'Your purchase has been matched to this product and the unlock request is now running in the background.'
  },
  {
    title: 'Keep the watch connected',
    description: 'Leave your smartwatch connected to the Connect IQ app until the device-side progress circle closes.'
  },
  {
    title: 'Use the same email later',
    description: 'For account access and future membership features, register with the email used for this purchase.'
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
.auto-unlock-container {
  min-height: 100dvh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%),
    radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.16), transparent 32%);
  color: #171717;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

.auto-unlock-shell {
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 56px 20px calc(56px + env(safe-area-inset-bottom));
}

.unlock-card {
  position: relative;
  overflow: hidden;
  padding: 36px;
  border: 1px solid rgba(23, 23, 23, 0.10);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.90)),
    radial-gradient(circle at 88% 12%, rgba(212, 175, 55, 0.22), transparent 28%);
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.10),
    0 4px 18px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.unlock-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.58), transparent 24%, transparent 76%, rgba(255, 255, 255, 0.38));
}

.unlock-card > * {
  position: relative;
  z-index: 1;
}

.status-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, #171717 0%, #2f2a20 55%, #8a6d1d 100%);
  color: #fff;
  box-shadow: 0 18px 36px rgba(23, 23, 23, 0.18);
}

.status-mark svg,
.primary-action svg {
  width: 24px;
  height: 24px;
}

.status-mark path,
.primary-action path {
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7c5f12;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  max-width: 620px;
  margin: 0;
  color: #171717;
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 850;
  line-height: 1.06;
}

.page-subtitle {
  max-width: 620px;
  margin: 18px 0 0;
  color: #57534e;
  font-size: 1.08rem;
  line-height: 1.65;
}

.status-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 28px 0;
}

.status-panel > div {
  padding: 16px;
  border: 1px solid rgba(23, 23, 23, 0.08);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.78);
}

.status-label {
  display: block;
  margin-bottom: 6px;
  color: #78716c;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-panel strong {
  display: block;
  color: #171717;
  font-size: 1rem;
  line-height: 1.35;
}

.steps-list {
  display: grid;
  gap: 14px;
  margin: 0 0 28px;
  padding: 0;
  list-style: none;
}

.step-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(23, 23, 23, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.18);
  color: #7c5f12;
  font-weight: 850;
}

.step-copy h2 {
  margin: 0 0 6px;
  color: #171717;
  font-size: 1rem;
  line-height: 1.35;
}

.step-copy p {
  margin: 0;
  color: #57534e;
  font-size: 0.95rem;
  line-height: 1.55;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 16px 22px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #171717 0%, #2f2a20 55%, #8a6d1d 100%);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease;
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.22);
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 56px rgba(23, 23, 23, 0.26);
}

.primary-action:active {
  transform: translateY(0);
}

.primary-action:focus-visible {
  outline: 3px solid rgba(212, 175, 55, 0.42);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .auto-unlock-shell {
    padding: 24px 14px calc(120px + env(safe-area-inset-bottom));
  }

  .unlock-card {
    padding: 24px 16px;
    border-radius: 20px;
  }

  .status-mark {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .status-panel {
    grid-template-columns: 1fr;
  }

  .step-item {
    grid-template-columns: 32px 1fr;
    gap: 12px;
    padding: 14px;
  }

  .step-number {
    width: 32px;
    height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .primary-action {
    transition: none;
  }
}
</style>
