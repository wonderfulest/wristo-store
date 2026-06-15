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
      <p>Save watch faces here while browsing, then complete checkout with your Wristo account email.</p>
      <button type="button" class="browse-btn" @click="goHome">Browse watch faces</button>
    </div>

    <div v-else class="cart-layout" :class="{ 'checkout-layout-active': inlineCheckoutVisible }">
      <div class="cart-items">
        <article v-for="item in cartStore.items" :key="item.appId" class="cart-item" :class="{ purchased: isPurchased(item.appId) }">
          <button type="button" class="item-main" @click="goProduct(item.appId)">
            <span class="item-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
              <span v-else class="item-fallback">W</span>
            </span>
            <span class="item-info">
              <span class="item-title-row">
                <strong>{{ item.name }}</strong>
                <span v-if="isPurchased(item.appId)" class="purchased-badge">Purchased</span>
              </span>
              <span>${{ item.price.toFixed(2) }}</span>
              <span v-if="purchaseConflict(item.appId)?.message" class="purchase-warning">
                {{ purchaseConflict(item.appId)?.message }}
              </span>
            </span>
          </button>

          <div class="item-actions">
            <span class="quantity-fixed">Qty 1</span>
            <button type="button" class="remove-btn" title="Remove" @click="removeItem(item.appId)">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </article>
      </div>

      <aside class="checkout-panel" aria-label="Checkout summary">
        <div class="checkout-row">
          <span>Items</span>
          <strong>{{ cartStore.count }}</strong>
        </div>
        <div class="checkout-row">
          <span>Subtotal</span>
          <strong>{{ formatMoney(cartSubtotal) }}</strong>
        </div>
        <div v-if="cartDiscount.rate > 0" class="checkout-row discount-row">
          <span>{{ cartDiscount.label }}</span>
          <strong>-{{ formatMoney(cartDiscount.amount) }}</strong>
        </div>
        <p v-else class="discount-hint">
          {{ firstDiscountHint.prefix }}<strong class="discount-saving">{{ firstDiscountHint.emphasis }}</strong>{{ firstDiscountHint.suffix }}
        </p>
        <p v-if="nextDiscountHint" class="discount-hint">
          {{ nextDiscountHint.prefix }}<strong class="discount-saving">{{ nextDiscountHint.emphasis }}</strong>{{ nextDiscountHint.suffix }}
        </p>
        <button type="button" class="recommend-search-btn" @click="goRecommendedSearch">
          <el-icon><Search /></el-icon>
          <span>Add more apps</span>
        </button>
        <div class="checkout-row total-row">
          <span>Estimated total</span>
          <strong>{{ formatMoney(cartEstimatedTotal) }}</strong>
        </div>
        <div class="email-lock">
          <span>Checkout email</span>
          <strong>{{ checkoutEmail }}</strong>
        </div>
        <button type="button" class="checkout-btn" :disabled="loading || checking || refreshingCart" @click="handleCheckout">
          <el-icon><CreditCard /></el-icon>
          <span>{{ checkoutButtonText }}</span>
        </button>
        <div v-if="inlineCheckoutVisible" class="inline-checkout-shell" aria-label="Paddle checkout" aria-live="polite">
          <div
            :key="inlineCheckoutKey"
            :id="checkoutFrameId"
            :class="['paddle-inline-checkout', checkoutFrameTarget]"
          ></div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CreditCard, Delete, Search, ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { useCartCheckout } from '@/composables/useCartCheckout'
import { checkCartPurchases } from '@/api/purchase'
import type { CartPurchaseCheckItemVO } from '@/api/purchase'
import { getProductDetail } from '@/api/product'

const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { loading, checkout, closeCheckout } = useCartCheckout()
const checking = ref(false)
const refreshingCart = ref(false)
const inlineCheckoutVisible = ref(false)
const inlineCheckoutKey = ref(0)
const purchaseConflicts = ref<Record<number, CartPurchaseCheckItemVO>>({})
const checkoutFrameId = 'cart-paddle-checkout'
const checkoutFrameTarget = 'cart-paddle-checkout-frame'
let rebuildingInlineCheckout = false
let rebuildTimer: ReturnType<typeof setTimeout> | null = null

