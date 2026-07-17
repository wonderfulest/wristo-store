<template>
  <div class="category-detail-page">
    <section
      v-if="series"
      class="category-hero"
      :class="{ 'has-banner': categoryBannerUrl }"
      :style="{ '--category-accent': categoryAccent }"
    >
      <img
        v-if="categoryBannerUrl"
        :src="categoryBannerUrl"
        :alt="`${series.name} banner`"
        class="category-hero-image"
      />
      <div class="category-hero-overlay" aria-hidden="true"></div>

      <div class="category-hero-content">
        <div class="category-heading">
          <img v-if="series.image" :src="series.image" :alt="series.name" class="category-image" />
          <div class="category-title-group">
            <p class="category-kicker">{{ t('category.collection') }}</p>
            <h1 class="category-title">{{ series.name }}</h1>
            <p class="category-results">{{ t('category.results', { count: filteredProducts.length }) }}</p>
          </div>
        </div>

        <div class="category-discovery-panel" :aria-label="t('category.filtersAria')">
          <div class="category-filter-row" :aria-label="t('category.filtersAria')">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              type="button"
              class="category-filter-chip"
              :class="{ active: selectedFilter === option.value }"
              :aria-pressed="selectedFilter === option.value"
              @click="selectFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="category-toolbar" :aria-label="t('category.sortAria')">
            <span class="category-sort-label">{{ t('category.sort') }}</span>
            <div class="category-sort-options" role="group" :aria-label="t('category.sortAria')">
              <button
                v-for="option in sortOptions"
                :key="option.value"
                type="button"
                class="category-sort-btn"
                :class="{ active: selectedOrderBy === option.value }"
                :aria-pressed="selectedOrderBy === option.value"
                @click="selectOrder(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isAdmin" class="admin-category-panel" aria-label="Category display management">
      <div class="admin-panel-head">
        <div>
          <p class="admin-panel-kicker">Store categories</p>
          <h2>分类展示管理</h2>
        </div>
        <div class="admin-panel-actions">
          <button type="button" class="admin-panel-btn subtle" :disabled="adminCategoryLoading" @click="loadAdminCategories">
            {{ adminCategoryLoading ? '刷新中' : '刷新' }}
          </button>
          <button
            type="button"
            class="admin-panel-btn subtle"
            :aria-expanded="adminCategoryPanelOpen"
            @click="adminCategoryPanelOpen = !adminCategoryPanelOpen"
          >
            {{ adminCategoryPanelOpen ? '收起' : '展开' }}
          </button>
        </div>
      </div>

      <div v-show="adminCategoryPanelOpen" class="admin-category-body">
        <form class="admin-category-create" @submit.prevent="createCategory">
          <label>
            <span>名称</span>
            <input v-model.trim="newCategory.name" type="text" placeholder="Minimal" required />
          </label>
          <label>
            <span>Slug</span>
            <input v-model.trim="newCategory.slug" type="text" placeholder="minimal" required />
          </label>
          <label>
            <span>排序</span>
            <input v-model.number="newCategory.sort" type="number" inputmode="numeric" />
          </label>
          <label class="admin-create-toggle">
            <span>展示</span>
            <input v-model="newCategory.isActive" type="checkbox" />
          </label>
          <button type="submit" class="admin-panel-btn primary" :disabled="adminCategorySaving">
            {{ adminCategorySaving ? '保存中' : '添加展示' }}
          </button>
        </form>

        <div class="admin-category-list">
          <article
            v-for="category in adminCategories"
            :key="category.id"
            class="admin-category-item"
            :class="{ hidden: Number(category.isActive) !== 1 }"
          >
            <div class="admin-category-main">
              <img v-if="category.image" :src="category.image" :alt="category.name" class="admin-category-thumb" />
              <div v-else class="admin-category-placeholder" aria-hidden="true">{{ category.name.slice(0, 1).toUpperCase() }}</div>
              <div class="admin-category-copy">
                <strong>{{ category.name }}</strong>
                <div class="admin-category-meta">
                  <span>/categories/{{ category.slug }}</span>
                  <span class="admin-category-count">{{ formatCategoryAppCount(category) }}</span>
                </div>
              </div>
            </div>
            <label class="admin-sort-field">
              <span>排序</span>
              <input
                v-model.number="category.sort"
                type="number"
                inputmode="numeric"
                @change="saveCategorySort(category)"
              />
            </label>
            <button
              type="button"
              class="admin-status-switch"
              :class="{ active: Number(category.isActive) === 1 }"
              :aria-pressed="Number(category.isActive) === 1"
              @click="toggleCategoryVisible(category)"
            >
              {{ Number(category.isActive) === 1 ? '展示中' : '已隐藏' }}
            </button>
            <label class="admin-image-upload" :class="{ disabled: uploadingCategoryImageId === category.id }">
              <input
                type="file"
                accept="image/*"
                :disabled="uploadingCategoryImageId === category.id"
                @change="handleCategoryImageSelected(category, $event)"
              />
              <span>{{ uploadingCategoryImageId === category.id ? '上传中' : '上传图片' }}</span>
            </label>
          </article>
        </div>
      </div>
    </section>

    <ProductGridSkeleton v-if="loading && products.length === 0" :count="10" class="category-skeleton" />

    <div v-else-if="filteredProducts.length > 0" class="storefront-product-grid">
      <product-card
        v-for="product in filteredProducts"
        :key="product.appId"
        :product="product"
        :admin-metrics="adminMetricsMap.get(product.appId) || null"
        :current-category-id="series?.id || null"
        class="product-item"
        @admin-changed="handleAdminChanged"
        @removed-from-current-category="handleRemovedFromCurrentCategory"
      />
    </div>
    
    <div v-if="loading && products.length > 0" class="loading-container" role="status">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ t('category.loading') }}</p>
    </div>
    
    <!-- No more data tip -->
    <div v-if="!loading && !loadMoreError && !hasMore && filteredProducts.length > 0" class="no-more-tip" role="status">
      <p>{{ t('category.end') }}</p>
    </div>

    <div v-if="loadMoreError && products.length > 0" class="load-more-error" role="alert">
      <span>{{ t('category.loadMoreError') }}</span>
      <button type="button" class="state-action-btn" @click="loadMore">{{ t('category.retry') }}</button>
    </div>

    <div v-if="loadError && products.length === 0 && !loading" class="state-card" role="alert">
      <Icon icon="solar:danger-triangle-linear" width="30" aria-hidden="true" />
      <p>{{ t('category.error') }}</p>
      <button type="button" class="state-action-btn" @click="fetchSeriesAndProducts(true)">
        {{ t('category.retry') }}
      </button>
    </div>
    <div v-else-if="products.length === 0 && !loading" class="state-card" role="status">
      <Icon icon="solar:box-minimalistic-linear" width="30" aria-hidden="true" />
      <p>{{ t('category.empty') }}</p>
      <button type="button" class="state-action-btn" @click="goHome">{{ t('nav.home') }}</button>
    </div>
    <div v-else-if="products.length > 0 && filteredProducts.length === 0 && !loading" class="state-card" role="status">
      <Icon icon="solar:filter-linear" width="30" aria-hidden="true" />
      <p>{{ t('category.noMatches') }}</p>
      <button type="button" class="state-action-btn" @click="selectFilter('all')">{{ t('category.clearFilter') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/store/product'
import {
  createAdminCategory,
  fetchAdminCategories,
  fetchAdminStoreMetrics,
  getProductsByCategory,
  type CategoryProductOrderBy,
  updateAdminCategory,
  updateAdminCategoryStatus,
  uploadAdminCategoryImage,
} from '@/api/product'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import type { PageResult, ProductBaseVO, ProductStoreMetricsVO, Series } from '@/types'
import ProductCard from '@/components/ProductCard.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'
import { Icon } from '@iconify/vue'
import { absoluteUrl, applySeo } from '@/seo'
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import {
  beginCategoryPageRequest,
  commitCategoryPageFailure,
  commitCategoryPageSuccess,
  type CategoryPageState,
} from './categoryBrowseState'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { t } = useI18n()
const series = ref<Series | null>(null)
const products = ref<ProductBaseVO[]>([])
const adminMetricsMap = ref<Map<number, ProductStoreMetricsVO | null>>(new Map())
const loading = ref(false)
const loadError = ref(false)
const loadMoreError = ref(false)
const currentPage = ref(1)
const failedPage = ref<number | null>(null)
const hasMore = ref(true)
const pageSize = 24
let scrollTimeout: number | null = null
const adminCategories = ref<Series[]>([])
const adminCategoryLoading = ref(false)
const adminCategorySaving = ref(false)
const adminCategoryPanelOpen = ref(false)
const uploadingCategoryImageId = ref<number | null>(null)
const newCategory = ref({
  name: '',
  slug: '',
  sort: 0,
  isActive: true,
})
const sortOptions = computed<{ label: string; value: CategoryProductOrderBy }[]>(() => [
  { label: t('category.sortMostDownloaded'), value: 'download:desc' },
  { label: t('category.sortTopRated'), value: 'rating:desc,download:desc' },
])
type CategoryFilterValue = 'all' | 'free' | 'popular'
const filterOptions = computed<{ label: string; value: CategoryFilterValue }[]>(() => [
  { label: t('category.filterAll'), value: 'all' },
  { label: t('category.filterFree'), value: 'free' },
  { label: t('category.filterPopular'), value: 'popular' },
])

const normalizeOrderBy = (value: unknown): CategoryProductOrderBy => {
  return value === 'rating' || value === 'rating:desc,download:desc'
    ? 'rating:desc,download:desc'
    : 'download:desc'
}

const orderByToQuery = (orderBy: CategoryProductOrderBy) => {
  return orderBy === 'rating:desc,download:desc' ? 'rating' : undefined
}

const selectedOrderBy = computed(() => normalizeOrderBy(route.query.sort))

const categoryBannerUrl = computed(() => {
  return series.value?.banner?.url || null
})

const categoryAccent = computed(() => {
  const palette = ['#0b746d', '#805b38', '#315f78', '#775b70']
  const slug = String(series.value?.slug || '')
  const index = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length
  return palette[index]
})

const normalizeFilter = (value: unknown): CategoryFilterValue => {
  const raw = Array.isArray(value) ? value[0] : value
  return filterOptions.value.some((option) => option.value === raw)
    ? raw as CategoryFilterValue
    : 'all'
}

const selectedFilter = computed(() => normalizeFilter(route.query.filter))

const productMatchesFilter = (product: ProductBaseVO, filter: CategoryFilterValue) => {
  if (filter === 'all') return true
  if (filter === 'free') return Number(product.price || 0) === 0
  if (filter === 'popular') return Number(product.download || 0) >= 1000
  return true
}

const getPageState = (): CategoryPageState => ({
  currentPage: currentPage.value,
  failedPage: failedPage.value,
  hasMore: hasMore.value,
})

const applyPageState = (state: CategoryPageState) => {
  currentPage.value = state.currentPage
  failedPage.value = state.failedPage
  hasMore.value = state.hasMore
}

const filteredProducts = computed(() => {
  return products.value.filter((product) => productMatchesFilter(product, selectedFilter.value))
})

const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some((role) => role.roleCode === 'ROLE_ADMIN')
})

