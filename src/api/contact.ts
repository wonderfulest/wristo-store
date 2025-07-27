import instance from '@/config/axios'
import type { ApiResponse } from '@/types'
import type { MessageCreateDTO } from '@/types/contact'


export const joinNewsletter = (email: string): Promise<ApiResponse<any>> => {
  return instance.get('/public/newsletter/subscribe', { params: { email } })
}

export const unsubscribeNewsletter = (email: string): Promise<ApiResponse<any>> => {
  return instance.get('/public/newsletter/unsubscribe', { params: { email } })
}

export const sendContactMessage = (data: MessageCreateDTO): Promise<ApiResponse<any>> => {
  return instance.post('/public/contact-us/send-message', data)
}