<template>
  <div class="template-editor-card">
    <div class="template-editor-header">
      <div>
        <div class="template-editor-eyebrow">Template builder</div>
        <h2 class="template-editor-title">Build dynamic watch text</h2>
      </div>
      <div class="template-editor-summary" aria-label="Template summary">
        <span>{{ internalValue.length }} chars</span>
        <span>{{ variables.length }} variables</span>
      </div>
    </div>

    <p class="template-editor-subtitle">
      Compose a short line for Garmin watch faces using live health, weather, time, and message data.
    </p>

    <div class="template-editor-body">
      <div class="template-main-column">
        <div class="template-field-row">
          <label class="template-label" for="watch-template-input">Template string</label>
          <span class="template-helper">Use &#123;&#123;variable&#125;&#125; format</span>
        </div>
        <div class="template-input-wrapper">
          <textarea
            id="watch-template-input"
            ref="textareaRef"
            class="template-textarea"
            v-model="internalValue"
            :placeholder="placeholder"
            @input="emitChange"
          />
        </div>
        <div class="template-preview-wrapper">
          <div class="template-preview-copy">
            <div>
              <div class="template-preview-label">Live preview</div>
              <div class="template-preview-note">Sample data rendering</div>
            </div>
          </div>
          <div class="template-preview-box">
            <div class="watch-preview" aria-hidden="true">
              <div class="watch-preview-screen">
                <span>WRISTO</span>
                <strong>{{ previewHeadline }}</strong>
              </div>
            </div>
            <p>{{ renderedPreview }}</p>
          </div>
        </div>
      </div>
      <div class="template-sidebar">
        <div class="sidebar-heading">
          <div>
            <div class="sidebar-title">Variables</div>
            <div class="sidebar-description">Insert at the cursor position.</div>
          </div>
        </div>
        <div class="variable-groups">
          <section v-for="group in groupedVariables" :key="group.name" class="variable-group">
            <div class="variable-group-title">{{ group.name }}</div>
            <div class="variable-list">
              <button
                v-for="v in group.items"
                :key="v.name"
                class="variable-chip"
                type="button"
                :aria-label="`Insert ${v.label} variable`"
                @click="insertVariable(v.name)"
              >
                <span class="variable-chip-name">{{ v.name }}</span>
                <span class="variable-chip-desc">{{ v.label }}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

interface VariableItem {
  name: string
  label: string
  sample?: string
  group: 'Health' | 'Weather' | 'Time' | 'Message'
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
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== internalValue.value) {
      internalValue.value = val
    }
  }
)

