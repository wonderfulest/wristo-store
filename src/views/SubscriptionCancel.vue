<template>
  <div class="subscription-cancel">
    <div class="container">
      <div class="header">
        <h1 class="page-title">Cancel your plan</h1>
      </div>

      <div class="cancel-card">
        <!-- 当前订阅信息 -->
        <div class="current-plan-info">
          <p class="plan-description">
            You're currently on the <strong>{{ subscriptionPlanName }}</strong>
            <span v-if="currentPrice && userStore.userInfo?.subscription">
              <template v-if="userStore.userInfo.subscription.planCode === 'yearly' || userStore.userInfo.subscription.planCode === 'annual'">
                ({{ formatPrice(currentPrice) }} per year, {{ formatPrice(monthlyPrice || 0) }} per month)
              </template>
              <template v-else-if="userStore.userInfo.subscription.planCode === 'monthly'">
                ({{ formatPrice(currentPrice) }} per month)
              </template>
              <template v-else>
                ({{ formatPrice(currentPrice) }})
              </template>
            </span>
            which will be canceled at the end of your billing period on 
            <strong>{{ formatDate(userStore.userInfo?.subscription?.endTime) }}</strong>. 
            You will be reverted back to the Free tier once the plan expires.
          </p>
          
          <div class="renewal-note">
            <p>If you change your mind, you can renew your subscription.</p>
          </div>
        </div>

        <!-- 反馈部分 -->
        <div class="feedback-section">
          <h2 class="feedback-title">We're sorry to see you go</h2>
          <p class="feedback-subtitle">
            Your feedback is incredibly valuable to us, and we'd love to hear if there's anything we could have done better.
          </p>
          
          <div class="reason-selection">
            <h3>Please select a reason for cancellation:</h3>
            <div class="reason-options">
              <label 
                v-for="reason in cancellationReasons" 
                :key="reason.value"
                class="reason-option"
                :class="{ active: selectedReason === reason.value }"
              >
                <input 
                  type="radio" 
                  :value="reason.value" 
                  v-model="selectedReason"
                  class="reason-radio"
                />
                <span class="reason-text">{{ reason.label }}</span>
              </label>
            </div>
          </div>

          <!-- 其他原因输入框 -->
          <div v-if="selectedReason === 'other'" class="other-reason">
            <el-input
              v-model="otherReasonText"
              type="textarea"
              :rows="3"
              placeholder="Please tell us more about your reason for canceling..."
              maxlength="500"
              show-word-limit
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button size="large" @click="goBack">
            Keep Subscription
          </el-button>
          <el-button 
            type="danger" 
            size="large" 
            :loading="cancelLoading"
            @click="handleCancelSubscription"
          >
            Cancel Plan
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElInput, ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { pauseSubscription } from '@/api/subscription'

const router = useRouter()
const userStore = useUserStore()

// State
const selectedReason = ref('')
const otherReasonText = ref('')
const cancelLoading = ref(false)

// 取消原因选项
const cancellationReasons = [
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'low-quality', label: 'Low Quality' },
  { value: 'missing-features', label: 'Missing Features' },
  { value: 'switching-service', label: 'Switching Service' },
  { value: 'too-complex', label: 'Too Complex' },
  { value: 'too-expensive', label: 'Too Expensive' },
  { value: 'unused', label: 'Unused' },
  { value: 'other', label: 'Other' }
]

// 计算属性
const subscriptionPlanName = computed(() => {
  return userStore.userInfo?.subscription?.name || 'Pro plan'
})

// 获取当前订阅价格
const currentPrice = computed(() => {
  const subscription = userStore.userInfo?.subscription
  if (!subscription) return null
  
  // 优先使用折扣价格，如果没有则使用原价
  return subscription.discountPrice || subscription.originalPrice
})

// 获取货币代码
const currencyCode = computed(() => {
  return userStore.userInfo?.subscription?.currencyCode || 'USD'
})

// 计算月度价格（如果是年付计划）
const monthlyPrice = computed(() => {
  const subscription = userStore.userInfo?.subscription
  if (!subscription || !currentPrice.value) return null
  
  const planCode = subscription.planCode
  if (planCode === 'yearly' || planCode === 'annual') {
    // 年付计划按月计算
    return Math.round((currentPrice.value / 12) * 100) / 100
  } else {
    // 月付计划直接返回价格
    return currentPrice.value
  }
})

// 格式化价格
const formatPrice = (price: number): string => {
  const currency = currencyCode.value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
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

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理取消订阅
const handleCancelSubscription = async () => {
  if (!selectedReason.value) {
    ElMessage.warning('Please select a reason for cancellation')
    return
  }

  try {
    const result = await ElMessageBox.confirm(
      'Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to premium features at the end of your billing period.',
      'Confirm Cancellation',
      {
        confirmButtonText: 'Yes, Cancel Plan',
        cancelButtonText: 'Keep Subscription',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      cancelLoading.value = true
      try {
        // 发送取消请求，包含取消原因
        await pauseSubscription(selectedReason.value)
        
        // 可以在这里发送反馈数据到后端
        const feedbackData = {
          reason: selectedReason.value,
          otherReason: selectedReason.value === 'other' ? otherReasonText.value : null
        }
        console.log('Cancellation feedback:', feedbackData)
        
        ElMessage.success('Your subscription has been scheduled for cancellation')
        
        // 重新获取用户信息
        await userStore.getUserInfo()
        
        // 跳转回订阅管理页面
        router.push('/subscription')
      } catch (error) {
        console.error('Failed to cancel subscription:', error)
        ElMessage.error('Failed to cancel subscription. Please try again.')
      }
    }
  } catch (error) {
    // 用户取消了操作
    console.log('User cancelled the operation')
  } finally {
    cancelLoading.value = false
  }
}
</script>

<style scoped>
.subscription-cancel {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1.5rem 0;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.cancel-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.current-plan-info {
  margin-bottom: 2rem;
}

.plan-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
}

.renewal-note {
  padding: 1rem;
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
  border-radius: 8px;
}

.renewal-note p {
  margin: 0;
  color: #0369a1;
  font-weight: 500;
}

.feedback-section {
  margin-bottom: 2rem;
}

.feedback-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.feedback-subtitle {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.reason-selection h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 1rem;
}

.reason-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.reason-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.reason-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.reason-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.reason-radio {
  margin-right: 0.75rem;
  accent-color: #3b82f6;
}

.reason-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
}

.other-reason {
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-buttons .el-button {
  min-width: 160px;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscription-cancel {
    padding: 1rem 0;
    align-items: flex-start;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .cancel-card {
    padding: 1.5rem;
  }
  
  .reason-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    padding-top: 1rem;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
