import instance from '@/config/axios'

export interface ActivationRecord {
  id: number
  appId: number
  productName: string | null
  imageUrl: string | null
  deviceName: string
  entitlementType: 'SINGLE' | 'BUNDLE' | 'SUBSCRIPTION'
  activatedAt: string | null
}

export function getActivations(): Promise<ActivationRecord[]> {
  return instance.get('/trials/activations')
}

export function removeActivation(id: number): Promise<boolean> {
  return instance.delete(`/trials/activations/${id}`)
}
