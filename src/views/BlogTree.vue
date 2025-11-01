<template>
  <div class="blogtree-container">
    <div class="blogtree-main">
      <div class="page-header">
        <div class="titles">
          <h1 class="title">Blog</h1>
          <p class="subtitle">Browse by topics and read articles</p>
        </div>
        <LanguageSwitcher v-if="hasAnyTranslations" :translations="sampleTranslations" />
      </div>

      <div class="layout">
        <aside class="sidebar">
          <div class="toc">
            <TreeNode
              v-for="n in tree"
              :key="n.id"
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
            <span>Loading…</span>
          </div>
          <div v-else-if="error" class="state-card error">
            <span class="state-emoji">⚠️</span>
            <div>
              <div class="state-title">Failed to load</div>
              <div class="state-desc">{{ error }}</div>
            </div>
          </div>
          <article v-else-if="currentPost" class="article">
            <h2 class="article-title">{{ currentPost.title }}</h2>
            <div v-if="currentPost.summary" class="summary">{{ currentPost.summary }}</div>
            <div class="article-body" v-html="currentPost.contentHtml"></div>
          </article>
          <div v-else class="placeholder">
            <div class="ph-title">Select an article from the left</div>
            <div class="ph-desc">Explore the tree to discover topics and guides.</div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlogTocTree } from '@/api/blog'
import type { BlogPostTocItemVO, BlogPostVO, BlogPostTranslationVO } from '@/types'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const tree = ref<BlogPostTocItemVO[]>([])
const activeNodeId = ref<number | undefined>(undefined)
const createdSeoLinks: HTMLLinkElement[] = []

const currentLang = computed(() => {
  const p = route.params.lang
  const fromParam = Array.isArray(p) ? p[0] : (typeof p === 'string' ? p : undefined)
  const q = route.query.lang
  const fromQuery = Array.isArray(q) ? (q[0] ?? undefined) : (typeof q === 'string' && q ? q : undefined)
  return fromParam || fromQuery
})

const firstNodeWithPost = computed<BlogPostTocItemVO | null>(() => {
  const queue: BlogPostTocItemVO[] = [...tree.value]
  while (queue.length) {
    const n = queue.shift()!
    if (n.post && (n.post.title || n.post.contentHtml)) return n
    if (n.children?.length) queue.push(...n.children)
  }
  return null
})

const currentPost = computed<BlogPostVO | null>(() => {
  if (!tree.value.length) return null
  const findById = (nodes: BlogPostTocItemVO[], id: number | null): BlogPostTocItemVO | null => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children?.length) {
        const r = findById(n.children, id)
        if (r) return r
      }
    }
    return null
  }
  const node = activeNodeId.value !== undefined ? findById(tree.value, activeNodeId.value as number) : firstNodeWithPost.value
  return node?.post || null
})

const hasAnyTranslations = computed(() => !!currentPost.value?.translations?.length)
const sampleTranslations = computed<BlogPostTranslationVO[]>(() => currentPost.value?.translations || [])

function ensureLink(rel: string, href: string): HTMLLinkElement {
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  document.head.appendChild(link)
  createdSeoLinks.push(link)
  return link
}

function setSeoLinks() {
  // Clear previous
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0

  const origin = window.location.origin
  const base = currentLang.value ? `/${encodeURIComponent(currentLang.value)}/blog` : '/blog'
  ensureLink('canonical', origin + base)
  const langs = ['en', 'zh-cn', 'ja']
  for (const l of langs) {
    const el = ensureLink('alternate', origin + `/${encodeURIComponent(l)}/blog`)
    el.setAttribute('hreflang', l)
  }
  const xd = ensureLink('alternate', origin + '/blog')
  xd.setAttribute('hreflang', 'x-default')
}

