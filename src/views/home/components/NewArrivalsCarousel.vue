<template>
  <section class="new-section">
    <div class="new-container">
      <SectionHeading
        :kicker="t('home.newKicker')"
        :title="t('home.newArrivalsTitle')"
      />
      <ProductGridSkeleton v-if="loading" :count="4" class="new-loading" />
      <p v-else-if="error" class="section-status" role="status">{{ t('home.sectionUnavailable') }}</p>
      <div v-else class="new-carousel-wrap">
        <div class="new-scroll" ref="scrollContainer">
          <div class="new-scroll-track">
            <div v-for="product in loopProducts" :key="`${product.appId}-${product.__loopKey}`" class="new-slide">
              <article
                class="slide-card"
                role="button"
                tabindex="0"
                @click="handleProductClick(product.__origin)"
                @keydown.enter.prevent="handleProductClick(product.__origin)"
                @keydown.space.prevent="handleProductClick(product.__origin)"
              >
                <div
                  v-if="hasBundleEntitlement"
                  class="product-activated-badge"
                  :title="t('product.activated')"
                  :aria-label="t('product.activated')"
                >
                  <Icon icon="solar:star-bold" width="14" height="14" aria-hidden="true" />
                </div>
                <div class="product-circle-img">
                  <img
                    :src="getProductImageUrl(product)"
                    :alt="product.name"
                    class="circle-img"
                    loading="lazy"
                  />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div v-if="!hasBundleEntitlement" class="product-footer">
                    <div class="product-price">${{ product.price.toFixed(2) }}</div>
                    <button
                      v-if="isCartEnabled"
                      class="cart-toggle"
                      type="button"
                      :class="{ active: cartStore.hasItem(product.appId) }"
                      :title="cartStore.hasItem(product.appId) ? t('cart.removeFromCart') : t('cart.addToCart')"
                      :aria-label="cartStore.hasItem(product.appId) ? t('cart.removeFromCart') : t('cart.addToCart')"
                      @click.stop="toggleCart(product.__origin)"
                    >
                      <el-icon><ShoppingCart /></el-icon>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import type { ProductBaseVO } from '@/types';
import { getProductImageUrl } from '@/utils/productImage'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'
import { hasActiveBundle } from '@/utils/entitlements'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'

const props = defineProps<{
  newProducts: ProductBaseVO[];
  loading?: boolean;
  error?: boolean;
}>();

const emit = defineEmits(['product-click']);
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const hasBundleEntitlement = computed(() => hasActiveBundle(userStore.userInfo))

const scrollContainer = ref<HTMLElement | null>(null)
const isMobile = ref(false)
let autoScrollInterval: number | null = null
let resumeTimer: number | null = null

const detectMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
}

const loopProducts = computed(() => {
  if (!props.newProducts || props.newProducts.length === 0) return [] as Array<ProductBaseVO & { __loopKey: string; __origin: ProductBaseVO }>
  if (props.newProducts.length === 1) return [{ ...props.newProducts[0], __loopKey: 'a', __origin: props.newProducts[0] }]
  return [
    ...props.newProducts.map(p => ({ ...p, __loopKey: 'a', __origin: p })),
    ...props.newProducts.map(p => ({ ...p, __loopKey: 'b', __origin: p })),
  ]
})

const handleProductClick = (product: ProductBaseVO) => {
  emit('product-click', product)
}

const toggleCart = (product: ProductBaseVO) => {
  if (!isCartEnabled) return
  if (!product?.appId) return
  const removing = cartStore.hasItem(product.appId)
  cartStore.toggle(product)
  if (removing) {
    ElMessage.success(t('cart.removed'))
    return
  }
  showAddedToCartMessage(router, localeStore.currentLocale, {
    added: t('cart.added'),
    viewCart: t('cart.viewCart'),
  })
}

const normalizeLoopScroll = () => {
  const el = scrollContainer.value
  if (!el) return
  if (props.newProducts.length <= 1) return

  const half = el.scrollWidth / 2
  if (half <= 0) return

  if (el.scrollLeft <= 0) {
    el.scrollLeft = el.scrollLeft + half
    return
  }

  if (el.scrollLeft >= half) {
    el.scrollLeft = el.scrollLeft - half
  }
}