const variables: VariableItem[] = [
  { name: 'hr', label: 'Heart rate', sample: '72', group: 'Health' },
  { name: 'heart', label: 'Heart alias', sample: '72', group: 'Health' },
  { name: 'steps', label: 'Steps today', sample: '10432', group: 'Health' },
  { name: 'calories', label: 'Calories', sample: '560', group: 'Health' },
  { name: 'floors', label: 'Floors climbed', sample: '8', group: 'Health' },
  { name: 'distance', label: 'Distance', sample: '6.3 km', group: 'Health' },
  { name: 'altitude', label: 'Altitude', sample: '120 m', group: 'Health' },
  { name: 'restingHeart', label: 'Resting HR', sample: '60', group: 'Health' },
  { name: 'battery', label: 'Battery', sample: '85%', group: 'Health' },
  { name: 'respiration', label: 'Respiration', sample: '14', group: 'Health' },
  { name: 'bodyBattery', label: 'Body battery', sample: '68', group: 'Health' },
  { name: 'stress', label: 'Stress', sample: '22', group: 'Health' },
  { name: 'sleep', label: 'Sleep time', sample: '7h 30m', group: 'Health' },
  { name: 'weather', label: 'Weather', sample: 'Clear', group: 'Weather' },
  { name: 'humidity', label: 'Humidity', sample: '48', group: 'Weather' },
  { name: 'windSpeed', label: 'Wind speed', sample: '9 km/h', group: 'Weather' },
  { name: 'clouds', label: 'Clouds', sample: '21', group: 'Weather' },
  { name: 'location', label: 'Location', sample: 'Home', group: 'Weather' },
  { name: 'aqi', label: 'AQI', sample: '42', group: 'Weather' },
  { name: 'pm25', label: 'PM2.5', sample: '12', group: 'Weather' },
  { name: 'pm10', label: 'PM10', sample: '20', group: 'Weather' },
  { name: 'o3', label: 'O3', sample: '8', group: 'Weather' },
  { name: 'no2', label: 'NO2', sample: '5', group: 'Weather' },
  { name: 'so2', label: 'SO2', sample: '3', group: 'Weather' },
  { name: 'co', label: 'CO', sample: '0.4', group: 'Weather' },
  { name: 'nh3', label: 'NH3', sample: '1.1', group: 'Weather' },
  { name: 'sunrise', label: 'Sunrise', sample: '06:25', group: 'Time' },
  { name: 'sunset', label: 'Sunset', sample: '19:42', group: 'Time' },
  { name: 'year', label: 'Year', sample: '2025', group: 'Time' },
  { name: 'month', label: 'Month', sample: '11', group: 'Time' },
  { name: 'day', label: 'Day', sample: '23', group: 'Time' },
  { name: 'weekday', label: 'Weekday', sample: 'Sat', group: 'Time' },
  { name: 'week', label: 'Week of year', sample: '47', group: 'Time' },
  { name: 'yearday', label: 'Day of year', sample: '327', group: 'Time' },
  { name: 'alarms', label: 'Alarms', sample: '2', group: 'Message' },
  { name: 'notifications', label: 'Notifications', sample: '5', group: 'Message' },
  { name: 'quote', label: 'Quote', sample: 'Keep moving forward.', group: 'Message' },
  { name: 'push', label: 'Push message', sample: 'New message', group: 'Message' }
]

const variableGroups: VariableItem['group'][] = ['Health', 'Weather', 'Time', 'Message']

const groupedVariables = computed(() =>
  variableGroups.map((name) => ({
    name,
    items: variables.filter((variable) => variable.group === name)
  }))
)

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

const previewHeadline = computed(() => {
  const text = renderedPreview.value.trim()
  if (!text) return 'Preview'
  return text.length > 28 ? `${text.slice(0, 28)}...` : text
})

function emitChange() {
  emit('update:modelValue', internalValue.value)
  emit('change', internalValue.value)
}

function insertVariable(name: string) {
  const token = `{{${name}}}`
  const textarea = textareaRef.value

  if (!textarea) {
    internalValue.value = appendToken(internalValue.value, token)
    emitChange()
    return
  }

  const start = textarea.selectionStart ?? internalValue.value.length
  const end = textarea.selectionEnd ?? start
  const before = internalValue.value.slice(0, start)
  const after = internalValue.value.slice(end)
  const prefix = before && !/\s$/.test(before) ? ' ' : ''
  const suffix = after && !/^\s/.test(after) ? ' ' : ''
  const inserted = `${prefix}${token}${suffix}`

  internalValue.value = `${before}${inserted}${after}`
  emitChange()
  nextTick(() => {
    textarea.focus()
    const cursor = start + inserted.length
    textarea.setSelectionRange(cursor, cursor)
  })
}

function appendToken(value: string, token: string) {
  if (!value) return token
  return /\s$/.test(value) ? `${value}${token}` : `${value} ${token}`
}
</script>

<style scoped>
.template-editor-card {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  border-radius: var(--radius-lg);
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 250, 0.94) 100%);
  box-shadow: var(--shadow-lg), 0 1px 0 rgba(255, 255, 255, 0.86) inset;
  border: 1px solid var(--color-line);
  font-family: var(--font-body);
}

.template-editor-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.template-editor-eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  margin-bottom: 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.12);
  background: rgba(15, 107, 104, 0.1);
  color: var(--color-brand-strong);
  font-size: 0.78rem;
  font-weight: 800;
}

.template-editor-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  line-height: 1.06;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: 0;
}

.template-editor-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.template-editor-summary span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-size: 0.82rem;
  font-weight: 800;
}

