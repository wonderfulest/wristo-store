<template>
  <div class="purchase-page">
    <div class="purchase-container">

      <div class="page-header">
        <div>
          <p class="page-kicker">Account</p>
          <h1 class="page-title">Purchase records</h1>
          <p class="page-subtitle">Review orders, receipts, and app unlock history in one place.</p>
        </div>
        <div class="header-actions" aria-label="Account actions">
          <button class="profile-link" type="button" @click="navigateToProfile">
            <Icon icon="mdi:account-outline" width="18" aria-hidden="true" />
            Profile
          </button>
          <button class="billing-link" type="button" @click="openPaddleCustomerPortal">
            <Icon icon="solar:bill-list-line-duotone" width="18" aria-hidden="true" />
            Billing & invoices
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-panel" aria-live="polite" aria-label="Loading purchase records">
        <div class="loading-line wide" />
        <div class="loading-grid">
          <div class="loading-tile" />
          <div class="loading-tile" />
          <div class="loading-tile" />
        </div>
        <div class="loading-table">
          <div v-for="item in 4" :key="item" class="loading-row" />
        </div>
      </div>

      <div v-else-if="records.length > 0" class="records-content">
        <div class="summary-grid" aria-label="Purchase summary">
          <div class="summary-item">
            <Icon icon="solar:receipt-list-line-duotone" width="22" aria-hidden="true" />
            <span class="summary-label">Records</span>
            <strong class="summary-value">{{ records.length }}</strong>
          </div>
          <div class="summary-item">
            <Icon icon="solar:box-line-duotone" width="22" aria-hidden="true" />
            <span class="summary-label">Bundles</span>
            <strong class="summary-value">{{ bundleRecords.length }}</strong>
          </div>
          <div class="summary-item">
            <Icon icon="solar:watch-round-line-duotone" width="22" aria-hidden="true" />
            <span class="summary-label">Products</span>
            <strong class="summary-value">{{ productRecords.length }}</strong>
          </div>
        </div>

        <div class="record-list" aria-label="Purchase records">
          <article v-for="item in sortedRecords" :key="item.transactionId || item.id" class="record-row">
            <div class="record-media" :class="{ bundle: item.isBundle }">
              <img
                v-if="!item.isBundle && getRecordImageUrl(item)"
                :src="getRecordImageUrl(item)"
                :alt="getRecordTitle(item)"
                class="record-thumb"
                loading="lazy"
              />
              <Icon v-else :icon="getRecordIcon(item)" width="24" aria-hidden="true" />
            </div>

            <div class="record-main">
              <div class="record-title-line">
                <strong class="record-title">{{ getRecordTitle(item) }}</strong>
                <span :class="['status-badge', getStatusClass(item.status)]" :title="item.statusDesc">
                  <Icon :icon="getStatusIcon(item.status)" width="14" aria-hidden="true" />
                  {{ getStatusLabel(item) }}
                </span>
              </div>
              <div class="record-meta">
                <span class="kind-badge">
                  <Icon :icon="getRecordIcon(item)" width="14" aria-hidden="true" />
                  {{ getRecordKindLabel(item) }}
                </span>
                <span class="meta-chip" :title="formatFullDate(item.createdAt)">
                  <Icon icon="solar:calendar-minimalistic-line-duotone" width="14" aria-hidden="true" />
                  {{ formatDate(item.createdAt) }}
                </span>
                <span class="meta-chip" :title="item.paymentMethod || 'Payment method'">
                  <Icon :icon="getPaymentIcon(item.paymentMethod)" width="14" aria-hidden="true" />
                  {{ formatPaymentMethod(item.paymentMethod) }}
                </span>
                <span v-if="item.transactionId" class="txn-chip" :title="item.transactionId">
                  #{{ formatTransactionId(item.transactionId) }}
                </span>
                <span v-if="isGiftRecord(item)" class="channel-chip" :title="item.origin || 'Gift channel'">
                  <Icon icon="solar:gift-line-duotone" width="14" aria-hidden="true" />
                  {{ getGiftChannelLabel(item) }}
                </span>
              </div>
            </div>

            <div class="record-side">
              <div v-if="isGiftRecord(item)" class="gift-state">
                <strong>{{ getGiftStatusLabel(item) }}</strong>
                <span>{{ getGiftChannelLabel(item) }}</span>
              </div>
              <strong v-else class="record-amount">{{ formatAmount(item) }}</strong>
              <div class="record-actions" aria-label="Record actions">
                <router-link
                  v-if="item.product?.garminStoreUrl"
                  :to="toGarminStoreBridge({
                    url: item.product.garminStoreUrl,
                    name: item.product?.name,
                    imageUrl: getRecordImageUrl(item),
                    sourcePath: route.fullPath,
                  })"
                  class="icon-action"
                  :aria-label="`Open ${getRecordTitle(item)} in Garmin store`"
                  title="Garmin store"
                >
                  <Icon icon="solar:shop-line-duotone" width="18" aria-hidden="true" />
                </router-link>
                <button
                  v-if="item.isBundle && item.bundle?.bundleId"
                  class="icon-action primary"
                  type="button"
                  :aria-label="`View ${getRecordTitle(item)}`"
                  title="Bundle"
                  @click="navigateToBundle(item.bundle.bundleId)"
                >
                  <Icon icon="solar:arrow-right-up-linear" width="18" aria-hidden="true" />
                </button>
                <button
                  v-if="!item.isBundle && item.product?.appId"
                  class="icon-action primary"
                  type="button"
                  :aria-label="`View ${getRecordTitle(item)} details`"
                  title="Details"
                  @click="navigateToProduct(item.product.appId)"
                >
                  <Icon icon="solar:arrow-right-up-linear" width="18" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-card">
        <div class="empty-icon-wrap">
          <Icon icon="mdi:receipt-text-outline" width="42" aria-hidden="true" />
        </div>
        <div class="empty-title">No purchases yet</div>
        <div class="empty-desc">Orders, receipts, and unlock records will appear here after checkout.</div>
        <button class="empty-action" type="button" @click="navigateToExplore">
          <Icon icon="mdi:compass-outline" width="18" aria-hidden="true" />
          Explore products
        </button>
      </div>

      <!-- Tip -->
      <div v-if="!isLoggedIn" class="tip-card">
        <Icon icon="mdi:lightbulb-outline" width="18" class="tip-icon" />
        <span>
          We recommend you
          <a
            href="https://sso.wristo.io/login?client=store&redirect_uri=https%3A%2F%2Fwristo.io%2Fauth%2Fcallback"
            target="_blank"
            rel="noopener noreferrer"
            class="tip-link"
          >create an account</a>
          to easily access your subscription and purchase records anytime.
        </span>
      </div>

      <!-- Footer -->
      <div class="page-footer">
        If you have any questions, please contact
        <a href="mailto:support@wristo.io" class="footer-link">support@wristo.io</a>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPurchaseRecords } from '@/api/pay'
