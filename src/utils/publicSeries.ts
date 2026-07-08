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

export const PUBLIC_SERIES_DEFINITIONS: PublicSeriesDefinition[] = [
  {
    slug: 'whole',
    name: 'All Watch Faces',
    sort: 1000,
    aliases: ['whole', 'all-watch-faces'],
    tagline: 'Start here when you want the full Wristo collection in one place.',
    chipLabel: 'All faces',
  },
  {
    slug: 'digital',
    name: 'Digital Utility',
    sort: 990,
    aliases: ['digital', 'data-rich', 'weather'],
    tagline: 'Best for quick reads, weather, activity stats, and daily dashboards.',
    chipLabel: 'Data-rich',
  },
  {
    slug: 'minimal',
    name: 'Minimal & Simple',
    sort: 980,
    aliases: ['minimal', 'simple', 'daily', 'strokes'],
    tagline: 'Clean everyday faces for users who want time first and clutter last.',
    chipLabel: 'Minimal',
  },
  {
    slug: 'analog',
    name: 'Analog Classic',
    sort: 970,
    aliases: ['analog'],
    tagline: 'Classic hand-based styles for a more traditional watch feel.',
    chipLabel: 'Analog',
  },
  {
    slug: 'neon',
    name: 'Neon & Cyberpunk',
    sort: 960,
    aliases: ['neon', 'cyberpunk', 'halo'],
    tagline: 'High-contrast looks that stand out on dark screens and night runs.',
    chipLabel: 'AMOLED',
  },
  {
    slug: 'nature',
    name: 'Nature & Landscape',
    sort: 950,
    aliases: ['nature', 'landscape', 'mountain'],
    tagline: 'Outdoor-inspired faces for hiking, travel, and calmer daily wear.',
    chipLabel: 'Outdoor',
  },
  {
    slug: 'cartoon',
    name: 'Animals & Cartoon',
    sort: 940,
    aliases: ['cartoon', 'animal', 'animals', 'family', 'fun'],
    tagline: 'Playful character faces for families, gifts, and casual weekends.',
    chipLabel: 'Cute',
  },
  {
    slug: 'flower',
    name: 'Floral & Mandala',
    sort: 930,
    aliases: ['flower', 'floral', 'mandala', 'dots'],
    tagline: 'Decorative floral patterns for softer, more personal wrist styling.',
    chipLabel: 'Floral',
  },
  {
    slug: 'galaxy',
    name: 'Galaxy & Fantasy',
    sort: 920,
    aliases: ['galaxy', 'fantasy'],
    tagline: 'Space and fantasy visuals when you want the watch face to feel vivid.',
    chipLabel: 'Fantasy',
  },
  {
    slug: 'pop-retro',
    name: 'Pop & Retro',
    sort: 910,
    aliases: ['pop-retro', 'pop-pulse', 'retro', 'skull'],
    tagline: 'Bold nostalgic styles for louder colors and statement looks.',
    chipLabel: 'Retro',
  },
  {
    slug: 'seasonal',
    name: 'Seasonal',
    sort: 900,
    aliases: ['seasonal', 'seasonal-themes', 'christmas'],
    tagline: 'Holiday and campaign faces for time-limited moods and events.',
    chipLabel: 'Seasonal',
    seasonal: true,
  },
]

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
