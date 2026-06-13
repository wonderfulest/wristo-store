import { faqGuidePosts, faqGuideTocTree } from './faq-guides.generated'
import type { BlogPostTocItemVO, BlogPostTranslationVO, BlogPostVO } from '@/types'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from '@/store/locale'

export const DEFAULT_FAQ_GUIDE_LANG = 'en'
const hiddenFaqGuideSectionTitles = new Set(['Design & Tutorials', 'Watchface Picks', 'Updates'])
const hiddenFaqGuidePostIds = collectHiddenFaqGuidePostIds(faqGuideTocTree)
const localePattern = SUPPORTED_LOCALES.join('|')
const faqPathPattern = new RegExp(`^/(?:(${localePattern})/)?faq(?:/([^/?#]+))?/?$`)
const localizedFaqPathPattern = new RegExp(`^/(${localePattern})/faq(?:/|$)`)

export const supportedFaqGuideLangs = Array.from(
  new Set(
    faqGuidePosts.flatMap((post) =>
      (post.translations || [])
        .map((translation) => translation.lang)
        .filter((lang): lang is string => !!lang),
    ),
  ),
).sort()

export function getFaqGuidePostBySlug(slug: string, lang?: string): BlogPostVO {
  const post = findPostBySlug(slug, lang)
  if (!post) throw new Error('FAQ guide not found')
  return localizePostRoutes(post)
}

export function getFaqGuidePostByLangSlug(lang: string, slug: string): BlogPostVO {
  return getFaqGuidePostBySlug(slug, lang)
}

export function getDefaultFaqGuidePost(lang?: string): BlogPostVO | null {
  const firstPost = findFirstPostInTree(faqGuideTocTree, lang) || getDisplayablePosts()[0] || null
  return firstPost ? localizePostRoutes(firstPost) : null
}

export function getDefaultFaqGuidePathForLocale(targetLang: string): string {
  const lang = normalizeLocale(targetLang)
  const post = getDefaultFaqGuidePost(DEFAULT_FAQ_GUIDE_LANG)
  const fallbackTranslation =
    post?.translations?.find((translation) => translation.lang === DEFAULT_FAQ_GUIDE_LANG && translation.slug) ||
    post?.translations?.find((translation) => translation.slug)
  return buildFaqGuidePath(lang, fallbackTranslation?.slug)
}

export function getFaqGuideTocTree(lang?: string): BlogPostTocItemVO[] {
  return localizeTree(faqGuideTocTree, lang)
}

export function getFaqGuideRoutes(): string[] {
  const routes = new Set<string>(['/faq'])
  for (const post of getDisplayablePosts()) {
    for (const translation of post.translations || []) {
      if (translation.lang && translation.slug) routes.add(buildFaqGuidePath(translation.lang, translation.slug))
    }
  }
  return [...routes]
}

export function getFaqGuidePosts(): BlogPostVO[] {
  return getDisplayablePosts().map((post) => localizePostRoutes(post))
}

export function buildFaqGuidePath(lang: string | undefined, slug: string | undefined): string {
  if (lang && slug) return `/${encodeURIComponent(lang)}/faq/${encodeURIComponent(slug)}`
  if (slug) return `/faq/${encodeURIComponent(slug)}`
  return lang ? `/${encodeURIComponent(lang)}/faq` : '/faq'
}

export function getFaqGuidePathForLocale(path: string, targetLang: string): string {
  const lang = normalizeLocale(targetLang)
  const match = path.match(faqPathPattern)
  if (!match) return path

  const currentLang = match[1]
  const slug = match[2] ? decodeURIComponent(match[2]) : undefined
  if (!slug) return buildFaqGuidePath(lang, undefined)

  const post = findPostBySlug(slug, currentLang || undefined)
  const targetTranslation = post?.translations?.find((translation) => translation.lang === lang && translation.slug)
  if (targetTranslation?.slug) {
    return buildFaqGuidePath(lang, targetTranslation.slug)
  }

  const defaultTranslation = post?.translations?.find(
    (translation) => translation.lang === DEFAULT_FAQ_GUIDE_LANG && translation.slug,
  )
  if (defaultTranslation?.slug) {
    return buildFaqGuidePath(lang, defaultTranslation.slug)
  }

  return buildFaqGuidePath(lang, undefined)
}