const checkoutEmail = computed(() => userStore.userInfo?.email || 'Sign in required')
const cartSubtotal = computed(() => cartStore.items.reduce((total, item) => total + Number(item.price || 0), 0))
const discountEligibleCount = computed(() => cartStore.items.filter((item) => Number(item.price || 0) > 0).length)
const cartDiscountRate = computed(() => {
  const count = discountEligibleCount.value
  if (count >= 5) return 20
  if (count >= 3) return 15
  if (count >= 2) return 10
  return 0
})
const cartDiscount = computed(() => {
  const rate = cartDiscountRate.value
  const amount = rate > 0 ? Math.round(cartSubtotal.value * rate) / 100 : 0
  return {
    rate,
    amount,
    label: rate > 0 ? `Bundle SAVE ${rate}%` : 'Buy more, save more',
  }
})
const cartEstimatedTotal = computed(() => Math.max(0, cartSubtotal.value - cartDiscount.value.amount))
const discountHint = (prefix: string, emphasis: string, suffix = '.') => ({ prefix, emphasis, suffix })
const firstDiscountHint = discountHint('Add one more app to ', 'SAVE 10%')
const nextDiscountHint = computed(() => {
  const count = discountEligibleCount.value
  if (count === 2) return discountHint('Add one more app to ', 'SAVE 15%')
  if (count === 3 || count === 4) return discountHint(`${5 - count} more ${count === 4 ? 'app' : 'apps'} unlocks `, '20% off')
  return null
})
const checkoutButtonText = computed(() => {
  if (refreshingCart.value) return 'Refreshing cart...'
  if (checking.value) return 'Checking cart...'
  if (loading.value) return inlineCheckoutVisible.value ? 'Updating checkout...' : 'Opening checkout...'
  return 'Checkout'
})
const cartCheckoutSignature = computed(() => cartStore.items.map((item) => `${item.appId}:${Number(item.price || 0)}`).join('|'))

const formatMoney = (amount: number) => `$${amount.toFixed(2)}`

const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)

const goHome = () => {
  router.push(localizedPath('/'))
}

const goProduct = (appId: number) => {
  router.push(localizedPath(`/product/${appId}`))
}

const goRecommendedSearch = () => {
  router.push(localizedPath('/search'))
}

const purchaseConflict = (appId: number) => purchaseConflicts.value[appId]

const isPurchased = (appId: number) => Boolean(purchaseConflict(appId)?.purchased)

const removeItem = (appId: number) => {
  cartStore.remove(appId)
  const nextConflicts = { ...purchaseConflicts.value }
  delete nextConflicts[appId]
  purchaseConflicts.value = nextConflicts
}

const cartCheckoutItems = () => cartStore.items.map((item) => ({ appId: item.appId, quantity: 1 }))

const refreshCartItems = async () => {
  const currentItems = [...cartStore.items]
  if (!currentItems.length || refreshingCart.value) return

  refreshingCart.value = true
  try {
    const results = await Promise.allSettled(
      currentItems.map((item) => getProductDetail(String(item.appId)))
    )
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        cartStore.updateItem(result.value)
      }
    })
  } catch (error) {
    console.warn('Failed to refresh cart items:', error)
  } finally {
    refreshingCart.value = false
  }
}

