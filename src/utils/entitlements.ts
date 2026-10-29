import type { UserInfo } from '@/types'

// Premium is resolved by the API across payment channels and historical purchases.
export const hasPremiumEntitlement = (userInfo?: UserInfo | null) =>
  userInfo?.premium?.active === true

export const hasActiveBundle = hasPremiumEntitlement
export const hasBundleStoreEntryAccess = (userInfo?: UserInfo | null) =>
  hasPremiumEntitlement(userInfo) || userInfo?.roles?.some(role =>
    role.roleCode === 'ROLE_ADMIN' || role.roleCode === 'ROLE_MERCHANT') === true
