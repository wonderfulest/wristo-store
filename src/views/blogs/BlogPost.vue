<template>
  <div class="blog-container">
    <div class="blog-main">
      <div class="page-header">
        <div class="header-actions">
          <button
            class="toc-toggle"
            type="button"
            :aria-expanded="!sidebarCollapsed"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <Icon icon="solar:book-bookmark-line-duotone" width="18" height="18" aria-hidden="true" />
            <span v-if="sidebarCollapsed">{{ uiText.topics }}</span>
            <span v-else>{{ uiText.hideTopics }}</span>
          </button>
        </div>
      </div>

      <div class="layout" :class="{ collapsed: sidebarCollapsed }">
        <aside class="sidebar">
          <div class="toc">
            <TreeNode
              v-for="n in tree"
              :key="`${currentLang || 'default'}-${n.id}`"
              :node="n"
              :level="0"
              :active-id="activeNodeId"
              @select="handleSelect"
            />
          </div>
        </aside>

        <main class="content">
          <div v-if="loading" class="state-card loading">
            <span class="spinner" />
            <span>{{ uiText.loading }}</span>
          </div>

          <div v-else-if="error" class="state-card error">
            <Icon icon="solar:danger-triangle-line-duotone" width="22" height="22" aria-hidden="true" />
            <div>
              <div class="state-title">{{ uiText.failedTitle }}</div>
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

            <div v-if="firstTr.summary" class="summary">{{ firstTr.summary }}</div>

            <div class="content-body" v-html="firstTr.contentHtml"></div>
          </article>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlogPostBySlug, getBlogPostByLangSlug, getBlogTocTree } from '@/api/blog'
import {
  DEFAULT_FAQ_GUIDE_LANG,
  buildFaqGuidePath,
  getDefaultFaqGuidePathForLocale,
  getDefaultFaqGuidePost,
  getFaqGuidePathForLocale,
} from '@/content/faq-guides'
import type { BlogPostVO, BlogPostTranslationVO, BlogPostTocItemVO } from '@/types'
import TreeNode from '@/components/blog/TreeNode.vue'
import { Icon } from '@iconify/vue'
import { applySeo, blogSeo } from '@/seo'
import { normalizeLocale, useLocaleStore } from '@/store/locale'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const loading = ref(true)
const error = ref('')
const post = ref<BlogPostVO | null>(null)
// toc state
const tree = ref<BlogPostTocItemVO[]>([])
const activeNodeId = ref<number | undefined>(undefined)
const sidebarCollapsed = ref(false)

const currentLang = computed(() => {
  const langParamRaw = route.params.lang
  const langParam = Array.isArray(langParamRaw) ? langParamRaw[0] : (typeof langParamRaw === 'string' ? langParamRaw : undefined)
  const langQ = route.query.lang
  const queryLang = Array.isArray(langQ) ? (langQ[0] ?? undefined) : (typeof langQ === 'string' && langQ ? langQ : undefined)
  return langParam || queryLang || localeStore.currentLocale
})

const uiText = computed(() => {
  if (currentLang.value === 'zh') {
    return {
      topics: 'FAQ 主题',
      hideTopics: '隐藏主题',
      loading: '正在加载 FAQ 指南...',
      failedTitle: '加载失败',
    }
  }
  return {
    topics: 'FAQ topics',
    hideTopics: 'Hide topics',
    loading: 'Loading FAQ guide...',
    failedTitle: 'Failed to load',
  }
})

const firstTr = computed<BlogPostTranslationVO | null>(() => {
  if (!post.value?.translations?.length) return null
  const match = post.value.translations.find(t => currentLang.value && t.lang === currentLang.value)
  return match || post.value.translations.find(t => t.lang === DEFAULT_FAQ_GUIDE_LANG) || post.value.translations[0]
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
  return buildFaqGuidePath(t.lang, t.slug)
}

function setBlogSeo() {
  if (!post.value || !firstTr.value) return
  applySeo(blogSeo(post.value, firstTr.value, buildTranslationUrl(firstTr.value)))
}

function isFaqGuideMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '')
  return message.includes('FAQ guide not found')
}

function redirectToDefaultFaq(activeLang: string) {
  const nextPath = getDefaultFaqGuidePathForLocale(activeLang)
  if (nextPath && nextPath !== route.path) {
    router.replace({ path: nextPath, query: route.query, hash: route.hash })
  }
}

