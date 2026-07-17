<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    priceLabel: string
    primaryLabel: string
    primaryDisabled?: boolean
    secondaryLabel?: string
  }>(),
  {
    primaryDisabled: false,
    secondaryLabel: '',
  },
)

defineEmits<{
  (event: 'primary'): void
  (event: 'secondary'): void
}>()
</script>

<template>
  <div
    v-if="visible"
    class="mobile-product-action-bar"
    role="region"
    :aria-label="primaryLabel"
  >
    <div class="mobile-product-action-bar__price">{{ priceLabel }}</div>
    <button
      v-if="secondaryLabel"
      type="button"
      class="mobile-product-action-bar__secondary"
      @click="$emit('secondary')"
    >
      {{ secondaryLabel }}
    </button>
    <button
      type="button"
      class="mobile-product-action-bar__primary"
      :class="{ 'mobile-product-action-bar__primary--wide': !secondaryLabel }"
      :disabled="primaryDisabled"
      @click="$emit('primary')"
    >
      {{ primaryLabel }}
    </button>
  </div>
</template>

<style scoped>
.mobile-product-action-bar {
  display: none;
}

@media (max-width: 900px) {
  .mobile-product-action-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    display: grid;
    grid-template-columns: minmax(72px, auto) minmax(0, 1fr) minmax(0, 1.35fr);
    align-items: center;
    gap: 8px;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-line);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 -14px 34px rgba(4, 18, 18, 0.12);
    backdrop-filter: blur(18px);
  }

  .mobile-product-action-bar__price {
    min-width: 0;
    overflow: hidden;
    color: var(--color-ink);
    font-size: 1rem;
    font-weight: 850;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-product-action-bar__secondary,
  .mobile-product-action-bar__primary {
    min-width: 0;
    min-height: 48px;
    padding: 0 12px;
    border-radius: 999px;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
  }

  .mobile-product-action-bar__secondary {
    border: 1px solid rgba(15, 107, 104, 0.24);
    color: var(--color-brand-strong);
    background: #fff;
  }

  .mobile-product-action-bar__primary {
    border: 1px solid var(--color-brand);
    color: #fff;
    background: var(--color-brand);
    box-shadow: 0 10px 22px rgba(15, 107, 104, 0.2);
  }

  .mobile-product-action-bar__primary--wide {
    grid-column: 2 / -1;
  }

  .mobile-product-action-bar__secondary:focus-visible,
  .mobile-product-action-bar__primary:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .mobile-product-action-bar__primary:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
}

@media (max-width: 430px) {
  .mobile-product-action-bar {
    grid-template-columns: minmax(62px, auto) minmax(0, 0.9fr) minmax(0, 1.1fr);
    padding-right: 12px;
    padding-left: 12px;
  }

  .mobile-product-action-bar__secondary,
  .mobile-product-action-bar__primary {
    padding-right: 9px;
    padding-left: 9px;
    font-size: 0.82rem;
  }
}
</style>
