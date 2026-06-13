import instance from '@/config/axios'

export interface GarminSimulatorLocation {
  x?: number | null
  y?: number | null
  width?: number | null
  height?: number | null
}

export interface GarminSimulatorConfig {
  display?: {
    location?: GarminSimulatorLocation | null
    shape?: string | null
  } | null
  image?: string | null
}

// 设备基础信息接口
export interface GarminDeviceBaseVO {
  id: number
  deviceId: string
  displayName: string
  imageUrl?: string | null
  devicePng?: string | null
  deviceTransparentPng?: string | null
  deviceFamily?: string | null
  resolutionWidth?: number | null
  resolutionHeight?: number | null
  simulator?: GarminSimulatorConfig | null
}

// 设备详细信息接口
export interface GarminDeviceVO extends GarminDeviceBaseVO {
  deviceId: string
  imageUrl: string | null
  devicePng: string | null
  deviceTransparentPng: string | null
  resolutionHeight: number | null
  resolutionWidth: number | null
  description?: string
  specifications?: string
  features?: string[]
  releaseDate?: string
  discontinued?: boolean
  partNumber: string | null
  deviceGroup: string | null
  deviceVersion: string | null
  displayType: string | null
  enhancedGraphicSupport: boolean | null
  hardwarePartNumber: string | null
  bitsPerPixel: number | null
  screenRotationSupport: boolean | null
  createdAt: string | null
  simulator?: GarminSimulatorConfig | null
  compiler?: any
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
  return instance.get(`/public/products/garmin-devices/get/${id}?populate=simulator`)
}

/**
 * 根据 Garmin deviceId 获取设备详情，包含模拟器显示区域与透明设备外框
 */
export const getDeviceDetailByDeviceId = (deviceId: string): Promise<GarminDeviceVO> => {
  return instance.get(`/public/products/garmin-devices/getByDeviceId/${encodeURIComponent(deviceId)}?populate=*`)
}
