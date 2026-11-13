<template>
  <section v-if="downloads.hasLinks" class="home-app-download storefront-container" aria-labelledby="home-app-download-title">
    <div class="home-app-download__card">
      <div class="home-app-download__intro">
        <img class="home-app-download__mark" src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-mark.svg" alt="" width="44" height="44" />
        <div>
          <h2 id="home-app-download-title">{{ t('appDownload.title') }}</h2>
          <p>{{ t('appDownload.description') }}</p>
        </div>
      </div>
      <AppDownloadLinks />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppDownloadLinks from '@/components/AppDownloadLinks.vue'
import { useCompanionAppsStore } from '@/store/companionApps'
import { useI18n } from '@/i18n'

const downloads = useCompanionAppsStore()
const { t } = useI18n()
onMounted(() => { void downloads.load() })
</script>

<style scoped>
.home-app-download { margin-top: 20px; }
.home-app-download__card { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 23px 28px; border: 1px solid #dce3d4; border-radius: 20px; background: #edf1e7; }
.home-app-download__intro { display: flex; align-items: center; gap: 18px; min-width: 0; }
.home-app-download__mark { flex-shrink: 0; }
.home-app-download h2 { margin: 0; color: #243e30; font-size: 22px; font-weight: 650; line-height: 1.3; }
.home-app-download p { margin: 6px 0 0; color: #5f6c5d; font-size: 14px; line-height: 1.6; }
.home-app-download :deep(.app-download-links) { flex-shrink: 0; }
@media (max-width: 900px) {
  .home-app-download__card { flex-direction: column; align-items: flex-start; gap: 18px; padding: 22px; }
}
@media (max-width: 640px) {
  .home-app-download { margin-top: 16px; }
  .home-app-download__card { padding: 20px; }
  .home-app-download__intro { gap: 12px; }
  .home-app-download__mark { width: 36px; height: 36px; }
  .home-app-download h2 { font-size: 20px; }
  .home-app-download p { font-size: 13px; }
  .home-app-download :deep(.app-download-links) { width: 100%; }
  .home-app-download :deep(.app-download-link) { flex: 1 1 auto; min-width: 0; padding-inline: 10px; gap: 8px; }
  .home-app-download :deep(.app-download-link strong) { font-size: 17px; }
  .home-app-download :deep(.app-download-link img) { width: 22px; height: 26px; flex-basis: 22px; }
}
@media (max-width: 380px) {
  .home-app-download :deep(.app-download-link) { flex-basis: 100%; }
}
</style>