const fetchAdminMetrics = async () => {
  if (!isAdmin.value || products.value.length === 0) {
    adminMetricsMap.value = new Map()
    return
  }
  try {
    const ids = [...new Set(products.value.map((product) => Number(product.appId)).filter(Boolean))]
    const missingIds = ids.filter((id) => !adminMetricsMap.value.has(id))
    if (!missingIds.length) return
    const metrics = await fetchAdminStoreMetrics(missingIds)
    const nextMap = new Map(adminMetricsMap.value)
    ;(metrics || []).forEach((item) => {
      nextMap.set(item.appId, item)
    })
    missingIds.forEach((id) => {
      if (!nextMap.has(id)) {
        nextMap.set(id, null)
      }
    })
    adminMetricsMap.value = nextMap
  } catch (error) {
    if (adminMetricsMap.value.size === 0) {
      adminMetricsMap.value = new Map()
    }
  }
}

const normalizeCategoryImages = (list: Series[]) => {
  return (list || []).map((category) => ({
    ...category,
    image: category.representativeProduct?.heroFile?.url
      ?? category.representativeProduct?.garminImageUrl
      ?? category.image
      ?? category.hero?.url
      ?? category.banner?.url
      ?? null,
  }))
}

const sortCategories = (list: Series[]) => {
  return [...list].sort((a, b) => {
    const sortDiff = Number(b.sort || 0) - Number(a.sort || 0)
    if (sortDiff !== 0) return sortDiff
    return a.name.localeCompare(b.name)
  })
}

