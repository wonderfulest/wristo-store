<template>
  <div class="purchase-page">
    <div class="purchase-container">

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Purchases</h1>
        <p class="page-subtitle">View your order history and manage purchases.</p>
      </div>

      <div v-if="records.length > 0" class="sections-wrapper">

        <!-- Section: Bundle Purchases -->
        <div v-if="bundleRecords.length > 0" class="section">
          <div class="section-label">
            <span class="section-label-text">Bundle Purchases</span>
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
              <el-table-column prop="total" label="Amount" width="120" align="right">
                <template #default="scope">
                  <span class="cell-amount">{{ (scope.row.total / 100).toFixed(2) }}</span>
                  <span class="cell-country">{{ scope.row.countryCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="Payment" width="110" align="center">
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
                    @click="navigateToBundle(scope.row.bundle.bundleId)"
                  >
                    View
                  </button>
                </template>
              </el-table-column>
              <el-table-column prop="transactionId" label="Transaction" min-width="280" align="left">
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
                <div class="m-card-name">{{ item.bundle?.bundleName || 'Bundle' }}</div>
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
                    {{ (item.total / 100).toFixed(2) }}
                    <span class="m-currency">{{ item.currencyCode }}</span>
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
                <button class="m-action-btn" @click="navigateToBundle(item.bundle.bundleId)">
                  View Bundle
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Product Purchases -->
        <div v-if="productRecords.length > 0" class="section">
          <div class="section-label">
            <span class="section-label-text">Product Purchases</span>
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
                    alt=""
                    class="cell-thumb"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="product.name" label="Name" min-width="140" align="left">
                <template #default="scope">
                  <span class="cell-name">{{ scope.row.product?.name || 'Product' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="total" label="Amount" width="120" align="right">
                <template #default="scope">
                  <span class="cell-amount">{{ (scope.row.total / 100).toFixed(2) }}</span>
                  <span class="cell-country">{{ scope.row.countryCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="Payment" width="110" align="center">
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
              <el-table-column label="" width="180" align="center">
                <template #default="scope">
                  <div class="cell-links">
                    <a
                      v-if="scope.row.product?.garminStoreUrl"
                      :href="scope.row.product.garminStoreUrl"
                      target="_blank"
                      class="cell-link-btn"
                    >
                      Store
                    </a>
                    <button
                      v-if="scope.row.product?.designId"
                      class="cell-link-btn outline"
                      @click="navigateToProduct(scope.row.product.appId)"
                    >
                      Details
                    </button>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="transactionId" label="Transaction" min-width="280" align="left">
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
                    alt=""
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
                    {{ (item.total / 100).toFixed(2) }}
                    <span class="m-currency">{{ item.currencyCode }}</span>
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
                  class="m-action-btn"
                >
                  App Store
                </a>
                <button
                  v-if="item.product?.designId"
                  class="m-action-btn outline"
                  @click="navigateToProduct(item.product.appId)"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-card">
        <div class="empty-icon-wrap">
          <Icon icon="mdi:receipt-text-outline" width="40" color="#c7c7cc" />
        </div>
        <div class="empty-title">No Purchases Yet</div>
        <div class="empty-desc">Your purchase history will appear here once you make a purchase.</div>
      </div>

      <!-- Tip -->
      <div class="tip-card">
        <Icon icon="mdi:lightbulb-outline" width="18" class="tip-icon" />
        <span>
          We recommend you
          <a
            href="https://sso.wristo.io/login?client=store&redirect_uri=https%3A%2F%2Fwristo.io%2Fauth%2Fcallback"
            target="_blank"
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

// 导航到 bundle 页面
const navigateToBundle = (bundleId: number | string) => {
  router.push(`/bundle/${String(bundleId)}`)
}

// 导航到 product 页面
const navigateToProduct = (productId: number | string) => {
  router.push(`/product/${String(productId)}`)
}

// 分离Bundle和Product记录
const bundleRecords = computed(() => {
  return records.value.filter(record => record.isBundle)
})

const productRecords = computed(() => {
  return records.value.filter(record => !record.isBundle)
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

const getStatusClass = (status: number) => {
  return status === 1 ? 'success' : 'failed'
}

const tableRowClass = () => 'table-row'

onMounted(async () => {
  try {
    records.value = await getPurchaseRecords()
  } catch (e) {
    ElMessage.error('Network error, please try again later.')
  }
})
</script>

<style scoped>
/* ===== Page ===== */
.purchase-page {
  width: 100%;
  min-height: 100vh;
  background: #f2f2f7;
  display: flex;
  justify-content: center;
  padding: 0 16px 48px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.purchase-container {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 40px;
}

/* ===== Page Header ===== */
.page-header {
  text-align: center;
  padding-bottom: 4px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.025em;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

/* ===== Sections ===== */
.sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.section-label-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #86868b;
  background: #e5e5ea;
  padding: 1px 8px;
  border-radius: 999px;
}

/* ===== Card Container ===== */
.section-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}

/* ===== Apple Table ===== */
.apple-table {
  font-size: 0.875rem;
}

.apple-table :deep(.el-table__header-wrapper) {
  border-bottom: 0.5px solid #d1d1d6;
}

:deep(.apple-th) {
  background: #fff !important;
  color: #86868b !important;
  font-weight: 500 !important;
  font-size: 0.8125rem !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  border: none !important;
  padding: 10px 14px !important;
}

:deep(.apple-td) {
  padding: 12px 14px !important;
  border-bottom: 0.5px solid #e5e5ea !important;
  vertical-align: middle !important;
}

:deep(.apple-td .cell) {
  overflow: visible;
  line-height: 1.4;
}

:deep(.table-row) {
  transition: background 0.15s ease;
}

:deep(.table-row:hover) {
  background: rgba(0, 0, 0, 0.02) !important;
}

:deep(.table-row:last-child .apple-td) {
  border-bottom: none !important;
}

/* ===== Cell Styles ===== */
.cell-date {
  font-size: 0.8125rem;
  color: #86868b;
  font-weight: 400;
}

.cell-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1d1d1f;
}

.cell-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  background: #f2f2f7;
  flex-shrink: 0;
}

.cell-amount {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1d1d1f;
}

.cell-country {
  font-size: 0.75rem;
  color: #86868b;
  margin-left: 4px;
}

.cell-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f2f2f7;
  color: #636366;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.cell-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.cell-status.success {
  background: #e8f8ef;
  color: #30a14e;
}

.cell-status.failed {
  background: #fef0f0;
  color: #e5484d;
}

.cell-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cell-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
  background: #007aff;
  color: #fff;
  border: none;
}

.cell-link-btn:hover {
  background: #0066d6;
}

.cell-link-btn.outline {
  background: transparent;
  color: #007aff;
  border: 1px solid #007aff;
}

.cell-link-btn.outline:hover {
  background: rgba(0, 122, 255, 0.06);
}

.cell-txn {
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  color: #86868b;
  word-break: break-all;
  line-height: 1.4;
}

/* ===== Mobile Cards ===== */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.m-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}

.m-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 10px;
}

.m-card-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1d1d1f;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-card-name.with-img {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f2f2f7;
}

.m-card-status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.m-card-status.success {
  background: #e8f8ef;
  color: #30a14e;
}

.m-card-status.failed {
  background: #fef0f0;
  color: #e5484d;
}

.m-card-body {
  padding: 0 16px;
}

.m-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 0.5px solid #e5e5ea;
  gap: 8px;
}

.m-label {
  font-size: 0.875rem;
  color: #86868b;
  flex-shrink: 0;
}

.m-value {
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 400;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-value.m-amount {
  font-weight: 600;
}

.m-currency {
  color: #86868b;
  font-weight: 400;
  margin-left: 2px;
  font-size: 0.8125rem;
}

.m-value.m-mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  color: #86868b;
  word-break: break-all;
  white-space: normal;
  line-height: 1.4;
}

.m-card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 14px;
  border-top: 0.5px solid #e5e5ea;
}

