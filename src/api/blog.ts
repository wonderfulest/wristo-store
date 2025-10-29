import instance from '@/config/axios'
import type { BlogPostVO } from '@/types'

export const getBlogPostBySlug = (slug: string, lang?: string): Promise<BlogPostVO> => {
  return instance.get(`/public/blog/post/${encodeURIComponent(slug)}`, {
    params: lang ? { lang } : undefined
  })
}