const formatCategoryAppCount = (category: Series) => {
  const count = Number(category.appCount ?? 0)
  return `${Number.isFinite(count) ? count : 0} 个应用`
}

const refreshStoreCategories = async () => {
  await productStore.getSeries()
}

const loadAdminCategories = async () => {
  if (!isAdmin.value) return
  adminCategoryLoading.value = true
  try {
    const response = await fetchAdminCategories()
    adminCategories.value = sortCategories(normalizeCategoryImages(response?.list || []))
  } finally {
    adminCategoryLoading.value = false
  }
}

const saveCategorySort = async (category: Series) => {
  adminCategorySaving.value = true
  try {
    await updateAdminCategory(category.id, { sort: Number(category.sort || 0) })
    adminCategories.value = sortCategories(adminCategories.value)
    await refreshStoreCategories()
    ElMessage.success('排序已更新')
  } finally {
    adminCategorySaving.value = false
  }
}

const toggleCategoryVisible = async (category: Series) => {
  const nextActive = Number(category.isActive) === 1 ? 0 : 1
  adminCategorySaving.value = true
  try {
    await updateAdminCategoryStatus(category.id, nextActive)
    category.isActive = nextActive
    await refreshStoreCategories()
    ElMessage.success(nextActive === 1 ? '分类已展示' : '分类已隐藏')
    if (series.value?.id === category.id && nextActive === 0) {
      await fetchSeriesAndProducts(true)
    }
  } finally {
    adminCategorySaving.value = false
  }
}

