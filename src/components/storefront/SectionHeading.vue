<script setup lang="ts">
withDefaults(defineProps<{
  kicker?: string
  title: string
  description?: string
  headingLevel?: 1 | 2
}>(), { kicker: '', description: '', headingLevel: 2 })
</script>

<template>
  <header class="section-heading">
    <div class="section-heading__copy">
      <p v-if="kicker" class="section-heading__kicker">{{ kicker }}</p>
      <component :is="`h${headingLevel}`" class="section-heading__title">{{ title }}</component>
      <p v-if="description" class="section-heading__description">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="section-heading__action"><slot name="action" /></div>
  </header>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-6);
}

.section-heading__copy {
  max-width: 760px;
}

.section-heading__kicker {
  margin: 0 0 var(--space-2);
  color: var(--color-brand);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-heading__title {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.025em;
}

.section-heading__description {
  max-width: 650px;
  margin: var(--space-3) 0 0;
  color: var(--color-muted);
  font-size: clamp(0.98rem, 1.5vw, 1.1rem);
  line-height: 1.7;
}

.section-heading__action {
  flex: 0 0 auto;
}

@media (max-width: 600px) {
  .section-heading {
    align-items: start;
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style>
