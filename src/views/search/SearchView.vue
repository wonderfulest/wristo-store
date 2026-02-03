<template>
  <div class="search-page">

    <SearchSection
      class="search-section-standalone"
      :initialSearchTerm="searchTerm"
      placeholder="Search styles, features, keywords or activate code"
      @search="handleSearch"
      @submit="handleSubmit"
    />

    <button
      v-if="showScrollTop"
      type="button"
      class="scroll-top-btn"
      @click="scrollToTop"
    >
      Top
    </button>

    <div class="search-content">
      <div v-if="loading" class="state-card">Loading results...</div>

      <div v-else-if="shouldShowEmpty" class="state-card">
        <div class="state-title">No results</div>
        <div class="state-subtitle">Try a different keyword or a broader style.</div>
      </div>

      <SearchResultsSection v-else :search-results="searchResults" />

      <div v-if="shouldShowPagination" class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="cappedTotal"
          layout="sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchSection from '@/views/home/components/SearchSection.vue'
import SearchResultsSection from '@/views/home/components/SearchResultsSection.vue'
import { useProductStore } from '@/store/product'
import type { ProductBaseVO } from '@/types'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const loading = ref(false)
const searchTerm = ref('')
const searchResults = ref<ProductBaseVO[]>([])

const showScrollTop = ref(false)
const isMobile = ref(false)

const pageNum = ref(1)
const pageSize = ref(24)
const total = ref(0)
const pages = ref(0)

const maxPages = computed(() => Math.min(pages.value || 0, 10))
const cappedTotal = computed(() => {
  if (total.value <= 0) return 0
  const cap = pageSize.value * 10
  return Math.min(total.value, cap)
})

const queryFromRoute = computed(() => {
  const q = route.query.q
  return typeof q === 'string' ? q : ''
})

const shouldShowEmpty = computed(() => {
  const q = searchTerm.value.trim()
  return !loading.value && q.length >= 2 && searchResults.value.length === 0
})

const runSearch = async (term: string) => {
  const q = term.trim()
  if (q.length < 2) {
    searchResults.value = []
    total.value = 0
    pages.value = 0
    return
  }

  loading.value = true
  try {
    const nextPageNum = Math.min(Math.max(pageNum.value, 1), 10)
    const res = await productStore.searchProductsV2(q, nextPageNum, pageSize.value)
    searchResults.value = res.list || []
    total.value = res.total || 0
    pages.value = res.pages || 0
    pageNum.value = Math.min(res.pageNum || nextPageNum, 10)
  } finally {
    loading.value = false
  }
}

const syncFromRoute = async () => {
  const q = queryFromRoute.value.trim()
  if (/^\d{6}$/.test(q)) {
    await router.replace({ path: '/code', query: { code: q } })
    return
  }
  pageNum.value = 1
  searchTerm.value = q
  await runSearch(q)
}

watch(
  () => route.query.q,
  async () => {
    await syncFromRoute()
  },
  { immediate: true }
)

const handleSearch = async (term: string) => {
  const q = term.trim()
  if (/^\d{6}$/.test(q)) {
    await router.replace({ path: '/code', query: { code: q } })
    return
  }
  pageNum.value = 1
  await router.replace({ path: '/search', query: { q: term } })
}

const handleSubmit = async (term: string) => {
  const q = term.trim()
  if (/^\d{6}$/.test(q)) {
    await router.push({ path: '/code', query: { code: q } })
    return
  }
  pageNum.value = 1
  await router.replace({ path: '/search', query: { q } })
}

const shouldShowPagination = computed(() => {
  const q = searchTerm.value.trim()
  if (loading.value) return false
  if (q.length < 2) return false
  return maxPages.value > 1
})

const handlePageChange = async (next: number) => {
  pageNum.value = Math.min(Math.max(next, 1), 10)
  await runSearch(searchTerm.value)
}

const handlePageSizeChange = async (next: number) => {
  pageSize.value = next
  pageNum.value = 1
  await runSearch(searchTerm.value)
}

