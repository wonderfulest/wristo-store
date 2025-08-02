export interface UserSubscription {
  name: string
  planCode: string
  partNumber: string | null
  startTime: string
  endTime: string
  isGift: boolean
}

export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string
  phone: string | null
  avatar: string | null
  status: string | null
  createdAt: string
  updatedAt: string
  lastLoginTime: string | null
  lastLoginIp: string | null
  isDeleted: string
  subscription?: UserSubscription
  activatedApps?: number[]
  roles?: Array<{id: number, roleName: string, roleCode: string, description: string, status: number}>
}

export interface UserBaseVO {
  id: number
  username: string
  nickname: string
  avatar: string
} 