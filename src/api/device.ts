import instance from '@/config/axios'

// 设备基础信息接口
export interface GarminDeviceBaseVO {
  id: number
  deviceId: number
  displayName: string
  imageUrl?: string
  deviceFamily?: string
}

// 设备详细信息接口
export interface GarminDeviceVO extends GarminDeviceBaseVO {
  description?: string
  specifications?: string
  features?: string[]
  releaseDate?: string
  discontinued?: boolean
}

/**
 * 获取设备列表
 */
export const getDeviceList = (): Promise<GarminDeviceBaseVO[]> => {
  return instance.get('/public/products/garmin-devices/list')
}

/**
 * 获取设备详情
 */
export const getDeviceDetail = (id: number): Promise<GarminDeviceVO> => {
  return instance.get(`/public/products/garmin-devices/get/${id}`)
}