const updateIsMobile = () => {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
}

const handleScroll = () => {
  const y = window.scrollY || document.documentElement.scrollTop || 0
  showScrollTop.value = isMobile.value && y > 120
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => searchResults.value.length,
  () => {
    handleScroll()
  }
)

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile, { passive: true })
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  padding-bottom: 72px;
}

.search-section-standalone {
  width: 100%;
}

.search-section-standalone :deep(.search-section) {
  min-height: auto;
  background: transparent;
  border-bottom: none;
  box-shadow: none;
}

.search-section-standalone :deep(.search-bar-outer) {
  margin-top: 28px;
  margin-bottom: 18px;
}

.search-section-standalone :deep(.search-bar-inner) {
  width: min(760px, calc(100vw - 32px));
  max-width: 760px;
}

.search-hero {
  padding: 56px 0 12px;
  background: radial-gradient(1200px 300px at 50% 0%, #eaf3ff 0%, #ffffff 70%);
  border-bottom: 1px solid #eef2f7;
}

.search-hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 22px;
}

.search-title {
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #111827;
}

.search-subtitle {
  margin: 10px 0 0;
  font-size: 16px;
  color: #6b7280;
}

.search-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 22px;
}

.pagination-wrap {
  max-width: 1200px;
  margin: 18px auto 0;
  padding: 14px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.10);
  backdrop-filter: blur(16px);
}

.pagination-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding-right: 6px;
}

.pagination-meta-item {
  font-size: 13px;
  color: #475569;
  line-height: 1.2;
  font-weight: 600;
}

.pagination-wrap :deep(.el-pagination) {
  justify-content: center;
  align-items: center;
}

.pagination-wrap :deep(.el-pagination__total),
.pagination-wrap :deep(.el-pagination__sizes),
.pagination-wrap :deep(.el-pagination__jump) {
  display: flex;
  align-items: center;
  height: 44px;
  line-height: 44px;
}

.pagination-wrap :deep(.el-pagination__sizes .el-select),
.pagination-wrap :deep(.el-pagination__sizes .el-select__wrapper) {
  height: 44px;
  /* display: flex; */
  align-items: center;
}

.pagination-wrap :deep(.el-pagination__jump .el-input__wrapper) {
  height: 44px;
  display: flex;
  align-items: center;
}

.pagination-wrap :deep(.el-pagination button),
.pagination-wrap :deep(.el-pager li) {
  min-width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 16px;
  border-radius: 12px;
}

.pagination-wrap :deep(.el-pagination__sizes .el-select) {
  min-height: 44px;
}

.scroll-top-btn {
  position: fixed;
  right: 16px;
  bottom: 18px;
  z-index: 60;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid rgba(0, 122, 255, 0.25);
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.96), rgba(64, 156, 255, 0.92));
  color: rgba(255, 255, 255, 0.98);
  font-weight: 800;
  font-size: 16px;
  box-shadow:
    0 18px 42px rgba(0, 122, 255, 0.26),
    0 12px 28px rgba(15, 23, 42, 0.14);
  transform: translateZ(0);
}

.scroll-top-btn:active {
  transform: scale(0.98);
}

@media (min-width: 769px) {
  .scroll-top-btn {
    display: none;
  }
}

.state-card {
  margin: 18px 0 0;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9));
  border: 1px solid #e5e7eb;
  color: #111827;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
}

@media (max-width: 735px) {
  .search-content {
    padding: 0 16px;
  }

  .pagination-wrap {
    padding: 12px 12px;
    margin-top: 14px;
    flex-direction: column;
    gap: 10px;
  }

  .pagination-meta {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding-right: 0;
  }
}

.state-title {
  font-size: 16px;
  font-weight: 600;
}

.state-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 735px) {
  .search-hero {
    padding-top: 44px;
  }

  .search-title {
    font-size: 34px;
  }
}
</style>
