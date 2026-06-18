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
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

interface TemplateExample {
  id: string
  label: string
  template: string
  category: 'stats' | 'weather' | 'quote' | 'time'
}

const props = defineProps<{
  category?: TemplateExample['category'] | 'all'
}>()

const examples: TemplateExample[] = [
  {
    id: 'basic-hr-steps',
    label: 'Heart rate + steps',
    template: 'Your heart beat is {{hr}} bpm, today you walked {{steps}} steps.',
    category: 'stats'
  },
  {
    id: 'summary-day',
    label: 'Daily summary',
    template: 'Today {{weekday}}, {{month}}/{{day}}: {{steps}} steps, {{calories}} kcal, body battery {{bodyBattery}}%.',
    category: 'stats'
  },
  {
    id: 'weather-air',
    label: 'Air quality',
    template: 'Air quality index {{aqi}} (PM2.5 {{pm25}}, PM10 {{pm10}}) at your location.',
    category: 'weather'
  },
  {
    id: 'weather-summary',
    label: 'Weather summary',
    template: 'Weather {{weather}}, humidity {{humidity}}%, wind {{windSpeed}}.',
    category: 'weather'
  },
  {
    id: 'weather-wind-clouds',
    label: 'Wind & clouds',
    template: 'Wind {{windSpeed}}, clouds {{clouds}}%.',
    category: 'weather'
  },
  {
    id: 'battery-altitude',
    label: 'Battery + altitude',
    template: 'Battery {{battery}} remaining, altitude {{altitude}} above sea level.',
    category: 'stats'
  },
  {
    id: 'sunrise-sunset',
    label: 'Sunrise & sunset',
    template: 'Sunrise at {{sunrise}}, sunset at {{sunset}} — enjoy your day outside.',
    category: 'weather'
  },
  {
    id: 'motivation-quote',
    label: 'Motivation + stats',
    template: '“{{quote}}”  — {{steps}} steps today, stress level {{stress}}, keep going!',
    category: 'stats'
  },
  {
    id: 'sleep-report',
    label: 'Sleep report',
    template: 'Last night you slept {{sleep}}. Resting heart rate {{restingHeart}} bpm.',
    category: 'stats'
  },
  {
    id: 'simple-minimal',
    label: 'Minimal',
    template: '{{steps}} steps · {{calories}} kcal · HR {{hr}} bpm',
    category: 'stats'
  },
  {
    id: 'time-today-basic',
    label: 'Today',
    template: 'Today {{weekday}}, {{month}}/{{day}}/{{year}}.',
    category: 'time'
  },
  {
    id: 'time-week-info',
    label: 'Week info',
    template: 'Week {{week}}, yearday {{yearday}}.',
    category: 'time'
  },
  {
    id: 'time-sun-brief',
    label: 'Sunrise & sunset',
    template: 'Sunrise {{sunrise}}, sunset {{sunset}}.',
    category: 'time'
  },
  {
    id: 'quote-keep-moving',
    label: 'Daily quote',
    template: 'Keep moving',
    category: 'quote'
  },
  {
    id: 'quote-stay-strong',
    label: 'Daily quote',
    template: 'Stay strong',
    category: 'quote'
  },
  {
    id: 'quote-you-got-this',
    label: 'Daily quote',
    template: 'You got this',
    category: 'quote'
  },
  {
    id: 'quote-be-your-best',
    label: 'Daily quote',
    template: 'Be your best',
    category: 'quote'
  },
  {
    id: 'quote-trust-yourself',
    label: 'Daily quote',
    template: 'Trust yourself',
    category: 'quote'
  },
  {
    id: 'quote-keep-faith',
    label: 'Daily quote',
    template: 'Keep the faith',
    category: 'quote'
  },
  {
    id: 'quote-choose-courage',
    label: 'Daily quote',
    template: 'Choose courage',
    category: 'quote'
  },
  {
    id: 'quote-stay-curious',
    label: 'Daily quote',
    template: 'Stay curious',
    category: 'quote'
  },
  {
    id: 'quote-find-calm',
    label: 'Daily quote',
    template: 'Find your calm',
    category: 'quote'
  },
  {
    id: 'quote-make-happen',
    label: 'Daily quote',
    template: 'Make it happen',
    category: 'quote'
  },
  {
    id: 'quote-keep-going',
    label: 'Daily quote',
    template: 'Keep going',
    category: 'quote'
  },
  {
    id: 'quote-stay-focused',
    label: 'Daily quote',
    template: 'Stay focused',
    category: 'quote'
  },
  {
    id: 'quote-believe-you',
    label: 'Daily quote',
    template: 'Believe in you',
    category: 'quote'
  },
  {
    id: 'quote-push-forward',
    label: 'Daily quote',
    template: 'Push forward',
    category: 'quote'
  },
  {
    id: 'quote-rise-again',
    label: 'Daily quote',
    template: 'Rise again',
    category: 'quote'
  },
  {
    id: 'quote-stay-brave',
    label: 'Daily quote',
    template: 'Stay brave',
    category: 'quote'
  },
  {
    id: 'quote-think-positive',
    label: 'Daily quote',
    template: 'Think positive',
    category: 'quote'
  },
  {
    id: 'quote-keep-growing',
    label: 'Daily quote',
    template: 'Keep growing',
    category: 'quote'
  },
  {
    id: 'quote-start-today',
    label: 'Daily quote',
    template: 'Start today',
    category: 'quote'
  },
  {
    id: 'quote-do-your-best',
    label: 'Daily quote',
    template: 'Do your best',
    category: 'quote'
  },
  {
    id: 'quote-dream-boldly',
    label: 'Daily quote',
    template: 'Dream boldly',
    category: 'quote'
  },
  {
    id: 'quote-stay-present',
    label: 'Daily quote',
    template: 'Stay present',
    category: 'quote'
  },
  {
    id: 'quote-go-for-more',
    label: 'Daily quote',
    template: 'Go for more',
    category: 'quote'
  },
  {
    id: 'quote-keep-shining',
    label: 'Daily quote',
    template: 'Keep shining',
    category: 'quote'
  },
  {
    id: 'quote-stay-hopeful',
    label: 'Daily quote',
    template: 'Stay hopeful',
    category: 'quote'
  },
  {
    id: 'quote-trust-path',
    label: 'Daily quote',
    template: 'Trust the path',
    category: 'quote'
  },
  {
    id: 'quote-move-purpose',
    label: 'Daily quote',
    template: 'Move with purpose',
    category: 'quote'
  },
  {
    id: 'quote-stay-resilient',
    label: 'Daily quote',
    template: 'Stay resilient',
    category: 'quote'
  },
  {
    id: 'quote-stay-grateful',
    label: 'Daily quote',
    template: 'Stay grateful',
    category: 'quote'
  },
  {
    id: 'quote-unstoppable',
    label: 'Daily quote',
    template: 'Be unstoppable',
    category: 'quote'
  },
  {
    id: 'quote-keep-improving',
    label: 'Daily quote',
    template: 'Keep improving',
    category: 'quote'
  },
  {
    id: 'quote-stay-inspired',
    label: 'Daily quote',
    template: 'Stay inspired',
    category: 'quote'
  },
  {
    id: 'quote-win-day',
    label: 'Daily quote',
    template: 'Win the day',
    category: 'quote'
  },
  {
    id: 'quote-own-future',
    label: 'Daily quote',
    template: 'Own your future',
    category: 'quote'
  },
  {
    id: 'quote-keep-rising',
    label: 'Daily quote',
    template: 'Keep rising',
    category: 'quote'
  },
  {
    id: 'quote-stay-committed',
    label: 'Daily quote',
    template: 'Stay committed',
    category: 'quote'
  },
  {
    id: 'quote-begin-again',
    label: 'Daily quote',
    template: 'Begin again',
    category: 'quote'
  }
]

