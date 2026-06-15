<template>
  <main class="contact-page">
    <section class="contact-hero" aria-labelledby="contact-title">
      <div class="contact-copy">
        <p class="contact-eyebrow">
          <Icon icon="solar:letter-unread-line-duotone" width="18" height="18" aria-hidden="true" />
          {{ t('contact.eyebrow') }}
        </p>
        <h1 id="contact-title">{{ t('contact.title') }}</h1>
        <p class="contact-subtitle">{{ t('contact.subtitle') }}</p>

        <div class="contact-actions">
          <a class="contact-primary" :href="mailtoHref" :aria-label="t('contact.ctaAria')">
            <Icon icon="solar:plain-2-bold-duotone" width="21" height="21" aria-hidden="true" />
            {{ t('contact.ctaLabel') }}
          </a>
          <a class="contact-billing" :href="paddleCustomerPortalUrl" target="_blank" rel="noopener noreferrer">
            <Icon icon="solar:bill-list-line-duotone" width="20" height="20" aria-hidden="true" />
            {{ t('contact.billingCta') }}
          </a>
          <a class="contact-secondary" :href="plainMailHref">
            <Icon icon="solar:letter-linear" width="20" height="20" aria-hidden="true" />
            support@wristo.io
          </a>
        </div>

        <div class="order-support-note">
          <Icon icon="solar:receipt-list-line-duotone" width="22" height="22" aria-hidden="true" />
          <p>{{ t('contact.orderLookupDesc') }}</p>
        </div>
      </div>

      <aside class="contact-mail-preview" :aria-label="t('contact.previewLabel')">
        <div class="preview-topbar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="preview-header">
          <span>{{ t('contact.previewTo') }}</span>
          <strong>support@wristo.io</strong>
        </div>
        <div class="preview-subject">
          <span>{{ t('contact.previewSubject') }}</span>
          <strong>{{ t('contact.templateSubject') }}</strong>
        </div>
        <div class="preview-body">
          <p>{{ t('contact.templateGreeting') }}</p>
          <p>{{ t('contact.templateIssue') }}</p>
          <p>{{ t('contact.templateDevice') }}</p>
          <p>{{ t('contact.templateOrder') }}</p>
          <p class="template-line template-line-with-help">
            <span>{{ t('contact.templatePaddleOrder') }}</span>
            <span class="tooltip-wrap">
              <button class="tooltip-trigger" type="button" :aria-label="t('contact.paddleOrderHint')">
                <Icon icon="solar:question-circle-line-duotone" width="18" height="18" aria-hidden="true" />
              </button>
              <span class="tooltip-bubble" role="tooltip">{{ t('contact.paddleOrderHint') }}</span>
            </span>
          </p>
        </div>
      </aside>
    </section>

    <section class="contact-support-grid" :aria-label="t('contact.supportAria')">
      <article class="support-card">
        <div class="support-icon">
          <Icon icon="solar:clock-circle-line-duotone" width="24" height="24" aria-hidden="true" />
        </div>
        <h2>{{ t('contact.responseTitle') }}</h2>
        <p>{{ t('contact.responseDesc') }}</p>
      </article>

      <article class="support-card">
        <div class="support-icon">
          <Icon icon="solar:checklist-minimalistic-line-duotone" width="24" height="24" aria-hidden="true" />
        </div>
        <h2>{{ t('contact.beforeTitle') }}</h2>
        <p>{{ t('contact.beforeDesc') }}</p>
      </article>

      <article class="support-card support-card-accent">
        <div class="support-icon">
          <Icon icon="solar:watch-round-line-duotone" width="24" height="24" aria-hidden="true" />
        </div>
        <h2>{{ t('contact.includeTitle') }}</h2>
        <p>{{ t('contact.includeDesc') }}</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { getPaddleCustomerPortalUrl } from '@/utils/paddlePortal'

const { t } = useI18n()
const supportEmail = 'support@wristo.io'
const paddleCustomerPortalUrl = getPaddleCustomerPortalUrl()

const plainMailHref = computed(() => `mailto:${supportEmail}`)
const mailtoHref = computed(() => {
  const body = [
    t('contact.templateGreeting'),
    '',
    t('contact.templateIssue'),
    '',
    t('contact.templateDevice'),
    '',
    t('contact.templateOrder'),
    '',
    t('contact.templatePaddleOrder'),
    '',
    t('contact.templateThanks'),
  ].join('\n')

  return `mailto:${supportEmail}?subject=${encodeURIComponent(t('contact.templateSubject'))}&body=${encodeURIComponent(body)}`
})
</script>

<style scoped>
.contact-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 64px 0 84px;
}

.contact-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(360px, 0.78fr);
  gap: 40px;
  align-items: stretch;
}

.contact-copy,
.contact-mail-preview,
.support-card {
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: var(--shadow-md);
}

