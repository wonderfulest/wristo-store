<template>
  <div class="lang-switcher" role="navigation" aria-label="Language Switcher">
    <span class="label">Language</span>
    <div class="buttons">
      <button
        v-for="t in normalized"
        :key="t.lang"
        class="pill"
        :class="{ active: t.lang === currentLang }"
        type="button"
        @click="switchLanguage(t.lang)"
      >
        {{ t.lang.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { BlogPostTranslationVO } from '@/types'

const props = defineProps<{ translations: BlogPostTranslationVO[] }>()

const route = useRoute()
const router = useRouter()

const currentLang = computed(() => {
  const p = route.params.lang
  const fromParam = Array.isArray(p) ? p[0] : (typeof p === 'string' ? p : undefined)
  const q = route.query.lang
  const fromQuery = Array.isArray(q) ? (q[0] ?? undefined) : (typeof q === 'string' && q ? q : undefined)
  return fromParam || fromQuery
})

const normalized = computed(() => props.translations || [])

function buildUrl(t: BlogPostTranslationVO): string {
  if (t.url) return t.url
  return `/${encodeURIComponent(t.lang)}/blog/${encodeURIComponent(t.slug)}`
}

function switchLanguage(targetLang: string) {
  const match = normalized.value.find(t => t.lang === targetLang)
  if (match) {
    const url = buildUrl(match)
    router.push(url)
  } else {
    router.push(`/${targetLang}/blog`)
  }
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin: 6px 24px 0 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}
.label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}
.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill {
  appearance: none;
  border: 1px solid #e5e7eb;
  background: #ffffffcc;
  color: #334155;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 600;
  transition: all .2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.pill:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.pill.active {
  color: #fff;
  border-color: #3b82f6;
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
@media (max-width: 640px) {
  .lang-switcher { margin: 6px 16px 0 16px; padding: 8px 10px; }
  .label { display: none; }
}
</style>
