<template>
  <section v-if="downloads.hasLinks" class="home-app-download storefront-container" aria-labelledby="home-app-download-title">
    <div class="home-app-download__card">
      <div class="home-app-download__intro">
        <img class="home-app-download__mark" src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-mark.svg" alt="" width="44" height="44" />
        <div>
          <span class="home-app-download__eyebrow">WRISTO APP</span>
          <h2 id="home-app-download-title">{{ t('appDownload.title') }}</h2>
          <p>{{ t('appDownload.description') }}</p>
        </div>
      </div>
      <ul v-if="!compact" class="home-app-download__features">
        <li v-for="feature in features" :key="feature.key">
          <Icon :icon="feature.icon" width="22" height="22" aria-hidden="true" />
          {{ t(feature.key) }}
        </li>
      </ul>
      <AppDownloadLinks />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import AppDownloadLinks from '@/components/AppDownloadLinks.vue'
import { useCompanionAppsStore } from '@/store/companionApps'
import { useI18n } from '@/i18n'

defineProps<{ compact?: boolean }>()
const features = [
  { key: 'appDownload.browse', icon: 'solar:widget-2-linear' },
  { key: 'appDownload.unlock', icon: 'solar:lock-keyhole-unlocked-linear' },
  { key: 'appDownload.install', icon: 'solar:watch-square-linear' },
]
const downloads = useCompanionAppsStore()
const { t } = useI18n()
onMounted(() => { void downloads.load() })
</script>

<style scoped>
.home-app-download { margin: 20px auto 0; }
.home-app-download__card { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 28px 40px; padding: 36px 40px; border: 1px solid #cddac8; border-radius: 24px; background: #e9f0e3; }
.home-app-download__intro { display: flex; align-items: flex-start; gap: 20px; min-width: 0; }
.home-app-download__mark { flex-shrink: 0; width: 52px; height: 52px; margin-top: 5px; }
.home-app-download__eyebrow { display: block; margin-bottom: 10px; color: #526b47; font-size: 11px; font-weight: 700; letter-spacing: .16em; }
.home-app-download h2 { margin: 0; color: #243e30; font-size: clamp(26px, 3vw, 36px); font-weight: 650; line-height: 1.2; letter-spacing: -.025em; }
.home-app-download p { max-width: 600px; margin: 12px 0 0; color: #4f614c; font-size: 16px; line-height: 1.65; }
.home-app-download__features { grid-column: 1; display: flex; flex-wrap: wrap; gap: 16px 28px; padding: 0; margin: 0 0 0 72px; list-style: none; }
.home-app-download__features li { display: flex; align-items: center; gap: 9px; color: #294c3b; font-size: 14px; font-weight: 600; }
.home-app-download__features svg { flex-shrink: 0; }
.home-app-download :deep(.app-download-links) { grid-column: 2; grid-row: 1 / 3; flex-direction: column; align-self: center; gap: 12px; }
.home-app-download :deep(.app-download-link) { min-width: 190px; min-height: 60px; }
@media (max-width: 900px) {
  .home-app-download__card { grid-template-columns: 1fr; gap: 24px; padding: 28px; }
  .home-app-download :deep(.app-download-links) { grid-column: 1; grid-row: auto; flex-direction: row; margin-left: 72px; }
}
@media (max-width: 640px) {
  .home-app-download { margin-top: 16px; }
  .home-app-download__card { padding: 24px; gap: 22px; border-radius: 20px; }
  .home-app-download__intro { gap: 14px; }
  .home-app-download__mark { width: 36px; height: 36px; }
  .home-app-download p { font-size: 15px; }
  .home-app-download__features { margin-left: 0; gap: 14px; flex-direction: column; }
  .home-app-download :deep(.app-download-links) { width: 100%; margin-left: 0; }
  .home-app-download :deep(.app-download-link) { flex: 1 1 150px; min-width: 0; padding-inline: 10px; gap: 8px; }
  .home-app-download :deep(.app-download-link strong) { font-size: 17px; }
}
</style>
