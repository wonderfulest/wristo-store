import {
  getFaqGuidePostByLangSlug,
  getFaqGuidePostBySlug,
  getFaqGuideTocTree,
} from '@/content/faq-guides'
import type { BlogPostTocItemVO, BlogPostVO } from '@/types'

export const getBlogPostBySlug = async (slug: string, lang?: string): Promise<BlogPostVO> => {
  return getFaqGuidePostBySlug(slug, lang)
}

export const getBlogPostByLangSlug = async (lang: string, slug: string): Promise<BlogPostVO> => {
  return getFaqGuidePostByLangSlug(lang, slug)
}

export const getBlogDetail = async (postId: number | string): Promise<BlogPostVO> => {
  const tree = getFaqGuideTocTree()
  const post = findPostById(tree, Number(postId))
  if (!post) throw new Error('FAQ guide not found')
  return post
}

export const getBlogTree = async (
  params?: { lang?: string; page?: number; pageSize?: number },
): Promise<{ items: BlogPostVO[]; total: number; page: number; pageSize: number }> => {
  const items = flattenPosts(getFaqGuideTocTree(params?.lang))
  const page = params?.page || 1
  const pageSize = params?.pageSize || items.length || 1
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

export interface BlogPostTocItemTreeQueryDTO {
  parentId?: number
}

export const getBlogTocTree = async (
  _dto: BlogPostTocItemTreeQueryDTO = { parentId: -1 },
  lang?: string,
): Promise<BlogPostTocItemVO[]> => {
  return getFaqGuideTocTree(lang)
}

function flattenPosts(nodes: BlogPostTocItemVO[]): BlogPostVO[] {
  const items: BlogPostVO[] = []
  for (const node of nodes) {
    if (node.post) items.push(node.post)
    items.push(...flattenPosts(node.children || []))
  }
  return items
}

function findPostById(nodes: BlogPostTocItemVO[], postId: number): BlogPostVO | null {
  for (const node of nodes) {
    if (node.post?.id === postId) return node.post
    const childMatch = findPostById(node.children || [], postId)
    if (childMatch) return childMatch
  }
  return null
}
