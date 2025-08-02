import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SubscriptionPlan } from '@/api/subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
  // 当前选中的订阅计划
  const selectedPlan = ref<SubscriptionPlan | null>(null)
  
  // 设置选中的计划
  const setSelectedPlan = (plan: SubscriptionPlan | null) => {
    selectedPlan.value = plan
  }
  
  // 清除选中的计划
  const clearSelectedPlan = () => {
    selectedPlan.value = null
  }
  
  // 获取当前选中的计划
  const getSelectedPlan = () => {
    return selectedPlan.value
  }
  
  return {
    selectedPlan,
    setSelectedPlan,
    clearSelectedPlan,
    getSelectedPlan
  }
})
