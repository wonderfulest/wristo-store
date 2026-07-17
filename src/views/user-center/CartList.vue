<template>
  <section class="cart-list" aria-labelledby="cart-title">
    <div class="cart-head">
      <div>
        <p class="cart-kicker">{{ t('cart.savedItems') }}</p>
        <h1 id="cart-title">{{ t('cart.title') }}</h1>
      </div>
      <div v-if="cartStore.count" class="cart-summary">
        <span>{{ t('cart.itemCount', { count: cartStore.count }) }}</span>
        <strong v-if="hasBundleEntitlement">{{ t('product.activated') }}</strong>
        <strong v-else>${{ cartStore.totalPrice.toFixed(2) }}</strong>
      </div>
    </div>

    <div v-if="!cartStore.items.length" class="empty-state">
      <el-icon><ShoppingCart /></el-icon>
      <h2>{{ t('cart.emptyTitle') }}</h2>
      <p>{{ t('cart.emptyDesc') }}</p>
      <button type="button" class="browse-btn" @click="goHome">{{ t('cart.browse') }}</button>
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
                <span v-if="isPurchased(item.appId)" class="purchased-badge">{{ t('cart.purchased') }}</span>
              </span>
              <span class="item-meta-row">
                <span v-if="hasBundleEntitlement" class="item-activated-badge">
                  <el-icon><StarFilled /></el-icon>
                  {{ t('product.activated') }}
                </span>
                <template v-else>
                  <span class="item-price">${{ item.price.toFixed(2) }}</span>
                  <span class="quantity-fixed">{{ t('cart.quantityFixed') }}</span>
                </template>
              </span>
              <span v-if="purchaseWarning(item.appId)" class="purchase-warning" role="alert">
                {{ purchaseWarning(item.appId) }}
              </span>
            </span>
          </button>

          <div class="item-actions">
            <button type="button" class="remove-btn" :title="t('cart.remove')" @click="removeItem(item.appId)">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </article>
      </div>

      <aside v-if="hasBundleEntitlement" class="checkout-panel cart-activated-panel" :aria-label="t('product.activatedTitle')">
        <div class="cart-activated-icon" aria-hidden="true">
          <el-icon><StarFilled /></el-icon>
        </div>
        <h2>{{ t('product.activatedTitle') }}</h2>
        <p>{{ t('product.activatedDesc') }}</p>
        <button type="button" class="recommend-search-btn" @click="goRecommendedSearch">
          <el-icon><Search /></el-icon>
          <span>{{ t('cart.addMoreApps') }}</span>
        </button>
      </aside>

      <aside v-else class="checkout-panel" :aria-label="t('cart.checkoutSummaryAria')">
        <div class="checkout-row">
          <span>{{ t('cart.itemsLabel') }}</span>
          <strong>{{ cartStore.count }}</strong>
        </div>
        <div class="checkout-row">
          <span>{{ t('cart.subtotalLabel') }}</span>
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
          <span>{{ t('cart.addMoreApps') }}</span>
        </button>
        <div class="checkout-row total-row">
          <span>{{ t('cart.estimatedTotal') }}</span>
          <strong>{{ formatMoney(cartEstimatedTotal) }}</strong>
        </div>
        <div v-if="checkoutEmailVisible" class="email-lock">
          <label for="cart-checkout-email">{{ t('cart.checkoutEmail') }}</label>
          <strong v-if="userStore.userInfo?.email">{{ checkoutEmail }}</strong>
          <input
            v-else
            id="cart-checkout-email"
            v-model="checkoutEmailInput"
            type="email"
            autocomplete="email"
            :placeholder="t('cart.emailPlaceholder')"
            :aria-invalid="Boolean(checkoutEmailError)"
          />
          <p v-if="!userStore.token" class="cart-email-note">
            {{ t('cart.guestEmailNote') }}
            <button type="button" class="cart-email-login" @click="goSsoLogin">{{ t('cart.emailLoginLink') }}</button>
          </p>
        </div>
        <p v-if="checkoutEmailVisible && checkoutEmailError" class="cart-email-error" role="alert">{{ checkoutEmailError }}</p>
        <button type="button" class="checkout-btn commerce-primary-action" :disabled="loading || checking || refreshingCart" :aria-busy="loading || checking || refreshingCart" @click="handleCheckout">
          <el-icon><CreditCard /></el-icon>
          <span>{{ checkoutButtonText }}</span>
        </button>
        <div v-if="inlineCheckoutVisible" class="inline-checkout-shell" :aria-label="t('cart.paddleCheckoutAria')" aria-live="polite">
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
import { CreditCard, Delete, Search, ShoppingCart, StarFilled } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { useCartCheckout } from '@/composables/useCartCheckout'
import { checkCartPurchases } from '@/api/purchase'
import type { CartPurchaseCheckItemVO } from '@/api/purchase'
import { getProductDetail } from '@/api/product'
import { useI18n } from '@/i18n'
import { buildSsoLoginUrl } from '@/utils/ssoRedirect'
import { hasActiveBundle } from '@/utils/entitlements'

