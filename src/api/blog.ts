import instance from '@/config/axios'
import type { BlogPostTocItemVO, BlogPostVO } from '@/types'

export const getBlogPostBySlug = (slug: string, lang?: string): Promise<BlogPostVO> => {
  return instance.get(`/public/blog/get-by-slug/${encodeURIComponent(slug)}?populate=*`, {
    params: lang ? { lang } : undefined
  })
}

export const getBlogPostByLangSlug = (lang: string, slug: string): Promise<BlogPostVO> => {
  return instance.get(`/public/blog/get-by-lang-slug/${encodeURIComponent(lang)}/${encodeURIComponent(slug)}?populate=*`)
}

export const getBlogDetail = (postId: number | string): Promise<BlogPostVO> => {
  return instance.get(`/public/blog/detail/${encodeURIComponent(String(postId))}?populate=*`)
}

export const getBlogList = (params?: { lang?: string; page?: number; pageSize?: number }): Promise<{ items: BlogPostVO[]; total: number; page: number; pageSize: number } | BlogPostVO[]> => {
  const { lang, page, pageSize } = params || {}
  return instance.get('/public/blog/list', {
    params: {
      ...(lang ? { lang } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
    }
  })
}

export interface BlogPostTocItemTreeQueryDTO {
  parentId?: number
}

export const getBlogTocTree = (dto: BlogPostTocItemTreeQueryDTO = { parentId: -1 }, lang?: string) : Promise<BlogPostTocItemVO[]> => {
  return instance.post('/public/blog/toc/tree?populate=translations', dto, {
    params: lang ? { lang } : undefined
  })
}