async function loadTree() {
  loading.value = true
  error.value = ''
  try {
    const lang = currentLang.value
    const res = await getBlogTocTree({ parentId: -1 }, lang || undefined)
    tree.value = (res?.data as BlogPostTocItemVO[]) || []
    setSeoLinks()
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function handleSelect(n: BlogPostTocItemVO) {
  activeNodeId.value = n.id
  // If node has a translated URL or slug in post.translations, navigate to detail when available
  const p = n.post
  if (p && (p.url || p.slug)) {
    const lang = currentLang.value
    if (p.url) {
      router.push(p.url)
    } else if (lang && p.slug) {
      router.push(`/${encodeURIComponent(lang)}/blog/${encodeURIComponent(p.slug)}`)
    } else if (p.slug) {
      router.push(`/blog/${encodeURIComponent(p.slug)}`)
    }
  }
}

onMounted(loadTree)
watch(() => route.fullPath, loadTree)

onBeforeUnmount(() => {
  for (const el of createdSeoLinks) {
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  createdSeoLinks.length = 0
})

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object as () => BlogPostTocItemVO, required: true },
    level: { type: Number, required: true },
    activeId: { type: Number, required: false }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const expanded = ref(true)
    const isActive = computed(() => props.activeId === props.node.id)
    const onClick = () => emit('select', props.node)
    const toggle = () => (expanded.value = !expanded.value)
    return { expanded, isActive, onClick, toggle, props }
  },
  template: `
    <div class="tree-node" :style="{ paddingLeft: 8 + level * 14 + 'px' }">
      <button class="toggle" v-if="props.node.children && props.node.children.length" @click.stop="toggle">
        <span v-if="expanded">▾</span>
        <span v-else>▸</span>
      </button>
      <button class="node-btn" :class="{ active: isActive }" @click="onClick">
        {{ props.node.title || (props.node.post && props.node.post.title) || 'Untitled' }}
      </button>
    </div>
    <div v-show="expanded" v-if="props.node.children && props.node.children.length">
      <TreeNode
        v-for="c in props.node.children"
        :key="c.id"
        :node="c"
        :level="(level as number) + 1"
        :active-id="activeId"
        @select="$emit('select', $event)"
      />
    </div>
  `
})
</script>

<style scoped>
.blogtree-container { min-height: 100vh; background: #fff; text-align: initial; }
.blogtree-main { max-width: 1200px; margin: 0 auto; padding: 20px 20px 80px; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.titles .title { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; }
.titles .subtitle { color: #475569; margin-top: 4px; }

.layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
.sidebar { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.toc { display: block; }
.tree-node { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
.toggle { appearance: none; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 12px; padding: 2px; }
.node-btn { appearance: none; border: 1px solid #e5e7eb; background: #ffffffcc; color: #334155; padding: 6px 8px; border-radius: 10px; font-weight: 600; transition: all .2s ease; text-align: left; flex: 1; }
.node-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.node-btn.active { color: #fff; border-color: #3b82f6; background: linear-gradient(180deg, #60a5fa, #3b82f6); box-shadow: 0 2px 8px rgba(59,130,246,0.35); }

.content { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.article-title { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
.summary { margin: 6px 0 10px; padding: 10px 12px; background: linear-gradient(180deg, #f8fafc, #eef2ff); border: 1px solid #e2e8f0; border-radius: 12px; color: #334155; }
.article-body { color: #111827; }
.article-body :deep(img) { max-width: 100%; border-radius: 12px; display: block; margin: 10px auto; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

.placeholder { padding: 40px 12px; text-align: center; color: #475569; }
.ph-title { font-weight: 800; color: #0f172a; }

.state-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px; border: 1px solid #e5e7eb; background: #f8fafc; color: #334155; font-weight: 600; }
.state-card.loading { background: linear-gradient(180deg, #f8fafc, #f1f5f9); }
.spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; border-top-color: #2563eb; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.state-card.error { background: linear-gradient(180deg, #fff7ed, #fffbeb); border-color: #fed7aa; color: #9a3412; }

@media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }
</style>
