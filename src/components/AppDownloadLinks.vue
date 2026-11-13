<template>
  <div v-if="downloads.hasLinks" class="app-download-links" :class="{ 'app-download-links--compact': compact }">
    <a v-if="downloads.apps.ios" class="app-download-link" :href="downloads.apps.ios" target="_blank" rel="noopener noreferrer" :aria-label="t('appDownload.iosLabel')">
      <img src="/images/app-downloads/apple.svg" alt="" width="26" height="30" />
      <span><small>{{ t('appDownload.downloadOn') }}</small><strong>App Store</strong></span>
    </a>
    <a v-if="downloads.apps.android" class="app-download-link" :href="downloads.apps.android" target="_blank" rel="noopener noreferrer" :aria-label="t('appDownload.androidLabel')">
      <img src="/images/app-downloads/google-play.svg" alt="" width="26" height="30" />
      <span><small>{{ t('appDownload.getItOn') }}</small><strong>Google Play</strong></span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useCompanionAppsStore } from '@/store/companionApps'

defineProps<{ compact?: boolean }>()
const { t } = useI18n()
const downloads = useCompanionAppsStore()
onMounted(() => { void downloads.load() })
</script>

<style scoped>
.app-download-links { display: flex; flex-wrap: wrap; gap: 10px; }
.app-download-links .app-download-link { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; min-width: 158px; box-sizing: border-box; padding: 8px 15px; border: 1px solid #515550; border-radius: 9px; background: #171d19; color: #fff; text-decoration: none; transition: background 160ms ease, border-color 160ms ease; }
.app-download-links .app-download-link:hover { background: #294c3b; border-color: #6e866f; color: #fff; text-decoration: none; }
.app-download-links .app-download-link:focus-visible { outline: 3px solid #6f8752; outline-offset: 4px; }
.app-download-link img { flex: 0 0 26px; object-fit: contain; }
.app-download-link span { display: flex; flex-direction: column; gap: 2px; }
.app-download-link small { font-size: 10px; line-height: 1.2; font-weight: 400; }
.app-download-link strong { font-size: 19px; line-height: 1.15; font-weight: 600; white-space: nowrap; }
.app-download-links--compact .app-download-link { min-width: 144px; min-height: 48px; padding: 7px 12px; gap: 8px; }
.app-download-links--compact .app-download-link strong { font-size: 17px; }
.app-download-links--compact .app-download-link img { width: 22px; height: 26px; flex-basis: 22px; }
@media (max-width: 380px) {
  .app-download-links .app-download-link { min-width: 0; padding-inline: 10px; gap: 8px; flex: 1 1 100%; }
  .app-download-link strong { font-size: 17px; }
}
@media (prefers-reduced-motion: reduce) { .app-download-link { transition: none; } }
</style>
