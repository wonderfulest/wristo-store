export interface BlogPostTranslationVO {
  lang: string
  slug: string
  title: string
  summary: string
  contentHtml: string
}

export interface BlogCategoryVO {
  id: number
  name: string
  slug: string
}

export interface BlogTagVO {
  id: number
  name: string
  slug: string
}

export interface BlogPostVO {
  id: number
  categoryId: number
  authorId: number
  coverImageUrl: string | null
  isPublished: number
  publishedAt: string | null
  viewCount: number
  slug: string
  createdAt: string
  updatedAt: string
  translations: BlogPostTranslationVO[]
  author: {
    id: number
    username: string
    nickname: string
    avatar: string | null
  }
  category: BlogCategoryVO | null
  tags: BlogTagVO[]
}
