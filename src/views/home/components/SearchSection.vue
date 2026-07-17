<template>
  <section class="search-section search-section-gradient" :class="`search-section-${variant}`">
    <div class="search-bar-outer">
      <div class="search-bar-inner flex items-center">
        <Icon class="search-icon" icon="solar:magnifer-line-duotone" width="30" height="30" aria-hidden="true" />
        <el-input
          v-model="searchTerm"
          :placeholder="placeholder"
          class="search-bar-input"
          :input-style="{ textAlign: inputAlign }"
          @input="handleSearch"
          @focus="handleFocus"
          @keyup.enter="handleSubmit"
          clearable
          :border="false"
          :aria-label="placeholder"
        />
        <button
          v-if="showSubmit"
          class="search-submit-btn"
          type="button"
          :disabled="searchTerm.trim().length < 2"
          :aria-label="submitLabel"
          @click="handleSubmit"
        >
          <Icon icon="mdi:arrow-right" width="18" aria-hidden="true" />
          <span>{{ submitLabel }}</span>
        </button>
        <span
          v-else-if="displayCount && searchTerm"
          class="results-count-pill"
        >
          {{ displayCount }}
        </span>
      </div>
      <p v-if="helper" class="search-helper">{{ helper }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '@/i18n'

const props = withDefaults(
  defineProps<{
    initialSearchTerm?: string
    placeholder?: string
    submitOnFocus?: boolean
    total?: number
    showSubmit?: boolean
    submitLabel?: string
    helper?: string
    variant?: 'hero' | 'compact'
  }>(),
  {
    initialSearchTerm: '',
    placeholder: 'Search elegant, sporty, minimal...',
    submitOnFocus: false,
    showSubmit: false,
    submitLabel: 'Search',
    helper: '',
    variant: 'hero'
  }
)

const searchTerm = ref(props.initialSearchTerm || '')
const emit = defineEmits(['search', 'submit']);
const { t } = useI18n()

let debounceTimer: number | undefined

const displayCount = computed(() => {
  if (props.total == null) return ''

  const total = props.total

  if (total < 0) return ''

  if (total < 100) {
    return `${total} ${t('search.items')}`
  }

  const bucket = Math.floor(total / 100) * 100
  return `${bucket}+ ${t('search.items')}`
})

const inputAlign = computed(() => (props.variant === 'compact' ? 'left' : 'center'))

const emitSearch = (value: string) => {
  emit('search', value)
}

const emitSearchDebounced = (value: string) => {
  if (debounceTimer) window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    emitSearch(value)
  }, 400)
}

const handleSearch = () => {
  const value = searchTerm.value.trim()
  if (value.length === 0) {
    if (debounceTimer) window.clearTimeout(debounceTimer)
    emitSearch('')
    return
  }
  if (value.length < 2) return
  emitSearchDebounced(value)
}

const handleSubmit = () => {
  const value = searchTerm.value.trim()
  if (value.length < 2) return
  if (debounceTimer) window.clearTimeout(debounceTimer)
  emit('submit', value)
}

const handleFocus = () => {
  if (!props.submitOnFocus) return
  if (debounceTimer) window.clearTimeout(debounceTimer)
  emit('submit', searchTerm.value.trim())
}

watch(
  () => props.initialSearchTerm,
  (next) => {
    if (typeof next !== 'string') return
    if (next === searchTerm.value) return
    searchTerm.value = next
  }
)

onBeforeUnmount(() => {
  if (debounceTimer) window.clearTimeout(debounceTimer)
})
</script>

<style scoped>
.search-section {
  min-height: 180px;
  background: var(--color-surface-soft);
  display: flex;
  align-items: center;
  border-block: 1px solid var(--color-line);
}

.search-bar-outer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-block: var(--space-6);
  padding-inline: var(--page-gutter);
}

.search-bar-inner {
  background: var(--color-surface);
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  padding: 0 28px 0 22px;
  width: 56vw;
  min-width: 320px;
  max-width: 820px;
  min-height: 68px;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-line);
}

.search-bar-input {
  flex: 1 1 auto;
  min-width: 0;
}

.results-count-pill {
  margin-left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-brand-strong);
  /* background: rgba(191, 219, 254, 0.75); */
  /* border: 1px solid rgba(59, 130, 246, 0.35); */
  white-space: nowrap;
}

.search-icon {
  color: var(--color-brand);
  margin-right: 14px;
  flex: 0 0 auto;
}

.search-bar-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  font-size: 2.8rem;
  color: var(--color-ink);
  padding: 0;
}

.search-bar-input :deep(.el-input__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-ink);
  padding: 0;
}

.search-bar-input :deep(.el-input__inner::placeholder) {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--color-subtle) !important;
  opacity: 1;
}

.search-submit-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 17px;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: var(--color-brand);
  font-size: 0.95rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 180ms ease, transform 180ms ease, opacity 180ms ease;
}

.search-submit-btn:hover:not(:disabled) {
  background: var(--color-brand-strong);
  transform: translateY(-1px);
}

.search-submit-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.search-helper {
  max-width: min(720px, calc(100vw - 40px));
  margin: 12px 0 0;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.55;
  text-align: center;
}

.search-section-compact {
  min-height: 168px;
  background:
    linear-gradient(135deg, rgba(223, 245, 241, 0.72) 0%, rgba(255, 255, 255, 0.92) 46%, rgba(255, 248, 235, 0.74) 100%);
}

.search-section-compact .search-bar-outer {
  margin-top: 24px;
  margin-bottom: 24px;
}

.search-section-compact .search-bar-inner {
  width: min(860px, calc(100vw - 36px));
  min-height: 66px;
  padding-right: 12px;
}

.search-section-compact .search-bar-input :deep(.el-input__inner) {
  font-size: 1.15rem;
}

.search-section-compact .search-bar-input :deep(.el-input__inner::placeholder) {
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .search-section {
    min-height: 220px;
  }

  .search-bar-outer {
    margin-top: 22px;
    margin-bottom: 22px;
  }

  .search-bar-inner {
    width: calc(100vw - 28px);
    max-width: none;
    min-width: 0;
    min-height: 64px;
    padding: 0 20px 0 18px;
  }

  .results-count-pill {
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.75rem;
  }

  .search-section-compact .search-bar-inner {
    min-height: 58px;
    padding-right: 8px;
  }

  .search-submit-btn span {
    display: none;
  }

  .search-submit-btn {
    width: 44px;
    padding: 0;
  }
}

.search-bar-btn {
  margin-left: 18px;
  height: 44px;
  min-width: 110px;
  font-size: 1.1rem;
  border-radius: 999px !important;
  background: var(--color-brand);
  border: none;
  box-shadow: 0 2px 8px 0 rgba(52,124,255,0.08);
}
</style>