const handleCategoryImageSelected = async (category: Series, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  uploadingCategoryImageId.value = category.id
  try {
    const image = await uploadAdminCategoryImage(file)
    await updateAdminCategory(category.id, { heroId: image.id })
    category.heroId = image.id
    category.hero = image
    category.image = image.url
    await refreshStoreCategories()
    if (series.value?.id === category.id) {
      await fetchSeriesAndProducts(true)
    }
    ElMessage.success('分类图片已更新')
  } finally {
    uploadingCategoryImageId.value = null
  }
}

const createCategory = async () => {
  if (!newCategory.value.name || !newCategory.value.slug) return
  adminCategorySaving.value = true
  try {
    const created = await createAdminCategory({
      name: newCategory.value.name,
      slug: newCategory.value.slug,
    })
    await updateAdminCategory(created.id, {
      sort: Number(newCategory.value.sort || 0),
      isActive: newCategory.value.isActive ? 1 : 0,
    })
    newCategory.value = { name: '', slug: '', sort: 0, isActive: true }
    await loadAdminCategories()
    await refreshStoreCategories()
    ElMessage.success('分类已添加')
  } finally {
    adminCategorySaving.value = false
  }
}

const fetchSeriesAndProducts = async (reset = true) => {
  loadError.value = false
  loadMoreError.value = false
  if (reset) {
    // 重置状态
    products.value = []
    adminMetricsMap.value = new Map()
    currentPage.value = 1
    failedPage.value = null
    hasMore.value = true
  }

  const pageState = getPageState()
  const request = beginCategoryPageRequest(pageState, reset)
  loading.value = true

  try {
    const slug = route.params.slug as string
    // 获取所有系列，找到当前系列
    const allSeries = await productStore.getSeries()
    series.value = allSeries.find((s: Series) => s.slug === slug) || null
    
    // 获取该系列下的商品
    if (series.value) {
      const response: PageResult<ProductBaseVO> = await getProductsByCategory(
        slug, 
        request.page,
        pageSize,
        selectedOrderBy.value
      )
      
      if (reset) {
        products.value = response.list || []
      } else {
        products.value = [...products.value, ...(response.list || [])]
      }
      await fetchAdminMetrics()

      applyCategorySeo()
      
      applyPageState(commitCategoryPageSuccess(pageState, request, response.list?.length || 0, pageSize))
    } else {
      products.value = []
      failedPage.value = null
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    if (reset) {
      loadError.value = true
      products.value = []
      failedPage.value = null
      hasMore.value = false
    } else {
      loadMoreError.value = true
      applyPageState(commitCategoryPageFailure(pageState, request))
    }
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push(addLocaleToPath('/', localeStore.currentLocale))
}

const handleAdminChanged = async () => {
  await fetchSeriesAndProducts(true)
  await loadAdminCategories()
}

const handleRemovedFromCurrentCategory = (appId: number) => {
  products.value = products.value.filter((product) => Number(product.appId) !== appId)
  const nextMetrics = new Map(adminMetricsMap.value)
  nextMetrics.delete(appId)
  adminMetricsMap.value = nextMetrics
  if (series.value?.id) {
    adminCategories.value = adminCategories.value.map((category) => {
      if (category.id !== series.value?.id) return category
      return {
        ...category,
        appCount: Math.max(Number(category.appCount ?? 0) - 1, 0),
      }
    })
  }
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  await fetchSeriesAndProducts(false)
}

const selectOrder = async (orderBy: CategoryProductOrderBy) => {
  if (orderBy === selectedOrderBy.value) return
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      sort: orderByToQuery(orderBy),
    },
  })
}

