<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import {
  GARMIN_INSTALL_REQUEST_EVENT,
  isAllowedGarminStoreUrl,
  type GarminStoreBridgeParams,
} from '@/utils/garminStore'

const { t } = useI18n()
const request = ref<GarminStoreBridgeParams | null>(null)

const handleRequest = (event: Event) => {
  const detail = (event as CustomEvent<GarminStoreBridgeParams>).detail
  if (!detail || !isAllowedGarminStoreUrl(detail.url)) return
  request.value = detail
}

const close = () => {
  request.value = null
}

const continueInstall = () => {
  const url = request.value?.url
  if (!url || !isAllowedGarminStoreUrl(url)) return
  window.open(url, '_blank', 'noopener,noreferrer')
  close()
}

onMounted(() => window.addEventListener(GARMIN_INSTALL_REQUEST_EVENT, handleRequest))
onBeforeUnmount(() => window.removeEventListener(GARMIN_INSTALL_REQUEST_EVENT, handleRequest))
</script>

<template>
  <Transition name="garmin-install-prompt">
    <div v-if="request" class="prompt-backdrop" role="presentation" @click.self="close">
      <section
        class="prompt-sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="t('garminInstall.title')"
      >
        <div class="prompt-handle" aria-hidden="true"></div>
        <p class="prompt-eyebrow">Garmin Connect IQ</p>
        <h2>{{ t('garminInstall.title') }}</h2>
        <p>{{ t('garminInstall.message') }}</p>
        <div class="prompt-actions">
          <button type="button" class="prompt-cancel" @click="close">
            {{ t('garminInstall.cancel') }}
          </button>
          <button type="button" class="prompt-continue" @click="continueInstall">
            {{ t('garminInstall.continue') }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.prompt-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  background: rgba(8, 24, 23, 0.46);
}

.prompt-sheet {
  width: 100%;
  padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 -16px 48px rgba(8, 24, 23, 0.16);
  color: #123331;
}

.prompt-handle {
  width: 40px;
  height: 4px;
  margin: 0 auto 20px;
  border-radius: 999px;
  background: #d5dfdc;
}

.prompt-eyebrow {
  margin: 0 0 6px;
  color: #0f6b68;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0 0 8px;
  font-size: 21px;
}

.prompt-sheet > p:last-of-type {
  margin: 0;
  color: #526966;
  line-height: 1.55;
}

.prompt-actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  margin-top: 22px;
}

.prompt-actions button {
  min-height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
}

.prompt-cancel {
  border: 1px solid #d7e1df;
  background: #fff;
  color: #36514e;
}

.prompt-continue {
  border: 1px solid #0f6b68;
  background: #0f6b68;
  color: #fff;
}

.garmin-install-prompt-enter-active,
.garmin-install-prompt-leave-active {
  transition: opacity 180ms ease;
}

.garmin-install-prompt-enter-active .prompt-sheet,
.garmin-install-prompt-leave-active .prompt-sheet {
  transition: transform 180ms ease;
}

.garmin-install-prompt-enter-from,
.garmin-install-prompt-leave-to {
  opacity: 0;
}

.garmin-install-prompt-enter-from .prompt-sheet,
.garmin-install-prompt-leave-to .prompt-sheet {
  transform: translateY(100%);
}

@media (min-width: 901px) {
  .prompt-backdrop {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .garmin-install-prompt-enter-active,
  .garmin-install-prompt-leave-active,
  .garmin-install-prompt-enter-active .prompt-sheet,
  .garmin-install-prompt-leave-active .prompt-sheet {
    transition: none;
  }
}
</style>
