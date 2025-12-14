<template>
  <div class="purchase-records-page">
    <h2>Purchases</h2>
    
    <div v-if="records.length > 0">
      <!-- Bundle 购买记录 -->
      <div v-if="bundleRecords.length > 0" class="records-section">
        <h3 class="section-title">Bundle Purchases</h3>
        <div class="records-container desktop-only">
          <el-table
            :data="bundleRecords"
            class="modern-table"
            header-cell-class-name="table-header"
            cell-class-name="table-cell"
            :row-class-name="tableRowClass"
            :border="false"
            :stripe="false"
          >
            <el-table-column prop="createdAt" label="Date" width="200" align="center">
              <template #default="scope">
                <div class="date-cell">
                  <div class="date-main">{{ formatDate(scope.row.createdAt) }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="bundle.bundleName" label="Bundle Name" min-width="180" align="center">
              <template #default="scope">
                <span class="product-name">{{ scope.row.bundle?.bundleName || 'Bundle' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Website" width="160" align="center">
              <template #default="scope">
                <button 
                  v-if="scope.row.bundle?.bundleId" 
                  @click="navigateToBundle(scope.row.bundle.bundleId)"
                  class="link-btn site-link"
                >
                  <el-icon><Link /></el-icon>
                  Bundle Link
                </button>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="Amount" width="160" align="center">
              <template #default="scope">
                <div class="amount-cell">
                  <div class="amount-main">
                    <span class="amount-value">{{ (scope.row.total / 100).toFixed(2) }}</span>
                    <div class="amount-meta">
                      <span class="amount-pill amount-pill-country">{{ scope.row.countryCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="paymentMethod" label="Payment" width="120" align="center">
              <template #default="scope">
                <span class="payment-method-pill">{{ scope.row.paymentMethod }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="statusDesc" label="Status" width="120" align="center">
              <template #default="scope">
                <div :class="['status-badge', getStatusClass(scope.row.status)]">
                  {{ scope.row.statusDesc }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="transactionId" label="Transaction" min-width="320" align="left">
              <template #default="scope">
                <div class="transaction-cell">
                  <div class="transaction-id">{{ scope.row.transactionId }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Mobile Cards: Bundle -->
        <div class="mobile-cards">
          <div
            v-for="item in bundleRecords"
            :key="item.transactionId"
            class="purchase-card"
          >
            <div class="card-header">
              <div class="card-title">{{ item.bundleId ? `Bundle #${item.bundleId}` : 'Bundle' }}</div>
              <div class="card-status" :class="getStatusClass(item.status)">{{ item.statusDesc }}</div>
            </div>
            <div class="card-row">
              <span class="row-label">Date</span>
              <span class="row-value">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="card-row">
              <span class="row-label">Amount</span>
              <span class="row-value amount">
                {{ (item.total / 100).toFixed(2) }}
                <span class="currency">{{ item.currencyCode }}</span>
              </span>
            </div>
            <div class="card-row">
              <span class="row-label">Transaction</span>
              <span class="row-value mono">{{ item.transactionId }}</span>
            </div>
            <div class="card-row meta">
              <span class="badge">{{ item.paymentMethod }}</span>
              <span class="badge warn">{{ item.countryCode }}</span>
            </div>
            <div class="card-actions">
              <button
                v-if="item.bundleId"
                class="link-btn site-link"
                @click="navigateToBundle(item.bundleId)"
              >
                <el-icon><Link /></el-icon>
                Bundle Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 购买记录 -->
      <div v-if="productRecords.length > 0" class="records-section">
        <h3 class="section-title">Product Purchases</h3>
        <div class="records-container desktop-only">
          <el-table
            :data="productRecords"
            class="modern-table"
            header-cell-class-name="table-header"
            cell-class-name="table-cell"
            :row-class-name="tableRowClass"
            :border="false"
            :stripe="false"
          >
            <el-table-column prop="createdAt" label="Date" width="200" align="center">
              <template #default="scope">
                <div class="date-cell">
                  <div class="date-main">{{ formatDate(scope.row.createdAt) }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="product.garminImageUrl" label="Image" width="70" align="center">
              <template #default="scope">
                <img :src="scope.row.product?.garminImageUrl" alt="product" class="product-img" />
              </template>
            </el-table-column>
            <el-table-column prop="product.name" label="Product Name" min-width="140" align="left">
              <template #default="scope">
                <span class="product-name">{{ scope.row.product?.name || 'Product' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="App Store" width="130" align="center">
              <template #default="scope">
                <a 
                  v-if="scope.row.product?.garminStoreUrl" 
                  :href="scope.row.product.garminStoreUrl" 
                  target="_blank" 
                  class="link-btn garmin-link"
                >
                  <el-icon><Link /></el-icon>
                  App Store
                </a>
              </template>
            </el-table-column>
            <el-table-column label="Website" width="110" align="center">
              <template #default="scope">
                <button 
                  v-if="scope.row.product?.designId" 
                  @click="navigateToProduct(scope.row.product.appId)"
                  class="link-btn site-link"
                >
                  <el-icon><Link /></el-icon>
                  App Link
                </button>
              </template>
            </el-table-column>

            <el-table-column prop="total" label="Amount" width="160" align="center">
              <template #default="scope">
                <div class="amount-cell">
                  <div class="amount-main">
                    <span class="amount-value">{{ (scope.row.total / 100).toFixed(2) }}</span>
                    <div class="amount-meta">
                      <span class="amount-pill amount-pill-country">{{ scope.row.countryCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="paymentMethod" label="Payment" width="120" align="center">
              <template #default="scope">
                <span class="payment-method-pill">{{ scope.row.paymentMethod }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="statusDesc" label="Status" width="120" align="center">
              <template #default="scope">
                <div :class="['status-badge', getStatusClass(scope.row.status)]">
                  {{ scope.row.statusDesc }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="transactionId" label="Transaction" min-width="320" align="left">
              <template #default="scope">
                <div class="transaction-cell">
                  <div class="transaction-id">{{ scope.row.transactionId }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Mobile Cards: Product -->
        <div class="mobile-cards">
          <div
            v-for="item in productRecords"
            :key="item.transactionId"
            class="purchase-card"
          >
            <div class="card-header">
              <div class="card-title with-thumb">
                <img :src="item.product?.garminImageUrl" alt="product" class="product-thumb" />
                <span>{{ item.product?.name || 'Product' }}</span>
              </div>
              <div class="card-status" :class="getStatusClass(item.status)">{{ item.statusDesc }}</div>
            </div>
            <div class="card-row">
              <span class="row-label">Date</span>
              <span class="row-value">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="card-row">
              <span class="row-label">Amount</span>
              <span class="row-value amount">
                {{ (item.total / 100).toFixed(2) }}
                <span class="currency">{{ item.currencyCode }}</span>
              </span>
            </div>
            <div class="card-row">
              <span class="row-label">Transaction</span>
              <span class="row-value mono">{{ item.transactionId }}</span>
            </div>
            <div class="card-row meta">
              <span class="badge">{{ item.paymentMethod }}</span>
              <span class="badge warn">{{ item.countryCode }}</span>
            </div>
            <div class="card-actions">
              <a
                v-if="item.product?.garminStoreUrl"
                :href="item.product.garminStoreUrl"
                target="_blank"
                class="link-btn garmin-link"
              >
                <el-icon><Link /></el-icon>
                App Store
              </a>
              <button
                v-if="item.product?.designId"
                class="link-btn site-link"
                @click="navigateToProduct(item.product.appId)"
              >
                <el-icon><Link /></el-icon>
                App Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state-container">
      <el-empty description="No purchase records found." class="empty-state">
        <el-icon class="empty-icon"><Document /></el-icon>
      </el-empty>
    </div>
    
    <!-- 提示信息 -->
    <div class="action-box">
      <strong>Tip:</strong> We recommend you 
      <a href="https://sso.wristo.io/login?client=store&redirect_uri=https%3A%2F%2Fwristo.io%2Fauth%2Fcallback" 
         target="_blank" 
         class="tip-link">
        create an account
      </a> 
      to easily access your subscription and purchase records anytime.
    </div>
    
    <!-- 页脚 -->
    <div class="footer">
      If you have any questions, please contact 
      <a href="mailto:support@wristo.io" class="contact-link">support@wristo.io</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPurchaseRecords } from '@/api/pay'
import type { PurchaseRecord } from '@/types'
import { ElMessage } from 'element-plus'
import { Link, Document } from '@element-plus/icons-vue'

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
.purchase-records-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #222;
  background: #f6f8fa;
  min-height: 100vh;
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 32px;
  color: #1a202c;
  text-align: center;
}

.records-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 24px 0 16px 0;
  color: #374151;
}

.records-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.mobile-cards {
  display: none;
}

.modern-table {
  font-size: 0.95rem;
}

.table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  border: none !important;
  padding: 16px 12px !important;
}

.table-cell {
  padding: 16px 12px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  vertical-align: middle !important;
}

.table-row {
  transition: all 0.2s ease-in-out;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: block;
  margin: 0 auto;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
  line-height: 1.2;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.garmin-link {
  background: #3b82f6;
  color: #fff;
}
.garmin-link:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
.site-link {
  background: #f59e42;
  color: #fff;
}
.site-link:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(245, 158, 66, 0.3);
}
.amount-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}

.amount-main {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  line-height: 1;
}

.amount-meta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.amount-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(243, 244, 246, 0.9);
  color: rgba(17, 24, 39, 0.78);
  text-transform: uppercase;
}

.amount-pill-country {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.22);
  color: rgba(146, 64, 14, 0.92);
}

.payment-method-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(243, 244, 246, 0.9);
  color: rgba(17, 24, 39, 0.78);
  text-transform: uppercase;
}
.amount-value {
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
}
.amount-currency {
  color: #6b7280;
  font-size: 0.85rem;
  margin-left: 4px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}
.status-badge.failed {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Mobile card UI */
.mobile-cards {
  grid-template-columns: 1fr;
  gap: 12px;
}
.purchase-card {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: 14px;
}
.purchase-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.purchase-card .card-title {
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
}
.purchase-card .card-title.with-thumb {
  display: flex;
  align-items: center;
  gap: 10px;
}
.product-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}
.purchase-card .card-status {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}
.purchase-card .card-status.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
}
.purchase-card .card-status.failed {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
}
.purchase-card .card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid #f3f4f6;
}
.purchase-card .card-row:first-of-type {
  border-top: none;
}
.row-label {
  color: #6b7280;
  font-size: 0.8rem;
}
.row-value {
  color: #111827;
  font-weight: 600;
  font-size: 0.9rem;
}
.row-value.mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  word-break: break-all;
}
.row-value.amount {
  color: #047857;
}
.row-value .currency {
  color: #6b7280;
  font-weight: 500;
  margin-left: 4px;
}
.purchase-card .card-row.meta {
  gap: 6px;
}
.badge {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.warn {
  background: #fef3c7;
  color: #92400e;
}
.purchase-card .card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.transaction-cell {
  min-width: 0;
}
.transaction-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-all;
}
.transaction-meta {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  color: #6b7280;
}
.payment-method {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  font-weight: 500;
}
.country-code {
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}
.empty-state-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.empty-state {
  padding: 64px 32px;
}
.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 16px;
}

.action-box {
  margin: 24px 0;
  padding: 18px 24px;
  background: #f8f9fa;
  border-left: 4px solid #222;
  border-radius: 8px;
  color: #333;
}

.tip-link {
  color: #007bff;
  text-decoration: underline;
  font-weight: bold;
}

.tip-link:hover {
  color: #0056b3;
}

.footer {
  margin-top: 32px;
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.contact-link {
  color: #007bff;
  text-decoration: underline;
}

.contact-link:hover {
  color: #0056b3;
}
@media (max-width: 768px) {
  .purchase-records-page {
    padding: 16px 8px;
  }
  .desktop-only {
    display: none;
  }
  .mobile-cards {
    display: grid;
  }
  h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
  .modern-table {
    font-size: 0.85rem;
  }
  .table-header {
    padding: 12px 8px !important;
    font-size: 0.8rem !important;
  }
  .table-cell {
    padding: 12px 8px !important;
  }
  .product-img {
    width: 40px;
    height: 40px;
  }
  .amount-value {
    font-size: 1rem;
  }
  .transaction-id {
    font-size: 0.75rem;
  }
}
@media (max-width: 480px) {
  .table-header {
    font-size: 0.75rem !important;
  }
  .table-cell {
    padding: 8px 4px !important;
  }
  .product-img {
    width: 36px;
    height: 36px;
  }
  .status-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}
</style> 