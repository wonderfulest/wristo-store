import type { UserInfo } from '@/types'

export const hasActiveBundle = (userInfo?: UserInfo | null) => {
  return Number(userInfo?.userProfile?.hasBundle || 0) > 0
}

export const hasActiveSubscription = (
  userInfo?: UserInfo | null,
  now: Date = new Date(),
) => {
  const endTime = userInfo?.subscription?.endTime
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
