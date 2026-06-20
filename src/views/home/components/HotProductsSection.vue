<template>
  <section class="hot-section">
    <div class="hot-container">
      <div class="hot-header">
        <div class="hot-header-main">
          <div class="hot-header-icon" aria-hidden="true">
            <Icon class="hot-header-icon-inner" icon="solar:fire-bold-duotone" width="25" height="25" />
          </div>
          <div class="hot-heading-copy">
            <span class="hot-kicker">{{ t('home.hotKicker') }}</span>
            <h2 class="hot-title">{{ t('home.hotTitle') }}</h2>
            <p class="hot-subtitle">{{ t('home.hotSubtitle') }}</p>
          </div>
        </div>
        <button class="hot-more" type="button" @click="$emit('more-click')">
          {{ t('home.hotMore') }}
          <Icon icon="solar:arrow-right-linear" width="18" height="18" aria-hidden="true" />
        </button>
      </div>
      <div class="hot-grid">
        <article
          v-for="product in visibleProducts"
          :key="product.appId" 
          class="hot-item" 
          role="button"
          tabindex="0"
          @click="handleProductClick(product)"
          @keydown.enter.prevent="handleProductClick(product)"
          @keydown.space.prevent="handleProductClick(product)"
        >
          <div class="hot-img-wrap">
            <img :src="getProductImageUrl(product)" :alt="product.name" class="hot-img" />
          </div>
          <div class="hot-card-body">
            <div class="hot-name">{{ product.name }}</div>
            <div class="hot-card-footer">
              <span class="hot-price">${{ product.price.toFixed(2) }}</span>
              <button
                v-if="isCartEnabled"
                class="hot-cart-toggle"
                type="button"
                :class="{ active: isProductInCart(product) }"
                :title="isProductInCart(product) ? t('cart.removeFromCart') : t('cart.addToCart')"
                :aria-label="isProductInCart(product) ? t('cart.removeFromCart') : t('cart.addToCart')"
                @click.stop="toggleCart(product)"
              >
                <el-icon><ShoppingCart /></el-icon>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { ShoppingCart } from '@element-plus/icons-vue';
import type { ProductBaseVO } from '@/types';
import { useI18n } from '@/i18n';
import { getProductImageUrl } from '@/utils/productImage'
import { useCartStore } from '@/store/cart'
import { useLocaleStore } from '@/store/locale'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'

const { t } = useI18n();
const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()

const props = defineProps<{
  hotProducts: ProductBaseVO[];
}>();

const emit = defineEmits(['product-click', 'more-click']);

const visibleProducts = computed(() => {
  const rowSize = 6
  const count = Math.floor((props.hotProducts?.length || 0) / rowSize) * rowSize
  return (props.hotProducts || []).slice(0, count)
});

const handleProductClick = (product: ProductBaseVO) => {
  emit('product-click', product)
}

const isProductInCart = (product: ProductBaseVO) => cartStore.hasItem(product?.appId)

const toggleCart = (product: ProductBaseVO) => {
  if (!isCartEnabled) return
  if (!product?.appId) return
  const removing = isProductInCart(product)
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
</script>

<style scoped>
.hot-section {
  padding: 72px 0;
  background:
    radial-gradient(circle at 12% 0%, rgba(15, 107, 104, 0.08), transparent 28rem),
    radial-gradient(circle at 88% 8%, rgba(245, 158, 11, 0.10), transparent 24rem),
    linear-gradient(180deg, #ffffff 0%, #f8fbfa 100%);
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.hot-container {
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  max-width: 100%;
}

.hot-header {
  display: flex;
  align-items: flex-start;
  width: min(var(--container), 100%);
  margin-bottom: 32px;
  justify-content: space-between;
  gap: 18px;
}

.hot-header-main {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  min-width: 0;
}

.hot-header-icon {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255, 247, 237, 0.98) 0%, rgba(223, 245, 241, 0.92) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 18px 42px rgba(245, 158, 11, 0.14),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.hot-header-icon-inner {
  color: var(--color-accent);
}

.hot-heading-copy {
  display: grid;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.hot-kicker {
  color: var(--color-brand);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hot-title {
  font-family: var(--font-display);
  font-size: clamp(2.15rem, 4vw, 3.35rem);
  line-height: 0.96;
  font-weight: 850;
  color: var(--color-ink);
  margin: 0;
  letter-spacing: 0;
}

.hot-subtitle {
  max-width: 560px;
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.55;
}

.hot-more {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: #fff;
  border-color: rgba(15, 107, 104, 0.16);
  box-shadow: var(--shadow-sm);
  font-size: 0.94rem;
  font-weight: 800;
  white-space: nowrap;
}

.hot-more:hover {
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.34);
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  justify-items: stretch;
  align-items: start;
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  justify-content: center;
  box-sizing: border-box;
}

.hot-item {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-height: 100%;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%);
  box-shadow:
    0 14px 34px rgba(17, 24, 39, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  color: var(--color-ink);
  overflow: visible;
}

.hot-item:hover,
.hot-item:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(15, 107, 104, 0.22);
  box-shadow:
    0 24px 70px rgba(17, 24, 39, 0.13),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.hot-item:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.24);
  outline-offset: 4px;
}

.hot-img-wrap {
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
  transition: transform 300ms ease, box-shadow 300ms ease;
  transform-origin: center;
  flex-shrink: 0;
}

.hot-item:hover .hot-img-wrap {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 16px 42px rgba(17, 24, 39, 0.16);
}

.hot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.hot-card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 4px 4px;
}

.hot-name {
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--color-ink);
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-item:hover .hot-name {
  color: var(--color-brand);
}

.hot-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.hot-price {
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

.hot-item:hover .hot-price {
  color: #fff;
  background: var(--color-brand);
}

.hot-cart-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-muted);
  box-shadow: var(--shadow-sm);
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.hot-cart-toggle:hover,
.hot-cart-toggle.active {
  color: var(--color-brand);
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .hot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hot-section {
    padding: 56px 0;
  }

  .hot-header {
    margin-bottom: 26px;
  }

  .hot-more {
    align-self: flex-start;
  }

  .hot-header-icon {
    width: 50px;
    height: 50px;
    flex-basis: 50px;
    border-radius: 16px;
  }

  .hot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .hot-name {
    font-size: 0.98rem;
  }

  .hot-price {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hot-container {
    padding: 0 16px;
  }

  .hot-header {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .hot-header-main {
    align-items: center;
    gap: 12px;
  }

  .hot-subtitle {
    font-size: 0.92rem;
  }

  .hot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .hot-item {
    min-height: 0;
    padding: 10px;
  }

  .hot-card-body {
    gap: 10px;
    padding: 12px 2px 2px;
  }

  .hot-name {
    min-height: 2.6em;
    font-size: 0.9rem;
  }

  .hot-card-footer {
    gap: 8px;
  }

  .hot-price {
    min-height: 30px;
    padding: 0 9px;
    font-size: 0.88rem;
  }

  .hot-cart-toggle {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
  }
}
</style>
