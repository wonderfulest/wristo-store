import type { ShotConfig, ShotSession } from '../api/nextShot'
export function parseDistances(input: string): number[] | null {
  const parts = input.split(/[,，]/).map(s => s.trim())
  if (parts.length < 1 || parts.length > 6 || parts.some(s => !/^\d+$/.test(s))) return null
  const distances = parts.map(Number)
  return distances.some(d => d < 10 || d > 150) || new Set(distances).size !== distances.length ? null : distances
}
export function distanceStats(sessions: ShotSession[], config: ShotConfig) {
  return config.distances.map(distance => {
    let short = 0, on = 0, long = 0
    for (const s of sessions) {
      if (s.config.unit !== config.unit || s.config.tolerance !== config.tolerance) continue
      for (const [d, result] of s.shots) if (d === distance) { if (result === 0) on++; else if (result < 0) short++; else long++ }
    }
    const total = short + on + long
    return { distance, short, on, long, total, percent: total ? Math.round(on * 100 / total) : 0, enough: total >= 10 }
  })
}
export const hits = (s: ShotSession) => s.shots.filter(pair => pair[1] === 0).length
export function benchmarkComparison(current: ShotSession, sessions: ShotSession[]) {
  if (current.config.mode !== 'benchmark' || !current.completed || !current.shots.length) return null
  const c = current.config
  const previous = sessions.filter(s => s.id !== current.id && s.startedAt < current.startedAt && s.completed && s.config.mode === 'benchmark' && s.config.unit === c.unit && s.config.tolerance === c.tolerance && s.config.balls === c.balls && JSON.stringify(s.config.distances) === JSON.stringify(c.distances)).sort((a,b) => b.startedAt - a.startedAt)[0]
  if (!previous?.shots.length) return null
  return { previous, change: Math.round(hits(current) * 100 / current.shots.length - hits(previous) * 100 / previous.shots.length) }
}
