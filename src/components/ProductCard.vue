<template>
  <article
    class="product-card"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <button
      class="cart-toggle"
      type="button"
      :class="{ active: isInCart }"
      :title="isInCart ? 'Remove from cart' : 'Add to cart'"
      :aria-label="isInCart ? 'Remove from cart' : 'Add to cart'"
      @click.stop="toggleCart"
    >
      <el-icon><ShoppingCart /></el-icon>
    </button>
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
      <div class="product-price">${{ product?.price?.toFixed(2) }}</div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { getProductImageUrl } from '@/utils/productImage'

const props = defineProps<{
  product: any
}>()

const router = useRouter()
const cartStore = useCartStore()

const isInCart = computed(() => cartStore.hasItem(props.product?.appId))
const productImageUrl = computed(() => getProductImageUrl(props.product))

const handleClick = () => {
  if (props.product?.appId) {
    router.push({ name: 'product-detail', params: { id: props.product.appId } })
  }
}

const toggleCart = () => {
  if (!props.product?.appId) return
  const removing = cartStore.hasItem(props.product.appId)
  cartStore.toggle(props.product)
  ElMessage.success(removing ? 'Removed from cart' : 'Added to cart')
}
</script>

<style scoped>
.product-card {
  position: relative;
  background: #fff;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-line);
  box-shadow: var(--shadow-sm);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
  text-align: left;
}

.cart-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 38px;
  height: 38px;
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
}

.cart-toggle:hover,
.cart-toggle.active {
  color: var(--color-brand);
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 107, 104, 0.2);
  box-shadow: var(--shadow-md);
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #eef5f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.product-img {
  max-width: 80%;
  max-height: 80%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
  margin: 0 auto;
}

.product-img-fallback {
  color: var(--color-brand);
  font-size: 3rem;
  font-weight: 900;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 1.2em;
  line-height: 1.4;
  letter-spacing: 0;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-brand);
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
