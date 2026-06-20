<template>
  <div class="category-detail-page">
    <div class="category-header" v-if="series">
      <img v-if="series.image" :src="series.image" :alt="series.name" class="category-image" />
      <h1 class="category-title">{{ series.name }}</h1>
    </div>

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
              <div>
                <strong>{{ category.name }}</strong>
                <span>/categories/{{ category.slug }}</span>
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

    <div v-if="products.length > 0" class="product-list">
      <product-card
        v-for="product in products"
        :key="product.appId"
        :product="product"
        :admin-metrics="adminMetricsMap.get(product.appId) || null"
        :current-category-id="series?.id || null"
        class="product-item"
        @admin-changed="handleAdminChanged"
        @removed-from-current-category="handleRemovedFromCurrentCategory"
        @click="goToProduct(product)"
      />
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading more apps...</p>
    </div>
    
    <!-- No more data tip -->
    <div v-if="!hasMore && products.length > 0" class="no-more-tip">
      <p>You've reached the end.</p>
    </div>
    
    <div v-else-if="products.length === 0 && !loading" class="empty-tip">No products found in this series.</div>
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
  updateAdminCategory,
  updateAdminCategoryStatus,
  uploadAdminCategoryImage,
} from '@/api/product'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import type { PageResult, ProductBaseVO, ProductStoreMetricsVO, Series } from '@/types'
import ProductCard from '@/components/ProductCard.vue'
import { absoluteUrl, applySeo } from '@/seo'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()
const series = ref<Series | null>(null)
const products = ref<ProductBaseVO[]>([])
const adminMetricsMap = ref<Map<number, ProductStoreMetricsVO>>(new Map())
const loading = ref(false)
const currentPage = ref(1)
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
    const metrics = await fetchAdminStoreMetrics(ids)
    adminMetricsMap.value = new Map((metrics || []).map((item) => [item.appId, item]))
  } catch (error) {
    adminMetricsMap.value = new Map()
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
  const slug = route.params.slug as string
  
  if (reset) {
    // 重置状态
    products.value = []
    currentPage.value = 1
    hasMore.value = true
  }
  
  loading.value = true
  
  try {
    // 获取所有系列，找到当前系列
    const allSeries = await productStore.getSeries()
    series.value = allSeries.find((s: Series) => s.slug === slug) || null
    
    // 获取该系列下的商品
    if (series.value) {
      const response: PageResult<ProductBaseVO> = await getProductsByCategory(
        slug, 
        currentPage.value, 
        pageSize
      )
      
      if (reset) {
        products.value = response.list || []
      } else {
        products.value = [...products.value, ...(response.list || [])]
      }
      await fetchAdminMetrics()

      applyCategorySeo()
      
      // 检查是否还有更多数据
      hasMore.value = (response.list?.length || 0) === pageSize
    } else {
      products.value = []
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    if (reset) {
      products.value = []
    }
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const handleAdminChanged = async () => {
  await fetchSeriesAndProducts(true)
}

const handleRemovedFromCurrentCategory = (appId: number) => {
  products.value = products.value.filter((product) => Number(product.appId) !== appId)
  const nextMetrics = new Map(adminMetricsMap.value)
  nextMetrics.delete(appId)
  adminMetricsMap.value = nextMetrics
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  currentPage.value++
  await fetchSeriesAndProducts(false)
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
    
    if (shouldLoad && !loading.value && hasMore.value) {
      console.log('Auto loading more apps triggered')
      loadMore()
    }
  }, 100)
}

const goToProduct = (product: ProductBaseVO) => {
  router.push({ name: 'product-detail', params: { id: product.appId } })
}

const applyCategorySeo = () => {
  if (!series.value) return
  const path = route.path
  applySeo({
    title: `${series.value.name} Garmin Watch Faces | Wristo`,
    description: `Browse ${series.value.name} Garmin watch faces and Connect IQ apps on Wristo.`,
    path,
    image: series.value.image,
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
    if (!loading.value && hasMore.value) {
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

watch(() => route.params.slug, () => {
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
  max-width: var(--container);
  margin: 0 auto;
  padding: 56px 20px 80px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 36px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.category-image {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-md);
}
.category-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--color-ink);
  margin: 0;
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
.admin-category-main span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-category-main strong {
  color: var(--color-ink);
}

.admin-category-main span {
  color: #64748b;
  font-size: 0.82rem;
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

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 22px;
  padding: 20px 0;
}

.product-item {
  transition: transform 0.3s ease;
}

.product-item:hover {
  transform: translateY(-3px);
}

.empty-tip {
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-muted);
  padding: 60px 20px;
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

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 16px;
  }
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
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
  .product-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
  }
  
  .category-title {
    font-size: 1.75rem;
  }
  
  .loading-container {
    padding: 20px;
  }
  
  .category-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .admin-category-create {
    grid-template-columns: 1fr;
  }
}
</style>
