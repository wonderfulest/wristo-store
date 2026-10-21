import api from '@/config/axios'
export const lifeKeys = ['habit-tracker', 'quick-log', 'next-up', 'battery-diary', 'quiet-beat', 'park-pin'] as const
export type LifeKey = typeof lifeKeys[number]
export const isLifeKey = (key: string): key is LifeKey => (lifeKeys as readonly string[]).includes(key)
export interface Appointment { id: string; title: string; startAt: number; endAt: number }
export interface LifeValues {
 label?: string; startAt?: number; milestoneDays?: number; unit?: string; portion?: number; goal?: number
 events?: Appointment[]; note?: string; bpm?: number; minutes?: number; presets?: number[]; section?: string
}
export interface LifeConfig { revision: number; values: LifeValues }
export interface LifeHistory { cursor: number; event: { id: string; at: number; payload: Record<string, string | number> } }
export interface LifeState { installationId: string; appKey: LifeKey; bound: boolean; config: LifeConfig; history: LifeHistory[]; progress?: { completedDays: number; lastDay: number; resistedCount: number; knownEventIds: string[] } | null }
const base = (key: LifeKey) => `/user/life-tools/v1/${key}/installations`
export const getLifeInstallations = (key: LifeKey): Promise<LifeState[]> => api.get(base(key))
export const saveLifeConfig = (key: LifeKey, id: string, config: LifeConfig): Promise<LifeState> => api.put(`${base(key)}/${encodeURIComponent(id)}/config`, config)
export const getLifeHistory = (key: LifeKey, id: string, before = 0): Promise<LifeHistory[]> => api.get(`${base(key)}/${encodeURIComponent(id)}/history`, { params: { before } })
