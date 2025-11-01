<template>
  <div class="blog-container">

    <div class="blog-main">
      <div v-if="loading" class="state-card loading">
        <span class="spinner" />
        <span>Loading article…</span>
      </div>

      <div v-else-if="error" class="state-card error">
        <span class="state-emoji">⚠️</span>
        <div>
          <div class="state-title">Failed to load</div>
          <div class="state-desc">{{ error }}</div>
        </div>
      </div>

      <article v-else-if="post && firstTr" class="blog-article">
        <div class="hero" v-if="post.coverImageUrl">
          <img class="hero-img" :src="post.coverImageUrl" :alt="firstTr.title" />
        </div>

        <h1 class="title">{{ firstTr.title }}</h1>

        <div class="meta">
          <div class="author" v-if="post.author">
            <img v-if="post.author.avatar" class="avatar" :src="post.author.avatar" :alt="post.author.nickname || post.author.username" />
            <div class="author-info">
              <div class="name">{{ post.author.nickname || post.author.username }}</div>
              <div class="date">{{ formattedDate }}</div>
            </div>
          </div>
          <div class="chips">
            <span v-if="post.category" class="chip">{{ post.category.name }}</span>
            <span v-for="t in post.tags" :key="t.id" class="chip">#{{ t.name }}</span>
          </div>
        </div>

        <LanguageSwitcher
          v-if="post && post.translations && post.translations.length"
          :translations="post.translations"
        />

        <div v-if="firstTr.summary" class="summary">{{ firstTr.summary }}</div>

        <div class="content" v-html="firstTr.contentHtml"></div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getBlogPostBySlug, getBlogPostByLangSlug } from '@/api/blog'
import type { BlogPostVO, BlogPostTranslationVO } from '@/types'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const post = ref<BlogPostVO | null>(null)
const createdSeoLinks: HTMLLinkElement[] = []

const currentLang = computed(() => {
  const langParamRaw = route.params.lang
  const langParam = Array.isArray(langParamRaw) ? langParamRaw[0] : (typeof langParamRaw === 'string' ? langParamRaw : undefined)
  const langQ = route.query.lang
  const queryLang = Array.isArray(langQ) ? (langQ[0] ?? undefined) : (typeof langQ === 'string' && langQ ? langQ : undefined)
  return langParam || queryLang
})

const firstTr = computed<BlogPostTranslationVO | null>(() => {
  if (!post.value?.translations?.length) return null
  const match = post.value.translations.find(t => currentLang.value && t.lang === currentLang.value)
  return match || post.value.translations[0]
})

