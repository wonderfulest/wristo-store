import publicSeriesDefinitions from './publicSeriesDefinitions.json'
import type { Series } from '@/types'

export interface PublicSeriesDefinition {
  slug: string
  name: string
  sort: number
  aliases: string[]
  tagline: string
  chipLabel: string
  seasonal?: boolean
}

export type PublicSeries = Series & {
  publicTagline?: string
  publicAliasSlugs?: string[]
  publicChipLabel?: string
}

export const PUBLIC_SERIES_DEFINITIONS: PublicSeriesDefinition[] = publicSeriesDefinitions

const aliasToDefinition = new Map<string, PublicSeriesDefinition>()
PUBLIC_SERIES_DEFINITIONS.forEach((definition) => {
  definition.aliases.forEach((alias) => aliasToDefinition.set(alias, definition))
})

const normalizeSlug = (value?: string | null) => (value || '').trim().toLowerCase()

const hasUsefulSeriesImage = (series?: Series | null) => Boolean(series?.image || series?.hero?.url || series?.banner?.url)

const getSeriesImage = (series?: Series | null) => {
  return series?.image ?? series?.hero?.url ?? series?.banner?.url ?? null
}

const isCanonicalSeries = (series: Series, definition: PublicSeriesDefinition) => {
  return normalizeSlug(series.slug) === definition.slug
}

const pickRepresentative = (current: Series | null, candidate: Series) => {
  if (!current) return candidate
  const currentIsCanonical = normalizeSlug(current.slug) === normalizeSlug(aliasToDefinition.get(normalizeSlug(current.slug))?.slug)
  const candidateIsCanonical = normalizeSlug(candidate.slug) === normalizeSlug(aliasToDefinition.get(normalizeSlug(candidate.slug))?.slug)
  if (candidateIsCanonical && !currentIsCanonical) return candidate
  if (hasUsefulSeriesImage(candidate) && !hasUsefulSeriesImage(current)) return candidate
  if (Number(candidate.appCount || 0) > Number(current.appCount || 0)) return candidate
  return current
}

export const toPublicSeriesList = (list: Series[], options: { limit?: number; includeSeasonal?: boolean } = {}) => {
  const includeSeasonal = options.includeSeasonal ?? false
  const grouped = new Map<string, { definition: PublicSeriesDefinition; items: Series[]; representative: Series | null }>()

  for (const series of list || []) {
    if (Number(series.isActive ?? 1) !== 1) continue
    const definition = aliasToDefinition.get(normalizeSlug(series.slug))
    if (!definition) continue
    if (definition.seasonal && !includeSeasonal) continue
    const bucket = grouped.get(definition.slug) || { definition, items: [], representative: null }
    bucket.items.push(series)
    bucket.representative = pickRepresentative(bucket.representative, series)
    grouped.set(definition.slug, bucket)
  }

  const normalized = [...grouped.values()].flatMap(({ definition, items, representative }) => {
    const canonical = items.find((item) => isCanonicalSeries(item, definition))
    if (!canonical) return []

    const appCount = items.reduce((sum, item) => {
      const count = Number(item.appCount ?? 0)
      return sum + (Number.isFinite(count) ? count : 0)
    }, 0)

    return [{
      ...canonical,
      name: definition.name,
      slug: canonical.slug,
      sort: definition.sort,
      image: getSeriesImage(canonical) ?? getSeriesImage(representative),
      representativeProduct: canonical.representativeProduct ?? representative?.representativeProduct ?? null,
      appCount: canonical.appCount ?? (appCount > 0 ? appCount : canonical.appCount),
      publicTagline: definition.tagline,
      publicAliasSlugs: definition.aliases,
      publicChipLabel: definition.chipLabel,
    } as PublicSeries]
  })

  const sorted = normalized.sort((a, b) => Number(b.sort || 0) - Number(a.sort || 0))
  return typeof options.limit === 'number' ? sorted.slice(0, options.limit) : sorted
}
