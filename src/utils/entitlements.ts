import type { UserInfo } from '@/types'

export const hasActiveBundle = (userInfo?: UserInfo | null) => {
  return Number(userInfo?.userProfile?.hasBundle || 0) > 0
}