const selectFilter = async (filter: CategoryFilterValue) => {
  if (filter === selectedFilter.value) return
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      filter: filter === 'all' ? undefined : filter,
    },
  })
}

// 滚动到底部自动加载更多
const handleScroll = () => {
  // 清除之前的定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  // 防抖处理，100ms后执行
  scrollTimeout = window.setTimeout(() => {
    // 兼容不同浏览器的滚动位置获取方式
    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    )
    
    // 计算滚动进度
    const scrollProgress = (scrollTop + windowHeight) / documentHeight
    const remainingHeight = documentHeight - (scrollTop + windowHeight)
    
    // 调试信息
    console.log('Scroll debug:', {
      scrollTop,
      windowHeight,
      documentHeight,
      scrollProgress: Math.round(scrollProgress * 100) + '%',
      remainingHeight: remainingHeight + 'px',
      loading: loading.value,
      hasMore: hasMore.value
    })
    
    // 更宽松的触发条件：滚动到60%时触发加载，或者距离底部400px时触发
    const shouldLoad = scrollProgress >= 0.6 || remainingHeight <= 400
    
    if (shouldLoad && !loading.value && !loadMoreError.value && hasMore.value) {
      console.log('Auto loading more apps triggered')
      loadMore()
    }
  }, 100)
}

const applyCategorySeo = () => {
  if (!series.value) return
  const path = route.path
  applySeo({
    title: `${series.value.name} Garmin Watch Faces | Wristo`,
    description: `Browse ${series.value.name} Garmin watch faces and Connect IQ apps on Wristo.`,
    path,
    image: categoryBannerUrl.value || series.value.image,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${series.value.name} Garmin Watch Faces`,
        description: `Wristo collection page for ${series.value.name} Garmin watch faces.`,
        url: absoluteUrl(path),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products.value.slice(0, 24).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/product/${product.appId}`),
            name: product.name,
          })),
        },
      },
    ],
  })
}

onMounted(() => {
  fetchSeriesAndProducts()
  loadAdminCategories()
  // 添加多种滚动监听，确保兼容性
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('scroll', handleScroll, { passive: true })
  
  // 添加触摸滚动监听（移动端）
  window.addEventListener('touchmove', handleScroll, { passive: true })
  
  // 定期检查是否需要加载更多（备用方案）
  const checkInterval = setInterval(() => {
    if (!loading.value && !loadMoreError.value && hasMore.value) {
      const scrollTop = Math.max(
        window.pageYOffset,
        document.documentElement.scrollTop,
        document.body.scrollTop
      )
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      )
      
      const scrollProgress = (scrollTop + windowHeight) / documentHeight
      const remainingHeight = documentHeight - (scrollTop + windowHeight)
      
      if (scrollProgress >= 0.6 || remainingHeight <= 400) {
        console.log('Interval check triggered loading')
        loadMore()
      }
    }
  }, 2000) // 每5秒检查一次
  
  // 保存定时器引用以便清理
  ;(window as any).scrollCheckInterval = checkInterval
})

watch(() => [route.params.slug, route.query.sort], () => {
  fetchSeriesAndProducts(true)
})

