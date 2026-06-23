<template>
  <section :class="['product-admin-panel', `product-admin-panel--${variant}`]" @click.stop>
    <div class="product-admin-panel__header">
      <span>{{ title }}</span>
      <div class="product-admin-panel__states">
        <span :class="['product-admin-panel__state', metrics?.storeVisibility === 'HIDDEN' ? 'hidden' : 'visible']">
          {{ metrics?.storeVisibility === 'HIDDEN' ? '已隐藏' : '展示中' }}
        </span>
        <span :class="['product-admin-panel__state', isSampleDesign ? 'sample' : 'neutral']">
          {{ isSampleDesign ? 'Sample' : 'Not sample' }}
        </span>
      </div>
    </div>

    <div class="product-admin-panel__metrics">
      <div><strong>{{ formatNumber(metrics?.download) }}</strong><span>下载</span></div>
      <div><strong>{{ formatNumber(metrics?.purchase) }}</strong><span>购买</span></div>
      <div><strong>{{ formatScore(metrics?.score) }}</strong><span>评分</span></div>
      <div><strong>{{ metrics?.storeWeight ?? DEFAULT_DISPLAY_WEIGHT }}</strong><span>权重</span></div>
    </div>

    <div class="product-admin-panel__meta">
      <span>{{ designerLabel }}</span>
      <span>{{ formatDate(metrics?.lastGoLive) }}</span>
      <span v-if="metrics?.storeVisibilityReason">原因：{{ metrics.storeVisibilityReason }}</span>
    </div>

    <div v-if="metrics?.categories?.length" class="product-admin-panel__categories">
      <span
        v-for="category in metrics.categories"
        :key="category.id"
        :class="{ current: category.id === currentCategoryId }"
      >
        {{ category.name }}
      </span>
    </div>

    <div class="product-admin-panel__actions">
      <button type="button" :class="{ danger: metrics?.storeVisibility !== 'HIDDEN' }" @click="toggleVisibility">
        {{ metrics?.storeVisibility === 'HIDDEN' ? '恢复展示' : '隐藏应用' }}
      </button>
      <button type="button" @click="editStoreWeight">权重</button>
      <button type="button" @click="categoryEditorVisible = true">分类</button>
      <button type="button" @click="toggleSampleStatus">
        {{ isSampleDesign ? '取消 Sample' : '设为 Sample' }}
      </button>
      <button type="button" @click="openProductInStudio">Studio</button>
      <button
        v-if="currentCategoryId"
        type="button"
        class="danger"
        @click="removeFromCategory"
      >
        移出分类
      </button>
    </div>

    <AdminCategoryEditorDialog
      v-model="categoryEditorVisible"
      :app-id="product?.appId ? Number(product.appId) : null"
      :selected-categories="metrics?.categories || []"
      @saved="emitChanged"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminCategoryEditorDialog from '@/components/AdminCategoryEditorDialog.vue'
import {
  removeProductCategory,
  updateProductSampleStatus,
  updateProductStoreDisplay,
} from '@/api/product'
import { openStudioDesign } from '@/utils/studio'
import type { ProductStoreMetricsVO } from '@/types'

const DEFAULT_DISPLAY_WEIGHT = 20
const DISPLAY_WEIGHT_PATTERN = /^(?:[0-9]|[1-9][0-9])$/

const props = withDefaults(defineProps<{
  product: any
  metrics: ProductStoreMetricsVO | null
  currentCategoryId?: number | null
  title?: string
  variant?: 'card' | 'detail'
}>(), {
  currentCategoryId: null,
  title: '管理员数据',
  variant: 'card',
})

const emit = defineEmits<{
  (event: 'changed', appId: number): void
  (event: 'removedFromCurrentCategory', appId: number): void
}>()

const categoryEditorVisible = ref(false)
const isSampleDesign = computed(() => Number(props.metrics?.designIsTemplate || 0) === 1)
const designerLabel = computed(() => {
  const designer = props.metrics?.designer
  if (!designer) return 'Designer -'
  const name = designer.nickname || designer.username || 'Designer'
  return `${name} #${designer.id}`
})

const emitChanged = () => {
  if (props.product?.appId) {
    emit('changed', Number(props.product.appId))
  }
}