const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { t } = useI18n()
const { loading, checkout, closeCheckout } = useCartCheckout()
const checking = ref(false)
const refreshingCart = ref(false)
const inlineCheckoutVisible = ref(false)
const inlineCheckoutKey = ref(0)
const checkoutEmailInput = ref('')
const checkoutEmailError = ref('')
const purchaseConflicts = ref<Record<number, CartPurchaseCheckItemVO>>({})
type PaddleCheckoutDisplayMode = 'overlay' | 'inline'
const paddleCheckoutDisplayMode = 'overlay' as PaddleCheckoutDisplayMode
const checkoutFrameId = 'cart-paddle-checkout'
const checkoutFrameTarget = 'cart-paddle-checkout-frame'
const paddleInlineCheckoutOptions = {
  displayMode: 'inline' as const,
  frameTarget: checkoutFrameTarget,
  frameInitialHeight: 620,
  frameStyle: 'width: 100%; min-width: 0; background-color: transparent; border: none;',
}
let rebuildingInlineCheckout = false
let rebuildTimer: ReturnType<typeof setTimeout> | null = null

const checkoutEmail = computed(() => userStore.token ? normalizeEmail(userStore.userInfo?.email || '') : '')
const hasBundleEntitlement = computed(() => hasActiveBundle(userStore.userInfo))
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
  if (refreshingCart.value) return t('cart.refreshingCart')
  if (checking.value) return t('cart.checkingCart')
  if (loading.value) return inlineCheckoutVisible.value ? t('cart.updatingCheckout') : t('cart.openingCheckout')
  return t('cart.checkout')
})
const checkoutEmailVisible = computed(() => !inlineCheckoutVisible.value)
const cartCheckoutSignature = computed(() => cartStore.items.map((item) => `${item.appId}:${Number(item.price || 0)}`).join('|'))
const cartCheckoutOptions = computed(() => (
  paddleCheckoutDisplayMode === 'inline' ? paddleInlineCheckoutOptions : { displayMode: 'overlay' as const }
))

const formatMoney = (amount: number) => `$${amount.toFixed(2)}`

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const resolveCheckoutEmail = () => {
  const email = userStore.token
    ? normalizeEmail(userStore.userInfo?.email || '')
    : normalizeEmail(checkoutEmailInput.value)
  checkoutEmailInput.value = email
  if (!email) {
    checkoutEmailError.value = t('cart.error.emailRequired')
    return ''
  }
  if (!isValidEmail(email)) {
    checkoutEmailError.value = t('cart.error.emailInvalid')
    return ''
  }
  checkoutEmailError.value = ''
  return email
}

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

const goSsoLogin = () => {
  try {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    sessionStorage.setItem('wristo:sso:return-path', currentPath || '/')
  } catch (e) {
    console.warn('Failed to save SSO return path:', e)
  }
  window.location.href = buildSsoLoginUrl('store')
}

const purchaseConflict = (appId: number) => purchaseConflicts.value[appId]

const isPurchased = (appId: number) => Boolean(purchaseConflict(appId)?.purchased)

