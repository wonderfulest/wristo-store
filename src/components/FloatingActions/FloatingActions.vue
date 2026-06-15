<template>
  <Teleport to="body">
    <div class="floating-actions" v-show="visible">
      <button
        v-if="cartStore.count"
        class="fab-btn fab-cart"
        type="button"
        @click="openCart"
        :aria-label="t('cart.floatingAria')"
        :title="t('cart.viewCart')"
      >
        <span class="fab-count">{{ cartStore.count }}</span>
        <svg
          class="fab-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 7h15l-1.5 8.5H8L6 4H3" />
          <path d="M9 20h.01" />
          <path d="M18 20h.01" />
        </svg>
      </button>
      <button
        class="fab-btn fab-top"
        type="button"
        @click="handleClick"
        aria-label="Back to top"
        title="Back to top"
      >
        <svg
          class="fab-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>

      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollVisibility } from './useScrollVisibility'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'

const props = withDefaults(
  defineProps<{
    threshold?: number
    alwaysVisible?: boolean
  }>(),
  {
    threshold: 200,
    alwaysVisible: false
  }
)

const { visible, scrollToTop } = useScrollVisibility(props.threshold, {
  alwaysVisible: props.alwaysVisible
})
const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const openCart = () => {
  router.push(addLocaleToPath('/user/cart', localeStore.currentLocale))
}

const handleClick = () => {
  console.log('[FloatingActions] Button clicked')
  console.log('[FloatingActions] visible:', visible.value)
  console.log('[FloatingActions] scrollToTop function:', typeof scrollToTop)
  scrollToTop()
}
</script>

<style scoped>
.floating-actions {
  position: fixed;
  right: 16px;
  bottom: 48px;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  gap: 12px;

  pointer-events: none;
}

.fab-btn {
  position: relative;
  pointer-events: auto;

  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.22);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  color: var(--color-brand-strong);

  cursor: pointer;
  box-shadow:
    0 16px 34px rgba(17, 24, 39, 0.12),
    0 8px 18px rgba(15, 107, 104, 0.14);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.fab-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 107, 104, 0.42);
  background: var(--color-brand);
  color: #fff;
  box-shadow:
    0 20px 44px rgba(17, 24, 39, 0.16),
    0 12px 26px rgba(15, 107, 104, 0.24);
}

.fab-btn:active {
  transform: translateY(0);
  box-shadow:
    0 10px 24px rgba(17, 24, 39, 0.12),
    0 6px 14px rgba(15, 107, 104, 0.18);
}

.fab-btn:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.22);
  outline-offset: 3px;
  box-shadow:
    0 16px 34px rgba(17, 24, 39, 0.12),
    0 8px 18px rgba(15, 107, 104, 0.14);
}

.fab-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.fab-cart {
  background: var(--color-brand);
  border-color: rgba(15, 107, 104, 0.42);
  color: #fff;
}

.fab-cart:hover {
  background: var(--color-brand-strong);
  color: #fff;
}

.fab-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #111827;
  border: 2px solid #fff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

@media (min-width: 768px) {
  .floating-actions {
    right: 24px;
    bottom: 48px;
  }
}

@media (max-width: 767px) {
  .floating-actions {
    right: 14px;
    bottom: calc(176px + env(safe-area-inset-bottom, 0px));
  }

  .fab-btn {
    width: 44px;
    height: 44px;
  }
}
</style>
