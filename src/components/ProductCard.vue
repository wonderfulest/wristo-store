<template>
  <article
    class="product-card"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="product-img-wrap">
      <img
        v-if="productImageUrl"
        :src="productImageUrl"
        :alt="product?.name"
        class="product-img"
      />
      <span v-else class="product-img-fallback">W</span>
    </div>
    <div class="product-info">
      <div class="product-name">{{ product?.name }}</div>
      <div v-if="isAdmin && resolvedMetrics" class="admin-metrics" @click.stop>
        <div class="admin-metrics-top">
          <span>D {{ formatNumber(resolvedMetrics.download) }}</span>
          <span>P {{ formatNumber(resolvedMetrics.purchase) }}</span>
          <span>S {{ formatScore(resolvedMetrics.score) }}</span>
          <span>W {{ resolvedMetrics.storeWeight ?? DEFAULT_DISPLAY_WEIGHT }}</span>
        </div>
        <div class="admin-meta-line">
          <span>{{ designerLabel }}</span>
          <span>{{ formatDate(resolvedMetrics.lastGoLive) }}</span>
        </div>
        <div v-if="resolvedMetrics.categories?.length" class="admin-category-row">
          <span
            v-for="category in resolvedMetrics.categories"
            :key="category.id"
            class="admin-category-chip"
            :class="{ current: category.id === currentCategoryId }"
          >
            {{ category.name }}
          </span>
        </div>
        <div class="admin-actions">
          <button
            type="button"
            class="admin-action-btn"
            :class="{ danger: resolvedMetrics.storeVisibility !== 'HIDDEN' }"
            @click="toggleVisibility"
          >
            {{ resolvedMetrics.storeVisibility === 'HIDDEN' ? '恢复' : '隐藏' }}
          </button>
          <button type="button" class="admin-action-btn" @click="editStoreWeight">权重</button>
          <button type="button" class="admin-action-btn" @click="categoryEditorVisible = true">分类</button>
          <button type="button" class="admin-action-btn" @click="openProductInStudio">Studio</button>
          <button
            v-if="currentCategoryId"
            type="button"
            class="admin-action-btn danger"
            @click="removeFromCategory"
          >
            移出分类
          </button>
        </div>
      </div>
      <div class="product-footer">
        <div class="product-price">${{ product?.price?.toFixed(2) }}</div>
        <button
          v-if="isCartEnabled"
          class="cart-toggle"
          type="button"
          :class="{ active: isInCart }"
          :title="isInCart ? 'Remove from cart' : 'Add to cart'"
          :aria-label="isInCart ? 'Remove from cart' : 'Add to cart'"
          @click.stop="toggleCart"
        >
          <el-icon><ShoppingCart /></el-icon>
        </button>
      </div>
    </div>
    <AdminCategoryEditorDialog
      v-if="isAdmin"
      v-model="categoryEditorVisible"
      :app-id="product?.appId ? Number(product.appId) : null"
      :selected-categories="resolvedMetrics?.categories || []"
      @saved="refreshAfterAdminChange"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { getProductImageUrl } from '@/utils/productImage'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'
import { openStudioDesign } from '@/utils/studio'
import AdminCategoryEditorDialog from '@/components/AdminCategoryEditorDialog.vue'
import {
  fetchAdminStoreMetrics,
  removeProductCategory,
  updateProductStoreDisplay,
} from '@/api/product'
import type { ProductStoreMetricsVO } from '@/types'

const props = defineProps<{
  product: any
  adminMetrics?: ProductStoreMetricsVO | null
  currentCategoryId?: number | null
}>()

const emit = defineEmits<{
  (event: 'adminChanged', appId: number): void
}>()

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const localMetrics = ref<ProductStoreMetricsVO | null>(null)
const categoryEditorVisible = ref(false)
const DEFAULT_DISPLAY_WEIGHT = 20
const DISPLAY_WEIGHT_PATTERN = /^(?:[0-9]|[1-9][0-9])$/

const isInCart = computed(() => cartStore.hasItem(props.product?.appId))
const productImageUrl = computed(() => getProductImageUrl(props.product))
const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some((role) => role.roleCode === 'ROLE_ADMIN')
})
const resolvedMetrics = computed(() => props.adminMetrics || localMetrics.value)
const currentCategoryId = computed(() => props.currentCategoryId ?? null)
const designerLabel = computed(() => {
  const designer = resolvedMetrics.value?.designer
  if (!designer) return 'Designer -'
  const name = designer.nickname || designer.username || 'Designer'
  return `${name} #${designer.id}`
})

const handleClick = () => {
  if (props.product?.appId) {
    router.push({ name: 'product-detail', params: { id: props.product.appId } })
  }
}

const openProductInStudio = () => {
  const designId = String(props.product?.designId || '').trim()
  if (!designId) {
    ElMessage.error('Studio design is not available')
    return
  }
  openStudioDesign(designId)
}

