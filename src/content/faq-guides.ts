import { faqGuidePosts, faqGuideTocTree } from './faq-pages'
import type { BlogPostTocItemVO, BlogPostTranslationVO, BlogPostVO } from '@/types'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale, type SupportedLocale } from '@/store/locale'

export const DEFAULT_FAQ_GUIDE_LANG = 'en'
const hiddenFaqGuideSectionTitles = new Set([
  'Design & Tutorials',
  'Watchface Picks',
  'Updates',
])
const hiddenFaqGuidePostSlugs = new Set([
  'garmin-watchface-iq-error-fix-zh',
  'install-error',
  'mina-lcd',
])
const localizedFaqGuideSectionTitles: Record<string, Partial<Record<SupportedLocale, string>>> = {
  'choose-and-install': {
    cs: 'Vyberte a nainstalujte',
    da: 'Vaelg og installer',
    de: 'Auswaehlen und installieren',
    en: 'Choose and install',
    es: 'Elegir e instalar',
    fr: 'Choisir et installer',
    it: 'Scegliere e installare',
    ja: '選択とインストール',
    ko: '선택 및 설치',
    nl: 'Kiezen en installeren',
    pl: 'Wybierz i zainstaluj',
    'pt-br': 'Escolher e instalar',
    sv: 'Valj och installera',
    zh: '选择与安装',
  },
  'activation-and-purchases': {
    cs: 'Aktivace a nakupy',
    da: 'Aktivering og kob',
    de: 'Aktivierung und Kaeufe',
    en: 'Activation and purchases',
    es: 'Activacion y compras',
    fr: 'Activation et achats',
    it: 'Attivazione e acquisti',
    ja: '有効化と購入',
    ko: '활성화 및 구매',
    nl: 'Activering en aankopen',
    pl: 'Aktywacja i zakupy',
    'pt-br': 'Ativacao e compras',
    sv: 'Aktivering och kop',
    zh: '激活与购买',
  },
  'settings-and-display': {
    cs: 'Nastaveni a zobrazeni',
    da: 'Indstillinger og visning',
    de: 'Einstellungen und Anzeige',
    en: 'Settings and display',
    es: 'Ajustes y pantalla',
    fr: 'Reglages et affichage',
    it: 'Impostazioni e display',
    ja: '設定と表示',
    ko: '설정 및 표시',
    nl: 'Instellingen en weergave',
    pl: 'Ustawienia i wyswietlanie',
    'pt-br': 'Configuracoes e exibicao',
    sv: 'Installningar och visning',
    zh: '设置与显示',
  },
  'sync-and-troubleshooting': {
    cs: 'Synchronizace a reseni problemu',
    da: 'Synkronisering og fejlfinding',
    de: 'Synchronisierung und Fehlerbehebung',
    en: 'Sync and troubleshooting',
    es: 'Sincronizacion y solucion de problemas',
    fr: 'Synchronisation et depannage',
    it: 'Sincronizzazione e risoluzione problemi',
    ja: '同期とトラブルシューティング',
    ko: '동기화 및 문제 해결',
    nl: 'Synchronisatie en probleemoplossing',
    pl: 'Synchronizacja i rozwiazywanie problemow',
    'pt-br': 'Sincronizacao e solucao de problemas',
    sv: 'Synkronisering och felsokning',
    zh: '同步与故障排查',
  },
}
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
  return buildFaqGuidePath(lang, undefined)
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
      !isHiddenFaqGuidePost(post) &&
      post.translations?.some((translation) => translation.slug && translation.contentHtml),
  )
}

function localizeTree(nodes: BlogPostTocItemVO[], lang?: string): BlogPostTocItemVO[] {
  return nodes.flatMap((node) => {
    if (
      hiddenFaqGuideSectionTitles.has(node.title) ||
      (node.post?.id && hiddenFaqGuidePostIds.has(node.post.id)) ||
      (node.post && isHiddenFaqGuidePost(node.post))
    ) {
      return []
    }

    const post = node.post ? localizePostRoutes(node.post) : null
    const localizedPost = post ? selectPostTranslation(post, lang) : null
    return [{
      ...node,
      title: localizedPost?.title || localizeSectionTitle(node, lang),
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

function isHiddenFaqGuidePost(post: BlogPostVO): boolean {
  return hiddenFaqGuidePostSlugs.has(post.slug) ||
    post.translations?.some((translation) => translation.slug && hiddenFaqGuidePostSlugs.has(translation.slug)) ||
    false
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

function localizeSectionTitle(node: BlogPostTocItemVO, lang?: string): string {
  if (!lang || !node.anchor) return node.title
  const locale = normalizeLocale(lang)
  return localizedFaqGuideSectionTitles[node.anchor]?.[locale] ||
    localizedFaqGuideSectionTitles[node.anchor]?.[DEFAULT_FAQ_GUIDE_LANG] ||
    node.title
}

function findFirstPostInTree(nodes: BlogPostTocItemVO[], lang?: string): BlogPostVO | null {
  for (const node of nodes) {
    if (node.post && selectPostTranslation(node.post, lang)) return node.post
    const childPost = findFirstPostInTree(node.children || [], lang)
    if (childPost) return childPost
  }
  return null
}
