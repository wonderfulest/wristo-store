<template>
  <section class="home-guides" aria-labelledby="home-guides-title">
    <div class="storefront-container home-guides__layout">
      <div class="home-guides__heading">
        <p>{{ t('home.guidesKicker') }}</p>
        <h2 id="home-guides-title">{{ t('home.guidesTitle') }}</h2>
      </div>
      <nav class="home-guides__grid" :aria-label="t('home.guidesTitle')">
        <RouterLink v-for="guide in guides" :key="guide.number" :to="guide.to">
          <span>{{ guide.number }}</span>
          <strong>{{ t(guide.title) }}</strong>
          <small>{{ t(guide.description) }}</small>
          <b aria-hidden="true">↗</b>
        </RouterLink>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

const { t } = useI18n()
const localeStore = useLocaleStore()
const guides = computed(() => [
  { number: '01', title: 'home.guidePurchaseTitle', description: 'home.guidePurchaseDesc', to: addLocaleToPath('/search', localeStore.currentLocale) },
  { number: '02', title: 'home.guideActivateTitle', description: 'home.guideActivateDesc', to: addLocaleToPath('/activate', localeStore.currentLocale) },
  { number: '03', title: 'home.guideInstallTitle', description: 'home.guideInstallDesc', to: addLocaleToPath('/support/installation-and-settings', localeStore.currentLocale) },
])
</script>

<style scoped>
.home-guides { padding: clamp(64px, 9vw, 112px) 0; color: #eaf4f0; background: #102d29; }
.home-guides__layout { display: grid; grid-template-columns: minmax(220px, .7fr) 2fr; gap: clamp(40px, 8vw, 120px); }
.home-guides__heading p { margin: 0 0 14px; color: #7bc4b5; font-size: .72rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
.home-guides__heading h2 { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2.2rem, 4vw, 4.2rem); font-weight: 500; line-height: 1; }
.home-guides__grid { border-top: 1px solid rgba(234,244,240,.2); }
.home-guides__grid a {
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(120px, .65fr) 1fr 24px;
  align-items: center;
  gap: 18px;
  min-height: 112px;
  padding: 18px 4px;
  border-bottom: 1px solid rgba(234,244,240,.2);
  color: inherit;
  text-decoration: none;
  transition: padding 180ms ease, background 180ms ease;
}
.home-guides__grid a:hover, .home-guides__grid a:focus-visible { padding-inline: 14px; background: rgba(255,255,255,.045); }
.home-guides__grid span { color: #7bc4b5; font: 1.35rem Georgia, serif; }
.home-guides__grid strong { font-size: 1.05rem; }
.home-guides__grid small { color: #a9beb8; font-size: .9rem; line-height: 1.5; }
.home-guides__grid b { color: #7bc4b5; font-size: 1.1rem; }
@media (max-width: 820px) { .home-guides__layout { grid-template-columns: 1fr; } }
@media (max-width: 560px) {
  .home-guides__grid a { grid-template-columns: 38px 1fr 24px; min-height: 104px; }
  .home-guides__grid small { grid-column: 2 / 4; margin-top: -12px; }
}
</style>
