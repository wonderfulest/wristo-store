<template>
  <div class="subscription-management">
    <div class="container">
      <div class="header">
        <h1 class="page-title">Subscription Management</h1>
        <p class="page-subtitle">Manage your subscription plan and billing</p>
      </div>

      <!-- 当前订阅信息 -->
      <div v-if="hasActiveSubscription" class="subscription-card">
        <div class="card-header">
          <div class="plan-info">
            <h2 class="plan-name">{{ userStore.userInfo?.subscription?.name }}</h2>
            <span class="plan-status" :class="{ 'active': hasActiveSubscription, 'expired': !hasActiveSubscription }">
              {{ hasActiveSubscription ? 'Active' : 'Expired' }}
            </span>
          </div>
          <div class="plan-actions">
            <el-button type="text" size="small" @click="goToCancelPage" class="manage-btn">
              Cancel
            </el-button>
          </div>
        </div>

        <div class="subscription-details">
          <div class="detail-item">
            <span class="label">Plan Type:</span>
            <span class="value">{{ formatPlanType(userStore.userInfo?.subscription?.planCode) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Start Date:</span>
            <span class="value">{{ formatDate(userStore.userInfo?.subscription?.startTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">End Date:</span>
            <span class="value">{{ formatDate(userStore.userInfo?.subscription?.endTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Days Remaining:</span>
            <span class="value">{{ daysRemaining }} days</span>
          </div>
        </div>

        <!-- 订阅权益 -->
        <div class="subscription-benefits">
          <h3>Your Benefits</h3>
          <ul class="benefits-list">
            <li><el-icon class="check-icon"><Check /></el-icon> Access to 2000+ premium watch faces</li>
            <li><el-icon class="check-icon"><Check /></el-icon> Get new watch faces monthly</li>
            <li><el-icon class="check-icon"><Check /></el-icon> Ad-free experience</li>
            <li><el-icon class="check-icon"><Check /></el-icon> Priority customer support</li>
          </ul>
        </div>
      </div>

      <!-- 无订阅状态 -->
      <div v-else class="no-subscription">
        <div class="empty-state">
          <el-icon class="empty-icon"><Warning /></el-icon>
          <h2>No Active Subscription</h2>
          <p>You don't have an active subscription. Subscribe now to unlock premium features!</p>
          <el-button type="primary" size="large" @click="router.push('/subscription')">
            View Subscription Plans
          </el-button>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElIcon } from 'element-plus'
import { Check, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 检查用户是否有有效订阅
const hasActiveSubscription = computed(() => {
  if (!userStore.userInfo?.subscription) return false
  const endTime = new Date(userStore.userInfo.subscription.endTime)
  const now = new Date()
  return endTime > now
})

// 计算剩余天数
const daysRemaining = computed(() => {
  if (!userStore.userInfo?.subscription) return 0
  const endTime = new Date(userStore.userInfo.subscription.endTime)
  const now = new Date()
  const diffTime = endTime.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

// 格式化计划类型
const formatPlanType = (planCode?: string): string => {
  if (!planCode) return 'Unknown'
  switch (planCode) {
    case 'monthly':
      return 'Monthly Plan'
    case 'yearly':
      return 'Annual Plan'
    case 'lifetime':
      return 'Lifetime Plan'
    default:
      return planCode
  }
}

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 跳转到取消订阅页面
const goToCancelPage = () => {
  router.push('/subscription-cancel')
}
</script>

<style scoped>
.subscription-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.subscription-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.plan-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-status.active {
  background-color: rgba(48, 209, 88, 0.2);
  color: #30d158;
}

.plan-status.expired {
  background-color: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.manage-btn {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 18px !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.manage-btn:hover {
  color: rgba(255, 255, 255, 0.9) !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.subscription-details {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  font-weight: 700;
  color: #1d1d1f;
}

.subscription-benefits {
  padding: 2rem;
  border-top: 1px solid #eee;
}

.subscription-benefits h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 1rem;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.check-icon {
  color: #30d158;
  font-size: 1.2rem;
}

.no-subscription {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #ffa500;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscription-management {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .subscription-details {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
