import instance from '@/config/axios'
import type { Response } from '@/types'

export const joinNewsletter = (email: string): Promise<Response<any>> => {
  return instance.get('/public/newsletter/subscribe', { params: { email } })
}

export const unsubscribeNewsletter = (email: string): Promise<Response<any>> => {
  return instance.get('/public/newsletter/unsubscribe', { params: { email } })
}