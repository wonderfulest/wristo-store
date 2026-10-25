<template>
  <Teleport to="body">
    <div class="floating-actions" v-show="visible">
      <!-- <a
        class="fab-btn fab-youtube"
        href="https://www.youtube.com/@wristoio"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Wristo on YouTube"
        title="Wristo on YouTube"
      >
        <Icon class="fab-icon fab-icon-solid" icon="mdi:youtube" width="22" height="22" aria-hidden="true" />
      </a> -->
      <button
        v-if="showPageActions && isCartEnabled && cartStore.count"
        class="fab-btn fab-cart"
        type="button"
        @click="openCart"
        :aria-label="t('cart.floatingAria')"
        :title="t('cart.viewCart')"
      >
        <span class="fab-count">{{ cartStore.count > 99 ? '99+' : cartStore.count }}</span>
        <svg class="fab-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 4h2l2.1 10.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.6" />
          <path d="M10 10.5h6" />
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      </button>
      <button
        v-if="showPageActions && scrolled"
        class="fab-btn fab-top"
        type="button"
        @click="handleClick"
        aria-label="Back to top"
        title="Back to top"
      >
        <Icon class="fab-icon" icon="solar:arrow-up-line-duotone" aria-hidden="true" />
      </button>

      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollVisibility } from './useScrollVisibility'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { isCartEnabled } from '@/config/features'

const props = withDefaults(
  defineProps<{
    threshold?: number
    alwaysVisible?: boolean
    showPageActions?: boolean
  }>(),
  {
    threshold: 200,
    alwaysVisible: false,
    showPageActions: true
  }
)

const { visible, scrolled, scrollToTop } = useScrollVisibility(props.threshold, {
  alwaysVisible: props.alwaysVisible
})
const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const openCart = () => {
  if (!isCartEnabled) return
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
  z-index: var(--layer-floating-actions);

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
  border: 1px solid rgba(11, 116, 109, 0.22);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  color: var(--color-brand-strong);

  cursor: pointer;
  box-shadow: var(--surface-raised);

  transition:
    transform var(--motion-fast) ease,
    box-shadow var(--motion-fast) ease,
    opacity var(--motion-fast) ease,
    background var(--motion-fast) ease,
    border-color var(--motion-fast) ease;
}

.fab-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(11, 116, 109, 0.42);
  background: var(--color-brand);
  color: #fff;
  box-shadow:
    0 20px 44px rgba(19, 32, 31, 0.16),
    0 12px 26px rgba(11, 116, 109, 0.24);
}

.fab-btn:active {
  transform: translateY(0);
  box-shadow:
    0 10px 24px rgba(19, 32, 31, 0.12),
    0 6px 14px rgba(11, 116, 109, 0.18);
}

.fab-btn:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
  box-shadow:
    var(--surface-raised),
    var(--focus-ring);
}

.fab-icon {
  width: 22px;
  height: 22px;
}

.fab-icon-solid {
  width: 22px;
  height: 22px;
  fill: currentColor;
  stroke: none;
}

.fab-cart {
  width: 56px;
  height: 56px;
  align-self: center;
  background: linear-gradient(145deg, #16877e, var(--color-brand) 58%, #075b56);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 6px 16px rgba(7, 91, 86, 0.2),
    0 2px 4px rgba(7, 91, 86, 0.1);
}

.fab-cart-icon {
  width: 27px;
  height: 27px;
}

.fab-cart:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .fab-cart {
    transition: none;
  }
}

.fab-cart:hover {
  background: var(--color-brand-strong);
  color: #fff;
}

.fab-youtube:hover {
  border-color: rgba(190, 18, 60, 0.45);
  background: #d6002f;
  color: #fff;
  box-shadow:
    0 20px 44px rgba(17, 24, 39, 0.16),
    0 12px 28px rgba(255, 0, 51, 0.3);
}

.fab-youtube {
  color: #fff;
  border-color: rgba(255, 0, 51, 0.34);
  background: #ff0033;
  box-shadow:
    0 16px 34px rgba(17, 24, 39, 0.12),
    0 8px 22px rgba(255, 0, 51, 0.18);
}

.fab-count {
  position: absolute;
  top: -4px;
  right: -4px;
  box-sizing: border-box;
  min-width: 23px;
  height: 23px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f4bd59;
  color: #49300d;
  box-shadow: 0 2px 5px rgba(73, 48, 13, 0.14);
  border: 2px solid var(--color-surface);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

@media (min-width: 768px) {
  .floating-actions {
    right: 24px;
    bottom: 172px;
  }
}

@media (max-width: 767px) {
  .floating-actions {
    right: 14px;
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  }

  .fab-cart {
    display: none;
  }
}
</style>
