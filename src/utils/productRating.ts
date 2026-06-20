const FALLBACK_RATING_BASE = 2.8
const FALLBACK_RATING_RANGE = 0.8
const DISPLAY_RATING_BONUS = 1
const MAX_DISPLAY_RATING = 5

const clampScore = (value: number) => Math.max(0, Math.min(1, value))
const applyDisplayRatingBonus = (value: number) => {
  if (!Number.isFinite(value)) return null
  return Math.min(MAX_DISPLAY_RATING, value + DISPLAY_RATING_BONUS)
}

export const scoreToDisplayRating = (score?: number | null) => {
  if (score == null) return null
  const numericScore = Number(score)
  if (!Number.isFinite(numericScore)) return null
  const normalizedScore = clampScore(numericScore)
  return applyDisplayRatingBonus(FALLBACK_RATING_BASE + normalizedScore * FALLBACK_RATING_RANGE)
}

export const resolveProductDisplayRating = (
  averageRating?: number | null,
  score?: number | null,
) => {
  if (averageRating != null) return applyDisplayRatingBonus(Number(averageRating))
  return scoreToDisplayRating(score)
}
