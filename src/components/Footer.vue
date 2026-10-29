<template>
  <footer class="footer">
    <div class="storefront-container footer-container">
      <div class="footer-main">
        <div>
          <a class="footer-brand" :href="localizedPath('/')" aria-label="Wristo">
            <img src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-mark.svg" alt="" width="36" height="36" />
            <span>Wristo<span class="brand-period">.</span></span>
          </a>
        </div>
        <nav class="footer-links" :aria-label="t('footer.quickLinks')">
          <h2>{{ t('footer.quickLinks') }}</h2>
          <a :href="localizedPath('/terms-and-conditions')">{{ t('footer.termsOfUse') }}</a>
          <a :href="localizedPath('/privacy-policy')">{{ t('footer.privacy') }}</a>
          <a :href="localizedPath('/contact')">{{ t('footer.contact') }}</a>
        </nav>
        <div class="footer-contact">
          <h2>{{ t('footer.contact') }}</h2>
          <a class="footer-email" href="mailto:support@wristo.io">support@wristo.io <span aria-hidden="true">↗</span></a>
          <address><span class="company-name">WuKong OÜ</span>Harju maakond, Tallinn, Kesklinna linnaosa,<br />Ahtri tn 12, 15551, Estonia</address>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">© {{ currentYear }} WuKong OÜ. {{ t('footer.rights') }}</p>
      </div>
      <slot />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
const localeStore = useLocaleStore()
const { t } = useI18n()
const currentYear = new Date().getFullYear()
const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)
</script>

<style scoped>
.footer { background: #f4f5f1; color: var(--color-muted, #5e706d); border-top: 1px solid var(--color-line); padding: 48px 0 max(24px, env(safe-area-inset-bottom)); text-align: left; }
.footer-container { max-width: 1280px; }
.footer-main { display: grid; grid-template-columns: 1.3fr 0.8fr 1fr; gap: 48px; padding-bottom: 36px; }
.footer h2 { margin: 0 0 12px; color: var(--color-ink); font-size: 13px; line-height: 1.5; font-weight: 700; }
.footer a { color: inherit; text-decoration: none; transition: color 160ms ease; }
.footer a:hover { color: var(--color-brand-strong); text-decoration: underline; text-underline-offset: 5px; }
.footer a:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 4px; border-radius: 3px; }
.footer-brand { display: inline-flex; align-items: center; gap: 12px; color: var(--color-ink) !important; font-size: 32px; font-weight: 750; line-height: 1.4; }
.footer-brand:hover { text-decoration: none !important; }
.footer-brand img { display: block; }
.brand-period { color: var(--color-brand); }
.footer-links { display: flex; flex-direction: column; align-items: flex-start; }
.footer-links a { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; }
.footer-email { display: inline-flex; align-items: center; gap: 20px; min-height: 44px; font-size: 16px; color: var(--color-brand-strong) !important; }
.footer-contact address { margin-top: 12px; font-style: normal; font-size: 13px; line-height: 1.8; }
.company-name { display: block; color: var(--color-ink); font-weight: 600; }
.footer-bottom { border-top: 1px solid #d8e0d9; padding-top: 22px; font-size: 12px; line-height: 1.8; }
.footer-copyright { margin: 0; }
@media (max-width: 900px) {
  .footer-main { grid-template-columns: 1fr 0.8fr 1.2fr; gap: 24px; }
}
@media (max-width: 640px) {
  .footer { padding-top: 32px; }
  .footer-main { grid-template-columns: 1fr; gap: 28px; padding-bottom: 28px; }
  .footer-brand { font-size: 28px; }
  .footer-links { flex-direction: row; flex-wrap: wrap; column-gap: 22px; }
  .footer-links h2 { flex-basis: 100%; margin-bottom: 4px; }
}
@media (prefers-reduced-motion: reduce) { .footer a { transition: none; } }
</style>
