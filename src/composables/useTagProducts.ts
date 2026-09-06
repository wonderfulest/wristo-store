import { onScopeDispose, ref } from 'vue'
import type { ProductBaseVO, ProductTagVO } from '@/types/product'
import type { TagProductPage, TagSort } from '@/api/product'

export function useTagProducts(fetchPage: (slug: string, sort: TagSort, page: number) => Promise<TagProductPage>) {
  const tag = ref<ProductTagVO | null>(null)
  const products = ref<ProductBaseVO[]>([])
  const total = ref(0)
  const pages = ref(0)
  const currentPage = ref(1)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(false)
  const moreError = ref(false)
  const notFound = ref(false)
  let revision = 0
  let slug = ''
  let sort: TagSort = 'popular'

  async function load(page: number, append: boolean) {
    const request = ++revision
    if (append) {
      loadingMore.value = true
      moreError.value = false
    } else {
      loading.value = true
      loadingMore.value = false
      error.value = false
      moreError.value = false
      notFound.value = false
      tag.value = null
      products.value = []
      total.value = 0
      pages.value = 0
    }
    try {
      const response = await fetchPage(slug, sort, page)
      if (request !== revision) return
      tag.value = response.meta.tag
      const seen = new Set(append ? products.value.map(product => product.appId) : [])
      const incoming = response.list.filter(product => {
        if (seen.has(product.appId)) return false
        seen.add(product.appId)
        return true
      })
      products.value = append ? [...products.value, ...incoming] : incoming
      total.value = response.total
      pages.value = response.pages
      currentPage.value = response.pageNum
    } catch (failure) {
      if (request !== revision) return
      if (append) moreError.value = true
      else {
        const code = (failure as { code?: number; response?: { status?: number } })
        notFound.value = code?.code === 404 || code?.response?.status === 404
        error.value = !notFound.value
      }
    } finally {
      if (request === revision) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  function reset(nextSlug: string, nextSort: TagSort, page = 1) {
    slug = nextSlug
    sort = nextSort
    currentPage.value = page
    return load(page, false)
  }

  function loadMore() {
    if (loading.value || loadingMore.value || currentPage.value >= pages.value) return
    return load(currentPage.value + 1, true)
  }

  onScopeDispose(() => { revision++ })
  return { tag, products, total, pages, currentPage, loading, loadingMore, error, moreError, notFound, reset, loadMore }
}
