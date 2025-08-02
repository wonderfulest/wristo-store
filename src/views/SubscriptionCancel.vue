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
            <span v-if="monthlyPrice">({{ formatPrice(monthlyPrice) }} per month)</span>
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
import { cancelSubscription } from '@/api/subscription'

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

const monthlyPrice = computed(() => {
  // 这里可以根据订阅计划代码返回相应的价格
  const planCode = userStore.userInfo?.subscription?.planCode
  switch (planCode) {
    case 'monthly':
      return 15
    case 'yearly':
      return 12 // 年付按月计算
    default:
      return null
  }
})

// 格式化价格
const formatPrice = (price: number): string => {
  return `$${price}`
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
        await cancelSubscription()
        
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
        router.push('/subscription-management')
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
  padding: 2rem 0;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.cancel-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.current-plan-info {
  margin-bottom: 3rem;
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
  margin-bottom: 3rem;
}

.feedback-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.feedback-subtitle {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.reason-selection h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 1.5rem;
}

.reason-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reason-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
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
  padding-top: 2rem;
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
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .cancel-card {
    padding: 1.5rem;
  }
  
  .reason-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
