import instance from '@/config/axios'
import type { MessageCreateDTO } from '@/types/contact'
export { subscribeAll, unsubscribeAll } from '@/api/email-preferences'

export const sendContactMessage = (data: MessageCreateDTO): Promise<boolean> => {
  return instance.post('/public/contact-us/send-message', data)
}