watch(isAdmin, (value) => {
  if (value) {
    loadAdminCategories()
  }
})

// 清理滚动监听
onBeforeUnmount(() => {
  // 清理所有滚动监听器
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchmove', handleScroll)
  
  // 清理防抖定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
  
  // 清理定期检查定时器
  if ((window as any).scrollCheckInterval) {
    clearInterval((window as any).scrollCheckInterval)
    ;(window as any).scrollCheckInterval = null
  }
})
</script>

<style scoped>
.category-detail-page {
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.category-hero {
  position: relative;
  display: grid;
  min-height: clamp(260px, 28vw, 340px);
  margin-bottom: 28px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--category-accent) 18%, transparent), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #eef7f5 100%);
  box-shadow: 0 18px 44px rgba(17, 24, 39, 0.1);
}

.category-hero-image,
.category-hero-overlay {
  position: absolute;
  inset: 0;
}

.category-hero-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-hero-overlay {
  background:
    linear-gradient(90deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.26) 42%, rgba(15, 23, 42, 0.08) 100%),
    linear-gradient(0deg, rgba(15, 23, 42, 0.44) 0%, rgba(15, 23, 42, 0.02) 62%);
}

.category-hero:not(.has-banner) .category-hero-overlay {
  background: linear-gradient(135deg, rgba(15, 107, 104, 0.1), rgba(255, 255, 255, 0.34));
}

.category-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  min-height: inherit;
  padding: clamp(22px, 3vw, 36px);
}

.category-heading {
  display: flex;
  align-items: center;
  gap: 18px;
  max-width: 720px;
}

.category-image {
  width: clamp(68px, 8vw, 96px);
  height: clamp(68px, 8vw, 96px);
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.2);
}

.category-title-group {
  min-width: 0;
}

.category-kicker {
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.category-hero:not(.has-banner) .category-kicker {
  color: var(--category-accent);
}

.category-results {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.9rem;
  font-weight: 700;
}

.category-hero:not(.has-banner) .category-results {
  color: var(--color-muted);
}

.category-title {
  margin: 0;
  color: #fff;
  font-size: clamp(2.1rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 0.98;
  text-wrap: balance;
  text-shadow: 0 12px 34px rgba(15, 23, 42, 0.28);
}

.category-hero:not(.has-banner) .category-title {
  color: var(--color-ink);
  text-shadow: none;
}

.category-discovery-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.category-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
  min-width: 0;
}

.category-sort-label {
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 800;
}

.category-sort-options {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
}

.category-sort-btn {
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #475569;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
}

.category-sort-btn:hover {
  color: var(--color-brand-strong);
  outline: none;
}

.category-sort-btn:focus-visible {
  color: var(--color-brand-strong);
  outline: none;
  box-shadow: var(--focus-ring);
}

.category-sort-btn.active {
  background: var(--color-brand);
  color: #fff;
  box-shadow: 0 8px 18px rgba(15, 107, 104, 0.18);
}

.category-sort-btn.active:focus-visible {
  box-shadow: var(--focus-ring);
}

.category-filter-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  min-width: 0;
  padding: 2px;
  scrollbar-width: thin;
}

.category-filter-chip {
  min-height: 44px;
  flex: 0 0 auto;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.category-filter-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 107, 104, 0.26);
  color: var(--color-brand-strong);
  outline: none;
}

.category-filter-chip:focus-visible {
  border-color: rgba(15, 107, 104, 0.26);
  color: var(--color-brand-strong);
  outline: none;
  box-shadow: var(--focus-ring);
}

.category-filter-chip.active {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: #fff;
  box-shadow: 0 8px 18px rgba(15, 107, 104, 0.18);
}

.category-filter-chip.active:focus-visible {
  box-shadow: var(--focus-ring);
}

.admin-category-panel {
  display: grid;
  gap: 18px;
  margin: 0 0 28px;
  padding: 20px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.08);
}

.admin-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.admin-panel-kicker {
  margin: 0 0 4px;
  color: var(--color-brand-strong);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.admin-panel-head h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: 1.15rem;
}

.admin-panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.admin-category-body {
  display: grid;
  gap: 18px;
}

.admin-category-create {
  display: grid;
  grid-template-columns: minmax(140px, 1.2fr) minmax(140px, 1.2fr) minmax(88px, 0.5fr) auto auto;
  gap: 12px;
  align-items: end;
}

