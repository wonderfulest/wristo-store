import { defineStore } from 'pinia'
import { logout as logoutApi, updateUserInfo as updateUserInfoApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import { type UserInfo, type Subscription } from '@/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as UserInfo | null
  }),
  actions: {
    async logout() {
      try {
        await logoutApi()
      } catch (e) {
        // 可选：错误处理
        console.error('logout error', e)
      }
      this.token = ''
      this.userInfo = null
      // 路由跳转请在组件中处理
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    setSubscriptionInfo(subscription: Subscription | undefined) {
      if (this.userInfo) {
        this.userInfo.subscription = subscription
      }
    },
    async getUserInfo() {
      try {
        const userInfo = await getUserInfoApi()
        this.userInfo = userInfo
        return userInfo
      } catch (e) {
        console.error('获取用户信息失败', e)
        return null
      }
    },
    async updateUserInfo(payload: { username: string, nickname: string, avatar: string }) {
      const res: boolean = await updateUserInfoApi(payload)
      // 更新成功后重新获取用户信息
      await this.getUserInfo()
      return res
    }
  },
  persist: {
    key: 'wristo-user',
    storage: localStorage
  }
})
