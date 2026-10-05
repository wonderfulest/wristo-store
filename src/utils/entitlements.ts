import type { UserInfo } from '@/types'

export const hasActiveBundle = (userInfo?: UserInfo | null) => {
  return Number(userInfo?.userProfile?.hasBundle || 0) > 0
}

export const hasBundleStoreEntryAccess = (userInfo?: UserInfo | null) => {
  return hasActiveBundle(userInfo)
}

export const hasActiveSubscription = (
  userInfo?: UserInfo | null,
  now: Date = new Date(),
) => {
  const subscription = userInfo?.subscription
  const endTime = subscription?.endTime
  // The API returns the current membership; an explicit null expiry denotes lifetime.
  if (endTime === null && subscription?.planCode) return true
  if (!endTime) return false

  const expiresAt = new Date(endTime)
  return !Number.isNaN(expiresAt.getTime()) && expiresAt > now
}

export const hasPremiumEntitlement = (
  userInfo?: UserInfo | null,
  now: Date = new Date(),
) => {
  return hasActiveBundle(userInfo) || hasActiveSubscription(userInfo, now)
}
