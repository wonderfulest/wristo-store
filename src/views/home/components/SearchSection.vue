<template>
  <section class="search-section search-section-gradient">
    <div class="search-bar-outer">
      <div class="search-bar-inner flex items-center">
        <Icon class="search-icon" icon="solar:magnifer-line-duotone" width="30" height="30" aria-hidden="true" />
        <el-input
          v-model="searchTerm"
          :placeholder="placeholder"
          class="search-bar-input"
          :input-style="{ textAlign: 'center' }"
          @input="handleSearch"
          @focus="handleFocus"
          @keyup.enter="handleSubmit"
          :border="false"
        />
        <span
          v-if="displayCount && searchTerm"
          class="results-count-pill"
        >
          {{ displayCount }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = withDefaults(
  defineProps<{
    initialSearchTerm?: string
    placeholder?: string
    submitOnFocus?: boolean
    total?: number
  }>(),
  {
    initialSearchTerm: '',
    placeholder: 'Search elegant, sporty, minimal...',
    submitOnFocus: false
  }
)

const searchTerm = ref(props.initialSearchTerm || '')
const emit = defineEmits(['search', 'submit']);

let debounceTimer: number | undefined

const displayCount = computed(() => {
  if (props.total == null) return ''

  const total = props.total

  if (total < 0) return ''

  if (total < 100) {
    return `${total} items`
  }

  const bucket = Math.floor(total / 100) * 100
  return `${bucket}+ items`
})

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
  min-height: 220px;
  background:
    linear-gradient(135deg, rgba(223, 245, 241, 0.9) 0%, rgba(255, 247, 237, 0.62) 48%, rgba(255, 255, 255, 0.86) 100%);
  display: flex;
  align-items: center;
  border-block: 1px solid var(--color-line);
}

.search-bar-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 32px;
  margin-bottom: 32px;
}

.search-bar-inner {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  box-shadow:
    var(--shadow-md),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  padding: 0 28px 0 22px;
  width: 56vw;
  min-width: 320px;
  max-width: 820px;
  min-height: 72px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(15, 107, 104, 0.12);
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
