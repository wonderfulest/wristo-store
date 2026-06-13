<template>
  <main class="success-page" aria-labelledby="payment-success-title">
    <section class="success-hero" aria-live="polite">
      <div class="confirmation-panel">
        <div class="success-mark" aria-hidden="true">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
        <p class="success-eyebrow">Secure payment complete</p>
        <h1 id="payment-success-title">Payment Successful</h1>
        <p class="success-message">
          Thank you for your purchase. Your Wristo access is being prepared and your receipt will be sent by Paddle.
        </p>

        <div class="next-step" role="note" aria-label="Next step">
          <div class="next-step-icon" aria-hidden="true">
            <el-icon><QuartzWatch /></el-icon>
          </div>
          <div>
            <h2>Unlock on your Garmin watch</h2>
            <p>
              Keep your watch near your phone and allow Connect IQ to sync. Most purchases unlock automatically within 1-5 minutes.
            </p>
          </div>
        </div>

        <div class="action-buttons" aria-label="Payment success actions">
          <button type="button" class="primary-action" @click="goToActivation">
            <el-icon aria-hidden="true"><Lock /></el-icon>
            <span>Open activation page</span>
            <el-icon class="button-arrow" aria-hidden="true"><ArrowRight /></el-icon>
          </button>
          <button v-if="isLoggedIn" type="button" class="secondary-action" @click="goToPurchases">
            <el-icon aria-hidden="true"><Tickets /></el-icon>
            <span>View purchases</span>
          </button>
          <button type="button" class="ghost-action" @click="goHome">
            <el-icon aria-hidden="true"><House /></el-icon>
            <span>Return home</span>
          </button>
        </div>
      </div>

      <aside class="order-panel" aria-label="Order summary">
        <div class="panel-heading">
          <p class="summary-eyebrow">Order summary</p>
          <h2>Your purchase details</h2>
        </div>

        <dl class="order-info">
          <div class="info-row">
            <dt>Order ID</dt>
            <dd>{{ referenceId || 'Processing' }}</dd>
          </div>
          <div class="info-row">
            <dt>Product</dt>
            <dd>{{ productName || 'Wristo watch face access' }}</dd>
          </div>
          <div class="info-row">
            <dt>Amount</dt>
            <dd>{{ formatCurrency(amount, currencyCode) }}</dd>
          </div>
          <div class="info-row">
            <dt>Payment method</dt>
            <dd>
              <el-icon aria-hidden="true"><CreditCard /></el-icon>
              Paddle
            </dd>
          </div>
        </dl>

        <div class="support-strip">
          <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
          <span>Receipt, entitlement, and activation checks are tied to your purchase email.</span>
        </div>
      </aside>
    </section>

    <section v-if="!isLoggedIn" class="account-panel" aria-labelledby="account-title">
      <div class="account-copy">
        <p class="summary-eyebrow">Save your access</p>
        <h2 id="account-title">Create an account to manage this purchase</h2>
        <p>
          Use the same email from checkout to keep purchases, unlock history, and future watch face access in one place.
        </p>
      </div>
      <ul class="benefit-list" aria-label="Account benefits">
        <li>
          <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
          <span>Manage all purchases</span>
        </li>
        <li>
          <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
          <span>Track unlock status</span>
        </li>
        <li>
          <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
          <span>Recover access faster</span>
        </li>
      </ul>
      <div class="account-actions">
        <button type="button" class="primary-action compact-action" @click="goToRegister">
          <el-icon aria-hidden="true"><UserFilled /></el-icon>
          <span>Create account</span>
        </button>
        <button type="button" class="secondary-action compact-action" @click="goToLogin">
          <span>Sign in</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  CircleCheckFilled,
  CreditCard,
  House,
  Lock,
  QuartzWatch,
  Tickets,
  UserFilled,
} from '@element-plus/icons-vue'
import { useShopOptionsStore } from '@/store/shopOptions'
import { useUserStore } from '@/store/user'
import { buildSsoLoginUrl, buildSsoSignupUrl } from '@/utils/ssoRedirect'

const router = useRouter()
const store = useShopOptionsStore()
const userStore = useUserStore()
const order = computed(() => store.order)
const referenceId = computed(() => order.value?.referenceId)
const productName = computed(() => order.value?.productName)
const amount = computed(() => order.value?.paddleOrder?.totals?.total || order.value?.amount)
const currencyCode = computed(() => order.value?.paddleOrder?.currency_code || 'USD')

const isLoggedIn = computed(() => {
  return Boolean(userStore.token && userStore.userInfo)
})

const formatAmount = (value?: string | number) => {
  if (!value) return '0.00'
  const numAmount = Number(value)
  if (!Number.isFinite(numAmount)) return '0.00'
  return numAmount.toFixed(2)
}

const formatCurrency = (value?: string | number, currency = 'USD') => {
  return `${getCurrencySymbol(currency)} ${formatAmount(value)}`
}

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  }
  return symbols[currency] || currency
}

onMounted(() => {
  if (!order.value) {
    router.push('/')
  }
})

function goHome() {
  store.reset()
  router.push('/')
}

