import instance from '@/config/axios'
export interface CustomPlan { code: 'PACKAGE' | 'STORE'; priceCents: number; currency: string; available: boolean }
export interface CustomOrder {
  id: string; planCode: 'PACKAGE' | 'STORE'; priceCents: number; currency: string; email: string;
  deviceModel: string; requirements: string; assetName: string; previewName: string | null;
  transactionId: string | null; paymentStatus: string; workStatus: string; createdAt: string;
}
export const getCustomPlans = (): Promise<CustomPlan[]> => instance.get('/public/custom-watchface/plans')
export const getCustomOrders = (): Promise<CustomOrder[]> => instance.get('/user/custom-watchface-orders')
export const createCustomOrder = (form: FormData): Promise<CustomOrder> => instance.post('/user/custom-watchface-orders', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 180000 })
export const checkoutCustomOrder = (id: string): Promise<CustomOrder> => instance.post(`/user/custom-watchface-orders/${id}/checkout`)
export const syncCustomOrder = (id: string): Promise<CustomOrder> => instance.post(`/user/custom-watchface-orders/${id}/sync`)
