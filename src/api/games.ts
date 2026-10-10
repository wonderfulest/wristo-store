import api from '@/config/axios'
import { useUserStore } from '@/store/user'

export interface Game {
  key: string; name: string; nameZh: string; description: string; descriptionZh: string; summary: string; summaryZh: string
  instructions: string; instructionsZh: string; coverUrl?: string; downloadUrl?: string
  enabled: boolean; sortOrder: number; modes: string[]; metric: string; rulesVersion: number
}
export interface GameBoard {
  gameKey: string; mode: string; rulesVersion: number; metric: string; participants: number
  entries: { rank: number; player: string; score: number; me: boolean }[]; myRank: number | null; myScore: number | null; cacheSeconds: number
}
export const getGames = (): Promise<Game[]> => api.get('/public/games')
export const getGame = (key: string): Promise<Game> => api.get(`/public/games/${encodeURIComponent(key)}`)
export async function getGameBoard(key: string, mode: string, _refresh = false): Promise<GameBoard> {
  const scope = useUserStore().userInfo ? 'user' : 'public'
  return api.get(`/${scope}/games/${encodeURIComponent(key)}/leaderboard`, { params: { mode, limit: 100 } })
}
export const linkGame = (code: string): Promise<{ bound: boolean; nickname: string }> =>
  api.post('/user/games/binding', { code })
