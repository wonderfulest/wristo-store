import instance from '@/config/axios'
import type { UserInfo } from '@/types'

export const logout = async () : Promise<string> => {
  return instance.post('/public/auth/logout')
}

export const getUserInfo = () : Promise<UserInfo> => {
  return instance.get('/users/info?populate=*')
}

export const updateUserInfo = (data: { username: string, nickname: string, avatar: string }): Promise<boolean> => {
  return instance.post('/users/update/my-info', data)
}
