<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import GarminInstallationSteps from '@/components/GarminInstallationSteps.vue'
import {
  GARMIN_INSTALL_REQUEST_EVENT,
  isAllowedGarminStoreUrl,
  type GarminStoreBridgeParams,
} from '@/utils/garminStore'

const { t } = useI18n()
const router = useRouter()
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
}

const finishInstall = () => {
  close()
  router.push('/activate')
}

const openHelp = () => {
  close()
  router.push('/support/install-sync')
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
        <button type="button" class="prompt-close" :aria-label="t('garminInstall.cancel')" @click="close">×</button>
        <GarminInstallationSteps
          compact
          show-open-action
          @open="continueInstall"
          @installed="finishInstall"
          @trouble="openHelp"
        />
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
  position: relative;
}

.prompt-handle {
  width: 40px;
  height: 4px;
  margin: 0 auto 20px;
  border-radius: 999px;
  background: #d5dfdc;
}

.prompt-close {
  position: absolute;
  z-index: 1;
  top: 20px;
  right: 28px;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: #526966;
  font-size: 28px;
  cursor: pointer;
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
