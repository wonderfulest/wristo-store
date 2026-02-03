<template>
  <section class="search-section search-section-gradient">
    <div class="search-bar-outer">
      <div class="search-bar-inner flex items-center">
        <el-icon class="search-icon"><Search /></el-icon>
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
import { Search } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    initialSearchTerm?: string
    placeholder?: string
    submitOnFocus?: boolean
    total?: number
  }>(),
  {
    initialSearchTerm: '',
    placeholder: 'Try "Elegant" ...',
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
  min-height: 260px;
  background: linear-gradient(135deg, #eaf3ff 0%, #f5faff 100%);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
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
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 0 28px 0 22px;
  width: 56vw;
  min-width: 320px;
  max-width: 820px;
  height: 76px;
  display: flex;
  align-items: center;
}

.search-icon {
  color: #b0b7c3;
  font-size: 28px;
  margin-right: 14px;
}

.search-bar-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  font-size: 2.8rem;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 2.0rem;
  font-weight: 600;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner::placeholder) {
  font-size: 1.2rem;
  font-weight: 400;
  color: #b0b7c3 !important;
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
    width: 98vw;
    max-width: none;
    min-width: 0;
    height: 72px;
    padding: 0 20px 0 18px;
  }
}

.search-bar-btn {
  margin-left: 18px;
  height: 44px;
  min-width: 110px;
  font-size: 1.1rem;
  border-radius: 999px !important;
  background: #347cff;
  border: none;
  box-shadow: 0 2px 8px 0 rgba(52,124,255,0.08);
}
</style>