function goToActivation() {
  router.push('/code')
}

function goToPurchases() {
  router.push('/user/purchase-records')
}

function goToRegister() {
  window.location.href = buildSsoSignupUrl('store', { mode: 'signup' })
}

function goToLogin() {
  window.location.href = buildSsoLoginUrl('store')
}
</script>

<style scoped>
.success-page {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto 88px;
  padding: 48px 20px 0;
  color: var(--color-ink);
}

.success-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.9fr);
  gap: 28px;
  align-items: stretch;
}

.confirmation-panel,
.order-panel,
.account-panel {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.92) inset;
}

.confirmation-panel {
  min-width: 0;
  border-radius: var(--radius-lg);
  padding: clamp(28px, 5vw, 52px);
  position: relative;
  overflow: hidden;
}

.confirmation-panel::after {
  content: "";
  position: absolute;
  right: -100px;
  top: -120px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(15, 107, 104, 0.14), transparent 68%);
  pointer-events: none;
}

.success-mark {
  width: 72px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand), #16a085);
  box-shadow: 0 18px 40px rgba(15, 107, 104, 0.28);
  font-size: 2rem;
  margin-bottom: 24px;
}

.success-eyebrow,
.summary-eyebrow {
  margin: 0 0 10px;
  color: var(--color-brand);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.confirmation-panel h1 {
  margin: 0;
  max-width: 620px;
  color: #0f172a;
  font-family: var(--font-display);
  font-size: clamp(2.35rem, 5vw, 4.2rem);
  line-height: 1;
  letter-spacing: 0;
}

.success-message {
  max-width: 620px;
  margin: 18px 0 0;
  color: var(--color-muted);
  font-size: 1.08rem;
  line-height: 1.7;
}

.next-step {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  margin-top: 34px;
  padding: 20px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: var(--radius-md);
  background: rgba(223, 245, 241, 0.72);
}

.next-step-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: var(--color-brand-strong);
  background: #fff;
  font-size: 1.5rem;
}

.next-step h2,
.panel-heading h2,
.account-copy h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.25;
}

.next-step p,
.account-copy p {
  margin: 8px 0 0;
  color: var(--color-muted);
  line-height: 1.65;
}

.action-buttons,
.account-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.primary-action,
.secondary-action,
.ghost-action {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--radius-sm);
  padding: 0 18px;
  font-weight: 800;
  line-height: 1.2;
}

.primary-action {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--color-brand), var(--color-brand-strong));
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.22);
}

.primary-action:hover {
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(15, 107, 104, 0.26);
}

.secondary-action {
  color: var(--color-brand-strong);
  border-color: rgba(15, 107, 104, 0.2);
  background: #fff;
}

.secondary-action:hover,
.ghost-action:hover {
  color: var(--color-brand-strong);
  transform: translateY(-1px);
  border-color: rgba(15, 107, 104, 0.35);
  box-shadow: var(--shadow-sm);
}

.ghost-action {
  color: #334155;
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.button-arrow {
  font-size: 1rem;
}

.order-panel {
  border-radius: var(--radius-lg);
  padding: 28px;
  align-self: stretch;
}

.panel-heading {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-line);
}

.order-info {
  margin: 0;
  padding: 10px 0 0;
}

.info-row {
  display: grid;
  grid-template-columns: minmax(96px, 0.8fr) minmax(0, 1.2fr);
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row dt {
  color: var(--color-muted);
  font-size: 0.92rem;
  font-weight: 700;
}

.info-row dd {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  margin: 0;
  color: #0f172a;
  font-weight: 800;
  text-align: right;
  overflow-wrap: anywhere;
}

.support-strip {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 12px;
  padding: 14px;
  border-radius: var(--radius-md);
  color: #475467;
  background: var(--color-surface-soft);
  font-size: 0.95rem;
  line-height: 1.55;
}

.support-strip .el-icon,
.benefit-list .el-icon {
  color: var(--color-brand);
  flex: 0 0 auto;
  margin-top: 2px;
}

.account-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 24px;
  align-items: center;
  margin-top: 28px;
  padding: 26px 28px;
  border-radius: var(--radius-lg);
}

.benefit-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.benefit-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #334155;
  font-weight: 700;
  white-space: nowrap;
}

.compact-action {
  min-width: 150px;
}

@media (max-width: 920px) {
  .success-hero,
  .account-panel {
    grid-template-columns: 1fr;
  }

  .account-actions {
    margin-top: 0;
  }

  .benefit-list li {
    white-space: normal;
  }
}

@media (max-width: 640px) {
  .success-page {
    margin-bottom: 56px;
    padding: 24px 14px 0;
  }

  .confirmation-panel,
  .order-panel,
  .account-panel {
    border-radius: 18px;
  }

  .next-step {
    grid-template-columns: 1fr;
  }

  .action-buttons,
  .account-actions {
    flex-direction: column;
  }

  .primary-action,
  .secondary-action,
  .ghost-action {
    width: 100%;
    min-height: 52px;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .info-row dd {
    justify-content: flex-start;
    text-align: left;
  }
}
</style>
