import { faqGuidePosts, faqGuideTocTree } from './faq-guides.generated'
import type { BlogPostTocItemVO, BlogPostTranslationVO, BlogPostVO } from '@/types'
import { DEFAULT_LOCALE, normalizeLocale } from '@/store/locale'

export const DEFAULT_FAQ_GUIDE_LANG = 'en'

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

export function buildFaqGuidePath(lang: string | undefined, slug: string | undefined): string {
  if (lang && slug) return `/${encodeURIComponent(lang)}/faq/${encodeURIComponent(slug)}`
  if (slug) return `/faq/${encodeURIComponent(slug)}`
  return lang ? `/${encodeURIComponent(lang)}/faq` : '/faq'
}

export function getFaqGuidePathForLocale(path: string, targetLang: string): string {
  const lang = normalizeLocale(targetLang)
  const match = path.match(/^\/(?:(de|en|es|fr|it|zh)\/)?faq(?:\/([^/?#]+))?\/?$/)
  if (!match) return path

  const currentLang = match[1]
  const slug = match[2] ? decodeURIComponent(match[2]) : undefined
  if (!slug) return buildFaqGuidePath(lang, undefined)

  const post = findPostBySlug(slug, currentLang || undefined)
  const targetTranslation = post?.translations?.find((translation) => translation.lang === lang && translation.slug)
  if (targetTranslation?.slug) {
    return buildFaqGuidePath(lang, targetTranslation.slug)
  }

  return buildFaqGuidePath(lang, undefined)
}

export function getPreferredFaqGuidePath(path: string, preferredLang: string): string {
  const lang = normalizeLocale(preferredLang)
  if (lang === DEFAULT_LOCALE || path.match(/^\/(de|en|es|fr|it|zh)\/faq(?:\/|$)/)) return path
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
  for (const post of getDisplayablePosts()) {
    const translations = post.translations || []
    if (lang && translations.some((translation) => translation.lang === lang && translation.slug === slug)) return post
    if (!lang && (post.slug === slug || translations.some((translation) => translation.slug === slug))) return post
  }
  return null
}

function getDisplayablePosts(): BlogPostVO[] {
  return faqGuidePosts.filter((post) => post.translations?.some((translation) => translation.slug && translation.contentHtml))
}

function localizeTree(nodes: BlogPostTocItemVO[], lang?: string): BlogPostTocItemVO[] {
  return nodes.map((node) => {
    const post = node.post ? localizePostRoutes(node.post) : null
    const localizedPost = post ? selectPostTranslation(post, lang) : null
    return {
      ...node,
      title: localizedPost?.title || node.title,
      linkUrl: node.linkUrl ? blogUrlToFaqUrl(node.linkUrl) || node.linkUrl : node.linkUrl,
      post,
      children: localizeTree(node.children || [], lang),
    }
  })
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