const toggleCart = () => {
  if (!isCartEnabled) return
  if (!props.product?.appId) return
  const removing = cartStore.hasItem(props.product.appId)
  cartStore.toggle(props.product)
  if (removing) {
    ElMessage.success(t('cart.removed'))
    return
  }
  showAddedToCartMessage(router, localeStore.currentLocale, {
    added: t('cart.added'),
    viewCart: t('cart.viewCart'),
  })
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

const loadLocalMetrics = async () => {
  if (!isAdmin.value || props.adminMetrics || !props.product?.appId) return
  try {
    const list = await fetchAdminStoreMetrics([Number(props.product.appId)])
    localMetrics.value = list?.[0] || null
  } catch (error) {
    localMetrics.value = null
  }
}

const refreshAfterAdminChange = async () => {
  await loadLocalMetrics()
  if (props.product?.appId) {
    emit('adminChanged', Number(props.product.appId))
  }
}

const toggleVisibility = async () => {
  if (!props.product?.appId || !resolvedMetrics.value) return
  const hidden = resolvedMetrics.value.storeVisibility === 'HIDDEN'
  let reason = resolvedMetrics.value.storeVisibilityReason || ''
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
    weight: resolvedMetrics.value.storeWeight ?? DEFAULT_DISPLAY_WEIGHT,
    reason,
  })
  ElMessage.success(hidden ? '应用已恢复展示' : '应用已隐藏')
  await refreshAfterAdminChange()
}

const editStoreWeight = async () => {
  if (!props.product?.appId || !resolvedMetrics.value) return
  const result = await ElMessageBox.prompt('请输入 0-99 的整数，数值越大越靠前', '展示权重', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: String(resolvedMetrics.value.storeWeight ?? DEFAULT_DISPLAY_WEIGHT),
    inputPattern: DISPLAY_WEIGHT_PATTERN,
    inputErrorMessage: '请输入 0-99 的整数',
  })
  await updateProductStoreDisplay(Number(props.product.appId), {
    storeVisibility: resolvedMetrics.value.storeVisibility || 'VISIBLE',
    weight: Number(result.value),
    reason: resolvedMetrics.value.storeVisibilityReason || '',
  })
  ElMessage.success('权重已更新')
  await refreshAfterAdminChange()
}

const removeFromCategory = async () => {
  if (!props.product?.appId || !currentCategoryId.value) return
  await ElMessageBox.confirm('确认将该应用从当前分类移出？应用不会被删除。', '移出分类', {
    confirmButtonText: '移出',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await removeProductCategory(Number(props.product.appId), currentCategoryId.value)
  ElMessage.success('已移出当前分类')
  await refreshAfterAdminChange()
}

onMounted(loadLocalMetrics)

watch(() => [props.product?.appId, props.adminMetrics, isAdmin.value], () => {
  if (props.adminMetrics) {
    localMetrics.value = null
    return
  }
  loadLocalMetrics()
})
</script>

<style scoped>
.product-card {
  position: relative;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%);
  border-radius: 22px;
  overflow: visible;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 14px 34px rgba(17, 24, 39, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  cursor: pointer;
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  width: 100%;
  padding: 14px;
  text-align: left;
  color: var(--color-ink);
}

.cart-toggle {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-muted);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.cart-toggle:hover,
.cart-toggle.active {
  color: var(--color-brand);
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
}

.product-card:hover,
.product-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(15, 107, 104, 0.22);
  box-shadow:
    0 24px 70px rgba(17, 24, 39, 0.13),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.product-card:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.24);
  outline-offset: 4px;
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.98), transparent 46%),
    linear-gradient(135deg, rgba(223, 245, 241, 0.94) 0%, rgba(255, 248, 235, 0.92) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.08);
  box-sizing: border-box;
  flex-shrink: 0;
  transition: transform 300ms ease, box-shadow 300ms ease;
  transform-origin: center;
}

.product-card:hover .product-img-wrap {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 16px 42px rgba(17, 24, 39, 0.16);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.product-img-fallback {
  color: var(--color-brand);
  font-size: 3rem;
  font-weight: 900;
}

.product-info {
  padding: 16px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.product-name {
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--color-ink);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6em;
  line-height: 1.3;
  letter-spacing: 0;
}

.admin-metrics {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  background: rgba(248, 250, 252, 0.92);
  color: #334155;
  font-size: 0.72rem;
  line-height: 1.25;
}

.admin-metrics-top,
.admin-meta-line,
.admin-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-metrics-top span,
.admin-meta-line span {
  padding: 2px 6px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.admin-category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.admin-category-chip {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
}

.admin-category-chip.current {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
}

.admin-action-btn {
  min-height: 24px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  color: #334155;
  font-size: 0.72rem;
  cursor: pointer;
}

.admin-action-btn:hover {
  border-color: rgba(15, 107, 104, 0.34);
  color: var(--color-brand-strong);
}

.admin-action-btn.danger {
  color: #b42318;
  border-color: rgba(180, 35, 24, 0.22);
}

.product-card:hover .product-name {
  color: var(--color-brand);
}

.product-price {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: rgba(15, 107, 104, 0.08);
  font-size: 1rem;
  font-weight: 850;
  transition: color 180ms ease, background 180ms ease;
}

.product-card:hover .product-price {
  color: #fff;
  background: var(--color-brand);
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

@media (max-width: 768px) {
  .product-name {
    font-size: 0.95rem;
  }
  
  .product-price {
    font-size: 1rem;
  }
}
</style> 
