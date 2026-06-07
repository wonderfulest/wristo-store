<template>
  <div class="lang-switcher" role="navigation" :aria-label="t('language.selector')">
    <button class="current" type="button" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <Icon icon="solar:global-line-duotone" width="18" height="18" aria-hidden="true" />
      <span>{{ getLanguageLabel(currentLocale) }}</span>
      <el-icon :class="{ rotated: isOpen }"><arrow-down /></el-icon>
    </button>
    <div class="buttons" :class="{ open: isOpen }">
      <button
        v-for="locale in supportedLocales"
        :key="locale"
        class="option"
        :class="{ active: locale === currentLocale }"
        type="button"
        @click="switchLanguage(locale)"
      >
        {{ getLanguageLabel(locale) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { getFaqGuidePathForLocale } from '@/content/faq-guides'
import { useI18n } from '@/i18n'
import { addLocaleToPath, normalizeLocale, SUPPORTED_LOCALES, useLocaleStore } from '@/store/locale'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const { t } = useI18n()
const isOpen = ref(false)
const supportedLocales = SUPPORTED_LOCALES
const languageLabels: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  zh: '中文',
}

const currentLocale = computed(() => {
  const p = route.params.lang
  const fromParam = Array.isArray(p) ? p[0] : (typeof p === 'string' ? p : undefined)
  const q = route.query.lang
  const fromQuery = Array.isArray(q) ? (q[0] ?? undefined) : (typeof q === 'string' && q ? q : undefined)
  return normalizeLocale(fromParam || fromQuery || localeStore.currentLocale)
})

function switchLanguage(targetLang: string) {
  localeStore.setLocale(targetLang)
  isOpen.value = false

  if (['FAQGuides', 'FAQGuidesLang', 'FAQGuide', 'FAQGuideLang'].includes(String(route.name || ''))) {
    const nextPath = getFaqGuidePathForLocale(route.path, targetLang)
    if (nextPath !== route.path) {
      router.push({ path: nextPath, query: route.query, hash: route.hash })
    }
    return
  }

  const nextPath = addLocaleToPath(route.path, normalizeLocale(targetLang))
  if (nextPath !== route.path) {
    router.push({ path: nextPath, query: route.query, hash: route.hash })
  }
}

function getLanguageLabel(locale: string) {
  return languageLabels[normalizeLocale(locale)]
}
</script>

<style scoped>
.lang-switcher {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.buttons {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  display: none;
  min-width: 164px;
  padding: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.buttons.open {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.current,
.option {
  appearance: none;
  border: 1px solid transparent;
  color: #334155;
  background: transparent;
  font-weight: 750;
  cursor: pointer;
  transition: all .2s ease;
}
.current {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.current:hover,
.current:focus-visible {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  outline: none;
}
.current .el-icon {
  transition: transform .2s ease;
}
.current .el-icon.rotated {
  transform: rotate(180deg);
}
.option {
  width: 100%;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  text-align: left;
  white-space: nowrap;
}
.option:hover,
.option.active {
  color: var(--color-brand-strong);
  background: rgba(15, 107, 104, 0.08);
}
@media (max-width: 640px) {
  .lang-switcher {
    width: 100%;
    justify-content: stretch;
  }
  .current {
    width: 100%;
    min-height: 48px;
    justify-content: center;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.72);
    border-color: rgba(15, 23, 42, 0.06);
  }
  .buttons {
    position: static;
    width: 100%;
    margin-top: 8px;
    box-shadow: none;
    background: rgba(238, 245, 243, 0.82);
  }
}
</style>
