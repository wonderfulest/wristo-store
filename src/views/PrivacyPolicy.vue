<template>
  <div class="privacy-pro-wrapper">
    <div class="privacy-pro-header">
      <Logo />
      <div class="privacy-meta">
        <h1 class="privacy-title">{{ t('privacy.title') }}</h1>
        <!-- <span class="privacy-breadcrumb">Home / Privacy Policy</span> -->
        <span class="privacy-updated">{{ t('privacy.updated') }}</span>
      </div>
     
    </div>
    <nav class="privacy-toc">
      <ul>
        <li><a href="#collection">{{ t('privacy.collectionTitle') }}</a></li>
        <li><a href="#use">{{ t('privacy.useTitle') }}</a></li>
        <li><a href="#nonpersonal">{{ t('privacy.nonpersonalTitle') }}</a></li>
        <li><a href="#cookies">{{ t('privacy.cookiesTitle') }}</a></li>
        <li><a href="#disclosure">{{ t('privacy.disclosureTitle') }}</a></li>
        <li><a href="#consent">{{ t('privacy.consentTitle') }}</a></li>
        <li><a href="#security">{{ t('privacy.securityTitle') }}</a></li>
        <li><a href="#changes">{{ t('privacy.changesTitle') }}</a></li>
        <li><a href="#contact">{{ t('privacy.contactTitle') }}</a></li>
      </ul>
    </nav>
    <div class="privacy-content">
      <h2 id="collection">{{ t('privacy.collectionTitle') }}</h2>
      <p>{{ t('privacy.collectionBody') }}</p>

      <h2 id="use">{{ t('privacy.useTitle') }}</h2>
      <ul>
        <li>{{ t('privacy.useItem1') }}</li>
        <li>{{ t('privacy.useItem2') }}</li>
        <li>{{ t('privacy.useItem3') }}</li>
      </ul>

      <h2 id="nonpersonal">{{ t('privacy.nonpersonalTitle') }}</h2>
      <p>{{ t('privacy.nonpersonalBody') }}</p>

      <h2 id="cookies">{{ t('privacy.cookiesTitle') }}</h2>
      <p>{{ t('privacy.cookiesBody') }}</p>

      <h2 id="disclosure">{{ t('privacy.disclosureTitle') }}</h2>
      <p>{{ t('privacy.disclosureBody') }}</p>

      <h2 id="consent">{{ t('privacy.consentTitle') }}</h2>
      <p>{{ t('privacy.consentBody') }}</p>
      <ul>
        <li>{{ t('privacy.consentItem1') }}</li>
        <li>{{ t('privacy.consentItem2') }}</li>
      </ul>

      <h2 id="security">{{ t('privacy.securityTitle') }}</h2>
      <p>{{ t('privacy.securityBody') }}</p>

      <h2 id="changes">{{ t('privacy.changesTitle') }}</h2>
      <p>{{ t('privacy.changesBody') }}</p>

      <h2 id="contact">{{ t('privacy.contactTitle') }}</h2>
      <p>{{ t('privacy.contactBody') }}</p>
      <p><strong>{{ t('privacy.businessName') }}:</strong> WuKong OÜ</p>
      <p><strong>{{ t('footer.address') }}:</strong> Harju maakond, Tallinn, Kesklinna linnaosa, Ahtri tn 12, 15551, Estonia</p>
      <p><strong>{{ t('footer.email') }}:</strong> <a href="mailto:support@wristo.io">support@wristo.io</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<style scoped>
.privacy-pro-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0 0 0;
  background: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.privacy-pro-header {
  margin-bottom: 18px;
}
.privacy-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-align: left;
  letter-spacing: 0.01em;
  color: #1a2a3a;
}
.privacy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.98rem;
  color: #888;
  margin-bottom: 8px;
  padding: 0 20px;
}
.privacy-breadcrumb {
  color: #888;
}
.privacy-updated {
  color: #888;
}
.privacy-toc {
  margin-bottom: 32px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 18px 24px;
  box-shadow: 0 1px 4px #0001;
}
.privacy-toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
}
.privacy-toc li {
  font-size: 1.05rem;
}
.privacy-toc a {
  color: #0056b3;
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s;
}
.privacy-toc a:hover {
  color: #003366;
}
.privacy-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px 36px 40px 36px;
  margin-bottom: 2.5rem;
  box-shadow: 0 2px 8px #0001;
  text-align: left;
  color: #222;
}
.privacy-content h2 {
  font-size: 1.18rem;
  color: #1a2a3a;
  margin-top: 2em;
  margin-bottom: 10px;
  font-weight: 700;
}
.privacy-content p, .privacy-content ul {
  color: #222;
  font-size: 1.08rem;
  line-height: 1.7;
  margin-bottom: 1.1em;
  text-align: left;
}
.privacy-content ul {
  padding-left: 1.5em;
}
a {
  color: #0056b3;
  text-decoration: underline;
}
</style> 
