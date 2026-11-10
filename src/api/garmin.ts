import request from '@/config/axios'

export interface GarminStatus {
  connected: boolean
  garminUserId: string | null
  revocationPending: boolean
  permissions: string[]
  connectedAt: string | null
  activities: number
  health: number
}
export type GarminSummary = Record<string, unknown>
export const getGarminStatus = () => request.get<never, GarminStatus>('/garmin/connection')
export const disconnectGarmin = () => request.delete<never, boolean>('/garmin/connection')
export const getGarminSummaries = (type: string, limit: number) =>
  request.get<never, GarminSummary[]>('/garmin/summaries', { params: { type, limit } })

export const garminDataTypes = [
  ['activities', '运动记录'], ['dailies', '每日健康'], ['sleeps', '睡眠'],
  ['stressDetails', '压力'], ['userMetrics', '用户指标'], ['hrv', '心率变异性'],
  ['pulseox', '血氧'], ['bodyComps', '身体成分'], ['epochs', '分时健康'],
  ['allDayRespiration', '全天呼吸'], ['healthSnapshot', '健康快照'],
  ['bloodPressures', '血压'], ['skinTemp', '皮肤温度'], ['nutrition', '营养'],
  ['hydration', '饮水'], ['breathingVariations', '呼吸变化'],
  ['activityDetails', '运动详情'], ['manuallyUpdatedActivities', '手动更新运动'],
  ['moveIQActivities', 'Move IQ 运动'],
] as const
