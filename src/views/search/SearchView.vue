<template>
  <div class="search-page">

    <SearchSection
      class="search-section-standalone"
      :initialSearchTerm="searchTerm"
      placeholder="Search styles, features, keywords or activate code"
      :total="total"
      @search="handleSearch"
      @submit="handleSubmit"
    />

    <div class="search-content">
      <div v-if="loading" class="state-card">Loading results...</div>

      <div v-else-if="shouldShowEmpty" class="state-card">
        <div class="state-title">No results</div>
        <div class="state-subtitle">Try a different keyword or a broader style.</div>
      </div>

      <SearchResultsSection v-else :search-results="searchResults" />

      <div
        v-if="searchResults.length > 0 && !canLoadMore"
        class="infinite-footer"
      >
        <span v-if="reachedHardLimit">
          You have reached the first 10 pages of results. Try refining your search to narrow things down.
        </span>
        <span v-else-if="reachedBackendEnd">
          You have reached the end of the results.
        </span>
      </div>
    </div>

    <section class="search-discovery">
      <div class="discovery-header">
        <div>
          <p class="section-kicker">Explore more</p>
        </div>
        <button class="outline-link" type="button" @click="goToTopApps">
          <Icon icon="mdi:chart-line" width="18" aria-hidden="true" />
          Top apps
        </button>
      </div>

      <div class="suggestion-panel">
        <div class="suggestion-copy">
          <Icon icon="mdi:magnify-scan" width="22" aria-hidden="true" />
          <div>
            <h3>Popular searches</h3>
            <p>Start with a proven keyword, then refine by style, device, or everyday use.</p>
          </div>
        </div>
        <div class="suggestion-chips" aria-label="Popular search suggestions">
          <button
            v-for="item in popularSearches"
            :key="item"
            class="search-chip"
            type="button"
            @click="submitSuggestion(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="discovery-grid">
        <button
          v-for="scenario in scenarios"
          :key="scenario.title"
          class="scenario-card"
          type="button"
          @click="submitSuggestion(scenario.query)"
        >
          <span class="scenario-icon">
            <Icon :icon="scenario.icon" width="22" aria-hidden="true" />
          </span>
          <span class="scenario-title">{{ scenario.title }}</span>
          <span class="scenario-desc">{{ scenario.desc }}</span>
          <span class="scenario-action">
            Search {{ scenario.query }}
            <Icon icon="mdi:arrow-right" width="18" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div class="help-strip">
        <div class="help-item">
          <Icon icon="mdi:ticket-confirmation-outline" width="22" aria-hidden="true" />
          <div>
            <h3>Have an unlock code?</h3>
            <p>Enter a 6-digit code in search and we will take you directly to activation.</p>
          </div>
        </div>
        <div class="help-actions">
          <button class="solid-link" type="button" @click="goToCode">
            Activate code
          </button>
          <button class="outline-link" type="button" @click="goToBundle">
            View bundle
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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

const popularSearches = [
  'minimal',
  'digital',
  'weather',
  'running',
  'galaxy',
  'flower',
  'daily'
]

const scenarios = [
  {
    icon: 'mdi:run-fast',
    title: 'Training days',
    desc: 'Data-forward faces for workouts, pace, and quick status checks.',
    query: 'running'
  },
  {
    icon: 'mdi:briefcase-outline',
    title: 'Work and meetings',
    desc: 'Clean layouts that keep time, battery, and calendar glanceable.',
    query: 'minimal'
  },
  {
    icon: 'mdi:weather-partly-cloudy',
    title: 'Weather aware',
    desc: 'Faces built around forecast, conditions, and outdoor planning.',
    query: 'weather'
  }
]

const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)
const pages = ref(0)

const maxPages = computed(() => Math.min(pages.value || 0, 10))

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

const submitSuggestion = async (term: string) => {
  searchTerm.value = term
  pageNum.value = 1
  await router.replace({ path: '/search', query: { q: term } })
}

const goToTopApps = () => {
  router.push('/top')
}

const goToCode = () => {
  router.push('/code')
}

const goToBundle = () => {
  router.push({
    path: '/purchase-options',
    hash: '#bundle-subscription-card'
  })
}

const isFetchingMore = ref(false)

const canLoadMore = computed(() => {
  const q = searchTerm.value.trim()
  if (loading.value || isFetchingMore.value) return false
  if (q.length < 2) return false
  if (pageNum.value >= maxPages.value) return false
  return true
})

const reachedHardLimit = computed(() => {
  // Backend has more than 10 pages but we stop at 10
  return pages.value > 10 && pageNum.value >= 10
})

const reachedBackendEnd = computed(() => {
  // All backend pages have been loaded (<= 10 pages total)
  return pages.value > 0 && pageNum.value >= pages.value && !reachedHardLimit.value
})