const filteredExamples = computed(() => {
  if (!props.category || props.category === 'all') {
    return examples
  }
  return examples.filter((item) => item.category === props.category)
})

function handleSelect(value: string) {
  emit('select', value)
}

const ROW_COUNT = 3
const rows = Array.from({ length: ROW_COUNT }, (_, i) => i)

function getRowExamples(row: number) {
  return filteredExamples.value.filter((_, index) => index % ROW_COUNT === row)
}
</script>

<style scoped>
.examples-card {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.examples-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(251, 253, 252, 0.95), rgba(251, 253, 252, 0) 16%, rgba(251, 253, 252, 0) 84%, rgba(251, 253, 252, 0.95)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(238, 245, 243, 0));
  pointer-events: none;
  z-index: 1;
}

.barrage-layer {
  position: relative;
  margin: 0 auto;
  max-width: var(--container);
  height: 100%;
  overflow: hidden;
  padding: 0 18px;
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
  animation-delay: calc(var(--row-index) * -5.5s);
}

.barrage-item {
  min-height: 42px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.09);
  background: linear-gradient(145deg, #ffffff, rgba(238, 245, 243, 0.82));
  box-shadow: var(--shadow-sm);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  color: var(--color-ink);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.barrage-item:hover,
.barrage-item:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(15, 107, 104, 0.14);
  border-color: rgba(15, 107, 104, 0.3);
  background: #ffffff;
}

.barrage-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--color-brand-strong);
}

.barrage-text {
  font-size: 0.78rem;
  color: var(--color-muted);
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
    padding: 0 12px;
  }

  .barrage-item {
    max-width: 84vw;
  }

  .barrage-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
