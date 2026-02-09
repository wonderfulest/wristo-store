<template>
  <div class="top-apps-page">
    <div class="top-header">
      <h1 class="top-title">Top Apps</h1>
      <p class="top-subtitle">
        Discover what users are buying this week and this month.
      </p>

      <div class="top-segmented">
        <button
          class="segment-btn"
          :class="{ active: activeTab === 'week' }"
          @click="activeTab = 'week'"
        >
          This Week
        </button>
        <button
          class="segment-btn"
          :class="{ active: activeTab === 'month' }"
          @click="activeTab = 'month'"
        >
          This Month
        </button>
      </div>
    </div>

    <div class="top-content" v-if="!loading && !error && displayList.length === 0">
      <div class="empty-state">
        <p>No data yet. Check back soon.</p>
      </div>
    </div>

    <div class="top-content" v-else>
      <div v-if="error" class="error-state">
        <p>Failed to load top apps. Please try again later.</p>
      </div>

      <div v-else class="cards-grid">
        <div
          v-for="(item, index) in displayList"
          :key="item.appId"
          class="top-card"
        >
          <div class="card-main">
            <div class="card-main-left" @click="goToApp(item.app.appId)">
              <div class="rank-badge" :class="`rank-${index + 1}`">
                <span>#{{ index + 1 }}</span>
              </div>
              <div class="app-hero">
                <img
                  v-if="item.app.heroFile?.previewUrl || item.app.heroFile?.url || item.app.garminImageUrl"
                  :src="item.app.heroFile?.previewUrl || item.app.heroFile?.url || item.app.garminImageUrl"
                  :alt="item.app.name"
                />
                <div v-else class="app-hero-fallback">
                  <Icon icon="mdi:watch-variant" width="28" />
                </div>
              </div>

              <div class="app-info">
                <div class="app-name-row">
                  <h2 class="app-name">{{ item.app.name }}</h2>
                </div>
              </div>
            </div>

            <a
              class="view-link"
              @click.stop.prevent="goToApp(item.app.appId)"
            >
              View app
            </a>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getTopWeekApps, getTopMonthApps } from '@/api/purchase'
import type { AppSalesSummaryVO, ProductBaseVO } from '@/types/product'

const router = useRouter()

const activeTab = ref<'week' | 'month'>('week')
const loading = ref(false)
const error = ref<string | null>(null)

const weekList = ref<AppSalesSummaryVO[]>([])
const monthList = ref<AppSalesSummaryVO[]>([])

const currentList = computed(() =>
  activeTab.value === 'week' ? weekList.value : monthList.value
)

// Type guard: ensure app is not null
const hasApp = (item: AppSalesSummaryVO): item is AppSalesSummaryVO & { app: ProductBaseVO } => {
  return !!item.app
}

// Only show Top 20 apps with valid app info
const displayList = computed(() => currentList.value.filter(hasApp).slice(0, 20))

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    if (activeTab.value === 'week' && weekList.value.length === 0) {
      weekList.value = await getTopWeekApps()
    } else if (activeTab.value === 'month' && monthList.value.length === 0) {
      monthList.value = await getTopMonthApps()
    }
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load top apps.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(activeTab, () => {
  void loadData()
})

const goToApp = (appId: number) => {
  router.push(`/product/${appId}`)
}

</script>

<style scoped>
.top-apps-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 20px 40px;
}

.top-header {
  text-align: left;
  margin-bottom: 24px;
}

.top-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #111827;
  margin: 0 0 6px;
}

.top-subtitle {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #6b7280;
}

.top-segmented {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: #f3f4f6;
}

.segment-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.18s ease;
}

.segment-btn.active {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
}

.top-content {
  position: relative;
  min-height: 160px;
}

/* One app per row */
.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-card {
  position: relative;
  padding: 14px 14px 10px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
  cursor: pointer;
}

.top-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  border-color: rgba(59, 130, 246, 0.6);
}

.rank-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #111827;
  background: #e5e7eb;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #111827;
}

.rank-2 {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
}

.rank-3 {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-main-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-hero {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 54px;
}

.app-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.app-hero-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.app-name {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-meta {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.card-footer {
  display: none;
}

.view-link {
  font-size: 0.8rem;
  color: #2563eb;
  cursor: pointer;
}

.view-link:hover {
  text-decoration: underline;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

.empty-state,
.error-state {
  padding: 24px 18px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .top-apps-page {
    padding: 20px 16px 32px;
  }

  .top-title {
    font-size: 1.6rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
