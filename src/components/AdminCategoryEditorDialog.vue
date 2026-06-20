<template>
  <el-dialog
    v-model="visible"
    title="编辑应用分类"
    width="420px"
    :z-index="11000"
    class="admin-category-dialog"
    @open="handleOpen"
  >
    <div class="category-editor">
      <div class="category-editor-label">所属分类</div>
      <el-select
        v-model="selectedIds"
        class="category-editor-select"
        multiple
        filterable
        clearable
        :loading="loading"
        popper-class="admin-category-select-popper"
        placeholder="选择分类"
      >
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>
      <div class="category-editor-hint">保存后会替换当前应用的分类列表。</div>
    </div>
    <template #footer>
      <button type="button" class="category-editor-btn" @click="visible = false">取消</button>
      <button
        type="button"
        class="category-editor-btn primary"
        :disabled="saving"
        @click="saveCategories"
      >
        {{ saving ? '保存中' : '保存' }}
      </button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSeries, updateProductCategories } from '@/api/product'
import type { CategoryVO, Series } from '@/types'

const props = defineProps<{
  modelValue: boolean
  appId?: number | null
  selectedCategories?: CategoryVO[] | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'saved'): void
}>()

const categories = ref<Series[]>([])
const selectedIds = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const syncSelectedIds = () => {
  selectedIds.value = (props.selectedCategories || []).map((category) => Number(category.id))
}

const loadCategories = async () => {
  if (categories.value.length > 0) return
  loading.value = true
  try {
    categories.value = await getSeries()
  } finally {
    loading.value = false
  }
}

const handleOpen = async () => {
  syncSelectedIds()
  await loadCategories()
}

const saveCategories = async () => {
  if (!props.appId) return
  saving.value = true
  try {
    await updateProductCategories(Number(props.appId), selectedIds.value)
    ElMessage.success('分类已更新')
    visible.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

watch(() => props.selectedCategories, () => {
  if (visible.value) {
    syncSelectedIds()
  }
})
</script>

<style scoped>
.category-editor {
  display: grid;
  gap: 8px;
}

.category-editor-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #334155;
}

.category-editor-select {
  width: 100%;
}

.category-editor-hint {
  font-size: 0.78rem;
  color: #64748b;
}

.category-editor-btn {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.category-editor-btn.primary {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: #fff;
}

.category-editor-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

:global(.admin-category-select-popper) {
  z-index: 11010 !important;
}
</style>
