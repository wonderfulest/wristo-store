<template>
  <Teleport to="body">
    <div class="floating-actions" v-show="visible">
      <button
        class="fab-btn fab-top"
        type="button"
        @click="handleClick"
        aria-label="Back to top"
      >
        Top
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

  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid rgba(0, 122, 255, 0.25);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    135deg,
    rgba(0, 122, 255, 0.96),
    rgba(64, 156, 255, 0.92)
  );

  color: #fff;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.4px;
  text-transform: uppercase;

  cursor: pointer;
  box-shadow:
    0 18px 42px rgba(0, 122, 255, 0.26),
    0 12px 28px rgba(15, 23, 42, 0.14);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.fab-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 22px 52px rgba(0, 122, 255, 0.32),
    0 16px 32px rgba(15, 23, 42, 0.20);
}

.fab-btn:active {
  transform: scale(0.96) translateY(0);
  box-shadow:
    0 12px 32px rgba(0, 122, 255, 0.22),
    0 8px 18px rgba(15, 23, 42, 0.18);
}

.fab-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: 2px;
  box-shadow:
    0 0 0 3px rgba(0, 122, 255, 0.35),
    0 18px 42px rgba(0, 122, 255, 0.26),
    0 12px 28px rgba(15, 23, 42, 0.14);
}

@media (min-width: 768px) {
  .floating-actions {
    right: 24px;
    bottom: 48px;
  }
}
</style>
