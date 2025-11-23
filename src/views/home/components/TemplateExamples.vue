<template>
  <div class="examples-card">
    <div class="barrage-layer">
      <div
        v-for="row in rows"
        :key="row"
        class="barrage-row"
        :style="{
          '--row-index': row.toString(),
          '--duration': (18 + row * 2) + 's'
        }"
      >
        <button
          v-for="item in getRowExamples(row)"
          :key="item.id"
          class="barrage-item"
          type="button"
          @click="handleSelect(item.template)"
        >
          <span class="barrage-label">{{ item.label }}</span>
          <span class="barrage-text">{{ item.template }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

interface TemplateExample {
  id: string
  label: string
  template: string
}

const examples: TemplateExample[] = [
  {
    id: 'basic-hr-steps',
    label: 'Heart rate + steps',
    template: 'Your heart beat is {{hr}} bpm, today you walked {{steps}} steps.'
  },
  {
    id: 'summary-day',
    label: 'Daily summary',
    template: 'Today {{weekday}}, {{month}}/{{day}}: {{steps}} steps, {{calories}} kcal, body battery {{bodyBattery}}%.'
  },
  {
    id: 'weather-air',
    label: 'Air quality',
    template: 'Air quality index {{aqi}} (PM2.5 {{pm25}}, PM10 {{pm10}}) at your location.'
  },
  {
    id: 'battery-altitude',
    label: 'Battery + altitude',
    template: 'Battery {{battery}} remaining, altitude {{altitude}} above sea level.'
  },
  {
    id: 'sunrise-sunset',
    label: 'Sunrise & sunset',
    template: 'Sunrise at {{sunrise}}, sunset at {{sunset}} — enjoy your day outside.'
  },
  {
    id: 'motivation-quote',
    label: 'Motivation + stats',
    template: '“{{quote}}”  — {{steps}} steps today, stress level {{stress}}, keep going!'
  },
  {
    id: 'sleep-report',
    label: 'Sleep report',
    template: 'Last night you slept {{sleep}}. Resting heart rate {{restingHeart}} bpm.'
  },
  {
    id: 'simple-minimal',
    label: 'Minimal',
    template: '{{steps}} steps · {{calories}} kcal · HR {{hr}} bpm'
  }
]

function handleSelect(value: string) {
  emit('select', value)
}

const ROW_COUNT = 3
const rows = Array.from({ length: ROW_COUNT }, (_, i) => i)

function getRowExamples(row: number) {
  return examples.filter((_, index) => index % ROW_COUNT === row)
}
</script>

<style scoped>
.examples-card {
  position: fixed;
  inset: 0 auto auto 0;
  top: 72px;
  width: 100%;
  pointer-events: none;
  z-index: 20;
}

.examples-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0));
  pointer-events: none;
}

.barrage-layer {
  position: relative;
  margin: 0 auto;
  max-width: 1100px;
  height: 150px;
  overflow: hidden;
  padding: 0 16px;
}

.barrage-row {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(10% + (var(--row-index) * 30%));
  display: flex;
  gap: 10px;
  transform: translateX(100%);
  animation: barrage-row-move var(--duration) linear infinite;
}

.barrage-item {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 4px 10px rgba(148, 163, 184, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
}

.barrage-item:hover {
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
}

.barrage-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1f2937;
}

.barrage-text {
  font-size: 0.78rem;
  color: #4b5563;
}

@keyframes barrage-row-move {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-120%);
  }
}

@media (max-width: 768px) {
  .barrage-layer {
    height: 160px;
  }
}
</style>
