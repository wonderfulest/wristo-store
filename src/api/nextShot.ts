import api from '@/config/axios'
export interface ShotConfig { revision: number; unit: 'yd' | 'm'; distances: number[]; mode: 'fixed' | 'random' | 'weak' | 'benchmark'; minutes: number; balls: number; tolerance: number }
export interface ShotSession { id: string; startedAt: number; endedAt: number; config: ShotConfig; shots: [number, number][]; completed: boolean }
export interface ShotInstallation { installationId: string; bound: boolean; config: ShotConfig }
export interface ShotHistory { cursor: number; session: ShotSession }
const base = '/user/next-shot/v1/installations'
export const getShotInstallations = (): Promise<ShotInstallation[]> => api.get(base)
export const saveShotConfig = (id: string, config: ShotConfig): Promise<ShotInstallation> => api.put(`${base}/${encodeURIComponent(id)}/config`, config)
export const getShotHistory = (id: string, before = 0): Promise<ShotHistory[]> => api.get(`${base}/${encodeURIComponent(id)}/sessions`, { params: { before } })
