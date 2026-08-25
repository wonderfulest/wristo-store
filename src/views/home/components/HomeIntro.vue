<template>
  <section class="catalog-intro" :aria-label="t('nav.search')">
    <div class="storefront-container">
      <SearchSection
        class="catalog-intro__search"
        :initial-search-term="searchTerm"
        :placeholder="t('search.placeholder')"
        :show-submit="true"
        :submit-label="t('nav.search')"
        variant="compact"
        @submit="submitSearch"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import SearchSection from '@/views/home/components/SearchSection.vue'

const router = useRouter()
const localeStore = useLocaleStore()
const { t } = useI18n()
const searchTerm = ref('')

const submitSearch = (term: string) => {
  const q = term.trim()
  const path = addLocaleToPath('/search', localeStore.currentLocale)
  return router.push(q ? { path, query: { q } } : { path })
}
</script>

<style scoped>
.catalog-intro {
  padding: clamp(28px, 5vw, 54px) 0 0;
  background: #f7f8f5;
}
.catalog-intro__search { width: 100%; }
@media (max-width: 760px) {
  .catalog-intro { padding-top: 18px; }
  .catalog-intro__search { min-width: 0; }
}
</style>
