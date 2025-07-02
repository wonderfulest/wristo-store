import { defineStore } from 'pinia'
import { logout as logoutApi, updateUserInfo as updateUserInfoApi } from '@/api/auth'
import { type UserInfo } from '@/types'

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
    async updateUserInfo(payload: { username: string, nickname: string, avatar: string }) {
      const res = await updateUserInfoApi(payload)
      if (res.code === 0 && this.userInfo) {
        this.userInfo.username = payload.username
        this.userInfo.nickname = payload.nickname
        this.userInfo.avatar = payload.avatar
      }
      return res
    }
  },
  persist: {
    key: 'wristo-user',
    storage: sessionStorage
  }
})
