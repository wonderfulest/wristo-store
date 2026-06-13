<template>
  <section class="cart-list" aria-labelledby="cart-title">
    <div class="cart-head">
      <div>
        <p class="cart-kicker">Saved items</p>
        <h1 id="cart-title">Cart</h1>
      </div>
      <div v-if="cartStore.count" class="cart-summary">
        <span>{{ cartStore.count }} items</span>
        <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong>
      </div>
    </div>

    <div v-if="!cartStore.items.length" class="empty-state">
      <el-icon><ShoppingCart /></el-icon>
      <h2>Your cart is empty</h2>
      <p>Save watch faces here while browsing. Checkout will be added later.</p>
      <button type="button" class="browse-btn" @click="goHome">Browse watch faces</button>
    </div>

    <div v-else class="cart-items">
      <article v-for="item in cartStore.items" :key="item.appId" class="cart-item">
        <button type="button" class="item-main" @click="goProduct(item.appId)">
          <span class="item-image">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
            <span v-else class="item-fallback">W</span>
          </span>
          <span class="item-info">
            <strong>{{ item.name }}</strong>
            <span>${{ item.price.toFixed(2) }}</span>
          </span>
        </button>

        <div class="item-actions">
          <el-input-number
            :model-value="item.quantity"
            :min="1"
            :max="99"
            size="small"
            controls-position="right"
            aria-label="Quantity"
            @change="updateQuantity(item.appId, $event)"
          />
          <button type="button" class="remove-btn" title="Remove" @click="cartStore.remove(item.appId)">
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Delete, ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()

const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)

const goHome = () => {
  router.push(localizedPath('/'))
}

const goProduct = (appId: number) => {
  router.push(localizedPath(`/product/${appId}`))
}

const updateQuantity = (appId: number, value: number | undefined) => {
  cartStore.setQuantity(appId, value ?? 1)
}
</script>

<style scoped>
.cart-list {
  width: 100%;
}

.cart-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.cart-kicker {
  margin: 0 0 6px;
  color: var(--color-brand);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: 2rem;
  letter-spacing: 0;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--color-muted);
  font-size: 0.92rem;
}

.cart-summary strong {
  color: var(--color-ink);
  font-size: 1.3rem;
}

.empty-state {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-muted);
  border: 1px dashed rgba(17, 24, 39, 0.18);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.68);
  padding: 40px 20px;
}

.empty-state .el-icon {
  color: var(--color-brand);
  font-size: 42px;
  margin-bottom: 14px;
}

.empty-state h2 {
  margin: 0 0 8px;
  color: var(--color-ink);
  font-size: 1.35rem;
}

.empty-state p {
  max-width: 360px;
  margin: 0 0 22px;
}

.browse-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--color-brand);
  color: #fff;
  font-weight: 800;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
}

.item-image {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #fff 0%, #eef5f3 100%);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-fallback {
  color: var(--color-brand);
  font-weight: 900;
}

.item-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-info strong {
  color: var(--color-ink);
  font-size: 1rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-info span {
  color: var(--color-brand);
  font-weight: 800;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.remove-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  color: #b42318;
}

@media (max-width: 640px) {
  .cart-head,
  .cart-item {
    align-items: stretch;
    flex-direction: column;
  }

  .cart-summary {
    align-items: flex-start;
  }

  .item-actions {
    justify-content: space-between;
  }
}
</style>