.admin-category-create label,
.admin-sort-field {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
}

.admin-category-create input,
.admin-sort-field input {
  width: 100%;
  min-height: 40px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  background: #fff;
  color: var(--color-ink);
  font: inherit;
  padding: 0 11px;
  outline: none;
}

.admin-category-create input:focus,
.admin-sort-field input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(15, 107, 104, 0.12);
}

.admin-create-toggle {
  min-height: 40px;
  align-content: center;
}

.admin-create-toggle input {
  width: 40px;
  min-height: 20px;
  accent-color: var(--color-brand);
}

.admin-panel-btn {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.admin-panel-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.admin-panel-btn.primary {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: #fff;
}

.admin-panel-btn.subtle {
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.admin-panel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.admin-category-list {
  display: grid;
  gap: 10px;
}

.admin-category-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px 94px 96px;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #fff;
}

.admin-category-item.hidden {
  background: rgba(248, 250, 252, 0.78);
}

.admin-category-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.admin-category-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.admin-category-thumb,
.admin-category-placeholder {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 12px;
}

.admin-category-thumb {
  object-fit: cover;
}

.admin-category-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-weight: 900;
}

.admin-category-main strong,
.admin-category-meta span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-category-main strong {
  color: var(--color-ink);
}

.admin-category-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.admin-category-meta span {
  color: #64748b;
  font-size: 0.82rem;
}

.admin-category-count {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 800;
}

.admin-status-switch {
  min-height: 36px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 800;
  cursor: pointer;
}

.admin-status-switch.active {
  border-color: rgba(15, 107, 104, 0.2);
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.admin-image-upload {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(15, 107, 104, 0.2);
  border-radius: 999px;
  background: #fff;
  color: var(--color-brand-strong);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.admin-image-upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.admin-image-upload.disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.admin-image-upload.disabled input {
  cursor: not-allowed;
}

.storefront-product-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-5);
  padding: 20px 0;
}

.product-item {
  transition: transform 0.3s ease;
}

.product-item:hover {
  transform: translateY(-3px);
}

.state-card {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding: var(--space-8) var(--space-5);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-muted);
  text-align: center;
}

.state-card p {
  margin: 0;
  line-height: 1.6;
}

.state-card > .iconify {
  color: var(--color-brand);
}

.state-action-btn {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(15, 107, 104, 0.22);
  border-radius: 999px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font: inherit;
  font-weight: 900;
  cursor: pointer;
}

.state-action-btn:hover,
.state-action-btn:focus-visible {
  border-color: var(--color-brand);
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid var(--color-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  color: var(--color-muted);
  margin: 0;
}



/* No more data tip */
.no-more-tip {
  text-align: center;
  padding: 40px 20px;
}

.no-more-tip p {
  font-size: 1.1rem;
  color: var(--color-muted);
  margin: 0;
  font-weight: 500;
}

.load-more-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  color: var(--color-muted);
  text-align: center;
}

@media (max-width: 1200px) {
  .storefront-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .storefront-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 768px) {

  .category-detail-page {
    padding-top: 24px;
  }

  .category-hero {
    min-height: 300px;
  }

  .category-hero-content {
    gap: 22px;
  }

  .category-discovery-panel {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .category-toolbar {
    justify-content: space-between;
  }

  .admin-panel-head,
  .admin-category-item {
    grid-template-columns: 1fr;
  }

  .admin-panel-head {
    align-items: flex-start;
  }

  .admin-panel-actions {
    justify-content: flex-start;
  }

  .admin-category-create {
    grid-template-columns: 1fr 1fr;
  }
  
  .category-title {
    font-size: 2rem;
  }
  
  .loading-container {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .category-hero {
    min-height: 340px;
    border-radius: 20px;
  }

  .storefront-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
  
  .category-title {
    font-size: 1.75rem;
  }
  
  .loading-container {
    padding: 20px;
  }
  
  .category-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .category-toolbar,
  .category-sort-options {
    width: 100%;
  }

  .category-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .category-sort-btn {
    flex: 1;
  }

  .admin-category-create {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .storefront-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .product-item,
  .category-filter-chip {
    transition: none;
  }
}
</style>
