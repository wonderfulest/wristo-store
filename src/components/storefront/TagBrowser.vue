<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getProductTagTree, type ProductTagTreeNode } from '@/api/product'
import { useI18n } from '@/i18n'
import { addLocaleToPath } from '@/store/locale'

const { locale, t } = useI18n()
const groups = ref<ProductTagTreeNode[]>([])
const loading = ref(true)
const error = ref(false)
const label = (item: { name: string; nameZh?: string | null }) =>
  locale.value.startsWith('zh') ? item.nameZh || item.name : item.name
const tagPath = (slug: string) => addLocaleToPath(`/explore/tag/${encodeURIComponent(slug)}/popular`, locale.value)
const load = async () => {
  loading.value = true
  error.value = false
  try {
    groups.value = await getProductTagTree()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <section id="browse-tags" class="tag-browser" aria-labelledby="tag-browser-title">
    <h2 id="tag-browser-title">{{ locale.startsWith('zh') ? '按标签浏览' : 'Browse by tag' }}</h2>
    <p v-if="loading" role="status">{{ t('search.loading') }}</p>
    <div v-else-if="error" role="alert">
      <p>{{ t('search.error') }}</p>
      <button type="button" @click="load">{{ t('search.retry') }}</button>
    </div>
    <div v-else class="tag-groups">
      <section v-for="group in groups" :key="group.slug" class="tag-group">
        <h3><router-link :to="tagPath(group.slug)">{{ label(group) }} →</router-link></h3>
        <ul>
          <li v-for="tag in group.children" :key="tag.id">
            <router-link :to="tagPath(tag.slug)">{{ label(tag) }}</router-link>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.tag-browser { margin: 32px 0; color: #172033; scroll-margin-top: 90px; }
.tag-browser h2 { font-size: 26px; margin-bottom: 24px; }
.tag-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.tag-group { padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; }
.tag-group h3 { margin: 0 0 14px; font-size: 16px; }
.tag-group ul { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; }
.tag-group li a { display: block; border-radius: 999px; padding: 7px 12px; background: #f1f3f5; font-size: 14px; }
a { color: inherit; text-decoration: none; }
a:hover { color: #475569; text-decoration: underline; }
a:focus-visible, button:focus-visible { outline: 2px solid #475569; outline-offset: 4px; }
</style>
