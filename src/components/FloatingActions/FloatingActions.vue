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
        <span class="fab-count">{{ cartStore.count }}</span>
        <el-icon class="fab-icon"><ShoppingCart /></el-icon>
      </button>
      <button
        v-if="showPageActions && scrolled"
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
// import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { isCartEnabled } from '@/config/features'
import { ShoppingCart } from '@element-plus/icons-vue'

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

.fab-icon-solid {
  width: 22px;
  height: 22px;
  fill: currentColor;
  stroke: none;
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
    bottom: 172px;
  }
}

@media (max-width: 767px) {
  .floating-actions {
    right: 14px;
    bottom: calc(172px + env(safe-area-inset-bottom, 0px));
    flex-direction: row;
    gap: 8px;
  }

  .fab-btn {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 520px) {
  .floating-actions {
    bottom: calc(168px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