.m-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 18px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
  background: #007aff;
  color: #fff;
  border: none;
}

.m-action-btn:hover {
  background: #0066d6;
}

.m-action-btn.outline {
  background: transparent;
  color: #007aff;
  border: 1px solid #007aff;
}

.m-action-btn.outline:hover {
  background: rgba(0, 122, 255, 0.06);
}

/* ===== Empty State ===== */
.empty-card {
  background: #fff;
  border-radius: 14px;
  padding: 56px 32px;
  text-align: center;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}

.empty-icon-wrap {
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 0.875rem;
  color: #86868b;
}

/* ===== Tip Card ===== */
.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  background: #fff;
  border-radius: 12px;
  font-size: 0.8125rem;
  color: #636366;
  line-height: 1.5;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}

.tip-icon {
  color: #ff9500;
  flex-shrink: 0;
  margin-top: 1px;
}

.tip-link {
  color: #007aff;
  text-decoration: none;
  font-weight: 500;
}

.tip-link:hover {
  text-decoration: underline;
}

/* ===== Footer ===== */
.page-footer {
  text-align: center;
  font-size: 0.8125rem;
  color: #86868b;
  padding-top: 8px;
}

.footer-link {
  color: #007aff;
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .purchase-page {
    padding: 0 0 32px;
  }

  .purchase-container {
    max-width: 100%;
    gap: 24px;
    padding-top: 24px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .page-title {
    font-size: 1.625rem;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-cards {
    display: flex;
  }

  .section-card {
    border-radius: 12px;
  }

  .m-card {
    border-radius: 12px;
  }
}
</style> 