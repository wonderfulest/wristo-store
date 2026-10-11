import api from '@/config/axios'
export type UtilityKey = 'last-time' | 'quick-counter' | 'ready-to-go' | 'qr-pocket'
export interface UtilityItem {
  itemId: string
  label: string
  lastAt?: number
  count?: number
  listId?: string
  checked?: boolean
}
export interface UtilityState {
  installationId: string
  appKey: UtilityKey
  revision: number
  bound: boolean
  items: UtilityItem[]
}
export interface UtilityBinding { bound: boolean; installationId: string }
const base = '/user/utilities/v1'
export const getUtilityInstallations = (): Promise<UtilityState[]> => api.get(`${base}/installations`)
export const getUtilityInstallation = (id: string): Promise<UtilityState> => api.get(`${base}/installations/${encodeURIComponent(id)}`)
export const bindUtility = (code: string): Promise<UtilityBinding> => api.post(`${base}/binding`, { code })
export const saveUtilityLabels = (id: string, revision: number, labels: { itemId: string; label: string }[]): Promise<UtilityState> =>
  api.put(`${base}/installations/${encodeURIComponent(id)}/config`, { revision, labels })

export interface QrItem { itemId: string; label: string; content: string; modules?: string[] }
export interface QrState { revision: number; items: QrItem[] }
export const getQrCodes = (): Promise<QrState> => api.get(`${base}/qr-codes`)
export const saveQrCodes = (state: QrState): Promise<QrState> => api.put(`${base}/qr-codes`, state)
export const previewQrCode = (content: string): Promise<{ modules: string[] }> => api.post(`${base}/qr-codes/preview`, { content })

export interface UtilityProduct {
  appKey: UtilityKey; name: string; nameZh: string; summary: string; summaryZh: string
  description: string; descriptionZh: string; instructions: string; instructionsZh: string
  logoUrl: string; coverUrl: string; heroUrl: string; shareUrls: string[]; downloadUrl: string
}
export const getUtilityCatalog = (): Promise<UtilityProduct[]> => api.get('/public/utilities/v1/catalog')
