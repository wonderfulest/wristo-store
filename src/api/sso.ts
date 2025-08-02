import instance from '@/config/axios'

export interface SsoTokenRequestDto {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface SsoTokenResponseData {
  accessToken: string
  expiresIn: number
  refreshToken: string
  tokenType: string
  idToken: string
}

export const fetchSsoToken = (data: SsoTokenRequestDto): Promise<SsoTokenResponseData> => {
  return instance.post('/public/sso/token', data)
}
