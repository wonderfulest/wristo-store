import instance from '@/config/axios'
import type { ApiResponse } from '@/types'

export const joinNewsletter = (email: string): Promise<ApiResponse<any>> => {
  return instance.get('/public/newsletter/subscribe', { params: { email } })
}

export const unsubscribeNewsletter = (email: string): Promise<ApiResponse<any>> => {
  return instance.get('/public/newsletter/unsubscribe', { params: { email } })
}