const formattedDate = computed(() => {
  if (!post.value?.publishedAt) return ''
  try {
    const d = new Date(post.value.publishedAt)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
})

function buildTranslationUrl(t: BlogPostTranslationVO): string {
  if (t.url) return t.url
  // Fallback build: /:lang/blog/:slug
  return `/${encodeURIComponent(t.lang)}/blog/${encodeURIComponent(t.slug)}`
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
  if (!post.value || !post.value.translations?.length) return
  // clear previous
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0
  const origin = window.location.origin
  const currentPath = window.location.pathname

  // canonical: prefer exact match for current lang+slug if present
  const currentLang = typeof route.params.lang === 'string' ? route.params.lang : undefined
  let canonicalHref = origin + currentPath
  if (currentLang) {
    const match = post.value.translations.find(t => t.lang === currentLang)
    if (match) canonicalHref = origin + buildTranslationUrl(match)
  }
  ensureLink('canonical', canonicalHref)

  // alternates for each translation
  for (const t of post.value.translations) {
    ensureLink('alternate', origin + buildTranslationUrl(t))
      .setAttribute('hreflang', t.lang)
  }
  // x-default -> default to first translation or current path without lang
  const xDefault = origin + (post.value.translations[0] ? buildTranslationUrl(post.value.translations[0]) : currentPath)
  const xDefaultEl = ensureLink('alternate', xDefault)
  xDefaultEl.setAttribute('hreflang', 'x-default')
}

onMounted(async () => {
  try {
    const slugRaw = route.params.slug
    const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw
    const langParamRaw = route.params.lang
    const langParam = Array.isArray(langParamRaw) ? langParamRaw[0] : (typeof langParamRaw === 'string' ? langParamRaw : undefined)
    const langQ = route.query.lang
    const queryLang = Array.isArray(langQ) ? (langQ[0] ?? undefined) : (typeof langQ === 'string' && langQ ? langQ : undefined)

    if (langParam) {
      post.value = await getBlogPostByLangSlug(langParam, slug || '')
    } else {
      post.value = await getBlogPostBySlug(slug || '', queryLang)
    }
    setSeoLinks()
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
})

watch(() => route.fullPath, async () => {
  loading.value = true
  error.value = ''
  try {
    const slugRaw = route.params.slug
    const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw
    const langParamRaw = route.params.lang
    const langParam = Array.isArray(langParamRaw) ? langParamRaw[0] : (typeof langParamRaw === 'string' ? langParamRaw : undefined)
    const langQ = route.query.lang
    const queryLang = Array.isArray(langQ) ? (langQ[0] ?? undefined) : (typeof langQ === 'string' && langQ ? langQ : undefined)

    if (langParam) {
      post.value = await getBlogPostByLangSlug(langParam, slug || '')
    } else {
      post.value = await getBlogPostBySlug(slug || '', queryLang)
    }
    setSeoLinks()
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  // Clean up injected SEO link tags
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0
})
</script>

<style scoped>
.blog-container {
  min-height: 100vh;
  background: #fff;
  /* Reset global #app text-align so this page uses default alignment */
  text-align: initial;
}

.blog-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px 20px 80px 20px;
}

.state-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
}
.state-card.loading {
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  border-top-color: #2563eb;
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

.state-card.error {
  background: linear-gradient(180deg, #fff7ed, #fffbeb);
  border-color: #fed7aa;
  color: #9a3412;
}
.state-emoji {
  font-size: 18px;
}
.state-title {
  font-weight: 700;
}
.state-desc {
  font-weight: 500;
  opacity: .8;
}

.blog-article {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.hero {
  width: 100%;
  aspect-ratio: 16/9;
  background: #f3f4f6;
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  padding: 20px 24px 0 24px;
  color: #0f172a;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px 8px 24px;
  gap: 12px;
  flex-wrap: wrap;
}
.author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
}
.author-info .name {
  font-weight: 700;
  color: #0f172a;
}
.author-info .date {
  font-size: 0.9rem;
  color: #64748b;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.85rem;
  color: #334155;
}
.summary {
  margin: 6px 24px 0 24px;
  padding: 12px 14px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #334155;
}
.content {
  padding: 18px 24px 28px 24px;
  color: #111827;
}
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  color: #0f172a;
  font-weight: 800;
  margin: 1.4em 0 0.6em;
}
.content :deep(p),
.content :deep(ul),
.content :deep(ol) {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #111827;
  margin: 0.9em 0;
}
.content :deep(img) {
  max-width: 100%;
  border-radius: 14px;
  display: block;
  margin: 10px auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

/* Ensure embedded media in v-html content are responsive: width 100%, height = 66% of width */
.content :deep(video),
.content :deep(iframe) {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 100 / 66; /* 66% of width */
  height: auto;
  display: block;
}

/* Table rendering for v-html content: add subtle borders without overriding inline styles */
.content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}
.content :deep(th),
.content :deep(td) {
  border: 2px solid #e5e7eb;
  padding: 8px 10px;
  vertical-align: top;
  text-align: left;
}
.content :deep(thead th) {
  background: #f8fafc;
}

@media (max-width: 640px) {
  .title { font-size: 1.6rem; padding: 16px 16px 0 16px; }
  .meta { padding: 10px 16px 6px 16px; }
  .content { padding: 14px 16px 22px 16px; }
}
</style>
