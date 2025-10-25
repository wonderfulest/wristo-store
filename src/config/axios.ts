import axios from 'axios'
import { ElMessage } from 'element-plus'
import { BizErrorCode } from '@/constant/errorCode'
import { useUserStore } from '@/store/user'
import type { ApiResponse } from '@/types'

const instance = axios.create({
  baseURL: '/api', // 走 vite 代理
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器
instance.interceptors.request.use(config => {
  const userStore = useUserStore()
  const token = userStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Append device param ONLY for public products APIs
  try {
    const url = config.url || ''
    const isPublicProducts = /\/public\/products(\/?|$)/.test(url)
    if (isPublicProducts) {
      const stored = localStorage.getItem('selectedDevice')
      if (stored) {
        const parsed = JSON.parse(stored)
        const deviceId = parsed?.id
        if (deviceId) {
          // Do not override explicitly provided params
          config.params = { ...(config.params || {}), device: deviceId }
        }
      }
    }
  } catch (e) {
    console.warn('读取本地设备选择失败:', e)
  }
  return config
})

const ErrorCodesWithoutMessage: number[] = [
  BizErrorCode.INVALID_PAYMENT_CODE,
  BizErrorCode.ALREADY_PAID,
]
// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const res: ApiResponse<any> = response.data
    if (res.code === BizErrorCode.SUCCESS) {
      // 当成功返回时，返回 ApiResponse.data
      return res.data
    } else {
      if (!ErrorCodesWithoutMessage.includes(res.code)) {
        ElMessage.error(res.msg || '请求失败')
      }
      // 当存在异常时，返回 ApiResponse
      return Promise.reject(res)
    }
  },
  error => {
    const reqUrl: string = error.config?.url || ''
    const isPublicApi = reqUrl.includes('/public/')
    if (error.response?.status === 403) {
      if (isPublicApi) {
        // 对公开接口不做登录重定向，仅提示错误
        const msg = error.response?.data?.msg || 'Permission denied'
        ElMessage.error(msg)
      } else {
        ElMessage.error('登录已过期，请重新登录')
        setTimeout(() => {
          const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
          const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
          window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`  
        }, 3000)
      }
    } else {
      const msg = error.response?.data?.msg || '网络错误，请稍后重试'
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  }
)


export default instance
