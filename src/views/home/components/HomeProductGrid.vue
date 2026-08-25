<template>
  <section class="catalog-products" aria-labelledby="new-products-title">
    <div class="storefront-container">
      <SectionHeading id="new-products-title" :title="t('home.newArrivalsTitle')" />
      <ProductGridSkeleton v-if="loading" :count="8" class="catalog-products__grid" />
      <div v-else-if="error" class="catalog-products__state" role="status">
        <strong>{{ t('home.catalogErrorTitle') }}</strong>
        <span>{{ t('home.sectionUnavailable') }}</span>
      </div>
      <div v-else-if="products.length" class="catalog-products__grid">
        <ProductCard v-for="product in products" :key="product.appId" :product="product" />
      </div>
      <div v-else class="catalog-products__state" role="status">
        <strong>{{ t('home.catalogEmptyTitle') }}</strong>
        <span>{{ t('home.catalogEmptyDescription') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductBaseVO } from '@/types'
import { useI18n } from '@/i18n'
import ProductCard from '@/components/ProductCard.vue'
import SectionHeading from '@/components/storefront/SectionHeading.vue'
import ProductGridSkeleton from '@/components/storefront/ProductGridSkeleton.vue'

defineProps<{ products: ProductBaseVO[]; loading?: boolean; error?: boolean }>()
const { t } = useI18n()
</script>

<style scoped>
.catalog-products { padding: clamp(28px, 5vw, 64px) 0; background: #f7f8f5; }
.catalog-products :deep(.section-heading__title) { font-size: clamp(1.5rem, 2.2vw, 2rem); line-height: 1.15; }
.catalog-products__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(16px, 2vw, 28px); margin-top: 18px; }
.catalog-products__state { display: grid; gap: 6px; margin-top: 30px; padding: 34px; border: 1px solid var(--color-line); color: var(--color-muted); background: var(--color-surface); }
.catalog-products__state strong { color: var(--color-ink); font-size: 1.1rem; }
@media (max-width: 1024px) { .catalog-products__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .catalog-products__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .catalog-products__grid { grid-template-columns: 1fr; } }
</style>
