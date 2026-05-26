<template>
  <div class="purchase-page">
    <div class="purchase-container">

      <div class="page-header">
        <div>
          <p class="page-kicker">Account</p>
          <h1 class="page-title">Purchase records</h1>
          <p class="page-subtitle">Review orders, receipts, and app unlock history in one place.</p>
        </div>
        <button class="profile-link" type="button" @click="navigateToProfile">
          <Icon icon="mdi:account-outline" width="18" aria-hidden="true" />
          Profile
        </button>
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
            <span class="summary-label">Total records</span>
            <strong class="summary-value">{{ records.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Paid amount</span>
            <strong class="summary-value">{{ totalSpendLabel }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Bundles</span>
            <strong class="summary-value">{{ bundleRecords.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Products</span>
            <strong class="summary-value">{{ productRecords.length }}</strong>
          </div>
        </div>

        <div class="sections-wrapper">

        <!-- Section: Bundle Purchases -->
        <div v-if="bundleRecords.length > 0" class="section">
          <div class="section-label">
            <div>
              <span class="section-label-text">Bundle purchases</span>
              <p class="section-help">Multi-product unlocks and collection purchases.</p>
            </div>
            <span class="section-count">{{ bundleRecords.length }}</span>
          </div>

          <!-- Desktop Table -->
          <div class="section-card desktop-only">
            <el-table
              :data="bundleRecords"
              class="apple-table"
              header-cell-class-name="apple-th"
              cell-class-name="apple-td"
              :row-class-name="tableRowClass"
              :border="false"
              :stripe="false"
            >
              <el-table-column prop="createdAt" label="Date" width="170" align="left">
                <template #default="scope">
                  <span class="cell-date">{{ formatDate(scope.row.createdAt) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="bundle.bundleName" label="Name" min-width="160" align="left">
                <template #default="scope">
                  <span class="cell-name">{{ scope.row.bundle?.bundleName || 'Bundle' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="total" label="Amount" width="140" align="right">
                <template #default="scope">
                  <span class="cell-amount">{{ formatAmount(scope.row) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="Method" width="120" align="center">
                <template #default="scope">
                  <span class="cell-pill">{{ scope.row.paymentMethod }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="statusDesc" label="Status" width="110" align="center">
                <template #default="scope">
                  <span :class="['cell-status', getStatusClass(scope.row.status)]">
                    {{ scope.row.statusDesc }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="" width="100" align="center">
                <template #default="scope">
                  <button
                    v-if="scope.row.bundle?.bundleId"
                    class="cell-link-btn"
                    type="button"
                    :aria-label="`View bundle ${scope.row.bundle?.bundleName || 'purchase'}`"
                    @click="navigateToBundle(scope.row.bundle.bundleId)"
                  >
                    <Icon icon="mdi:open-in-new" width="14" aria-hidden="true" />
                    View
                  </button>
                </template>
              </el-table-column>
              <el-table-column prop="transactionId" label="Transaction" min-width="260" align="left">
                <template #default="scope">
                  <span class="cell-txn">{{ scope.row.transactionId }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards">
            <div v-for="item in bundleRecords" :key="item.transactionId" class="m-card">
              <div class="m-card-top">
                <div class="m-card-name">
                  <Icon icon="mdi:package-variant-closed" width="18" aria-hidden="true" />
                  <span>{{ item.bundle?.bundleName || 'Bundle' }}</span>
                </div>
                <span :class="['m-card-status', getStatusClass(item.status)]">{{ item.statusDesc }}</span>
              </div>
              <div class="m-card-body">
                <div class="m-row">
                  <span class="m-label">Date</span>
                  <span class="m-value">{{ formatDate(item.createdAt) }}</span>
                </div>
                <div class="m-row">
                  <span class="m-label">Amount</span>
                  <span class="m-value m-amount">
                    {{ formatAmount(item) }}
                  </span>
                </div>
                <div class="m-row">
                  <span class="m-label">Payment</span>
                  <span class="m-value">{{ item.paymentMethod }}</span>
                </div>
                <div class="m-row">
                  <span class="m-label">Transaction</span>
                  <span class="m-value m-mono">{{ item.transactionId }}</span>
                </div>
              </div>
              <div v-if="item.bundle?.bundleId" class="m-card-footer">
                <button class="m-action-btn" type="button" @click="navigateToBundle(item.bundle.bundleId)">
                  <Icon icon="mdi:open-in-new" width="16" aria-hidden="true" />
                  View Bundle
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Product Purchases -->
        <div v-if="productRecords.length > 0" class="section">
          <div class="section-label">
            <div>
              <span class="section-label-text">Product purchases</span>
              <p class="section-help">Individual watch faces, apps, and direct unlocks.</p>
            </div>
            <span class="section-count">{{ productRecords.length }}</span>
          </div>

          <!-- Desktop Table -->
          <div class="section-card desktop-only">
            <el-table
              :data="productRecords"
              class="apple-table"
              header-cell-class-name="apple-th"
              cell-class-name="apple-td"
              :row-class-name="tableRowClass"
              :border="false"
              :stripe="false"
            >
              <el-table-column prop="createdAt" label="Date" width="170" align="left">
                <template #default="scope">
                  <span class="cell-date">{{ formatDate(scope.row.createdAt) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="" width="56" align="center">
                <template #default="scope">
                  <img
                    v-if="scope.row.product?.garminImageUrl"
                    :src="scope.row.product.garminImageUrl"
                    :alt="scope.row.product?.name || 'Purchased product'"
                    class="cell-thumb"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="product.name" label="Name" min-width="140" align="left">
                <template #default="scope">
                  <span class="cell-name">{{ scope.row.product?.name || 'Product' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="total" label="Amount" width="140" align="right">
                <template #default="scope">
                  <span class="cell-amount">{{ formatAmount(scope.row) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="Method" width="120" align="center">
                <template #default="scope">
                  <span class="cell-pill">{{ scope.row.paymentMethod }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="statusDesc" label="Status" width="110" align="center">
                <template #default="scope">
                  <span :class="['cell-status', getStatusClass(scope.row.status)]">
                    {{ scope.row.statusDesc }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="" width="200" align="center">
                <template #default="scope">
                  <div class="cell-links">
                    <a
                      v-if="scope.row.product?.garminStoreUrl"
                      :href="scope.row.product.garminStoreUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="cell-link-btn"
                      :aria-label="`Open ${scope.row.product?.name || 'product'} in Garmin store`"
                    >
                      <Icon icon="mdi:storefront-outline" width="14" aria-hidden="true" />
                      Store
                    </a>
                    <button
                      v-if="scope.row.product?.designId"
                      class="cell-link-btn outline"
                      type="button"
                      :aria-label="`View ${scope.row.product?.name || 'product'} details`"
                      @click="navigateToProduct(scope.row.product.appId)"
                    >
                      <Icon icon="mdi:arrow-right" width="14" aria-hidden="true" />
                      Details
                    </button>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="transactionId" label="Transaction" min-width="260" align="left">
                <template #default="scope">
                  <span class="cell-txn">{{ scope.row.transactionId }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards">
            <div v-for="item in productRecords" :key="item.transactionId" class="m-card">
              <div class="m-card-top">
                <div class="m-card-name with-img">
                  <img
                    v-if="item.product?.garminImageUrl"
                    :src="item.product.garminImageUrl"
                    :alt="item.product?.name || 'Purchased product'"
                    class="m-thumb"
                  />
                  <span>{{ item.product?.name || 'Product' }}</span>
                </div>
                <span :class="['m-card-status', getStatusClass(item.status)]">{{ item.statusDesc }}</span>
              </div>
              <div class="m-card-body">
                <div class="m-row">
                  <span class="m-label">Date</span>
                  <span class="m-value">{{ formatDate(item.createdAt) }}</span>
                </div>
                <div class="m-row">
                  <span class="m-label">Amount</span>
                  <span class="m-value m-amount">
                    {{ formatAmount(item) }}
                  </span>
                </div>
                <div class="m-row">
                  <span class="m-label">Payment</span>
                  <span class="m-value">{{ item.paymentMethod }}</span>
                </div>
                <div class="m-row">
                  <span class="m-label">Transaction</span>
                  <span class="m-value m-mono">{{ item.transactionId }}</span>
                </div>
              </div>
              <div class="m-card-footer">
                <a
                  v-if="item.product?.garminStoreUrl"
                  :href="item.product.garminStoreUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="m-action-btn"
                >
                  <Icon icon="mdi:storefront-outline" width="16" aria-hidden="true" />
                  App Store
                </a>
                <button
                  v-if="item.product?.designId"
                  class="m-action-btn outline"
                  type="button"
                  @click="navigateToProduct(item.product.appId)"
                >
                  <Icon icon="mdi:arrow-right" width="16" aria-hidden="true" />
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
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
      <div class="tip-card">
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
import { useRouter } from 'vue-router'
import { getPurchaseRecords } from '@/api/pay'
import type { PurchaseRecord } from '@/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const records = ref<PurchaseRecord[]>([])
const isLoading = ref(true)

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

const paidRecords = computed(() => {
  return records.value.filter(record => record.status === 1)
})

const totalSpendLabel = computed(() => {
  const currencies = new Set(paidRecords.value.map(record => record.currencyCode || record.countryCode).filter(Boolean))
  const total = paidRecords.value.reduce((sum, record) => sum + Number(record.total || 0), 0) / 100
  const currency = currencies.size === 1 ? Array.from(currencies)[0] : ''
  return `${total.toFixed(2)}${currency ? ` ${currency}` : ''}`
})

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
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

const getStatusClass = (status: number) => {
  return status === 1 ? 'success' : 'failed'
}

const tableRowClass = () => 'table-row'

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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.page-kicker,
.section-label-text,
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

.profile-link,
.empty-action,
.cell-link-btn,
.m-action-btn {
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

.profile-link {
  flex-shrink: 0;
  padding: 0 16px;
  color: var(--color-brand-strong);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.profile-link:hover {
  border-color: rgba(15, 107, 104, 0.36);
  background: var(--color-brand-soft);
}

.records-content,
.sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  min-height: 108px;
  padding: 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.summary-label {
  display: block;
  color: var(--color-muted);
}

.summary-value {
  display: block;
  margin-top: 12px;
  color: var(--color-ink);
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.section-help {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.section-count {
  min-width: 34px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.section-card,
.m-card,
.empty-card,
.tip-card,
.loading-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.section-card {
  overflow: hidden;
}

.apple-table {
  font-size: 0.875rem;
}

.apple-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.apple-table :deep(.el-table__header-wrapper) {
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

:deep(.apple-th) {
  background: #fbfdfc !important;
  color: var(--color-muted) !important;
  font-size: 0.75rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: uppercase !important;
  border: none !important;
  padding: 12px 16px !important;
}

:deep(.apple-th .cell) {
  overflow: visible;
  white-space: nowrap;
  word-break: normal;
}

:deep(.apple-td) {
  padding: 14px 16px !important;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08) !important;
  vertical-align: middle !important;
}

:deep(.apple-td .cell) {
  overflow: visible;
  line-height: 1.4;
}

:deep(.table-row) {
  transition: background 180ms ease;
}

:deep(.table-row:hover) {
  background: rgba(15, 107, 104, 0.04) !important;
}

:deep(.table-row:last-child .apple-td) {
  border-bottom: none !important;
}

.cell-date,
.cell-txn {
  color: var(--color-muted);
  font-size: 0.8125rem;
}

.cell-name {
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 700;
}

.cell-thumb,
.m-thumb {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  object-fit: cover;
  background: var(--color-surface-soft);
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
}

.cell-thumb {
  display: block;
  margin: 0 auto;
}

.cell-amount {
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cell-pill,
.cell-status,
.m-card-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0;
}

.cell-pill {
  color: #475467;
  background: #f2f4f7;
}

.cell-status.success,
.m-card-status.success {
  color: #027a48;
  background: #ecfdf3;
}

.cell-status.failed,
.m-card-status.failed {
  color: #b42318;
  background: #fef3f2;
}

.cell-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cell-link-btn,
.m-action-btn,
.empty-action {
  padding: 0 14px;
  color: #fff;
  background: var(--color-brand);
}

.cell-link-btn:hover,
.m-action-btn:hover,
.empty-action:hover {
  border-color: var(--color-brand-strong);
  background: var(--color-brand-strong);
  color: #fff;
  transform: translateY(-1px);
}

.cell-link-btn.outline,
.m-action-btn.outline {
  color: var(--color-brand-strong);
  background: #fff;
}

.cell-link-btn.outline:hover,
.m-action-btn.outline:hover {
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.cell-txn {
  display: inline-block;
  max-width: 100%;
  font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
  word-break: break-all;
}

.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.m-card {
  overflow: hidden;
}

.m-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.m-card-name {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 800;
}

.m-card-name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-card-body {
  padding: 0 16px 4px;
}

.m-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.m-label {
  flex-shrink: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.m-value {
  min-width: 0;
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-value.m-amount {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.m-value.m-mono {
  color: var(--color-muted);
  font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
}

.m-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px 16px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
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
    flex-direction: column;
    gap: 16px;
  }

  .profile-link {
    width: 100%;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-cards {
    display: flex;
  }

  .section-label {
    align-items: flex-start;
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
    min-height: 92px;
  }

  .m-card-top {
    flex-direction: column;
  }

  .m-card-status {
    align-self: flex-start;
  }
}
</style>
