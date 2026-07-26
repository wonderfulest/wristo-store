<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import {
  dismissChinaSitePrompt,
  getChinaSiteDestination,
  shouldShowChinaSitePrompt,
} from '@/utils/chinaSitePrompt'

const { t } = useI18n()
const visible = ref(false)
const destination = computed(() => getChinaSiteDestination(window.location.pathname))

const browserStorage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const continueOnWristo = () => {
  dismissChinaSitePrompt(browserStorage())
  visible.value = false
}

const visitChinaSite = () => {
  window.location.assign(destination.value)
}

onMounted(async () => {
  visible.value = await shouldShowChinaSitePrompt({
    storage: browserStorage(),
  })
})
</script>

<template>
  <aside
    v-if="visible"
    class="china-site-prompt"
    aria-live="polite"
    :aria-label="t('chinaSitePrompt.message')"
  >
    <div class="china-site-prompt__inner">
      <p>{{ t('chinaSitePrompt.message') }}</p>
      <div class="china-site-prompt__actions">
        <button
          class="china-site-prompt__visit"
          type="button"
          @click="visitChinaSite"
        >
          {{ t('chinaSitePrompt.visit') }}
        </button>
        <button
          class="china-site-prompt__continue"
          type="button"
          @click="continueOnWristo"
        >
          {{ t('chinaSitePrompt.continue') }}
        </button>
        <button
          class="china-site-prompt__close"
          type="button"
          :aria-label="t('chinaSitePrompt.close')"
          @click="continueOnWristo"
        >
          ×
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.china-site-prompt {
  position: relative;
  z-index: calc(var(--layer-header) + 1);
  border-bottom: 1px solid rgba(216, 239, 234, 0.22);
  background: var(--color-brand-strong);
  color: #fff;
}

.china-site-prompt__inner {
  width: min(100%, var(--container-wide));
  min-height: 52px;
  margin: 0 auto;
  padding: 8px var(--page-gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.china-site-prompt p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

.china-site-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.china-site-prompt button {
  min-height: 36px;
  padding: 0 13px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.china-site-prompt__visit {
  border: 1px solid #fff;
  background: #fff;
  color: var(--color-brand-strong);
}

.china-site-prompt__continue,
.china-site-prompt__close {
  border: 1px solid rgba(255, 255, 255, 0.44);
  background: transparent;
  color: #fff;
}

.china-site-prompt__close {
  width: 36px;
  padding: 0;
  font-size: 1.2rem;
}

.china-site-prompt button:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.42);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  .china-site-prompt__inner {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    padding-block: 10px;
  }

  .china-site-prompt__actions {
    flex-wrap: wrap;
  }

  .china-site-prompt__visit,
  .china-site-prompt__continue {
    flex: 1 1 auto;
  }
}
</style>
