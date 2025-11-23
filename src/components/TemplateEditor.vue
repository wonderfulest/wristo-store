<template>
  <div class="template-editor-card">
    <div class="template-editor-header">
      <div class="template-editor-title">Template Editor</div>
      <div class="template-editor-subtitle">
        Build your watch text using variables like <code>&#123;&#123;hr&#125;&#125;</code> and <code>&#123;&#123;steps&#125;&#125;</code>.
      </div>
    </div>
    <div class="template-editor-body">
      <div class="template-main-column">
        <label class="template-label">Template String</label>
        <div class="template-input-wrapper">
          <textarea
            class="template-textarea"
            v-model="internalValue"
            :placeholder="placeholder"
            @input="emitChange"
          />
        </div>
        <div class="template-preview-wrapper">
          <div class="template-preview-label">
            Live Preview (sample data)
          </div>
          <div class="template-preview-box">
            {{ renderedPreview }}
          </div>
        </div>
      </div>
      <div class="template-sidebar">
        <div class="sidebar-title">Available Variables</div>
        <div class="sidebar-description">
          Click to insert a variable at the cursor position.
        </div>
        <div class="variable-list">
          <button
            v-for="v in variables"
            :key="v.name"
            class="variable-chip"
            type="button"
            @click="insertVariable(v.name)"
          >
            <span class="variable-chip-name">{{ v.name }}</span>
            <span class="variable-chip-desc">{{ v.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface VariableItem {
  name: string
  label: string
  sample?: string
}

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const placeholder =
  'your heart beat is {{hr}}, today walk {{steps}} steps.'

const internalValue = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== internalValue.value) {
      internalValue.value = val
    }
  }
)

const variables: VariableItem[] = [
  { name: 'hr', label: 'Heart Rate', sample: '72' },
  { name: 'heart', label: 'Heart (alias of hr)', sample: '72' },
  { name: 'alarms', label: 'Alarms', sample: '2' },
  { name: 'notifications', label: 'Notifications', sample: '5' },
  { name: 'steps', label: 'Steps Today', sample: '10432' },
  { name: 'calories', label: 'Calories', sample: '560' },
  { name: 'floors', label: 'Floors Climbed', sample: '8' },
  { name: 'distance', label: 'Distance', sample: '6.3 km' },
  { name: 'altitude', label: 'Altitude', sample: '120 m' },
  { name: 'restingHeart', label: 'Resting HR', sample: '60' },
  { name: 'battery', label: 'Battery', sample: '85%' },
  { name: 'respiration', label: 'Respiration Rate', sample: '14' },
  { name: 'location', label: 'Location', sample: 'Home' },
  { name: 'aqi', label: 'AQI', sample: '42' },
  { name: 'pm25', label: 'PM2.5', sample: '12' },
  { name: 'pm10', label: 'PM10', sample: '20' },
  { name: 'o3', label: 'O3', sample: '8' },
  { name: 'no2', label: 'NO2', sample: '5' },
  { name: 'so2', label: 'SO2', sample: '3' },
  { name: 'co', label: 'CO', sample: '0.4' },
  { name: 'nh3', label: 'NH3', sample: '1.1' },
  { name: 'bodyBattery', label: 'Body Battery', sample: '68' },
  { name: 'stress', label: 'Stress', sample: '22' },
  { name: 'sunrise', label: 'Sunrise Time', sample: '06:25' },
  { name: 'sunset', label: 'Sunset Time', sample: '19:42' },
  { name: 'quote', label: 'Quote', sample: 'Keep moving forward.' },
  { name: 'push', label: 'Push Message', sample: 'New message' },
  { name: 'sleep', label: 'Sleep Time', sample: '7h 30m' },
  { name: 'year', label: 'Year', sample: '2025' },
  { name: 'month', label: 'Month', sample: '11' },
  { name: 'day', label: 'Day', sample: '23' },
  { name: 'weekday', label: 'Weekday', sample: 'Sat' },
  { name: 'week', label: 'Week of Year', sample: '47' },
  { name: 'yearday', label: 'Day of Year', sample: '327' }
]

const sampleMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  variables.forEach((v) => {
    if (v.sample) map[v.name] = v.sample
  })
  return map
})

const renderedPreview = computed(() => {
  const tpl = internalValue.value || placeholder
  return tpl.replace(/{{\s*([^}]+)\s*}}/g, (_, key: string) => {
    const k = key.trim()
    return sampleMap.value[k] ?? `{{${k}}}`
  })
})

function emitChange() {
  emit('update:modelValue', internalValue.value)
  emit('change', internalValue.value)
}

function insertVariable(name: string) {
  const token = `{{${name}}}`
  // Simple append if we cannot access a real textarea element here
  if (!internalValue.value) {
    internalValue.value = token
  } else if (/\s$/.test(internalValue.value)) {
    internalValue.value += token
  } else {
    internalValue.value += ' ' + token
  }
  emitChange()
}
</script>

<style scoped>
.template-editor-card {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  border-radius: 24px;
  padding: 20px 24px;
  background: linear-gradient(145deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9));
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.45);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  font-family: -apple-system, BlinkMacSystemFont, system-ui, -apple-system-font, 'SF Pro Text', sans-serif;
}

.template-editor-header {
  margin-bottom: 16px;
}

.template-editor-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.template-editor-subtitle {
  margin-top: 4px;
  font-size: 0.92rem;
  color: #64748b;
}

.template-editor-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.template-main-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-sidebar {
  flex: 1.3;
  border-radius: 18px;
  padding: 14px 14px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.template-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}

.template-input-wrapper {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 0 0 0.5px rgba(148, 163, 184, 0.3);
  padding: 10px 12px;
}

.template-textarea {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #0f172a;
  font-family: inherit;
}

.template-textarea::placeholder {
  color: #94a3b8;
}

.template-preview-wrapper {
  margin-top: 4px;
}

.template-preview-label {
  font-size: 0.86rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.template-preview-box {
  border-radius: 14px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e5e7eb;
  font-size: 0.96rem;
  line-height: 1.5;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.sidebar-description {
  margin-top: 2px;
  font-size: 0.82rem;
  color: #94a3b8;
}

.variable-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 6px 9px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 4px 10px rgba(148, 163, 184, 0.3);
  cursor: pointer;
  transition: all 0.18s ease-out;
  min-width: 0;
}

.variable-chip:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}

.variable-chip-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1d4ed8;
}

.variable-chip-desc {
  font-size: 0.8rem;
  color: #64748b;
}

@media (max-width: 900px) {
  .template-editor-card {
    padding: 16px 14px;
  }

  .template-editor-body {
    flex-direction: column;
  }

  .template-sidebar {
    width: 100%;
  }
}
</style>
