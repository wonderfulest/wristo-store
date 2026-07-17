<template>
  <button class="series-card" type="button" @click="emit('select', series)">
    <span class="series-card__art">
      <img v-if="series.image" :src="series.image" :alt="series.name" loading="lazy" />
      <span v-else class="series-card__fallback" aria-hidden="true">{{ series.name.charAt(0) }}</span>
      <span class="series-card__number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
    </span>
    <span class="series-card__body">
      <strong>{{ series.name }}</strong>
      <span v-if="series.publicTagline" class="series-card__tagline">{{ series.publicTagline }}</span>
      <span v-if="series.appCount != null" class="series-card__count">{{ series.appCount }} apps</span>
    </span>
    <span class="series-card__arrow" aria-hidden="true">&#8599;</span>
  </button>
</template>

<script setup lang="ts">
import type { Series } from '@/types'

defineProps<{
  series: Series & { publicTagline?: string }
  index: number
}>()

const emit = defineEmits<{
  (event: 'select', series: Series): void
}>()
</script>

<style scoped>
.series-card {
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 0 0 var(--space-5);
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-ink);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  text-align: left;
}

.series-card:hover,
.series-card:focus-visible {
  border-color: color-mix(in srgb, var(--series-accent) 48%, transparent);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.series-card__art {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background:
    radial-gradient(circle at 55% 44%, color-mix(in srgb, var(--series-accent) 42%, white), transparent 44%),
    color-mix(in srgb, var(--series-accent) 16%, var(--color-stage));
}

.series-card__art img {
  width: 76%;
  height: 76%;
  object-fit: contain;
  filter: drop-shadow(0 18px 20px rgba(7, 35, 33, 0.24));
  transition: transform var(--motion-base) ease;
}

.series-card:hover .series-card__art img {
  transform: scale(1.04);
}

.series-card__fallback {
  color: rgba(255, 255, 255, 0.88);
  font-family: var(--font-display);
  font-size: clamp(4rem, 9vw, 7rem);
}

.series-card__number {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  color: rgba(255, 255, 255, 0.62);
  font-family: var(--font-display);
  font-size: 1rem;
}

.series-card__body {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-5) 0;
}

.series-card__body strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.series-card__tagline {
  color: var(--color-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.series-card__count {
  color: var(--color-subtle);
  font-size: 0.78rem;
  font-weight: 700;
}

.series-card__arrow {
  position: absolute;
  right: var(--space-5);
  bottom: var(--space-5);
  color: var(--series-accent);
  font-size: 1.25rem;
}
</style>
