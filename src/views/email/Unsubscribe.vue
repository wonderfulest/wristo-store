<template>
  <div class="unsubscribe-page">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <div class="page-container">
      <section class="unsubscribe-shell" aria-labelledby="unsubscribe-title">
        <div class="brand-row">
          <router-link to="/" class="brand-link" aria-label="Back to Wristo home">
            <img src="/logo.svg" alt="" class="brand-logo" />
            <span>Wristo</span>
          </router-link>
          <router-link :to="{ name: 'PrivacyPolicy' }" class="privacy-link">
            Privacy
          </router-link>
        </div>

        <div class="hero-panel">
          <div class="header-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" stroke="currentColor" stroke-width="1.8"/>
              <path d="m7.5 8.25 3.55 2.55a1.65 1.65 0 0 0 1.9 0l3.55-2.55" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 15.75h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="header-content">
            <p class="eyebrow">Email settings</p>
            <h1 id="unsubscribe-title" class="page-title">Unsubscribe</h1>
            <p class="page-subtitle">Stop receiving marketing emails from Wristo.</p>
          </div>
        </div>

        <div v-if="loading" class="status-message loading" role="status" aria-live="polite">
          <div class="spinner"></div>
          <span>Processing your request...</span>
        </div>
        
        <div v-if="success" class="status-message success" role="status" aria-live="polite">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>You have been unsubscribed from Wristo newsletters.</span>
        </div>
        
        <div v-if="error" class="status-message error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-if="!loading && !success" class="content-wrapper">
          <form @submit.prevent="handleSubmit" class="unsubscribe-form" novalidate>
            <div class="section email-section">
              <div class="section-header">
                <label for="unsubscribe-email" class="section-title">Email address</label>
                <p class="section-desc">Enter the address that receives Wristo marketing emails.</p>
              </div>
              <div class="input-wrapper">
                <input
                  id="unsubscribe-email"
                  type="email"
                  v-model.trim="emailModel"
                  placeholder="you@example.com"
                  class="email-input"
                  :class="{ 'input-error': inputError }"
                  autocomplete="email"
                  inputmode="email"
                  :aria-invalid="!!inputError"
                  aria-describedby="unsubscribe-email-help"
                />
                <div id="unsubscribe-email-help" class="input-help">
                  Marketing messages stop after this request. Receipts and account notices still arrive when needed.
                </div>
                <div v-if="inputError" class="input-error-text" role="alert">{{ inputError }}</div>
              </div>
            </div>

            <div class="actions-section">
              <button type="submit" class="unsubscribe-button" :disabled="submitting || !isFormValid">
                <span v-if="submitting" class="button-spinner"></span>
                <span>{{ submitting ? 'Unsubscribing...' : 'Unsubscribe from Marketing' }}</span>
              </button>
              <router-link :to="{ name: 'EmailPreferences', query: { email: emailModel } }" class="preferences-link">
                Manage email preferences instead
              </router-link>
            </div>
          </form>
        </div>

        <div v-if="success" class="success-actions">
          <div class="success-card">
            <div class="success-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>Marketing emails are off</h2>
            <p>You can still adjust individual categories anytime from preferences.</p>
          </div>

          <div class="success-button-row">
            <router-link :to="{ name: 'EmailPreferences', query: { email: emailModel } }" class="manage-button">
              Manage Email Preferences
            </router-link>
            <a href="https://www.wristo.io" class="home-button">Back to Wristo.io</a>
          </div>
        </div>

        <div class="page-footer">
          <span class="footer-dot" aria-hidden="true"></span>
          <p>Unsubscribing stops marketing emails only. Essential system emails may still be sent for purchases, security, and account activity.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { unsubscribeAll } from '@/api/email-preferences'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const success = ref(false)
const error = ref('')

const queryEmail = computed(() => (route.query.email as string) || '')

const userEmail = computed(() => userStore.userInfo?.email || '')
const emailModel = ref(queryEmail.value || '')
const inputError = ref('')

const isFormValid = computed(() => {
  return emailModel.value && /\S+@\S+\.\S+/.test(emailModel.value)
})

const performUnsubscribe = async (email: string) => {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    await unsubscribeAll(email)
    success.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Unsubscribe failed.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  inputError.value = ''
  if (!emailModel.value || !/\S+@\S+\.\S+/.test(emailModel.value)) {
    inputError.value = 'Please enter a valid email address'
    return
  }
  submitting.value = true
  await performUnsubscribe(emailModel.value)
  submitting.value = false
}

onMounted(async () => {
  // Autofill email: prefer query param, otherwise use logged-in user's email
  if (queryEmail.value) {
    emailModel.value = queryEmail.value
  } else if (userEmail.value) {
    emailModel.value = userEmail.value
  }
})
</script>

<style scoped>
.unsubscribe-page {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 72px 20px;
  background:
    radial-gradient(circle at 18% 12%, rgba(15, 107, 104, 0.13), transparent 28rem),
    radial-gradient(circle at 84% 8%, rgba(245, 158, 11, 0.12), transparent 24rem),
    linear-gradient(180deg, #fbfdfc 0%, var(--color-canvas) 100%);
  font-family: var(--font-body);
}

.page-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  opacity: 0.45;
  pointer-events: none;
}