const loadNextPage = async () => {
  if (!canLoadMore.value) return

  const q = searchTerm.value.trim()
  if (q.length < 2) return

  const nextPage = Math.min(pageNum.value + 1, 10)
  isFetchingMore.value = true
  try {
    const res = await productStore.searchProductsV2(q, nextPage, pageSize.value)
    const list = res.list || []
    if (list.length > 0) {
      searchResults.value = [...searchResults.value, ...list]
    }
    total.value = res.total || total.value
    pages.value = res.pages || pages.value
    pageNum.value = Math.min(res.pageNum || nextPage, 10)
  } finally {
    isFetchingMore.value = false
  }
}

const handleScroll = () => {
  if (!canLoadMore.value) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const host = scrollHost || window

  let scrollTop: number
  let viewportHeight: number
  let docHeight: number

  if (host instanceof Window) {
    scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    viewportHeight = window.innerHeight || document.documentElement.clientHeight
    docHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight || 0
  } else {
    scrollTop = host.scrollTop
    viewportHeight = host.clientHeight
    docHeight = host.scrollHeight
  }

  if (docHeight - (scrollTop + viewportHeight) < 200) {
    loadNextPage()
  }
}

let scrollHost: Window | HTMLElement | null = null

onMounted(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const layoutMain = document.querySelector('.layout-main') as HTMLElement | null

  if (layoutMain && layoutMain.scrollHeight > layoutMain.clientHeight + 10) {
    scrollHost = layoutMain
    layoutMain.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    scrollHost = window
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (!scrollHost) return

  if (scrollHost instanceof Window) {
    scrollHost.removeEventListener('scroll', handleScroll)
  } else {
    scrollHost.removeEventListener('scroll', handleScroll)
  }

  scrollHost = null
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

.search-discovery {
  width: min(var(--container), calc(100% - 44px));
  margin: 18px auto 0;
  padding: 34px 0 0;
}

.discovery-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.section-kicker {
  margin: 0 0 8px;
  color: var(--color-brand);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: 0;
}

.suggestion-panel,
.scenario-card,
.help-strip {
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: var(--shadow-sm);
}

.suggestion-panel {
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(320px, 1.15fr);
  gap: 22px;
  padding: 22px;
}

.suggestion-copy,
.help-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.suggestion-copy > .iconify,
.help-item > .iconify {
  flex-shrink: 0;
  color: var(--color-brand);
}

.suggestion-copy h3,
.help-item h3 {
  margin: 0;
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 800;
}

.suggestion-copy p,
.help-item p {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: 0.94rem;
  line-height: 1.6;
}

.suggestion-chips {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.search-chip {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  color: var(--color-brand-strong);
  background: #ffffff;
  font-size: 0.94rem;
  font-weight: 800;
}

.search-chip:hover {
  border-color: rgba(15, 107, 104, 0.34);
  background: var(--color-brand-soft);
}

.discovery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.scenario-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 22px;
  text-align: left;
  color: var(--color-ink);
}

.scenario-card:hover {
  border-color: rgba(15, 107, 104, 0.28);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.scenario-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
}

.scenario-title {
  color: var(--color-ink);
  font-size: 1.08rem;
  font-weight: 800;
}

.scenario-desc {
  color: var(--color-muted);
  font-size: 0.94rem;
  line-height: 1.58;
}

.scenario-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: var(--color-brand);
  font-size: 0.9rem;
  font-weight: 800;
}

.help-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin-top: 14px;
  padding: 22px;
  background:
    linear-gradient(135deg, rgba(223, 245, 241, 0.68), rgba(255, 255, 255, 0.94) 48%, rgba(255, 248, 235, 0.82));
}

.help-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.solid-link,
.outline-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.94rem;
  font-weight: 800;
  white-space: nowrap;
}

.solid-link {
  color: #ffffff;
  background: var(--color-brand);
  border-color: var(--color-brand);
}

.solid-link:hover {
  color: #ffffff;
  background: var(--color-brand-strong);
  border-color: var(--color-brand-strong);
}

.outline-link {
  color: var(--color-brand-strong);
  background: #ffffff;
  border-color: rgba(15, 107, 104, 0.16);
  box-shadow: var(--shadow-sm);
}

.outline-link:hover {
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.34);
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

  .search-discovery {
    width: calc(100% - 32px);
    margin-top: 8px;
    padding-top: 28px;
  }

  .discovery-header,
  .help-strip {
    align-items: stretch;
    flex-direction: column;
  }

  .outline-link,
  .solid-link {
    width: 100%;
  }

  .suggestion-panel {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .suggestion-chips {
    justify-content: flex-start;
  }

  .discovery-grid {
    grid-template-columns: 1fr;
  }

  .scenario-card {
    min-height: 190px;
  }

  .help-actions {
    flex-direction: column;
    width: 100%;
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
