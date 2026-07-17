<template>
  <section class="series-section">
    <div class="storefront-container">
      <SectionHeading
        :kicker="t('home.seriesKicker')"
        :title="t('home.seriesTitle')"
      />
      <ProductGridSkeleton v-if="loading" :count="4" class="series-loading" />
      <p v-else-if="error" class="section-status" role="status">{{ t('home.sectionUnavailable') }}</p>
      <div v-else class="series-grid">
        <SeriesCard
          v-for="(series, index) in seriesList"
          :key="series.id"
          :series="series"
          :index="index"
          :style="{ '--series-accent': resolveSeriesAccent(series.slug) }"
          @select="$emit('series-click', series)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Series } from '@/types'
import { useI18n } from '@/i18n'
import SeriesCard from '@/components/SeriesCard.vue'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'

const { t } = useI18n()

defineProps<{
  seriesList: Array<Series & { publicTagline?: string }>
  loading?: boolean
  error?: boolean
}>()

defineEmits<{
  (event: 'series-click', series: Series): void
}>()

const seriesAccents = ['#0b746d', '#c98919', '#6c7b64', '#a65a42', '#526c8a']

const resolveSeriesAccent = (slug?: string) => {
  const seed = (slug || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return seriesAccents[seed % seriesAccents.length] as CSSProperties['color']
}
</script>

<style scoped>
.series-section {
  padding-block: var(--space-section);
  background: var(--color-surface-soft);
}

.series-grid,
.series-loading,
.section-status {
  margin-top: var(--space-6);
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
}

.section-status {
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  background: var(--color-surface);
}

@media (max-width: 900px) {
  .series-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .series-grid { grid-template-columns: 1fr; }
}
</style>
