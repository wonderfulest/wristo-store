<template>
  <article
    class="product-card"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div
      v-if="hasBundleEntitlement"
      class="product-activated-badge"
      :title="t('product.activated')"
      :aria-label="t('product.activated')"
    >
      <el-icon><StarFilled /></el-icon>
    </div>
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
      <div class="product-public-metrics" aria-label="Product popularity">
        <span>
          <el-icon><Download /></el-icon>
          {{ formatDisplayDownloadCount(product?.download) }}
        </span>
        <span>
          <el-icon><StarFilled /></el-icon>
          {{ formatProductRating(product?.averageRating, product?.score) }}
        </span>
      </div>
      <ProductAdminPanel
        v-if="isAdmin && resolvedMetrics"
        :product="product"
        :metrics="resolvedMetrics"
        :current-category-id="currentCategoryId"
        variant="card"
        @changed="refreshAfterAdminChange"
        @removed-from-current-category="handleRemovedFromCurrentCategory"
      />
      <div v-if="!hasBundleEntitlement" class="product-footer">
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
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, ShoppingCart, StarFilled } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { getProductImageUrl } from '@/utils/productImage'
import { resolveProductDisplayRating } from '@/utils/productRating'
import { formatApproxDownloadCount, formatExactCount } from '@/utils/downloadCount'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'
import { hasActiveBundle } from '@/utils/entitlements'
import { fetchAdminStoreMetricBatched, invalidateAdminStoreMetric } from '@/utils/adminStoreMetricsBatch'
import ProductAdminPanel from '@/components/ProductAdminPanel.vue'
import type { ProductStoreMetricsVO } from '@/types'

const props = defineProps<{
  product: any
  adminMetrics?: ProductStoreMetricsVO | null
  currentCategoryId?: number | null
}>()

const emit = defineEmits<{
  (event: 'adminChanged', appId: number): void
  (event: 'removedFromCurrentCategory', appId: number): void
}>()

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const localMetrics = ref<ProductStoreMetricsVO | null>(null)

const isInCart = computed(() => cartStore.hasItem(props.product?.appId))
const productImageUrl = computed(() => getProductImageUrl(props.product))
const hasBundleEntitlement = computed(() => hasActiveBundle(userStore.userInfo))
const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some((role) => role.roleCode === 'ROLE_ADMIN')
})
const resolvedMetrics = computed(() => props.adminMetrics || localMetrics.value)
const currentCategoryId = computed(() => props.currentCategoryId ?? null)

const handleClick = () => {
  if (props.product?.appId) {
    router.push({ name: 'product-detail', params: { id: props.product.appId } })
  }
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

const formatDisplayDownloadCount = (value?: number | null) => {
  return isAdmin.value ? formatExactCount(value) : formatApproxDownloadCount(value)
}

const formatDisplayRating = (value?: number | null) => {
  if (value == null) return '-'
  return Number(value).toFixed(1)
}

const formatProductRating = (averageRating?: number | null, score?: number | null) => {
  return formatDisplayRating(resolveProductDisplayRating(averageRating, score))
}

const loadLocalMetrics = async (force = false) => {
  if (!isAdmin.value || props.adminMetrics || !props.product?.appId) return
  try {
    localMetrics.value = await fetchAdminStoreMetricBatched(Number(props.product.appId), { force })
  } catch (error) {
    localMetrics.value = null
  }
}

const refreshAfterAdminChange = async () => {
  if (props.product?.appId) {
    invalidateAdminStoreMetric(Number(props.product.appId))
  }
  await loadLocalMetrics(true)
  if (props.product?.appId) {
    emit('adminChanged', Number(props.product.appId))
  }
}

const handleRemovedFromCurrentCategory = async (appId: number) => {
  emit('removedFromCurrentCategory', appId)
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
  padding: 12px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  line-height: 1.3;
  letter-spacing: 0;
}

.product-public-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 20px;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1;
}

.product-public-metrics span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  white-space: nowrap;
}

.product-public-metrics .el-icon {
  color: var(--color-brand);
  font-size: 0.95rem;
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

.product-activated-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  border-radius: 999px;
  color: rgba(92, 59, 7, 0.78);
  background: rgba(255, 247, 214, 0.5);
  border: 1px solid rgba(194, 138, 26, 0.18);
  font-size: 0.78rem;
  font-weight: 750;
}

.product-activated-badge .el-icon {
  color: rgba(151, 94, 10, 0.72);
  font-size: 0.86rem;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
