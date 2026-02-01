<template>
  <section class="search-section search-section-gradient">
    <div class="search-bar-outer">
      <div class="search-bar-inner flex items-center">
        <el-icon class="search-icon"><Search /></el-icon>
        <el-input
          v-model="searchTerm"
          placeholder='Try "Elegant" ...'
          class="search-bar-input"
          @input="handleSearch"
          :border="false"
        />
        <el-button class="search-bar-btn" type="primary" round @click="handleSearchImmediate">Search</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const searchTerm = ref('');
const emit = defineEmits(['search']);

let debounceTimer: number | undefined

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

const handleSearchImmediate = () => {
  const value = searchTerm.value.trim()
  if (value.length < 2) return
  if (debounceTimer) window.clearTimeout(debounceTimer)
  emitSearch(value)
}

onBeforeUnmount(() => {
  if (debounceTimer) window.clearTimeout(debounceTimer)
})
</script>

<style scoped>
.search-section {
  min-height: 220px;
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
  padding: 0 24px 0 20px;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  height: 64px;
  display: flex;
  align-items: center;
}

.search-icon {
  color: #b0b7c3;
  font-size: 26px;
  margin-right: 12px;
}

.search-bar-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  font-size: 1.3rem;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-size: 1.3rem;
  color: #222;
  padding: 0;
}

.search-bar-input :deep(.el-input__inner)::placeholder {
  color: #b0b7c3 !important;
  opacity: 1;
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