const startAutoScroll = () => {
  if (!scrollContainer.value) return
  if (props.newProducts.length <= 1) return
  if (isMobile.value) return

  stopAutoScroll()
  autoScrollInterval = window.setInterval(() => {
    const el = scrollContainer.value
    if (!el) return
    el.scrollLeft += 1
    normalizeLoopScroll()
  }, 30)
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    window.clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

const pauseAndCancelResume = () => {
  stopAutoScroll()
  if (resumeTimer) {
    window.clearTimeout(resumeTimer)
    resumeTimer = null
  }
}

const scheduleResume = () => {
  if (isMobile.value) return
  if (props.newProducts.length <= 1) return
  if (resumeTimer) window.clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(() => {
    startAutoScroll()
  }, 2000)
}

const handleInteractionStart = () => {
  pauseAndCancelResume()
}

const handleInteractionEnd = () => {
  scheduleResume()
}

onMounted(() => {
  isMobile.value = detectMobile()

  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', normalizeLoopScroll, { passive: true })
    scrollContainer.value.addEventListener('touchstart', handleInteractionStart, { passive: true })
    scrollContainer.value.addEventListener('touchend', handleInteractionEnd, { passive: true })
    scrollContainer.value.addEventListener('pointerdown', handleInteractionStart)
    scrollContainer.value.addEventListener('pointerup', handleInteractionEnd)
    scrollContainer.value.addEventListener('mouseenter', handleInteractionStart)
    scrollContainer.value.addEventListener('mouseleave', handleInteractionEnd)
  }

  if (!isMobile.value) {
    startAutoScroll()
  }
})

onUnmounted(() => {
  stopAutoScroll()
  if (resumeTimer) {
    window.clearTimeout(resumeTimer)
    resumeTimer = null
  }

  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', normalizeLoopScroll)
    scrollContainer.value.removeEventListener('touchstart', handleInteractionStart)
    scrollContainer.value.removeEventListener('touchend', handleInteractionEnd)
    scrollContainer.value.removeEventListener('pointerdown', handleInteractionStart)
    scrollContainer.value.removeEventListener('pointerup', handleInteractionEnd)
    scrollContainer.value.removeEventListener('mouseenter', handleInteractionStart)
    scrollContainer.value.removeEventListener('mouseleave', handleInteractionEnd)
  }
})
</script>

<style scoped>
.new-section {
  background: #fff;
  padding: 62px 0 54px;
}

.new-container {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding-inline: var(--page-gutter);
}

.new-loading,
.section-status {
  margin-top: var(--space-6);
}

.section-status {
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  background: var(--color-surface);
}

.new-carousel-wrap {
  padding: var(--space-5) 0 0;
  position: relative;
}

.new-slide {
  height: auto;
  flex: 0 0 auto;
}

.new-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 44px;
}

.new-scroll::-webkit-scrollbar {
  display: none;
}

.new-scroll-track {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 0;
}

.slide-card {
  position: relative;
  width: 100%;
  border: none;
  background: transparent;
  padding: 22px 10px 18px;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.slide-card:active {
  transform: scale(0.99);
}

.product-circle-img {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(180deg, #fff 0%, #eef5f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-line);
  margin: 0 auto;
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-card:hover .product-circle-img {
  transform: scale(1.03);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.16);
}

.circle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.product-info {
  margin-top: 24px;
  text-align: center;
  padding: 0 16px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand);
}

.product-activated-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 999px;
  color: rgba(151, 94, 10, 0.72);
  background: rgba(255, 247, 214, 0.5);
  border: 1px solid rgba(194, 138, 26, 0.18);
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-muted);
  box-shadow: var(--shadow-sm);
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.cart-toggle:hover,
.cart-toggle.active {
  color: var(--color-brand);
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
}

/* ⭐ 连续滚动核心 */

:deep(.new-scroll) {
  scroll-behavior: auto;
}

/* Responsive styles */
@media (max-width: 768px) {
  .new-section {
    padding: 24px 0;
  }
  
  .new-container {
    width: 100%;
    padding-inline: var(--page-gutter);
  }
  
  .new-carousel-wrap {
    padding: 0 8px;
  }

  .new-scroll {
    padding: 10px 0 24px;
  }

  .new-scroll-track {
    gap: 18px;
  }

  .product-circle-img {
    width: 250px;
    height: 250px;
    border-width: 3px;
  }
}

@media (max-width: 480px) {
  .new-section {
    padding: 20px 0;
  }
  
  .new-container {
    width: 100%;
    padding: 0 8px;
  }
  
  .new-carousel-wrap {
    padding: 0;
  }

  .slide-btn {
    padding: 18px 6px 14px;
  }

  .new-scroll-track {
    gap: 12px;
  }

  .product-circle-img {
    width: 220px;
    height: 220px;
  }

  .product-name {
    font-size: 16px;
  }

  .product-price {
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .product-circle-img {
    width: 190px;
    height: 190px;
  }

  .product-name {
    font-size: 15px;
  }

  .product-price {
    font-size: 14px;
  }
}
</style>
