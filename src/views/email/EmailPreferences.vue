<template>
  <main class="preferences-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="hero-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 7.5L10.98 12.15C11.59 12.56 12.41 12.56 13.02 12.15L20 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.5 18.5H18.5C19.33 18.5 20 17.83 20 17V7C20 6.17 19.33 5.5 18.5 5.5H5.5C4.67 5.5 4 6.17 4 7V17C4 17.83 4.67 18.5 5.5 18.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="hero-copy">
          <p class="eyebrow">Wristo Store</p>
          <h1>Email Preferences</h1>
          <p>Customize your email notifications</p>
        </div>
      </header>

      <section class="status-stack" aria-live="polite" aria-atomic="true">
        <div v-if="loading" class="notice notice-loading">
          <span class="spinner"></span>
          <span>Loading preferences...</span>
        </div>

        <div v-if="error" class="notice notice-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8.5V13M12 16.5H12.01M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-if="!loading && isUnsubscribed" class="notice notice-warning">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9V13M12 17H12.01M10.29 4.86L2.82 17.5C2.23 18.5 2.95 19.75 4.11 19.75H19.89C21.05 19.75 21.77 18.5 21.18 17.5L13.71 4.86C13.13 3.88 10.87 3.88 10.29 4.86Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>You are currently unsubscribed from marketing emails.</span>
        </div>
      </section>

      <form v-if="!loading" class="preferences-panel" @submit.prevent="handleSave">
        <section class="account-card" aria-labelledby="email-section-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Account</p>
              <h2 id="email-section-title">Email address</h2>
            </div>
            <span class="summary-pill">{{ enabledOptionalCount }} optional on</span>
          </div>

          <label class="email-field">
            <span>Notification email</span>
            <input
              v-model="emailModel"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="your@email.com"
              :aria-invalid="!!emailError"
              :aria-describedby="emailError ? 'email-error' : 'email-help'"
              :class="{ 'input-error': emailError }"
            />
          </label>
          <p id="email-help" class="field-help">We use this address to load and save your notification choices.</p>
          <p v-if="emailError" id="email-error" class="field-error" role="alert">{{ emailError }}</p>
        </section>

        <section class="required-card" aria-labelledby="required-section-title">
          <div class="section-heading compact">
            <div>
              <p class="section-kicker">Always on</p>
              <h2 id="required-section-title">Essential notifications</h2>
            </div>
            <span class="required-pill">Required</span>
          </div>

          <div class="required-grid">
            <div v-for="item in requiredItems" :key="item.title" class="required-item">
              <span class="required-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          v-for="section in preferenceSections"
          :key="section.title"
          class="preference-section"
          :aria-labelledby="section.id"
        >
          <div class="section-heading">
            <div>
              <p class="section-kicker">{{ section.kicker }}</p>
              <h2 :id="section.id">{{ section.title }}</h2>
              <p>{{ section.description }}</p>
            </div>
          </div>

          <div class="preference-list">
            <label
              v-for="item in section.items"
              :key="item.key"
              class="preference-row"
              :class="{ selected: form[item.key] }"
            >
              <span class="preference-copy">
                <span class="preference-title">{{ item.title }}</span>
                <span class="preference-description">{{ item.description }}</span>
              </span>
              <span class="switch-shell">
                <input
                  v-model="form[item.key]"
                  class="switch-input"
                  type="checkbox"
                  :aria-label="item.title"
                />
                <span class="switch-track" aria-hidden="true">
                  <span class="switch-thumb"></span>
                </span>
              </span>
            </label>
          </div>
        </section>

        <footer class="actions-section">
          <div class="save-summary">
            <strong>{{ enabledOptionalCount }} of {{ optionalPreferenceCount }}</strong>
            <span>optional email categories enabled</span>
          </div>

          <button type="submit" class="save-button" :disabled="saving || !isFormValid">
            <span v-if="saving" class="button-spinner"></span>
            <span>{{ saving ? 'Saving...' : 'Save Preferences' }}</span>
          </button>

          <div v-if="success" class="notice notice-success inline-success" role="status">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 12L11 14L15.5 9.5M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Preferences saved successfully</span>
          </div>

          <router-link :to="{ name: 'PrivacyPolicy' }" class="privacy-link">
            Privacy Policy
          </router-link>
        </footer>
      </form>

      <footer class="page-footer">
        <p>Unsubscribe stops marketing emails. You may still receive essential system emails.</p>
      </footer>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPreferences, setPreferences } from '@/api/email-preferences'
