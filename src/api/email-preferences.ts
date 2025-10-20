import instance from '@/config/axios'

// VO returned by backend
export interface EmailPreferencesVO {
  id?: number
  email: string
  systemNotifications?: number
  purchaseReceipts?: number
  licenseUpdates?: number
  weeklyNewsletter?: number
  exclusivePromotions?: number
  bundleOffers?: number
  creatorSpotlight?: number
  personalizedRecommendations?: number
  designUpdates?: number
  platformAnnouncements?: number
  surveysFeedback?: number
  isUnsubscribed?: number
  lastUpdatedBy?: string
}

// Update DTO (accepting booleans in UI; convert to 0/1 before sending)
export interface EmailPreferencesUpdateDTO {
  id?: number
  email?: string
  systemNotifications?: number
  purchaseReceipts?: number
  licenseUpdates?: number
  weeklyNewsletter?: number
  exclusivePromotions?: number
  bundleOffers?: number
  creatorSpotlight?: number
  personalizedRecommendations?: number
  designUpdates?: number
  platformAnnouncements?: number
  surveysFeedback?: number
  isUnsubscribed?: number
  lastUpdatedBy?: string
}

export const getPreferences = (email: string): Promise<EmailPreferencesVO> => {
  return instance.get('/public/email-preferences/get', { params: { email } })
}

export const setPreferences = (dto: EmailPreferencesUpdateDTO): Promise<EmailPreferencesVO> => {
  return instance.post('/public/email-preferences/set', dto)
}

export const subscribeAll = (email: string, updatedBy?: string): Promise<EmailPreferencesVO> => {
  return instance.post('/public/email-preferences/subscribe-all', null, { params: { email, updatedBy } })
}

export const unsubscribeAll = (email: string, updatedBy?: string): Promise<EmailPreferencesVO> => {
  return instance.post('/public/email-preferences/unsubscribe-all', null, { params: { email, updatedBy } })
}
