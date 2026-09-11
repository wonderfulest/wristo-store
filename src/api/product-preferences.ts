import instance from '@/config/axios'
import type { Preference } from '@/components/discovery/preferences'

export interface ProductPreference {
  appId: number
  preference: Preference | null
}

export const getProductPreferences = (): Promise<ProductPreference[]> =>
  instance.get('/products/discovery/preferences')

export const setProductPreference = (appId: number, preference: Preference | null): Promise<void> =>
  instance.post('/products/discovery/preferences', [{ appId, preference }])