import type { PurchaseRecord } from '@/types'
import { ElMessage } from 'element-plus'
import { toGarminStoreBridge } from '@/utils/garminStore'
import { getProductImageUrl } from '@/utils/productImage'
import { useUserStore } from '@/store/user'
import { openPaddleCustomerPortal } from '@/utils/paddlePortal'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const records = ref<PurchaseRecord[]>([])
const isLoading = ref(true)
const isLoggedIn = computed(() => !!userStore.userInfo)

const navigateToBundle = (bundleId: number | string) => {
  router.push(`/bundle/${String(bundleId)}`)
}

const navigateToProduct = (productId: number | string) => {
  router.push(`/product/${String(productId)}`)
}

const navigateToProfile = () => {
  router.push('/user/profile')
}

const navigateToExplore = () => {
  router.push('/search')
}

const bundleRecords = computed(() => {
  return records.value.filter(record => record.isBundle)
})

const productRecords = computed(() => {
  return records.value.filter(record => !record.isBundle)
})

const sortedRecords = computed(() => {
  return [...records.value].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) {
    return '--'
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatFullDate = (dateStr: string) => {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) {
    return dateStr || 'Unknown date'
  }
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (record: PurchaseRecord) => {
  const currency = record.currencyCode || record.countryCode
  return `${(Number(record.total || 0) / 100).toFixed(2)}${currency ? ` ${currency}` : ''}`
}

const isGiftRecord = (record: PurchaseRecord) => {
  return (record.paymentMethod || '').toLowerCase() === 'gift'
    || (record.origin || '').toLowerCase().startsWith('gift:')
}

const getGiftChannelLabel = (record: PurchaseRecord) => {
  const origin = (record.origin || '').toLowerCase()
  const channel = origin.startsWith('gift:') ? origin.slice(5) : ''
  const labels: Record<string, string> = {
    taobao: 'Taobao',
    xiaohongshu: 'Xiaohongshu',
    xianyu: 'Xianyu',
    other: 'Other',
  }
  return labels[channel] || 'Partner Order'
}

const getGiftStatusLabel = (record: PurchaseRecord) => {
  return record.status === 1 ? 'Activated' : (record.statusDesc || 'Pending')
}

const getStatusClass = (status: number) => {
  return status === 1 ? 'success' : 'failed'
}

const getStatusLabel = (record: PurchaseRecord) => {
  if (record.status === 1) {
    if (isGiftRecord(record)) {
      return 'Activated'
    }
    return 'Paid'
  }
  return record.statusDesc || 'Failed'
}

const getStatusIcon = (status: number) => {
  return status === 1 ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'
}

const getRecordTitle = (record: PurchaseRecord) => {
  if (record.isBundle) {
    return record.bundle?.bundleName || 'Bundle'
  }
  return record.product?.name || 'Product'
}

const getRecordKindLabel = (record: PurchaseRecord) => {
  return record.isBundle ? 'Bundle' : 'App'
}

const getRecordIcon = (record: PurchaseRecord) => {
  return record.isBundle ? 'solar:box-line-duotone' : 'solar:watch-round-line-duotone'
}

const getRecordImageUrl = (record: PurchaseRecord) => {
  return record.product ? getProductImageUrl(record.product) : ''
}

const formatTransactionId = (transactionId: string) => {
  if (!transactionId) {
    return ''
  }
  return transactionId.length > 10 ? transactionId.slice(-8).toUpperCase() : transactionId
}

const formatPaymentMethod = (paymentMethod: string) => {
  if (!paymentMethod) {
    return 'Pay'
  }
  if (paymentMethod.toLowerCase() === 'gift') {
    return 'Partner Order'
  }
  const normalized = paymentMethod.replace(/[_-]+/g, ' ').trim()
  if (!normalized) {
    return 'Pay'
  }
  return normalized.length > 12 ? normalized.slice(0, 12) : normalized
}

const getPaymentIcon = (paymentMethod: string) => {
  const normalized = (paymentMethod || '').toLowerCase()
  if (normalized === 'gift') {
    return 'solar:gift-line-duotone'
  }
  if (normalized.includes('paypal')) {
    return 'simple-icons:paypal'
  }
  if (normalized.includes('card') || normalized.includes('visa') || normalized.includes('master')) {
    return 'solar:card-2-line-duotone'
  }
  return 'solar:wallet-2-line-duotone'
}

onMounted(async () => {
  try {
    records.value = await getPurchaseRecords()
  } catch (e) {
    ElMessage.error('Network error, please try again later.')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.purchase-page {
  width: 100%;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(244, 247, 246, 0) 36%),
    var(--color-canvas);
  display: flex;
  justify-content: center;
  padding: 0 20px 56px;
}

.purchase-container {
  width: 100%;
  max-width: 1080px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 48px;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.page-kicker,
.summary-label {
  margin: 0;
  color: var(--color-brand);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.page-title {
  margin: 4px 0 8px;
  color: var(--color-ink);
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: 0;
}

.page-subtitle {
  margin: 0;
  max-width: 560px;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-bottom: 2px;
}

.profile-link,
.billing-link,
.empty-action {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.profile-link,
.billing-link {
  flex-shrink: 0;
  padding: 0 16px;
  color: var(--color-brand-strong);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.billing-link {
  color: #fff;
  background: var(--color-brand);
}

.profile-link:hover,
.billing-link:hover {
  border-color: rgba(15, 107, 104, 0.36);
  background: var(--color-brand-soft);
}

.billing-link:hover {
  color: var(--color-brand-strong);
}

.records-content,
.record-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 760px;
}

.summary-item {
  min-height: 92px;
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 10px 14px;
  padding: 18px;
  background:
    linear-gradient(135deg, rgba(15, 107, 104, 0.055), rgba(255, 255, 255, 0) 48%),
    var(--color-surface);
  border: 1px solid rgba(17, 24, 39, 0.09);
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.055), 0 1px 2px rgba(17, 24, 39, 0.06);
}

.summary-item > svg {
  grid-row: span 2;
  width: 38px;
  height: 38px;
  padding: 8px;
  color: var(--color-brand);
  background: rgba(15, 107, 104, 0.09);
  border: 1px solid rgba(15, 107, 104, 0.12);
  border-radius: 8px;
}

.summary-label {
  display: block;
  color: var(--color-muted);
  align-self: end;
}

.summary-value {
  display: block;
  color: var(--color-ink);
  font-size: 1.72rem;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  align-self: start;
}

.record-list,
.empty-card,
.tip-card,
.loading-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.record-list {
  gap: 0;
  overflow: hidden;
}

.record-row {
  min-height: 92px;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  transition: background 180ms ease;
}

.record-row:last-child {
  border-bottom: 0;
}

.record-row:hover {
  background: rgba(15, 107, 104, 0.035);
}

.record-media {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  color: var(--color-brand);
  background: var(--color-surface-soft);
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.record-media.bundle {
  background: var(--color-brand-soft);
}

.record-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-main {
  min-width: 0;
}

.record-title-line {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-title {
  min-width: 0;
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 9px;
}

.kind-badge,
.meta-chip,
.txn-chip,
.channel-chip,
.status-badge {
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.kind-badge {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
}

.meta-chip {
  color: #475467;
  background: #f2f4f7;
}

.txn-chip {
  color: var(--color-subtle);
  background: #f8faf9;
  border: 1px solid rgba(17, 24, 39, 0.06);
  font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}

.channel-chip {
  color: #9a3412;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.status-badge {
  flex-shrink: 0;
  padding-inline: 8px;
}

.status-badge.success {
  color: #027a48;
  background: #ecfdf3;
}

.status-badge.failed {
  color: #b42318;
  background: #fef3f2;
}

.record-side {
  display: grid;
  grid-template-columns: minmax(92px, auto) auto;
  align-items: center;
  gap: 16px;
}

.record-amount {
  color: var(--color-ink);
  font-size: 0.98rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.gift-state {
  min-width: 92px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  text-align: right;
}

.gift-state strong {
  color: #027a48;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.15;
}

.gift-state span {
  color: #9a3412;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1.1;
}

.record-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.icon-action {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--color-brand-strong);
  background: #fff;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.icon-action.primary {
  color: #fff;
  background: var(--color-brand);
}

.icon-action:hover {
  border-color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  transform: translateY(-1px);
}

.icon-action.primary:hover {
  background: var(--color-brand-strong);
  color: #fff;
}

.empty-action {
  padding: 0 14px;
  color: #fff;
  background: var(--color-brand);
}

.empty-action:hover {
  border-color: var(--color-brand-strong);
  background: var(--color-brand-strong);
  color: #fff;
  transform: translateY(-1px);
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  color: var(--color-brand);
  background: var(--color-brand-soft);
  border-radius: 50%;
}

.empty-title {
  color: var(--color-ink);
  font-size: 1.25rem;
  font-weight: 800;
}

.empty-desc {
  max-width: 420px;
  margin-top: 8px;
  color: var(--color-muted);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.empty-action {
  margin-top: 22px;
}

.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-accent);
}

.tip-link,
.footer-link {
  color: var(--color-brand);
  font-weight: 800;
  text-decoration: none;
}

.tip-link:hover,
.footer-link:hover {
  color: var(--color-brand-strong);
  text-decoration: underline;
}

.page-footer {
  color: var(--color-muted);
  text-align: center;
  font-size: 0.875rem;
}

.loading-panel {
  padding: 20px;
}

.loading-line,
.loading-tile,
.loading-row {
  position: relative;
  overflow: hidden;
  background: #eef2f1;
  border-radius: 8px;
}

.loading-line::after,
.loading-tile::after,
.loading-row::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  animation: shimmer 1.4s infinite;
}

.loading-line {
  width: 38%;
  height: 18px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.loading-tile {
  height: 92px;
}

.loading-table {
  margin-top: 18px;
}

.loading-row {
  height: 46px;
  margin-top: 10px;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }
}

@media (max-width: 768px) {
  .purchase-page {
    padding: 0 16px 40px;
  }

  .purchase-container {
    gap: 22px;
    padding-top: 28px;
  }

  .page-header {
    align-items: stretch;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .header-actions {
    justify-content: flex-start;
    padding-bottom: 0;
  }

  .profile-link,
  .billing-link {
    flex: 1 1 0;
  }

  .record-row {
    grid-template-columns: 48px minmax(0, 1fr);
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
  }

  .record-media {
    width: 48px;
    height: 48px;
  }

  .record-title-line {
    align-items: flex-start;
    justify-content: space-between;
  }

  .record-title {
    white-space: normal;
  }

  .record-side {
    grid-column: 1 / -1;
    grid-template-columns: 1fr auto;
    padding-left: 60px;
  }

  .record-actions {
    gap: 6px;
  }

  .loading-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    min-height: 82px;
  }

  .summary-value {
    font-size: 1.45rem;
  }

  .record-title-line {
    flex-direction: column;
    gap: 8px;
  }

  .record-meta {
    gap: 6px;
  }

  .record-side {
    padding-left: 0;
  }

  .txn-chip {
    display: none;
  }
}
</style>