const formatNumber = (value?: number | null) => {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatScore = (value?: number | null) => {
  if (value == null) return '-'
  return Number(value).toFixed(2)
}

const formatDate = (value?: string | null) => {
  if (!value) return '未上线'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未上线'
  return date.toLocaleDateString()
}

const openProductInStudio = () => {
  const designId = String(props.product?.designId || '').trim()
  if (!designId) {
    ElMessage.error('Studio design is not available')
    return
  }
  openStudioDesign(designId)
}

const toggleVisibility = async () => {
  if (!props.product?.appId || !props.metrics) return
  const hidden = props.metrics.storeVisibility === 'HIDDEN'
  let reason = props.metrics.storeVisibilityReason || ''
  if (!hidden) {
    const result = await ElMessageBox.prompt('隐藏原因', '隐藏应用', {
      confirmButtonText: '隐藏',
      cancelButtonText: '取消',
      inputValue: reason,
    })
    reason = String(result.value || '').trim()
  }
  await updateProductStoreDisplay(Number(props.product.appId), {
    storeVisibility: hidden ? 'VISIBLE' : 'HIDDEN',
    weight: props.metrics.storeWeight ?? DEFAULT_DISPLAY_WEIGHT,
    reason,
  })
  ElMessage.success(hidden ? '应用已恢复展示' : '应用已隐藏')
  emitChanged()
}

const editStoreWeight = async () => {
  if (!props.product?.appId || !props.metrics) return
  const result = await ElMessageBox.prompt('请输入 0-99 的整数，数值越大越靠前', '展示权重', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: String(props.metrics.storeWeight ?? DEFAULT_DISPLAY_WEIGHT),
    inputPattern: DISPLAY_WEIGHT_PATTERN,
    inputErrorMessage: '请输入 0-99 的整数',
  })
  await updateProductStoreDisplay(Number(props.product.appId), {
    storeVisibility: props.metrics.storeVisibility || 'VISIBLE',
    weight: Number(result.value),
    reason: props.metrics.storeVisibilityReason || '',
  })
  ElMessage.success('权重已更新')
  emitChanged()
}

const toggleSampleStatus = async () => {
  if (!props.product?.appId || !props.metrics) return
  const nextValue = isSampleDesign.value ? 0 : 1
  const title = nextValue === 1 ? '设为 Sample Project' : '取消 Sample Project'
  const message = nextValue === 1
    ? '确认让这个设计出现在 Studio 的 Sample Projects 里？'
    : '确认从 Studio 的 Sample Projects 中移除这个设计？'
  await ElMessageBox.confirm(message, title, {
    confirmButtonText: nextValue === 1 ? '设为 Sample' : '取消 Sample',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await updateProductSampleStatus(Number(props.product.appId), nextValue)
  ElMessage.success(nextValue === 1 ? '已设为 Studio Sample' : '已取消 Studio Sample')
  emitChanged()
}

const removeFromCategory = async () => {
  if (!props.product?.appId || !props.currentCategoryId) return
  await ElMessageBox.confirm('确认将该应用从当前分类移出？应用不会被删除。', '移出分类', {
    confirmButtonText: '移出',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await removeProductCategory(Number(props.product.appId), props.currentCategoryId)
  ElMessage.success('已移出当前分类')
  emit('removedFromCurrentCategory', Number(props.product.appId))
}
</script>

<style scoped>
.product-admin-panel {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 0.72rem;
  line-height: 1.25;
}

.product-admin-panel--card {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  background: rgba(248, 250, 252, 0.92);
}

.product-admin-panel--detail {
  width: var(--detail-content-width);
  gap: 12px;
  margin: 0 0 22px;
  padding: 14px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
}

.product-admin-panel__header,
.product-admin-panel__states,
.product-admin-panel__meta,
.product-admin-panel__actions,
.product-admin-panel__categories {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.product-admin-panel__header {
  justify-content: space-between;
  font-weight: 750;
  color: var(--color-ink);
}

.product-admin-panel__state,
.product-admin-panel__meta span,
.product-admin-panel__categories span {
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
}

.product-admin-panel__state.visible,
.product-admin-panel__state.sample,
.product-admin-panel__categories span.current {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.22);
}

.product-admin-panel__state.hidden,
.product-admin-panel__actions button.danger {
  color: #b42318;
  border-color: rgba(180, 35, 24, 0.22);
}

.product-admin-panel__state.hidden {
  background: rgba(180, 35, 24, 0.1);
}

.product-admin-panel__state.neutral,
.product-admin-panel__categories span {
  color: #64748b;
  background: #f1f5f9;
}

.product-admin-panel__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.product-admin-panel__metrics div {
  display: grid;
  gap: 2px;
  padding: 6px;
  border-radius: 8px;
  background: #fff;
  text-align: center;
}

.product-admin-panel--detail .product-admin-panel__metrics div {
  padding: 8px 6px;
  background: #f8fafc;
}

.product-admin-panel__metrics strong {
  color: var(--color-ink);
  font-size: 0.95rem;
}

.product-admin-panel__metrics span,
.product-admin-panel__meta {
  color: #64748b;
}

.product-admin-panel__actions button {
  min-height: 24px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  color: #334155;
  font-size: 0.72rem;
  cursor: pointer;
}

.product-admin-panel--detail .product-admin-panel__actions button {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 8px;
}

.product-admin-panel__actions button:hover {
  border-color: rgba(15, 107, 104, 0.34);
  color: var(--color-brand-strong);
}
</style>
