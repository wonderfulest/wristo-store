import { buildFaqGuidePath, DEFAULT_FAQ_GUIDE_LANG, getFaqGuidePosts } from '@/content/faq-guides'
import { normalizeLocale, type SupportedLocale } from '@/store/locale'

export type FaqAgentSourceType = 'guide'

export interface FaqAgentResult {
  id: string
  type: FaqAgentSourceType
  title: string
  answer: string
  category?: string
  url?: string
  score: number
}

interface FaqAgentDocument {
  id: string
  type: FaqAgentSourceType
  locale: string
  fallbackLocale?: string
  title: string
  answer: string
  category?: string
  url?: string
  titleText: string
  summaryText: string
  bodyText: string
  searchableText: string
}

const MIN_QUERY_LENGTH = 2
const MIN_SCORE = 7
const MAX_RESULTS = 3

let cachedDocuments: FaqAgentDocument[] | null = null

export function searchFaqAgent(query: string, locale: SupportedLocale | string): FaqAgentResult[] {
  const normalizedQuery = normalizeText(query)
  if (normalizedQuery.length < MIN_QUERY_LENGTH) return []

  const activeLocale = normalizeLocale(locale)
  const queryTokens = tokenize(normalizedQuery)
  if (!queryTokens.length) return []

  return getDocuments()
    .map((document) => ({
      document,
      score: scoreDocument(document, normalizedQuery, queryTokens, activeLocale),
    }))
    .filter((item) => item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ document, score }) => ({
      id: document.id,
      type: document.type,
      title: document.title,
      answer: buildAnswerSnippet(document.answer || document.summaryText || document.bodyText),
      category: document.category,
      url: document.url,
      score,
    }))
}

function getDocuments(): FaqAgentDocument[] {
  if (cachedDocuments) return cachedDocuments

  cachedDocuments = [
    ...buildGuideDocuments(),
  ]

  return cachedDocuments
}

function buildGuideDocuments(): FaqAgentDocument[] {
  return getFaqGuidePosts().flatMap((post) =>
    (post.translations || [])
      .filter((translation) => translation.lang && translation.slug && translation.contentHtml)
      .map((translation) => {
        const title = stripHtml(translation.title || post.title || '')
        const summary = stripHtml(translation.summary || post.summary || '')
        const body = stripHtml(translation.contentHtml || '')
        const locale = translation.lang || DEFAULT_FAQ_GUIDE_LANG
        return {
          id: `guide:${locale}:${translation.slug}`,
          type: 'guide',
          locale,
          fallbackLocale: DEFAULT_FAQ_GUIDE_LANG,
          title,
          answer: summary || body,
          category: post.category?.name || undefined,
          url: buildFaqGuidePath(locale, translation.slug),
          titleText: normalizeText(title),
          summaryText: normalizeText(summary),
          bodyText: normalizeText(body),
          searchableText: normalizeText(`${title} ${summary} ${body}`),
        }
      }),
  )
}

function scoreDocument(
  document: FaqAgentDocument,
  normalizedQuery: string,
  queryTokens: string[],
  activeLocale: SupportedLocale,
): number {
  let score = 0

  if (document.locale === activeLocale) score += 10
  else if (document.locale === DEFAULT_FAQ_GUIDE_LANG) score += 4
  else score -= 6

  if (document.titleText.includes(normalizedQuery)) score += 30
  if (document.summaryText.includes(normalizedQuery)) score += 18
  if (document.bodyText.includes(normalizedQuery)) score += 10

  for (const token of queryTokens) {
    if (document.titleText.includes(token)) score += 9
    if (document.summaryText.includes(token)) score += 5
    if (document.bodyText.includes(token)) score += 2
  }

  return score
}

function buildAnswerSnippet(value: string): string {
  const text = stripHtml(value)
  if (text.length <= 320) return text
  return `${text.slice(0, 317).trim()}...`
}

function stripHtml(value: string | null | undefined): string {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|table|section|article)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeText(value: string | null | undefined): string {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string): string[] {
  return Array.from(new Set(
    value
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= MIN_QUERY_LENGTH),
  ))
}
