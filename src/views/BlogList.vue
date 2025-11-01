<template>
  <div class="bloglist-container">
    <div class="bloglist-main">
      <div class="header">
        <h1 class="title">Blog</h1>
        <p class="subtitle">Latest articles and guides</p>
      </div>

      <div v-if="loading" class="state-card loading">
        <span class="spinner" />
        <span>Loading…</span>
      </div>
      <div v-else-if="error" class="state-card error">
        <span class="state-emoji">⚠️</span>
        <div>
          <div class="state-title">Failed to load</div>
          <div class="state-desc">{{ error }}</div>
        </div>
      </div>

      <div v-else class="grid">
        <article v-for="item in items" :key="item.id" class="card">
          <router-link class="cover" :to="postUrl(item)">
            <img v-if="item.coverImageUrl" :src="item.coverImageUrl" :alt="firstTitle(item)" />
          </router-link>
          <div class="content">
            <router-link class="card-title" :to="postUrl(item)">{{ firstTitle(item) }}</router-link>
            <p v-if="firstSummary(item)" class="summary">{{ firstSummary(item) }}</p>
            <div class="meta">
              <span v-if="item.category" class="chip">{{ item.category.name }}</span>
              <span v-for="t in (item.tags || [])" :key="t.id" class="chip">#{{ t.name }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getBlogList } from '@/api/blog'
import type { BlogPostVO, BlogPostTranslationVO } from '@/types'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const items = ref<BlogPostVO[]>([])
const createdSeoLinks: HTMLLinkElement[] = []

const currentLang = computed(() => {
  const p = route.params.lang
  const fromParam = Array.isArray(p) ? p[0] : (typeof p === 'string' ? p : undefined)
  const q = route.query.lang
  const fromQuery = Array.isArray(q) ? (q[0] ?? undefined) : (typeof q === 'string' && q ? q : undefined)
  return fromParam || fromQuery
})

function firstTr(item: BlogPostVO): BlogPostTranslationVO | undefined {
  if (!item?.translations?.length) return undefined
  const match = currentLang.value ? item.translations.find(t => t.lang === currentLang.value) : undefined
  return match || item.translations[0]
}
function firstTitle(item: BlogPostVO): string { return firstTr(item)?.title || '' }
function firstSummary(item: BlogPostVO): string { return firstTr(item)?.summary || '' }

function postUrl(item: BlogPostVO): string {
  const tr = firstTr(item)
  if (!tr) return '#'
  if (currentLang.value) return `/${encodeURIComponent(currentLang.value)}/blog/${encodeURIComponent(tr.slug)}`
  return `/blog/${encodeURIComponent(tr.slug)}`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const lang = currentLang.value
    const res = await getBlogList({ lang: lang || undefined, page: 1, pageSize: 20 }) as any
    items.value = Array.isArray(res) ? res : (res.items || [])
    setSeoLinks()
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function ensureLink(rel: string, href: string): HTMLLinkElement {
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  document.head.appendChild(link)
  createdSeoLinks.push(link)
  return link
}

function setSeoLinks() {
  // clear previous
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0

  const origin = window.location.origin
  const path = currentLang.value ? `/${encodeURIComponent(currentLang.value)}/blog` : '/blog'
  const canonical = origin + path
  ensureLink('canonical', canonical)

  const langs = ['en', 'zh-cn', 'ja']
  for (const l of langs) {
    const href = origin + `/${encodeURIComponent(l)}/blog`
    const el = ensureLink('alternate', href)
    el.setAttribute('hreflang', l)
  }
  const xd = ensureLink('alternate', origin + '/blog')
  xd.setAttribute('hreflang', 'x-default')
}

onMounted(load)
watch(() => route.fullPath, load)

onBeforeUnmount(() => {
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0
})
</script>

<style scoped>
.bloglist-container { min-height: 100vh; background: #fff; text-align: initial; }
.bloglist-main { max-width: 1000px; margin: 0 auto; padding: 20px 20px 80px; }
.header { padding: 6px 4px 14px; }
.title { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; }
.subtitle { color: #475569; margin-top: 4px; }

.state-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px; border: 1px solid #e5e7eb; background: #f8fafc; color: #334155; font-weight: 600; }
.state-card.loading { background: linear-gradient(180deg, #f8fafc, #f1f5f9); }
.spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; border-top-color: #2563eb; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.state-card.error { background: linear-gradient(180deg, #fff7ed, #fffbeb); border-color: #fed7aa; color: #9a3412; }
.state-emoji { font-size: 18px; }
.state-title { font-weight: 700; }
.state-desc { font-weight: 500; opacity: .8; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
.cover { display: block; width: 100%; aspect-ratio: 16/9; background: #f3f4f6; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.content { padding: 12px 14px 14px; }
.card-title { display: inline-block; font-weight: 800; color: #0f172a; font-size: 1.05rem; text-decoration: none; }
.card-title:hover { color: #2563eb; }
.summary { color: #334155; margin: 8px 0 10px; }
.meta { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 0.8rem; color: #334155; }

@media (max-width: 1024px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .title { font-size: 1.6rem; } .bloglist-main { padding: 16px; } }
</style>