import { useUserStore } from '@/store/user'

type PreferenceKey =
  | 'weeklyNewsletter'
  | 'exclusivePromotions'
  | 'bundleOffers'
  | 'creatorSpotlight'
  | 'personalizedRecommendations'
  | 'designUpdates'
  | 'platformAnnouncements'
  | 'surveysFeedback'

type PreferenceItem = {
  key: PreferenceKey
  title: string
  description: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const success = ref(false)
const error = ref('')
const isUnsubscribed = ref(false)

const userEmail = computed(() => userStore.userInfo?.email || '')
const queryEmail = computed((): string => (route.query.email as string) || '')

const form = reactive({
  systemNotifications: true,
  purchaseReceipts: true,
  licenseUpdates: true,
  weeklyNewsletter: true,
  exclusivePromotions: true,
  bundleOffers: false,
  creatorSpotlight: false,
  personalizedRecommendations: true,
  designUpdates: false,
  platformAnnouncements: true,
  surveysFeedback: false,
})

const emailModel = ref(queryEmail.value || userEmail.value)
const emailError = ref('')

const requiredItems = [
  {
    title: 'System notifications',
    description: 'Critical account and security updates',
  },
  {
    title: 'Purchase receipts',
    description: 'Order confirmations and billing receipts',
  },
  {
    title: 'License & activation updates',
    description: 'License keys and activation information',
  },
]

const preferenceSections: Array<{
  id: string
  kicker: string
  title: string
  description: string
  items: PreferenceItem[]
}> = [
  {
    id: 'marketing-section-title',
    kicker: 'Marketing',
    title: 'Deals and product ideas',
    description: 'Choose the promotional emails that are useful to you.',
    items: [
      {
        key: 'weeklyNewsletter',
        title: 'Weekly newsletter',
        description: 'Top apps, watch faces, and product news',
      },
      {
        key: 'exclusivePromotions',
        title: 'Exclusive promotions',
        description: 'Limited-time deals and discounts',
      },
      {
        key: 'bundleOffers',
        title: 'Bundle offers',
        description: 'Curated bundles and savings',
      },
      {
        key: 'creatorSpotlight',
        title: 'Creator spotlight',
        description: 'Featured designers and collections',
      },
      {
        key: 'personalizedRecommendations',
        title: 'Personalized recommendations',
        description: 'Suggestions tailored to your interests',
      },
    ],
  },
  {
    id: 'community-section-title',
    kicker: 'Community',
    title: 'Updates and feedback',
    description: 'Stay close to new releases and help shape Wristo.',
    items: [
      {
        key: 'designUpdates',
        title: 'Design updates',
        description: 'New design drops and improvements',
      },
      {
        key: 'platformAnnouncements',
        title: 'Platform announcements',
        description: 'Important platform news and releases',
      },
      {
        key: 'surveysFeedback',
        title: 'Surveys & feedback',
        description: 'Help us improve Wristo products',
      },
    ],
  },
]

const optionalPreferenceKeys = preferenceSections.flatMap((section) => section.items.map((item) => item.key))

const optionalPreferenceCount = computed(() => optionalPreferenceKeys.length)

const enabledOptionalCount = computed(() => {
  return optionalPreferenceKeys.filter((key) => form[key]).length
})

const isFormValid = computed(() => {
  return emailModel.value && /\S+@\S+\.\S+/.test(emailModel.value)
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const effectiveEmail = queryEmail.value || userEmail.value
    if (effectiveEmail) {
      const prefs = await getPreferences(effectiveEmail)
      if (prefs) {
        isUnsubscribed.value = !!prefs.isUnsubscribed
        form.systemNotifications = true
        form.purchaseReceipts = !!prefs.purchaseReceipts
        form.licenseUpdates = !!prefs.licenseUpdates
        const unsub = !!prefs.isUnsubscribed
        form.weeklyNewsletter = unsub ? false : !!prefs.weeklyNewsletter
        form.exclusivePromotions = unsub ? false : !!prefs.exclusivePromotions
        form.bundleOffers = unsub ? false : !!prefs.bundleOffers
        form.creatorSpotlight = unsub ? false : !!prefs.creatorSpotlight
        form.personalizedRecommendations = unsub ? false : !!prefs.personalizedRecommendations
        form.designUpdates = unsub ? false : !!prefs.designUpdates
        form.platformAnnouncements = unsub ? false : !!prefs.platformAnnouncements
        form.surveysFeedback = unsub ? false : !!prefs.surveysFeedback
      }
      if (!emailModel.value) emailModel.value = effectiveEmail
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load preferences.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  emailError.value = ''
  if (!emailModel.value || !/\S+@\S+\.\S+/.test(emailModel.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }
  saving.value = true
  error.value = ''
  success.value = false
  try {
    await setPreferences({
      email: emailModel.value,
      systemNotifications: 1,
      purchaseReceipts: form.purchaseReceipts ? 1 : 0,
      licenseUpdates: form.licenseUpdates ? 1 : 0,
      weeklyNewsletter: form.weeklyNewsletter ? 1 : 0,
      exclusivePromotions: form.exclusivePromotions ? 1 : 0,
      bundleOffers: form.bundleOffers ? 1 : 0,
      creatorSpotlight: form.creatorSpotlight ? 1 : 0,
      personalizedRecommendations: form.personalizedRecommendations ? 1 : 0,
      designUpdates: form.designUpdates ? 1 : 0,
      platformAnnouncements: form.platformAnnouncements ? 1 : 0,
      surveysFeedback: form.surveysFeedback ? 1 : 0,
      isUnsubscribed: 0,
    })
    success.value = true
    setTimeout(() => {
      router.push({ name: 'PreferencesSuccess', query: { email: emailModel.value } })
    }, 800)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Failed to save preferences.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.preferences-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(0, 122, 255, 0.12), transparent 34rem),
    linear-gradient(180deg, #f7f8fb 0%, #eef1f5 100%);
  color: #17202a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-shell {
  width: min(100% - 32px, 760px);
  margin: 0 auto;
  padding: 48px 0 40px;
}

.page-hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: center;
  margin-bottom: 22px;
}

.hero-mark {
  display: grid;
  width: 60px;
  height: 60px;
  place-items: center;
  border: 1px solid rgba(30, 64, 175, 0.18);
  border-radius: 16px;
  background: linear-gradient(135deg, #0f62fe, #15b8a6);
  color: #fff;
  box-shadow: 0 18px 38px rgba(15, 98, 254, 0.2);
}

.hero-mark svg {
  width: 32px;
  height: 32px;
}

.hero-copy {
  min-width: 0;
}

.eyebrow,
.section-kicker {
  margin: 0 0 4px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #101828;
  font-size: 36px;
  font-weight: 760;
  line-height: 1.12;
}

.hero-copy p:last-child {
  max-width: 42rem;
  margin: 8px 0 0;
  color: #5f6b7a;
  font-size: 17px;
  line-height: 1.55;
}

.status-stack {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.notice {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.4;
}

.notice svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.notice-loading {
  border-color: rgba(15, 98, 254, 0.18);
  background: #eef5ff;
  color: #0f62fe;
}

.notice-success {
  border-color: rgba(16, 185, 129, 0.22);
  background: #ecfdf5;
  color: #047857;
}

.notice-warning {
  border-color: rgba(217, 119, 6, 0.24);
  background: #fff7ed;
  color: #9a3412;
}

.notice-error {
  border-color: rgba(220, 38, 38, 0.22);
  background: #fef2f2;
  color: #b91c1c;
}

.spinner,
.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preferences-panel {
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.12);
}

.account-card,
.required-card,
.preference-section,
.actions-section {
  padding: 24px;
}

.account-card,
.required-card,
.preference-section {
  border-bottom: 1px solid #e8edf3;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading.compact {
  margin-bottom: 14px;
}

.section-heading h2 {
  margin: 0;
  color: #101828;
  font-size: 20px;
  font-weight: 730;
  line-height: 1.25;
}

.section-heading p:not(.section-kicker) {
  margin: 6px 0 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.5;
}

.summary-pill,
.required-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 750;
}

.summary-pill {
  background: #e6fffb;
  color: #0f766e;
}

.required-pill {
  background: #fff7ed;
  color: #c2410c;
}

.email-field {
  display: grid;
  gap: 8px;
  color: #344054;
  font-size: 14px;
  font-weight: 700;
}

.email-field input {
  width: 100%;
  min-height: 52px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  color: #101828;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  padding: 0 14px;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.email-field input::placeholder {
  color: #98a2b3;
  font-weight: 500;
}

.email-field input:focus {
  border-color: #0f62fe;
  box-shadow: 0 0 0 4px rgba(15, 98, 254, 0.14);
  outline: none;
}

.email-field input.input-error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.field-help,
.field-error {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.45;
}

.field-help {
  color: #667085;
}

.field-error {
  color: #b91c1c;
  font-weight: 650;
}

.required-grid {
  display: grid;
  gap: 10px;
}

.required-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  align-items: start;
  min-height: 56px;
  padding: 12px;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  background: #f8fafc;
}

.required-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: #dffcf8;
  color: #0f766e;
}

.required-icon svg {
  width: 18px;
  height: 18px;
}

.required-item h3 {
  margin: 0;
  color: #17202a;
  font-size: 15px;
  font-weight: 720;
  line-height: 1.35;
}

.required-item p {
  margin: 3px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.45;
}

.preference-list {
  display: grid;
  gap: 10px;
}

.preference-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  min-height: 68px;
  padding: 14px;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.preference-row:hover {
  border-color: rgba(15, 98, 254, 0.28);
  background: #fbfdff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.preference-row:active {
  transform: scale(0.995);
}

.preference-row.selected {
  border-color: rgba(15, 118, 110, 0.32);
  background: #f7fffd;
}

.preference-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.preference-title {
  color: #17202a;
  font-size: 15px;
  font-weight: 720;
  line-height: 1.35;
}

.preference-description {
  color: #667085;
  font-size: 13px;
  line-height: 1.45;
}

.switch-shell {
  position: relative;
  display: grid;
  width: 56px;
  height: 44px;
  place-items: center;
}

.switch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  opacity: 0;
}

.switch-track {
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: #d7dee8;
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 7px rgba(15, 23, 42, 0.22);
  transition: transform 180ms ease;
}

.switch-input:checked + .switch-track {
  background: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
}

.switch-input:checked + .switch-track .switch-thumb {
  transform: translateX(20px);
}

.switch-input:focus-visible + .switch-track {
  outline: 3px solid rgba(15, 98, 254, 0.34);
  outline-offset: 3px;
}

.actions-section {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  background: #f8fafc;
}

.save-summary {
  display: grid;
  gap: 2px;
}

.save-summary strong {
  color: #101828;
  font-size: 16px;
  line-height: 1.35;
}

.save-summary span {
  color: #667085;
  font-size: 13px;
  line-height: 1.45;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 188px;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f62fe, #0f766e);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 760;
  line-height: 1;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.save-button:hover:not(:disabled) {
  box-shadow: 0 14px 28px rgba(15, 98, 254, 0.24);
  transform: translateY(-1px);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.save-button:focus-visible,
.privacy-link:focus-visible {
  outline: 3px solid rgba(15, 98, 254, 0.34);
  outline-offset: 3px;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.54;
  transform: none;
}

.button-spinner {
  color: #fff;
}

.inline-success {
  grid-column: 1 / -1;
  margin: 0;
}

.privacy-link {
  justify-self: end;
  color: #0f62fe;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.privacy-link:hover {
  text-decoration: underline;
}

.page-footer {
  max-width: 620px;
  margin: 18px auto 0;
  text-align: center;
}

.page-footer p {
  margin: 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .page-shell {
    width: min(100% - 24px, 760px);
    padding: 28px 0 32px;
  }

  .page-hero {
    grid-template-columns: 1fr;
    gap: 14px;
    text-align: center;
  }

  .hero-mark {
    margin: 0 auto;
  }

  .hero-copy h1 {
    font-size: 30px;
  }

  .hero-copy p:last-child {
    font-size: 16px;
  }

  .preferences-panel {
    border-radius: 16px;
  }

  .account-card,
  .required-card,
  .preference-section,
  .actions-section {
    padding: 18px 14px;
  }

  .section-heading {
    display: grid;
    gap: 10px;
  }

  .summary-pill,
  .required-pill {
    justify-self: start;
  }

  .preference-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .switch-shell {
    justify-self: start;
  }

  .actions-section {
    grid-template-columns: 1fr;
  }

  .save-button {
    width: 100%;
  }

  .privacy-link {
    justify-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
