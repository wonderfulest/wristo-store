<template>
  <div class="tag-page">
    <header class="tag-hero">
      <router-link class="back-link" :to="localizedPath('/search')">← {{ t('nav.search') }}</router-link>
      <p class="tag-kicker">{{ t('tags.explore') }}</p>
      <h1>#{{ tagName }}</h1>
      <p class="tag-description">{{ t('tags.description') }}</p>
      <div class="tag-toolbar">
        <span aria-live="polite">{{ loading ? t('search.loading') : notFound || error ? '' : t('tags.count').replace('{count}', total.toLocaleString(locale)) }}</span>
        <nav class="sort-tabs" :aria-label="t('tags.sort')">
          <router-link v-for="option in sortOptions" :key="option" :to="tagPath(option)" :aria-current="sort === option ? 'page' : undefined" :class="{ active: sort === option }">
            {{ t(`tags.${option}`) }}
          </router-link>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="tag-state" role="status">{{ t('search.loading') }}</div>
    <div v-else-if="notFound" class="tag-state">
      <h2>{{ t('tags.notFound') }}</h2>
      <router-link :to="localizedPath('/search')">{{ t('tags.browseAll') }}</router-link>
    </div>
    <div v-else-if="error" class="tag-state" role="alert">
      <p>{{ t('search.error') }}</p>
      <button type="button" @click="reload">{{ t('search.retry') }}</button>
    </div>
    <template v-else>
      <div v-if="!products.length" class="tag-state">
        <h2>{{ t('tags.empty') }}</h2>
        <p>{{ t('tags.emptyHint') }}</p>
        <router-link :to="localizedPath('/search')">{{ t('tags.browseAll') }}</router-link>
      </div>
      <SearchResultsSection :search-results="products" />
      <nav v-if="pages > 1 || routePage > 1" class="tag-pagination" :aria-label="t('tags.pagination')">
        <router-link v-if="routePage > 1" :to="pagePath(routePage - 1)">{{ t('tags.previous') }}</router-link>
        <span>{{ t('tags.page').replace('{page}', String(routePage)).replace('{pages}', String(pages)) }}</span>
        <router-link v-if="routePage < pages" :to="pagePath(routePage + 1)">{{ t('tags.next') }}</router-link>
      </nav>
      <div class="mobile-pagination">
        <router-link v-if="routePage > 1" :to="pagePath(1)">{{ t('tags.firstPage') }}</router-link>
        <p v-if="moreError" role="alert">{{ t('search.loadMoreError') }}</p>
        <button v-if="currentPage < pages" type="button" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? t('search.loadingMore') : moreError ? t('search.retry') : t('tags.loadMore') }}
        </button>
        <p v-else-if="products.length">{{ t('search.endReached') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProductsByTag, type TagSort } from '@/api/product'
import { useTagProducts } from '@/composables/useTagProducts'
import { useI18n } from '@/i18n'
import { addLocaleToPath } from '@/store/locale'
import SearchResultsSection from '@/views/home/components/SearchResultsSection.vue'

const route = useRoute()
const { locale, t } = useI18n()
const sortOptions: TagSort[] = ['popular', 'latest']
const slug = computed(() => String(route.params.slug || ''))
const sort = computed<TagSort>(() => route.params.sort === 'latest' ? 'latest' : 'popular')
const routePage = computed(() => {
  const value = Number(route.query.page)
  return Number.isSafeInteger(value) && value > 0 ? value : 1
})
const { tag, products, total, pages, currentPage, loading, loadingMore, error, moreError, notFound, reset, loadMore } = useTagProducts(getProductsByTag)
const tagName = computed(() => locale.value.startsWith('zh') ? tag.value?.nameZh?.trim() || tag.value?.name || slug.value : tag.value?.name || slug.value)
const localizedPath = (path: string) => addLocaleToPath(path, locale.value)
const tagPath = (value: TagSort) => localizedPath(`/explore/tag/${encodeURIComponent(slug.value)}/${value}`)
const pagePath = (page: number) => ({ path: tagPath(sort.value), query: page > 1 ? { page: String(page) } : {} })
const reload = () => reset(slug.value, sort.value, routePage.value)

watch([slug, sort, routePage, locale], reload, { immediate: true })
</script>

<style scoped>
.tag-page { padding-bottom: 72px; min-height: 60vh; }
.tag-hero { max-width: 1200px; margin: 0 auto; padding: 42px 32px 0; }
.back-link { color: #64748b; font-size: 14px; text-decoration: none; }
.tag-kicker { margin: 34px 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: .14em; color: #64748b; }
h1 { margin: 0; font-size: clamp(32px, 5vw, 54px); letter-spacing: -.04em; line-height: 1.15; overflow-wrap: anywhere; color: #172033; }
.tag-description { margin: 18px 0 32px; color: #64748b; line-height: 1.6; }
.tag-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; font-size: 14px; color: #64748b; }
.sort-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: #f1f3f5; }
.sort-tabs a { padding: 8px 18px; border-radius: 999px; color: #64748b; text-decoration: none; white-space: nowrap; }
.sort-tabs a.active { color: #fff; background: #172033; }
.tag-state { padding: 64px 24px; text-align: center; color: #64748b; }
.tag-state h2 { font-size: 24px; color: #172033; }
.tag-state a, .mobile-pagination a { color: #334155; }
button, .tag-pagination a { border: 1px solid #cbd5e1; border-radius: 999px; background: white; color: #334155; padding: 10px 20px; font: inherit; cursor: pointer; text-decoration: none; }
button:disabled { opacity: .6; cursor: wait; }
a:focus-visible, button:focus-visible { outline: 2px solid #475569; outline-offset: 4px; }
.tag-pagination { display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 28px; color: #64748b; font-size: 14px; }
.mobile-pagination { display: none; }
@media (max-width: 767px) {
  .tag-hero { padding: 28px 22px 0; }
  .tag-kicker { margin-top: 28px; }
  .tag-toolbar { gap: 10px; flex-wrap: wrap; }
  .sort-tabs a { padding: 8px 14px; }
  .tag-pagination { display: none; }
  .mobile-pagination { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; color: #64748b; text-align: center; }
}
</style>