const openInlineCheckout = async () => {
  if (rebuildingInlineCheckout) return
  rebuildingInlineCheckout = true

  try {
    await refreshCartItems()
    const items = cartCheckoutItems()
    if (!items.length) {
      closeCheckout()
      inlineCheckoutVisible.value = false
      await checkout(items)
      return
    }
    if (!userStore.userInfo?.email) {
      closeCheckout()
      inlineCheckoutVisible.value = false
      await checkout(items)
      return
    }

    checking.value = true
    try {
      const checkResult = await checkCartPurchases({ items })
      purchaseConflicts.value = Object.fromEntries(
        (checkResult.items || [])
          .filter((item) => item.purchased)
          .map((item) => [item.appId, item])
      )
      if (checkResult.hasPurchasedItems) {
        closeCheckout()
        inlineCheckoutVisible.value = false
        ElMessage.warning('Some items are already purchased. Please remove them before checkout.')
        return
      }
    } finally {
      checking.value = false
    }

    closeCheckout()
    inlineCheckoutVisible.value = true
    inlineCheckoutKey.value += 1
    await nextTick()
    await checkout(items, () => cartStore.clear(), {
      displayMode: 'inline',
      frameTarget: checkoutFrameTarget,
      frameInitialHeight: 620,
      frameStyle: 'width: 100%; min-width: 0; background-color: transparent; border: none;',
    })
  } finally {
    rebuildingInlineCheckout = false
  }
}

const handleCheckout = async () => {
  const items = cartCheckoutItems()
  if (!items.length) {
    checkout(items)
    return
  }
  if (!userStore.userInfo?.email) {
    checkout(items)
    return
  }

  await openInlineCheckout()
}

watch(cartCheckoutSignature, (signature, previousSignature) => {
  if (!inlineCheckoutVisible.value || signature === previousSignature) return
  if (!signature) {
    closeCheckout()
    inlineCheckoutVisible.value = false
    return
  }
  if (rebuildTimer) clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => {
    openInlineCheckout()
  }, 250)
})

onMounted(() => {
  refreshCartItems()
})

onBeforeUnmount(() => {
  if (rebuildTimer) clearTimeout(rebuildTimer)
  closeCheckout()
})
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

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 22px;
  align-items: flex-start;
}

.cart-layout.checkout-layout-active {
  grid-template-columns: minmax(300px, 0.86fr) minmax(460px, 520px);
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

.cart-item.purchased {
  border-color: rgba(180, 35, 24, 0.28);
  background: #fffafa;
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

.item-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.item-info > span:not(.item-title-row):not(.purchase-warning),
.item-title-row strong {
  color: var(--color-brand);
  font-weight: 800;
}

.item-title-row strong {
  color: var(--color-ink);
}

.purchased-badge {
  flex: 0 0 auto;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(180, 35, 24, 0.1);
  color: #b42318;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1.2;
}

.purchase-warning {
  color: #b42318;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.35;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-fixed {
  min-width: 58px;
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
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

.checkout-panel {
  position: sticky;
  top: 92px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.checkout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-muted);
  font-size: 0.95rem;
}

.checkout-row strong {
  color: var(--color-ink);
}

.discount-row {
  color: #087443;
}

.discount-row strong {
  color: #087443;
}

.discount-hint {
  margin: -6px 0 0;
  color: var(--color-muted);
  font-size: 0.86rem;
  line-height: 1.4;
}

.discount-saving {
  color: #d92d20;
  font-weight: 900;
}

.recommend-search-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: #fff;
  color: var(--color-brand);
  font-size: 0.9rem;
  font-weight: 900;
}

.recommend-search-btn:hover {
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
}

.total-row {
  padding-top: 14px;
  border-top: 1px solid var(--color-line);
}

.total-row strong {
  color: var(--color-brand);
  font-size: 1.35rem;
}

.email-lock {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-brand-soft);
  color: var(--color-muted);
  font-size: 0.82rem;
}

.email-lock strong {
  display: block;
  margin-top: 4px;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}

.checkout-btn {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  background: var(--color-brand);
  color: #fff;
  font-weight: 800;
}

.checkout-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}

.inline-checkout-shell {
  overflow: hidden;
  margin-top: 2px;
  padding-top: 16px;
  border-top: 1px solid var(--color-line);
}

.paddle-inline-checkout {
  min-height: 620px;
  width: 100%;
  background: transparent;
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

  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-layout.checkout-layout-active {
    grid-template-columns: 1fr;
  }

  .checkout-panel {
    position: static;
  }

  .inline-checkout-shell {
    margin-inline: -6px;
    padding-top: 14px;
  }

  .paddle-inline-checkout {
    min-height: 680px;
  }
}
</style>