.template-editor-subtitle {
  max-width: 680px;
  margin: 10px 0 22px;
  font-size: 1rem;
  line-height: 1.58;
  color: var(--color-muted);
}

.template-editor-body {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(310px, 0.65fr);
  gap: 24px;
  align-items: flex-start;
}

.template-main-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.template-sidebar {
  align-self: stretch;
  border-radius: var(--radius-md);
  padding: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(238, 245, 243, 0.62));
  border: 1px solid var(--color-line);
}

.template-field-row,
.template-preview-copy,
.sidebar-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.template-label {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-ink);
}

.template-helper,
.template-preview-note {
  color: var(--color-subtle);
  font-size: 0.84rem;
  font-weight: 600;
}

.template-input-wrapper {
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: var(--shadow-sm);
  padding: 14px 16px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.template-input-wrapper:focus-within {
  border-color: rgba(15, 107, 104, 0.38);
  box-shadow: 0 0 0 4px rgba(15, 107, 104, 0.1);
}

.template-textarea {
  width: 100%;
  min-height: 148px;
  resize: vertical;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-ink);
  font-family: inherit;
}

.template-textarea::placeholder {
  color: var(--color-subtle);
}

.template-preview-wrapper {
  display: grid;
  gap: 8px;
}

.template-preview-label {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-ink);
}

.template-preview-box {
  min-height: 132px;
  border-radius: var(--radius-md);
  padding: 16px;
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  background:
    radial-gradient(circle at 12% 18%, rgba(245, 158, 11, 0.24), transparent 12rem),
    linear-gradient(135deg, var(--color-brand-strong) 0%, #0f172a 100%);
  color: #f8fafc;
  font-size: 1rem;
  line-height: 1.5;
  box-shadow: 0 18px 46px rgba(6, 78, 75, 0.18);
}

.template-preview-box p {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}

.watch-preview {
  width: 86px;
  height: 86px;
  padding: 7px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1f2937 0%, #050f12 100%);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24);
}

.watch-preview-screen {
  height: 100%;
  border-radius: 50%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 4px;
  padding: 10px;
  text-align: center;
  background:
    radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.58), transparent 36%),
    linear-gradient(160deg, #0f6b68 0%, #064e4b 52%, #111827 100%);
}

.watch-preview-screen span {
  font-size: 0.56rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.68);
}

.watch-preview-screen strong {
  max-width: 60px;
  color: #ffffff;
  font-size: 0.6rem;
  line-height: 1.12;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-ink);
}

.sidebar-description {
  margin-top: 3px;
  font-size: 0.82rem;
  color: var(--color-muted);
}

.variable-groups {
  max-height: 364px;
  overflow: auto;
  padding-right: 2px;
}

.variable-group {
  padding-top: 16px;
}

.variable-group-title {
  margin-bottom: 8px;
  font-size: 0.74rem;
  line-height: 1.2;
  color: var(--color-brand-strong);
  font-weight: 900;
  text-transform: uppercase;
}

.variable-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.variable-chip {
  min-height: 48px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.09);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  min-width: 0;
  text-align: left;
}

.variable-chip:hover,
.variable-chip:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 107, 104, 0.12);
  border-color: rgba(15, 107, 104, 0.28);
  background: #ffffff;
}

.variable-chip:active {
  transform: translateY(0) scale(0.99);
}

.variable-chip-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-brand);
}

.variable-chip-desc {
  max-width: 100%;
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 980px) {
  .template-editor-card {
    padding: 20px;
  }

  .template-editor-body {
    grid-template-columns: 1fr;
  }

  .template-sidebar {
    width: 100%;
  }

  .variable-groups {
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 640px) {
  .template-editor-card {
    border-radius: 20px;
    padding: 16px;
  }

  .template-editor-header,
  .template-field-row,
  .template-preview-copy {
    align-items: flex-start;
    flex-direction: column;
  }

  .template-editor-summary {
    justify-content: flex-start;
  }

  .template-helper {
    font-size: 0.8rem;
  }

  .template-preview-box {
    grid-template-columns: 1fr;
  }

  .variable-list {
    grid-template-columns: 1fr;
  }
}
</style>
