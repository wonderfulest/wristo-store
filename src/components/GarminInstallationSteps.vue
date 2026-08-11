<script setup lang="ts">
import { useI18n } from '@/i18n'

withDefaults(defineProps<{
  showOpenAction?: boolean
  compact?: boolean
}>(), {
  showOpenAction: false,
  compact: false,
})

defineEmits<{
  (event: 'open'): void
  (event: 'installed'): void
  (event: 'trouble'): void
}>()

const { t } = useI18n()
const steps = [
  'installationSteps.purchased',
  'installationSteps.openConnectIq',
  'installationSteps.tapInstall',
  'installationSteps.waitForSync',
  'installationSteps.selectWatchFace',
] as const
</script>

<template>
  <section class="installation-card" :class="{ 'installation-card--compact': compact }" :aria-label="t('installationSteps.title')">
    <div class="installation-heading">
      <p>{{ t('installationSteps.eyebrow') }}</p>
      <h2>{{ t('installationSteps.title') }}</h2>
      <span>{{ t('installationSteps.description') }}</span>
    </div>

    <ol class="installation-list">
      <li v-for="(step, index) in steps" :key="step">
        <span class="step-number" aria-hidden="true">{{ index + 1 }}</span>
        <span>{{ t(step) }}</span>
      </li>
    </ol>

    <button v-if="showOpenAction" type="button" class="open-action" @click="$emit('open')">
      {{ t('installationSteps.openAction') }}
    </button>

    <div class="completion-step" :aria-label="t('installationSteps.completionAria')">
      <span class="step-number" aria-hidden="true">6</span>
      <div class="completion-actions">
        <button type="button" class="installed-action" @click="$emit('installed')">
          {{ t('installationSteps.installed') }}
        </button>
        <button type="button" class="trouble-action" @click="$emit('trouble')">
          {{ t('installationSteps.trouble') }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.installation-card {
  padding: 22px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(237, 249, 246, 0.94), rgba(255, 255, 255, 0.98));
  color: #123331;
}

.installation-heading p {
  margin: 0 0 6px;
  color: #0f6b68;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.installation-heading h2 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.25;
}

.installation-heading span {
  display: block;
  margin-top: 7px;
  color: #526966;
  line-height: 1.5;
}

.installation-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.installation-list li {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #36514e;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.35;
}

.step-number {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: #0f6b68;
  color: #fff;
  font-size: 0.75rem;
}

.open-action,
.installed-action,
.trouble-action {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

.open-action {
  width: 100%;
  margin-top: 18px;
  border: 1px solid #0f6b68;
  background: #0f6b68;
  color: #fff;
}

.completion-step {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.completion-actions {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 10px;
}

.installed-action {
  border: 1px solid #0f6b68;
  background: #fff;
  color: #0f6b68;
}

.trouble-action {
  border: 1px solid #d7e1df;
  background: transparent;
  color: #526966;
}

.installation-card--compact {
  padding: 18px;
}

.installation-card--compact .installation-list {
  grid-template-columns: 1fr;
  margin-top: 16px;
}

@media (max-width: 760px) {
  .installation-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .completion-actions {
    grid-template-columns: 1fr;
  }
}
</style>