.ambient-left {
  width: 280px;
  height: 280px;
  left: max(-120px, -10vw);
  bottom: 8%;
  background: rgba(15, 107, 104, 0.08);
}

.ambient-right {
  width: 220px;
  height: 220px;
  right: max(-88px, -8vw);
  top: 18%;
  background: rgba(245, 158, 11, 0.1);
}

.unsubscribe-shell {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-line);
}

.brand-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink);
  font-weight: 800;
  text-decoration: none;
}

.brand-logo {
  width: 34px;
  height: 34px;
  display: block;
}

.privacy-link,
.preferences-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: color 180ms ease, background-color 180ms ease;
}

.privacy-link:hover,
.preferences-link:hover {
  color: var(--color-brand-strong);
}

.hero-panel {
  padding: 40px 40px 24px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 18px;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  display: grid;
  place-items: center;
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.14);
}

.header-content {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--color-brand);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(40px, 8vw, 60px);
  font-weight: 700;
  line-height: 1;
}

.page-subtitle {
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: 17px;
  line-height: 1.5;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 40px 20px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
}

.status-message.loading {
  background: rgba(15, 107, 104, 0.08);
  color: var(--color-brand-strong);
  border: 1px solid rgba(15, 107, 104, 0.14);
}

.status-message.success {
  background: rgba(15, 107, 104, 0.08);
  color: var(--color-brand-strong);
  border: 1px solid rgba(15, 107, 104, 0.16);
}

.status-message.error {
  background: rgba(185, 28, 28, 0.08);
  color: #9f1239;
  border: 1px solid rgba(185, 28, 28, 0.16);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content-wrapper {
  margin: 0 40px 32px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.unsubscribe-form {
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 24px 24px 12px;
}

.section-title {
  display: block;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
}

.section-desc {
  margin: 6px 0 0;
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.5;
}

.input-wrapper {
  padding: 0 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.email-input {
  width: 100%;
  min-height: 52px;
  border: 1px solid rgba(17, 24, 39, 0.16);
  border-radius: var(--radius-sm);
  padding: 0 16px;
  background: var(--color-surface);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.email-input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 4px rgba(15, 107, 104, 0.14);
}

.email-input.input-error {
  border-color: #be123c;
  box-shadow: 0 0 0 4px rgba(190, 18, 60, 0.1);
}

.input-help {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.5;
}

.input-error-text {
  color: #be123c;
  font-size: 13px;
  font-weight: 700;
}

.actions-section {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unsubscribe-button {
  width: 100%;
  min-height: 52px;
  background: var(--color-brand);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 14px 24px rgba(15, 107, 104, 0.22);
}

.unsubscribe-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--color-brand-strong);
  box-shadow: 0 18px 30px rgba(15, 107, 104, 0.26);
}

.unsubscribe-button:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.preferences-link {
  text-align: center;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0 40px 32px;
}

.success-card {
  padding: 28px 24px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #ffffff 0%, var(--color-brand-soft) 130%);
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: var(--color-brand);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.22);
}

.success-card h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: 24px;
  line-height: 1.2;
}

.success-card p {
  margin: 8px auto 0;
  max-width: 360px;
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.55;
}

.success-button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.manage-button, .home-button {
  min-height: 52px;
  padding: 0 24px;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 800;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, color 180ms ease;
}

.manage-button {
  background: var(--color-brand);
  color: #ffffff;
  box-shadow: 0 14px 24px rgba(15, 107, 104, 0.2);
}

.home-button {
  background: var(--color-surface);
  color: var(--color-ink);
  border: 1px solid rgba(17, 24, 39, 0.14);
}

.manage-button:hover, .home-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.page-footer {
  display: flex;
  gap: 10px;
  padding: 18px 40px 34px;
  color: var(--color-muted);
  border-top: 1px solid rgba(17, 24, 39, 0.06);
}

.footer-dot {
  width: 8px;
  height: 8px;
  margin-top: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--color-accent);
}

.page-footer p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .unsubscribe-page {
    align-items: flex-start;
    padding: 24px 14px;
  }

  .unsubscribe-shell {
    border-radius: 18px;
  }

  .brand-row {
    padding: 14px 16px;
  }

  .hero-panel {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 30px 22px 20px;
    text-align: center;
  }

  .header-icon {
    margin: 0 auto;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .status-message,
  .content-wrapper,
  .success-actions {
    margin-left: 16px;
    margin-right: 16px;
  }

  .section-header,
  .input-wrapper,
  .actions-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .success-button-row {
    grid-template-columns: 1fr;
  }

  .page-footer {
    padding: 18px 22px 28px;
  }
}

@media (max-width: 420px) {
  .brand-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .privacy-link {
    min-height: 32px;
  }

  .status-message,
  .content-wrapper,
  .success-actions {
    margin-left: 12px;
    margin-right: 12px;
  }

  .page-title {
    font-size: 40px;
  }

  .actions-section,
  .success-button-row {
    padding-right: 72px;
  }

  .success-button-row {
    display: flex;
    flex-direction: column;
  }
}
</style>
