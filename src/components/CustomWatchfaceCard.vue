<template>
  <article class="custom-card storefront-container">
    <div><span class="kicker">{{ t('custom.eyebrow') }}</span><h2>{{ t('custom.cardTitle') }}</h2><p>{{ t('custom.cardDesc') }}</p></div>
    <router-link :to="addLocaleToPath('/custom-watchface', locale.currentLocale)">{{ t('custom.start') }} <span aria-hidden="true">↗</span></router-link>
  </article>
</template>
<script setup lang="ts">
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
const { t } = useI18n()
const locale = useLocaleStore()
</script>
<style scoped>
.custom-card { box-sizing: border-box; margin: 0 auto 32px; padding: 30px 36px !important; display: flex; align-items: center; justify-content: space-between; gap: 28px; border: 1px solid #d9d9c9; border-radius: 20px; color: #263d31; background: #eeeedf; }
.kicker { font-size: 10px; font-weight: 700; letter-spacing: .16em; }
h2 { margin: 10px 0 8px; font-size: clamp(22px, 2.5vw, 30px); letter-spacing: -.035em; line-height: 1.2; }
p { margin: 0; color: #5c695b; line-height: 1.6; }
a { display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-shrink: 0; border-radius: 8px; padding: 16px 22px; background: #294735; color: #fff; text-decoration: none; font-weight: 600; }
a:hover { background: #1b3526; }
a:focus-visible { outline: 3px solid #9caa78; outline-offset: 4px; }
@media(max-width: 640px) { .custom-card { padding: 24px !important; align-items: stretch; flex-direction: column; } }
</style>
