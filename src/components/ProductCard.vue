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
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'
import { getProductImageUrl } from '@/utils/productImage'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'

const props = defineProps<{
  product: any
}>()

const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const isInCart = computed(() => cartStore.hasItem(props.product?.appId))
const productImageUrl = computed(() => getProductImageUrl(props.product))

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