const purchaseWarning = (appId: number) => {
  const conflict = purchaseConflict(appId)
  if (!conflict?.purchased) return ''
  if (conflict.purchaseType === 'bundle') {
    return conflict.bundleName
      ? t('cart.purchasedBundleMessage', { bundleName: conflict.bundleName })
      : t('cart.purchasedBundleFallbackMessage')
  }
  return t('cart.purchasedDirectMessage')
}

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
  const email = resolveCheckoutEmail()
  if (!email) return
  rebuildingInlineCheckout = true

  try {
    await refreshCartItems()
    const items = cartCheckoutItems()
    if (!items.length) {
      closeCheckout()
      inlineCheckoutVisible.value = false
      await checkout(items, email)
      return
    }
    checking.value = true
    try {
      const checkResult = await checkCartPurchases({ items, email })
      purchaseConflicts.value = Object.fromEntries(
        (checkResult.items || [])
          .filter((item) => item.purchased)
          .map((item) => [item.appId, item])
      )
      if (checkResult.hasPurchasedItems) {
        closeCheckout()
        inlineCheckoutVisible.value = false
        ElMessage.warning(t('cart.error.containsPurchasedItems'))
        return
      }
    } finally {
      checking.value = false
    }

    closeCheckout()
    inlineCheckoutVisible.value = paddleCheckoutDisplayMode === 'inline'
    inlineCheckoutKey.value += 1
    await nextTick()
    await checkout(items, email, () => cartStore.clear(), cartCheckoutOptions.value)
  } finally {
    rebuildingInlineCheckout = false
  }
}

const handleCheckout = async () => {
  if (hasBundleEntitlement.value) return
  const items = cartCheckoutItems()
  if (!items.length) {
    checkout(items, '')
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
  grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
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
  flex: 1 1 auto;
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
  border-radius: 50%;
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
  overflow-wrap: anywhere;
}

.item-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.item-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--color-brand);
  font-weight: 800;
  line-height: 1.35;
}

.item-info > span:not(.item-title-row):not(.item-meta-row):not(.purchase-warning),
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
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-fixed {
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.item-activated-badge {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  color: #7a4b00;
  background: linear-gradient(135deg, #fff7d6 0%, #f8df8b 100%);
  border: 1px solid rgba(194, 138, 26, 0.28);
  font-size: 0.84rem;
  font-weight: 850;
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
  top: calc(var(--header-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.cart-activated-panel {
  align-items: flex-start;
  border-color: rgba(194, 138, 26, 0.26);
  background:
    linear-gradient(135deg, rgba(255, 248, 218, 0.98) 0%, rgba(248, 224, 148, 0.82) 100%);
  color: #5f3b00;
  box-shadow: 0 14px 34px rgba(148, 107, 31, 0.12);
}

.cart-activated-icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  color: #b7791f;
  font-size: 1.35rem;
  box-shadow: inset 0 0 0 1px rgba(194, 138, 26, 0.18);
}

.cart-activated-panel h2 {
  margin: 0;
  color: #4a3000;
  font-size: 1.1rem;
  line-height: 1.2;
}

.cart-activated-panel p {
  margin: -8px 0 0;
  color: rgba(74, 48, 0, 0.74);
  line-height: 1.5;
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-brand-soft);
  color: var(--color-muted);
  font-size: 0.82rem;
}

.email-lock label {
  font-weight: 800;
}

.email-lock strong {
  color: var(--color-ink);
  overflow-wrap: anywhere;
}

.email-lock input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-ink);
  font-size: 0.92rem;
  outline: none;
}

.email-lock input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.14);
}

.cart-email-note {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.cart-email-login {
  display: inline;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-brand);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.cart-email-login:hover,
.cart-email-login:focus-visible {
  text-decoration: underline;
}

.cart-email-error {
  margin: -4px 0 0;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.35;
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

.checkout-btn:focus-visible,
.browse-btn:focus-visible,
.recommend-search-btn:focus-visible,
.remove-btn:focus-visible,
.item-main:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
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

  .checkout-btn {
    width: 100%;
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
