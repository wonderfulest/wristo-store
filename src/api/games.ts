import api from '@/config/axios'

export interface Game {
  key: string; name: string; nameZh: string; description: string; descriptionZh: string; summary: string; summaryZh: string
  instructions: string; instructionsZh: string; coverUrl?: string; downloadUrl?: string
  enabled: boolean; sortOrder: number; modes: string[]; metric: string; rulesVersion: number
}
export interface GameBoard {
  gameKey: string; mode: string; rulesVersion: number; metric: string; participants: number
  entries: { rank: number; player: string; score: number }[]; cacheSeconds: number
}
const cache = new Map<string, { at: number; data: GameBoard }>()
export const getGames = (): Promise<Game[]> => api.get('/public/games')
export const getGame = (key: string): Promise<Game> => api.get(`/public/games/${encodeURIComponent(key)}`)
export async function getGameBoard(key: string, mode: string, refresh = false): Promise<GameBoard> {
  const id = `${key}:${mode}`
  const old = cache.get(id)
  if (!refresh && old && Date.now() - old.at < 45000) return old.data
  const data: GameBoard = await api.get(`/public/games/${encodeURIComponent(key)}/leaderboard`, { params: { mode, limit: 50 } })
  cache.set(id, { at: Date.now(), data })
  return data
}
