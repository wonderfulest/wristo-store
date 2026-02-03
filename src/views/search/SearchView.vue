<template>
  <div class="search-page">

    <SearchSection
      class="search-section-standalone"
      :initialSearchTerm="searchTerm"
      placeholder="Search styles, features, keywords or activate code"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
    return
  }

  loading.value = true
  try {
    searchResults.value = await productStore.searchProducts(q)
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
  await router.replace({ path: '/search', query: { q: term } })
}

const handleSubmit = async (term: string) => {
  const q = term.trim()
  if (/^\d{6}$/.test(q)) {
    await router.push({ path: '/code', query: { code: q } })
    return
  }
  await router.replace({ path: '/search', query: { q } })
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #ffffff;
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
  padding: 0;
}

.state-card {
  max-width: 1200px;
  margin: 24px auto 0;
  padding: 18px 22px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9));
  border: 1px solid #e5e7eb;
  color: #111827;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
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
