<template>
  <main class="top-apps-page storefront-container">
    <SectionHeading
      :kicker="t('top.kicker')"
      :title="t('top.title')"
      :description="t('top.subtitle')"
      :heading-level="1"
    >
      <template #action>
        <div class="top-segmented" role="group" :aria-label="t('top.periodAria')">
          <button
            class="segment-btn"
            :class="{ active: activeTab === 'week' }"
            type="button"
            :aria-pressed="activeTab === 'week'"
            @click="activeTab = 'week'"
          >
            {{ t('top.week') }}
          </button>
          <button
            class="segment-btn"
            :class="{ active: activeTab === 'month' }"
            type="button"
            :aria-pressed="activeTab === 'month'"
            @click="activeTab = 'month'"
          >
            {{ t('top.month') }}
          </button>
        </div>
      </template>
    </SectionHeading>

    <div v-if="loading" class="top-loading" role="status" :aria-label="t('top.loading')">
      <ProductGridSkeleton :count="10" />
    </div>

    <div v-else-if="error" class="state-card" role="alert">
      <Icon icon="solar:danger-triangle-linear" width="32" aria-hidden="true" />
      <p>{{ t('top.error') }}</p>
      <button type="button" class="state-action" @click="loadData">{{ t('top.retry') }}</button>
    </div>

    <div v-else-if="displayList.length === 0" class="state-card" role="status">
      <Icon icon="solar:cup-star-linear" width="32" aria-hidden="true" />
      <p>{{ t('top.empty') }}</p>
    </div>

    <div v-else class="storefront-product-grid">
      <div v-for="(item, index) in displayList" :key="item.appId" class="ranked-product">
        <span class="rank-badge" :class="`rank-${index + 1}`">#{{ index + 1 }}</span>
        <ProductCard :product="item.app" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { getTopWeekApps, getTopMonthApps } from '@/api/purchase'
import type { AppSalesSummaryVO, ProductBaseVO } from '@/types/product'
import ProductCard from '@/components/ProductCard.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const activeTab = ref<'week' | 'month'>('week')
const loading = ref(false)
const error = ref(false)
const weekList = ref<AppSalesSummaryVO[]>([])
const monthList = ref<AppSalesSummaryVO[]>([])

const currentList = computed(() => activeTab.value === 'week' ? weekList.value : monthList.value)

const hasApp = (item: AppSalesSummaryVO): item is AppSalesSummaryVO & { app: ProductBaseVO } => !!item.app

const displayList = computed(() => currentList.value.filter(hasApp).slice(0, 20))

const loadData = async () => {
  loading.value = true
  error.value = false
  try {
    if (activeTab.value === 'week' && weekList.value.length === 0) {
      weekList.value = await getTopWeekApps()
    } else if (activeTab.value === 'month' && monthList.value.length === 0) {
      monthList.value = await getTopMonthApps()
    }
  } catch (loadFailure) {
    console.error(loadFailure)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(activeTab, loadData)
</script>

<style scoped>
.top-apps-page {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
}

.top-segmented {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-stage);
}

.segment-btn,
.state-action {
  min-height: 44px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.segment-btn {
  padding: 0 16px;
  border-radius: 999px;
  background: transparent;
  color: var(--color-muted);
}

.segment-btn.active {
  border-color: var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--surface-raised);
}

.segment-btn:focus-visible,
.state-action:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.top-loading,
.storefront-product-grid,
.state-card {
  margin-top: var(--space-8);
}

.storefront-product-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-5);
}

.ranked-product {
  position: relative;
  min-width: 0;
}

.rank-badge {
  position: absolute;
  z-index: 2;
  top: 10px;
  left: 10px;
  min-width: 34px;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 900;
  text-align: center;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.rank-1 { background: #b97816; }
.rank-2 { background: #64748b; }
.rank-3 { background: #9a5b3e; }

.state-card {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-5);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-muted);
  text-align: center;
}

.state-card p { margin: 0; }
.state-card > .iconify { color: var(--color-brand); }

.state-action {
  padding: 0 18px;
  border-radius: 999px;
  background: var(--color-brand);
  color: #fff;
}

@media (max-width: 1200px) {
  .storefront-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .storefront-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 600px) {
  .storefront-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}

@media (max-width: 430px) {
  .storefront-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .segment-btn { transition: none; }
}
</style>
