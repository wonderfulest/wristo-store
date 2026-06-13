<template>
  <main class="garmin-bridge-page">
    <section class="bridge-shell">
      <div class="product-panel">
        <div class="image-frame">
          <img v-if="imageUrl" :src="imageUrl" :alt="productName" />
          <div v-else class="image-fallback">W</div>
        </div>

        <div class="product-copy">
          <p class="eyebrow">Garmin Connect IQ</p>
          <h1>{{ productName }}</h1>
          <p class="summary">
            Use your phone camera or Garmin Connect IQ app to scan the QR code. Wristo keeps
            Garmin installs on mobile first so your watch can sync through the app.
          </p>
        </div>
      </div>

      <div v-if="isValidUrl" class="action-panel">
        <div class="qr-wrap">
          <qrcode-vue :value="garminUrl" :size="164" :level="'M'" class="qr-code" />
        </div>
        <div class="qr-copy">
          <strong>Scan with your phone</strong>
          <span>Opening Garmin in a desktop browser is not recommended.</span>
        </div>
        <div class="actions">
          <button class="secondary-action" type="button" @click="goBack">
            Back to Wristo
          </button>
          <button class="danger-action" type="button" @click="confirmGarminStoreOpen">
            {{ openButtonLabel }}
          </button>
        </div>
        <p v-if="confirmationCount > 0" class="confirmation-note" aria-live="polite">
          Confirmation {{ confirmationCount }} of {{ REQUIRED_CONFIRMATIONS }} complete. Scan the QR code instead unless you specifically need Garmin's website.
        </p>
      </div>

      <div v-else class="action-panel invalid">
        <p>The Garmin Store link is unavailable.</p>
        <button class="secondary-action" type="button" @click="goBack">
          Back to Wristo
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QrcodeVue from 'qrcode.vue'
import { isAllowedGarminStoreUrl } from '@/utils/garminStore'

const route = useRoute()
const router = useRouter()
const REQUIRED_CONFIRMATIONS = 3
const confirmationCount = ref(0)

const queryValue = (value: unknown) => {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

const garminUrl = computed(() => queryValue(route.query.url))
const imageUrl = computed(() => queryValue(route.query.image))
const sourcePath = computed(() => queryValue(route.query.from))
const productName = computed(() => queryValue(route.query.name) || 'Wristo Garmin app')
const isValidUrl = computed(() => isAllowedGarminStoreUrl(garminUrl.value))
const remainingConfirmations = computed(() => REQUIRED_CONFIRMATIONS - confirmationCount.value)
const openButtonLabel = computed(() => {
  if (remainingConfirmations.value <= 1) return 'Final confirm: open Garmin website'
  if (confirmationCount.value === 0) return 'I still want Garmin website'
  return `Confirm again (${remainingConfirmations.value} left)`
})

watch(garminUrl, () => {
  confirmationCount.value = 0
})

const confirmGarminStoreOpen = () => {
  if (!isValidUrl.value) {
    ElMessage.error('Garmin Store link is unavailable')
    return
  }

  confirmationCount.value += 1
  if (confirmationCount.value < REQUIRED_CONFIRMATIONS) {
    ElMessage.warning('Please scan the QR code with your phone for Garmin Connect IQ installation.')
    return
  }

  window.open(garminUrl.value, '_blank', 'noopener,noreferrer')
  confirmationCount.value = 0
}

const goBack = () => {
  if (sourcePath.value && sourcePath.value.startsWith('/')) {
    router.push(sourcePath.value)
    return
  }

  router.push('/')
}
</script>

<style scoped>
.garmin-bridge-page {
  min-height: 100vh;
  padding: 72px 20px 96px;
  background: linear-gradient(180deg, #fbfdfc 0%, #eef4f2 100%);
  color: #123331;
}

.bridge-shell {
  width: min(100%, 960px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 28px;
  align-items: stretch;
}

.product-panel,
.action-panel {
  background: #fff;
  border: 1px solid rgba(18, 51, 49, 0.1);
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(18, 51, 49, 0.08);
}

.product-panel {
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}

.image-frame {
  width: 100%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #f3f7f5;
  overflow: hidden;
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-fallback {
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #0f6b68;
  color: #fff;
  font-size: 36px;
  font-weight: 700;
}

.eyebrow {
  margin: 0 0 8px;
  color: #0f6b68;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
}

h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
  letter-spacing: 0;
}

.summary {
  margin: 18px 0 0;
  max-width: 460px;
  color: #526563;
  font-size: 16px;
  line-height: 1.65;
}

.action-panel {
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.qr-wrap {
  padding: 14px;
  background: #fff;
  border: 1px solid rgba(18, 51, 49, 0.12);
  border-radius: 8px;
}

.qr-code {
  display: block;
}

.qr-copy {
  display: grid;
  gap: 6px;
  text-align: center;
  color: #123331;
}

.qr-copy strong {
  font-size: 18px;
}

.qr-copy span,
.confirmation-note {
  color: #526563;
  font-size: 14px;
  line-height: 1.5;
}

.actions {
  width: 100%;
  display: grid;
  gap: 12px;
}

.primary-action,
.secondary-action,
.danger-action {
  width: 100%;
  min-height: 46px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary-action {
  background: #0f6b68;
  color: #fff;
}

.primary-action:hover {
  background: #0b5855;
}

.secondary-action {
  background: #fff;
  color: #123331;
  border-color: rgba(18, 51, 49, 0.18);
}

.secondary-action:hover {
  background: #f5f8f7;
}

.danger-action {
  background: #fff8f2;
  color: #8a3b13;
  border-color: rgba(138, 59, 19, 0.24);
}

.danger-action:hover {
  background: #ffefe1;
}

.confirmation-note {
  margin: -8px 0 0;
  text-align: center;
}

.invalid {
  color: #8a2f24;
  text-align: center;
}

@media (max-width: 760px) {
  .garmin-bridge-page {
    padding: 32px 16px 64px;
  }

  .bridge-shell,
  .product-panel {
    grid-template-columns: 1fr;
  }

  .product-panel,
  .action-panel {
    padding: 22px;
  }

  .image-frame {
    max-width: 260px;
    margin: 0 auto;
  }
}
</style>
