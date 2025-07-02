import instance from '@/config/axios'
import type { ApiResponse, UserInfo } from '@/types'

export const logout = async () : Promise<ApiResponse<string>> => {
  return instance.post('/public/auth/logout')
}

export const getUserInfo = () : Promise<ApiResponse<UserInfo>> => {
  return instance.get('/users/info')
}

export const updateUserInfo = (data: { username: string, nickname: string, avatar: string }): Promise<ApiResponse<boolean>> => {
  return instance.post('/users/update/my-info', data)
}
