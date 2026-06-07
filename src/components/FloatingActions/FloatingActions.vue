<template>
  <Teleport to="body">
    <div class="floating-actions" v-show="visible">
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

@media (min-width: 768px) {
  .floating-actions {
    right: 24px;
    bottom: 48px;
  }
}
</style>