export function getPreferredFaqGuidePath(path: string, preferredLang: string): string {
  const lang = normalizeLocale(preferredLang)
  if (lang === DEFAULT_LOCALE || path.match(localizedFaqPathPattern)) return path
  return getFaqGuidePathForLocale(path, lang)
}

export function blogUrlToFaqUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  const match = url.match(/^\/([^/]+)\/blog\/([^/?#]+)/)
  if (match) return buildFaqGuidePath(match[1], match[2])
  const defaultMatch = url.match(/^\/blog\/([^/?#]+)/)
  if (defaultMatch) return buildFaqGuidePath(undefined, defaultMatch[1])
  return url.replace('/blog', '/faq')
}

function findPostBySlug(slug: string, lang?: string): BlogPostVO | null {
  let fallbackPost: BlogPostVO | null = null
  for (const post of getDisplayablePosts()) {
    const translations = post.translations || []
    if (lang && translations.some((translation) => translation.lang === lang && translation.slug === slug)) return post
    if (lang && translations.some((translation) => translation.lang === DEFAULT_FAQ_GUIDE_LANG && translation.slug === slug)) {
      fallbackPost = post
    }
    if (!lang && (post.slug === slug || translations.some((translation) => translation.slug === slug))) return post
  }
  return fallbackPost
}

function getDisplayablePosts(): BlogPostVO[] {
  return faqGuidePosts.filter(
    (post) =>
      !hiddenFaqGuidePostIds.has(post.id) &&
      post.translations?.some((translation) => translation.slug && translation.contentHtml),
  )
}

function localizeTree(nodes: BlogPostTocItemVO[], lang?: string): BlogPostTocItemVO[] {
  return nodes.flatMap((node) => {
    if (hiddenFaqGuideSectionTitles.has(node.title) || (node.post?.id && hiddenFaqGuidePostIds.has(node.post.id))) {
      return []
    }

    const post = node.post ? localizePostRoutes(node.post) : null
    const localizedPost = post ? selectPostTranslation(post, lang) : null
    return [{
      ...node,
      title: localizedPost?.title || node.title,
      linkUrl: node.linkUrl ? blogUrlToFaqUrl(node.linkUrl) || node.linkUrl : node.linkUrl,
      post,
      children: localizeTree(node.children || [], lang),
    }]
  })
}

function collectHiddenFaqGuidePostIds(nodes: BlogPostTocItemVO[]): Set<number> {
  const ids = new Set<number>()

  const visit = (node: BlogPostTocItemVO, hidden: boolean) => {
    const isHidden = hidden || hiddenFaqGuideSectionTitles.has(node.title)
    if (isHidden && node.post?.id) ids.add(node.post.id)
    for (const child of node.children || []) visit(child, isHidden)
  }

  for (const node of nodes) visit(node, false)
  return ids
}

function localizePostRoutes(post: BlogPostVO): BlogPostVO {
  return {
    ...post,
    url: blogUrlToFaqUrl(post.url),
    translations: (post.translations || []).map((translation) => ({
      ...translation,
      url: buildFaqGuidePath(translation.lang, translation.slug),
    })),
  }
}

function selectPostTranslation(post: BlogPostVO, lang?: string): BlogPostTranslationVO | null {
  if (!post.translations?.length) return null
  return (
    post.translations.find((translation) => lang && translation.lang === lang) ||
    post.translations.find((translation) => translation.lang === DEFAULT_FAQ_GUIDE_LANG) ||
    post.translations[0]
  )
}

function findFirstPostInTree(nodes: BlogPostTocItemVO[], lang?: string): BlogPostVO | null {
  for (const node of nodes) {
    if (node.post && selectPostTranslation(node.post, lang)) return node.post
    const childPost = findFirstPostInTree(node.children || [], lang)
    if (childPost) return childPost
  }
  return null
}