.contact-copy {
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(32px, 6vw, 72px);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.contact-copy::after {
  content: "";
  position: absolute;
  inset: auto -80px -120px auto;
  width: 290px;
  height: 290px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.16), transparent 68%);
  pointer-events: none;
}

.contact-eyebrow {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 22px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-size: 0.86rem;
  font-weight: 700;
}

.contact-copy h1 {
  max-width: 680px;
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(2.7rem, 6vw, 5.9rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.contact-subtitle {
  max-width: 650px;
  margin: 24px 0 0;
  color: #475467;
  font-size: clamp(1.05rem, 2vw, 1.24rem);
  line-height: 1.7;
}

.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.contact-primary,
.contact-billing,
.contact-secondary {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--radius-sm);
  padding: 13px 18px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
  touch-action: manipulation;
}

.contact-primary {
  background: var(--color-brand);
  color: #fff;
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.22);
}

.contact-billing {
  border: 1px solid rgba(15, 107, 104, 0.18);
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.contact-primary:hover {
  color: #fff;
  background: var(--color-brand-strong);
  transform: translateY(-2px);
}

.contact-billing:hover {
  border-color: rgba(15, 107, 104, 0.36);
  background: #fff;
  color: var(--color-brand-strong);
  transform: translateY(-2px);
}

.contact-secondary {
  border: 1px solid rgba(15, 107, 104, 0.18);
  background: #fff;
  color: var(--color-brand-strong);
}

.contact-secondary:hover {
  border-color: rgba(15, 107, 104, 0.36);
  background: var(--color-brand-soft);
}

.contact-primary:focus-visible,
.contact-billing:focus-visible,
.contact-secondary:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.24);
  outline-offset: 4px;
}

.order-support-note {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  padding: 16px 18px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: var(--radius-sm);
  background: #f8fbfa;
  color: #475467;
  line-height: 1.65;
}

.order-support-note svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--color-brand);
}

.order-support-note p {
  margin: 0;
}

.contact-mail-preview {
  display: flex;
  flex-direction: column;
  min-height: 520px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.preview-topbar {
  display: flex;
  gap: 7px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-line);
  background: #f7faf9;
}

.preview-topbar span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d0d5dd;
}

.preview-topbar span:first-child {
  background: var(--color-accent);
}

.preview-header,
.preview-subject {
  display: grid;
  gap: 6px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--color-line);
}

.preview-header span,
.preview-subject span {
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.preview-header strong,
.preview-subject strong {
  color: var(--color-ink);
  font-size: 1rem;
  line-height: 1.45;
}

.preview-body {
  display: grid;
  gap: 14px;
  padding: 24px 22px;
  color: #475467;
  line-height: 1.65;
}

.preview-body p {
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: #f8fbfa;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.template-line-with-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tooltip-wrap {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.tooltip-trigger {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  background: #fff;
  color: var(--color-brand-strong);
  box-shadow: none;
}

.tooltip-trigger:hover,
.tooltip-trigger:focus-visible {
  border-color: rgba(15, 107, 104, 0.36);
  background: var(--color-brand-soft);
}

.tooltip-bubble {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  z-index: 5;
  width: min(260px, calc(100vw - 48px));
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: #101828;
  color: #fff;
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.45;
  box-shadow: 0 16px 36px rgba(16, 24, 40, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 160ms ease, transform 160ms ease;
}

.tooltip-bubble::after {
  content: "";
  position: absolute;
  right: 11px;
  top: 100%;
  border: 7px solid transparent;
  border-top-color: #101828;
}

.tooltip-wrap:hover .tooltip-bubble,
.tooltip-wrap:focus-within .tooltip-bubble {
  opacity: 1;
  transform: translateY(0);
}

.contact-support-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.support-card {
  min-height: 220px;
  border-radius: var(--radius-md);
  padding: 24px;
}

.support-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.support-card h2 {
  margin: 22px 0 10px;
  color: var(--color-ink);
  font-size: 1.15rem;
  line-height: 1.25;
}

.support-card p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.65;
}

.support-card-accent {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(223, 245, 241, 0.78));
}

@media (max-width: 960px) {
  .contact-hero,
  .contact-support-grid {
    grid-template-columns: 1fr;
  }

  .contact-copy,
  .contact-mail-preview {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .contact-page {
    width: min(100% - 28px, 1180px);
    padding: 34px 0 54px;
  }

  .contact-copy {
    padding: 28px 22px;
    border-radius: var(--radius-md);
  }

  .contact-actions,
  .contact-primary,
  .contact-billing,
  .contact-secondary {
    width: 100%;
  }

  .contact-copy h1 {
    font-size: clamp(2.35rem, 14vw, 3.8rem);
  }

  .contact-mail-preview,
  .support-card {
    border-radius: var(--radius-md);
  }

  .preview-header,
  .preview-subject,
  .preview-body {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