async function loadCurrentPost() {
  const slugRaw = route.params.slug
  const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw
  const langParamRaw = route.params.lang
  const langParam = Array.isArray(langParamRaw) ? langParamRaw[0] : (typeof langParamRaw === 'string' ? langParamRaw : undefined)
  const langQ = route.query.lang
  const queryLang = Array.isArray(langQ) ? (langQ[0] ?? undefined) : (typeof langQ === 'string' && langQ ? langQ : undefined)

  const activeLang = langParam || queryLang || localeStore.currentLocale
  try {
    if (slug) {
      post.value = langParam
        ? await getBlogPostByLangSlug(langParam, slug || '')
        : await getBlogPostBySlug(slug || '', activeLang)
    } else {
      post.value = getDefaultFaqGuidePost(activeLang)
    }
  } catch (e) {
    if (isFaqGuideMissing(e)) {
      post.value = getDefaultFaqGuidePost(DEFAULT_FAQ_GUIDE_LANG)
      redirectToDefaultFaq(activeLang)
      return activeLang
    }
    throw e
  }
  return activeLang
}

onMounted(async () => {
  sidebarCollapsed.value = window.innerWidth <= 640

  try {
    const activeLang = await loadCurrentPost()
    setBlogSeo()
    console.debug('[BlogPost] onMounted: will refreshTree', { lang: activeLang, route: route.fullPath })
    try {
      await refreshTree(activeLang)
      console.debug('[BlogPost] onMounted: refreshTree done', { size: tree.value.length, activeId: activeNodeId.value })
    } catch (e) {
      console.error('[BlogPost] onMounted: refreshTree failed', e)
    }
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
    const activeLang = await loadCurrentPost()
    setBlogSeo()
    await refreshTree(activeLang)
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
})

function handleSelect(n: BlogPostTocItemVO) {
  activeNodeId.value = n.id
  const p = n.post
  if (p && (p.url || p.slug)) {
    const lang = normalizeLocale(currentLang.value)
    localeStore.setLocale(lang)
    const localizedSlug = p.translations?.find(t => t.lang === lang && t.slug)?.slug
    if (localizedSlug) {
      router.push(buildFaqGuidePath(lang, localizedSlug))
    } else if (p.slug) {
      router.push(buildFaqGuidePath(lang, p.slug))
    } else if (p.url) {
      router.push(getFaqGuidePathForLocale(p.url, lang))
    }
  }
}

async function refreshTree(lang?: string) {
  console.debug('[BlogPost] refreshTree start', { lang: lang })
  const useLang = lang ?? currentLang.value
  const data = await getBlogTocTree({ parentId: -1 }, useLang || undefined)
  tree.value = data
  const path = window.location.pathname
  const findNode = (nodes: BlogPostTocItemVO[]): BlogPostTocItemVO | null => {
    for (const n of nodes) {
      const p = n.post
      if (p?.id && post.value?.id && p.id === post.value.id) return n
      if (p?.url && p.url === path) return n
      if (p?.slug) {
        if (useLang && path === buildFaqGuidePath(useLang, p.slug)) return n
        if (!useLang && path === buildFaqGuidePath(undefined, p.slug)) return n
      }
      if (n.children?.length) {
        const r = findNode(n.children)
        if (r) return r
      }
    }
    return null
  }
  const matched = findNode(tree.value)
  if (matched) activeNodeId.value = matched.id
  console.debug('[BlogPost] refreshTree done', { size: tree.value.length, activeId: activeNodeId.value })
}

</script>

<style scoped>
.blog-container {
  min-height: 100vh;
  --blog-sticky-gap: 0px;
  --blog-toolbar-height: 60px;
  background:
    radial-gradient(520px 260px at 12% 0%, rgba(15, 107, 104, 0.08), transparent 70%),
    linear-gradient(180deg, #f8fafc 0%, #fff 240px);
  /* Reset global #app text-align so this page uses default alignment */
  text-align: initial;
}

.blog-main { max-width: 1200px; margin: 0 auto; padding: 18px 20px 80px 20px; }
.page-header { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-bottom: 12px; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.toc-toggle {
  appearance: none;
  border: 1px solid rgba(15, 107, 104, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  color: var(--color-ink);
  padding: 9px 13px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  transition: all .2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}
.toc-toggle:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(15, 23, 42, 0.10); color: var(--color-brand-strong); }
.toc-toggle:active { transform: translateY(0); }
.header-actions :deep(.lang-switcher) {
  margin: 0;
}

.layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
.layout.collapsed { grid-template-columns: 1fr; }
.layout.collapsed .sidebar { display: none; }
.sidebar {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  align-self: start;
  position: sticky;
  top: 92px;
  max-height: calc(100dvh - 110px);
  overflow: auto;
}
.toc { display: block; }
.tree-node { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
.toggle { appearance: none; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 12px; padding: 2px; }
.node-btn { appearance: none; border: 1px solid #e5e7eb; background: #ffffffcc; color: #334155; padding: 6px 8px; border-radius: 10px; font-weight: 600; transition: all .2s ease; text-align: left; flex: 1; }
.node-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.node-btn.active { color: #fff; border-color: #3b82f6; background: linear-gradient(180deg, #60a5fa, #3b82f6); box-shadow: 0 2px 8px rgba(59,130,246,0.35); }

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
.state-title {
  font-weight: 700;
}
.state-desc {
  font-weight: 500;
  opacity: .8;
}

.blog-article {
  background: #fff;
  /* border-radius: 24px; */
  /* box-shadow: 0 2px 12px rgba(0,0,0,0.06); */
  /* border: 1px solid #e5e7eb; */
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
  letter-spacing: 0;
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
.content { background: rgba(255, 255, 255, 0.94); border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 18px; padding: 0; box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08); overflow: hidden; }
.content-body { padding: 18px 24px 28px 24px; color: #111827; }
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
  .blog-container {
    background:
      radial-gradient(360px 220px at 50% -40px, rgba(15, 107, 104, 0.12), transparent 70%),
      linear-gradient(180deg, #f8fafc 0%, #fff 250px);
  }
  .blog-main { padding: 0 12px 44px; }
  .page-header {
    position: sticky;
    top: 0;
    z-index: 18;
    justify-content: stretch;
    margin: 0 -2px 8px;
    padding: 8px 0 10px;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.72));
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .header-actions { width: 100%; gap: 8px; justify-content: space-between; flex-wrap: nowrap; }
  .toc-toggle {
    min-height: 42px;
    padding: 0 13px;
    border-radius: 14px;
    font-size: 0.9rem;
    flex: 0 0 auto;
  }
  .header-actions :deep(.lang-switcher) {
    min-width: 0;
    flex: 1 1 auto;
    justify-content: flex-end;
    padding: 8px 10px;
    border-radius: 14px;
    overflow: hidden;
  }
  .header-actions :deep(.buttons) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .header-actions :deep(.buttons::-webkit-scrollbar) {
    display: none;
  }

  .layout { display: block; }
  .layout.collapsed { grid-template-columns: 1fr; }
  .layout.collapsed .sidebar { display: none; }
  .sidebar {
    position: sticky;
    top: var(--blog-toolbar-height);
    z-index: 8;
    max-height: min(52dvh, 420px);
    overflow: auto;
    padding: 10px;
    border-radius: 16px;
    margin-bottom: 12px;
    box-shadow: 0 18px 38px rgba(15, 23, 42, 0.10);
  }
  .toc { max-height: none; overflow: visible; }

  /* TreeNode touch-friendly but compact */
  .tree-node { gap: 4px; margin: 1px 0; }
  .toggle { font-size: 12px; padding: 2px; }
  .node-btn { padding: 6px 8px; font-size: 0.92rem; border-radius: 10px; }

  /* Article */
  .hero {
    margin: 0;
    border-radius: 0;
    aspect-ratio: 4 / 3;
  }
  .title {
    font-size: clamp(1.55rem, 8vw, 2.15rem);
    line-height: 1.12;
    padding: 18px 16px 0;
  }
  .meta {
    padding: 12px 16px 4px;
    gap: 12px;
    align-items: flex-start;
  }
  .author { width: 100%; }
  .avatar { width: 34px; height: 34px; }
  .chips {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .chips::-webkit-scrollbar { display: none; }
  .chip { flex: 0 0 auto; }
  .summary {
    margin: 10px 16px 0;
    padding: 12px 13px;
    border-radius: 14px;
    font-size: 0.96rem;
    line-height: 1.65;
  }
  .content {
    border-radius: 18px;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
  }
  .content-body { padding: 16px 16px 24px; }
  .content :deep(h1),
  .content :deep(h2),
  .content :deep(h3),
  .content :deep(h4) {
    line-height: 1.18;
    margin: 1.25em 0 0.55em;
  }
  .content :deep(p),
  .content :deep(ul),
  .content :deep(ol) { font-size: 1rem; line-height: 1.78; }
  .content :deep(img) { border-radius: 10px; }
  .content :deep(table) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .content :deep(th),
  .content :deep(td) {
    min-width: 120px;
    padding: 9px 10px;
  }
}

@media (max-width: 380px) {
  .blog-main { padding-left: 10px; padding-right: 10px; }
  .title { font-size: 1.48rem; }
  .content-body { padding-left: 14px; padding-right: 14px; }
}
</style>
