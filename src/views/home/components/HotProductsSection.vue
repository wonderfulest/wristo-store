<template>
  <section class="hot-section">
    <div class="storefront-container">
      <SectionHeading
        :kicker="t('home.hotKicker')"
        :title="t('home.hotTitle')"
        :description="t('home.hotSubtitle')"
      >
        <template #action>
          <button class="hot-more" type="button" @click="$emit('more-click')">
            {{ t('home.hotMore') }}
            <Icon icon="solar:arrow-right-linear" width="18" height="18" aria-hidden="true" />
          </button>
        </template>
      </SectionHeading>

      <ProductGridSkeleton v-if="loading" :count="6" class="hot-loading" />
      <p v-else-if="error" class="section-status" role="status">{{ t('home.sectionUnavailable') }}</p>
      <div v-else class="hot-grid">
        <ProductCard
          v-for="product in visibleProducts"
          :key="product.appId"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ProductBaseVO } from '@/types'
import { useI18n } from '@/i18n'
import ProductCard from '@/components/ProductCard.vue'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'

const { t } = useI18n()

const props = defineProps<{
  hotProducts: ProductBaseVO[]
  loading?: boolean
  error?: boolean
}>()

defineEmits<{
  (event: 'more-click'): void
}>()

const visibleProducts = computed(() => (props.hotProducts || []).slice(0, 12))
</script>

<style scoped>
.hot-section {
  padding-block: var(--space-section);
  background:
    radial-gradient(circle at 88% 8%, rgba(201, 137, 25, 0.09), transparent 24rem),
    var(--color-canvas);
  border-top: 1px solid var(--color-line);
}

.hot-more {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
}

.hot-grid,
.hot-loading,
.section-status {
  margin-top: var(--space-6);
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-5);
}

.section-status {
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  background: var(--color-surface);
}

@media (max-width: 1200px) {
  .hot-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .hot-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 600px) {
  .hot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}
</style>
