<template>

  <div class="home">
    <!-- Home Banner -->
    <HomeBanner />

    <!-- Search Section -->
    <SearchSection 
      :initialSearchTerm="searchTerm"
      :submitOnFocus="true"
      @submit="handleSubmitSearch"
    />

    <!-- Brands Section -->
    <BrandsSection />
    
    <!-- Feature Section -->
    <FeatureSection />

    <!-- Series Section -->
    <SeriesSection 
      :series-list="seriesList"
      @series-click="goToSeries"
    />

    <!-- Hot Products Section -->
    <HotProductsSection 
      :hot-products="hotProducts"
      @product-click="goToProduct"
      @more-click="goToTopApps"
    />
  </div>
  <section class="bundle-subscription-section" aria-labelledby="bundle-subscription-title">
    <button
      class="bundle-subscription-card"
      type="button"
      :aria-label="t('home.bundleAria')"
      @click="goToBundleSubscription"
    >
      <span class="bundle-card-copy">
        <span class="bundle-eyebrow">
          <Icon icon="mdi:watch-variant" width="18" height="18" aria-hidden="true" />
          {{ t('home.bundleEyebrow') }}
        </span>
        <span id="bundle-subscription-title" class="bundle-title">
          {{ t('home.bundleTitle') }}
        </span>
        <span class="bundle-desc">
          {{ t('home.bundleDesc') }}
        </span>
      </span>

      <span class="bundle-card-meta" aria-hidden="true">
        <span class="bundle-metric">
          <strong>{{ t('home.bundleMetric') }}</strong>
          <span>{{ t('home.bundleOffer') }}</span>
        </span>
        <span class="bundle-cta">
          {{ t('home.bundleCta') }}
          <Icon icon="mdi:arrow-right" width="20" height="20" />
        </span>
      </span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/store/product';
import type { ProductBaseVO, Series } from '@/types';
import HomeBanner from '@/views/home/components/HomeBanner.vue';
import SearchSection from '@/views/home/components/SearchSection.vue';
import BrandsSection from '@/views/brands/BrandsSection.vue';
import FeatureSection from '@/views/home/components/FeatureSection.vue';
import SeriesSection from '@/views/home/components/SeriesSection.vue';
import HotProductsSection from '@/views/home/components/HotProductsSection.vue';
import { addLocaleToPath, useLocaleStore } from '@/store/locale';
import { useI18n } from '@/i18n';

const productStore = useProductStore();
const router = useRouter();
const localeStore = useLocaleStore();
const { t } = useI18n();

const searchTerm = ref('');
const seriesList = ref<Series[]>([]);
const hotProducts = ref<ProductBaseVO[]>([]);

const handleSubmitSearch = async (term: string) => {
  const q = term.trim()
  searchTerm.value = term
  const searchPath = addLocaleToPath('/search', localeStore.currentLocale)
  await router.push(q ? { path: searchPath, query: { q } } : { path: searchPath })
}

const goToBundleSubscription = () => {
  router.push({
    path: addLocaleToPath('/purchase-options', localeStore.currentLocale),
    hash: '#bundle-subscription-card'
  })
}

// Fetch initial data
onMounted(async () => {
  try {
    [seriesList.value, hotProducts.value] = await Promise.all([
      productStore.getHotSeries(),
      productStore.getHotProducts()
    ]);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }
});

const goToProduct = (product: ProductBaseVO) => {
  router.push(addLocaleToPath(`/product/${product.appId}`, localeStore.currentLocale));
};

const goToTopApps = () => {
  router.push(addLocaleToPath('/top', localeStore.currentLocale));
};

const goToSeries = (series: Series) => {
  router.push(addLocaleToPath(`/categories/${series.slug}`, localeStore.currentLocale));
};
</script>

<style scoped>
.home {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, #fbfdfc 0%, #f4f7f6 34%, #ffffff 100%);
}
.bundle-subscription-section {
  width: min(var(--container), calc(100% - 32px));
  margin: 32px auto 64px;
}

.bundle-subscription-card {
  width: 100%;
  min-height: 168px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 28px;
  padding: 28px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: var(--radius-md);
  text-align: left;
  color: var(--color-ink);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(223, 245, 241, 0.82) 58%, rgba(255, 248, 235, 0.92) 100%);
  box-shadow:
    var(--shadow-md),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  overflow: hidden;
  position: relative;
}

.bundle-subscription-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(360px 180px at 86% 12%, rgba(245, 158, 11, 0.20), transparent 68%),
    radial-gradient(420px 220px at 16% 0%, rgba(15, 107, 104, 0.16), transparent 70%);
}

.bundle-subscription-card > * {
  position: relative;
  z-index: 1;
}

.bundle-subscription-card:hover {
  border-color: rgba(15, 107, 104, 0.32);
  box-shadow:
    var(--shadow-lg),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  transform: translateY(-3px);
}

.bundle-subscription-card:active {
  transform: translateY(-1px);
}

.bundle-card-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 680px;
}

.bundle-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: 12px;
  color: var(--color-brand-strong);
  font-size: 0.88rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bundle-title {
  font-size: clamp(1.45rem, 2.4vw, 2.2rem);
  line-height: 1.15;
  font-weight: 800;
  color: var(--color-ink);
}

.bundle-desc {
  margin-top: 12px;
  max-width: 620px;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.bundle-card-meta {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
}

.bundle-metric {
  display: grid;
  gap: 3px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 107, 104, 0.12);
  color: var(--color-muted);
  box-shadow: var(--shadow-sm);
}

.bundle-metric strong {
  color: var(--color-brand-strong);
  font-size: 1.18rem;
}

.bundle-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.24);
}

@media (max-width: 768px) {
  .bundle-subscription-section {
    width: calc(100% - 24px);
    margin: 24px auto 40px;
  }

  .bundle-subscription-card {
    flex-direction: column;
    min-height: auto;
    padding: 22px;
    gap: 22px;
  }

  .bundle-card-meta {
    min-width: 0;
    width: 100%;
    align-items: stretch;
  }

  .bundle-cta {
    width: 100%;
  }
}
</style>
