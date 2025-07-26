<template>
  <div class="purchase-records-page">
    <h2>Purchase Records</h2>
    <div class="records-container">
      <el-table
        v-if="records.length"
        :data="records"
        class="modern-table"
        header-cell-class-name="table-header"
        cell-class-name="table-cell"
        :row-class-name="tableRowClass"
        :border="false"
        :stripe="false"
      >
        <el-table-column prop="createdAt" label="Date" width="160" align="center">
          <template #default="scope">
            <div class="date-cell">
              <div class="date-main">{{ formatDate(scope.row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="product.garminImageUrl" label="Image" width="70" align="center">
          <template #default="scope">
            <img :src="scope.row.product.garminImageUrl" alt="product" class="product-img" />
          </template>
        </el-table-column>
        <el-table-column prop="product.name" label="Product Name" min-width="140" align="left">
          <template #default="scope">
            <span class="product-name">{{ scope.row.product.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="App Store" width="130" align="center">
          <template #default="scope">
            <a 
              v-if="scope.row.product.garminStoreUrl" 
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
            <a 
              v-if="scope.row.product.designId" 
              :href="`https://wristo.io/product/${scope.row.product.appId}`" 
              target="_blank" 
              class="link-btn site-link"
            >
              <el-icon><Link /></el-icon>
              Website
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="Amount" width="120" align="right">
          <template #default="scope">
            <div class="amount-cell">
              <span class="amount-value">{{ (scope.row.total / 100).toFixed(2) }}</span>
              <span class="amount-currency">{{ scope.row.currencyCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="Status" width="120" align="center">
          <template #default="scope">
            <div :class="['status-badge', getStatusClass(scope.row.status)]">
              {{ scope.row.statusDesc }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionId" label="Transaction" min-width="200" align="left">
          <template #default="scope">
            <div class="transaction-cell">
              <div class="transaction-id">{{ scope.row.transactionId }}</div>
              <div class="transaction-meta">
                <span class="payment-method">{{ scope.row.paymentMethod }}</span>
                <span class="country-code">{{ scope.row.countryCode }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="No purchase records found." class="empty-state">
        <el-icon class="empty-icon"><Document /></el-icon>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPurchaseRecords } from '@/api/pay'
import type { PurchaseRecord } from '@/types'
import { ElMessage } from 'element-plus'
import { Link, Document } from '@element-plus/icons-vue'

const records = ref<PurchaseRecord[]>([])

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
    const res = await getPurchaseRecords()
    if (res.code === 0 && res.data) {
      records.value = res.data
    } else {
      ElMessage.error(res.msg || 'Failed to load purchase records')
    }
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
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 32px;
  color: #1a202c;
  text-align: center;
}

.records-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
  border-radius: 6px;
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
  text-align: right;
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
  border-radius: 20px;
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
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 500;
}
.country-code {
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.empty-state {
  padding: 64px 32px;
}
.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 16px;
}
@media (max-width: 768px) {
  .purchase-records-page {
    padding: 16px 8px;
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