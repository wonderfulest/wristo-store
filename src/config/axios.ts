import axios from 'axios'
import { ElMessage } from 'element-plus'
import { BizErrorCode } from '@/constant/errorCode'

export const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'api_IcWhAKwlu6ghDfo1yuCWhFJo0ERCCK0u'


const instance = axios.create({
  baseURL: '/api', // 走 vite 代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  }
})

// 请求拦截器
instance.interceptors.request.use(config => {
  return config
})

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 统一处理 code
    if (response.data.code == BizErrorCode.SUCCESS) {
      return response.data
    }
    if (response.data.code == BizErrorCode.SYSTEM_ERROR) { // 系统未知异常，进行弹框提示；其他业务异常，直接返回 data，在业务中处理
      ElMessage.error(response.data.message || '请求失败')
      // 直接 reject，业务代码不用再判断 code
      return Promise.reject(response.data)
    }
    // code === 0，直接返回 data
    return response.data
  },
  error => {
    ElMessage.error('网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default instance
