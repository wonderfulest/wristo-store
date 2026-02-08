import request from '@/config/axios'

export interface UserBindDeviceDTO {
  /** 设备唯一ID，用于绑定到用户画像 */
  deviceId: string
}

/**
 * 绑定当前登录用户的设备（更新到 user_profile.watchModel 上）
 */
export const bindDevice = (data: UserBindDeviceDTO) => {
  return request.post<boolean>('/users/bind-device', data)
}
