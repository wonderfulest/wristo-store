<template>
  <div class="preferences-page">
    <div class="page-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-icon">
          <div class="icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="header-content">
          <h1 class="page-title">Email Preferences</h1>
          <p class="page-subtitle">Customize your email notifications</p>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="loading" class="status-message loading">
        <div class="spinner"></div>
        <span>Loading preferences...</span>
      </div>
      
      <div v-if="error" class="status-message error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ error }}</span>
      </div>

      <div v-if="!loading && isUnsubscribed" class="status-message error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>You are currently unsubscribed from marketing emails.</span>
      </div>

      <!-- Main Content -->
      <div v-if="!loading" class="content-wrapper">
        <form @submit.prevent="handleSave" class="preferences-form">
          <!-- Email Input Section -->
          <div class="section email-section">
            <div class="section-header">
              <h2 class="section-title">Email Address</h2>
              <p class="section-desc">Enter the email address for your notifications</p>
            </div>
            <div class="input-wrapper">
              <input 
                type="email" 
                v-model="emailModel" 
                placeholder="your@email.com"
                class="email-input"
                :class="{ 'input-error': emailError }"
              />
              <div v-if="emailError" class="input-error-text">{{ emailError }}</div>
            </div>
          </div>

          <!-- System Notifications -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">System Notifications</h2>
              <p class="section-desc">Essential emails that cannot be disabled</p>
            </div>
            <div class="preferences-list">
              <div class="preference-item disabled">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">System notifications</span>
                    <span class="preference-badge required">Required</span>
                  </div>
                  <p class="preference-desc">Critical account and security updates</p>
                </div>
                <div class="toggle-wrapper">
                  <div class="toggle enabled disabled"></div>
                </div>
              </div>
              
              <div class="preference-item disabled">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Purchase receipts</span>
                    <span class="preference-badge required">Required</span>
                  </div>
                  <p class="preference-desc">Order confirmations and billing receipts</p>
                </div>
                <div class="toggle-wrapper">
                  <div class="toggle enabled disabled"></div>
                </div>
              </div>
              
              <div class="preference-item disabled">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">License & activation updates</span>
                    <span class="preference-badge required">Required</span>
                  </div>
                  <p class="preference-desc">License keys and activation information</p>
                </div>
                <div class="toggle-wrapper">
                  <div class="toggle enabled disabled"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Marketing & Promotions -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Marketing & Promotions</h2>
              <p class="section-desc">Product updates, deals, and promotional content</p>
            </div>
            <div class="preferences-list">
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Weekly newsletter</span>
                  </div>
                  <p class="preference-desc">Top apps, faces and product news</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.weeklyNewsletter" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.weeklyNewsletter }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Exclusive promotions</span>
                  </div>
                  <p class="preference-desc">Limited-time deals and discounts</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.exclusivePromotions" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.exclusivePromotions }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Bundle offers</span>
                  </div>
                  <p class="preference-desc">Curated bundles and savings</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.bundleOffers" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.bundleOffers }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Creator spotlight</span>
                  </div>
                  <p class="preference-desc">Featured designers and collections</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.creatorSpotlight" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.creatorSpotlight }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Personalized recommendations</span>
                  </div>
                  <p class="preference-desc">Suggestions tailored to your interests</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.personalizedRecommendations" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.personalizedRecommendations }"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Community & Educational -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Community & Educational</h2>
              <p class="section-desc">Platform updates and community content</p>
            </div>
            <div class="preferences-list">
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Design updates</span>
                  </div>
                  <p class="preference-desc">New design drops and improvements</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.designUpdates" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.designUpdates }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Platform announcements</span>
                  </div>
                  <p class="preference-desc">Important platform news and releases</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.platformAnnouncements" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.platformAnnouncements }"></div>
                </div>
              </label>
              
              <label class="preference-item">
                <div class="preference-content">
                  <div class="preference-main">
                    <span class="preference-title">Surveys & feedback</span>
                  </div>
                  <p class="preference-desc">Help us improve Wristo products</p>
                </div>
                <div class="toggle-wrapper">
                  <input type="checkbox" v-model="form.surveysFeedback" class="toggle-input" />
                  <div class="toggle" :class="{ enabled: form.surveysFeedback }"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="actions-section">
            <button type="submit" class="save-button" :disabled="saving || !isFormValid">
              <span v-if="saving" class="button-spinner"></span>
              <span>{{ saving ? 'Saving...' : 'Save Preferences' }}</span>
            </button>
            <div v-if="success" class="status-message success actions-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Preferences saved successfully</span>
            </div>
            <router-link :to="{ name: 'PrivacyPolicy' }" class="privacy-link">
              Privacy Policy
            </router-link>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="page-footer">
        <p>Unsubscribe stops marketing emails. You may still receive essential system emails.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getPreferences, setPreferences } from '@/api/email-preferences'

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
  // required system notifications (display-only in UI but we store as 1)
  systemNotifications: true,
  purchaseReceipts: true,
  licenseUpdates: true,
  // marketing & promotions
  weeklyNewsletter: true,
  exclusivePromotions: true,
  bundleOffers: false,
  creatorSpotlight: false,
  personalizedRecommendations: true,
  // community & educational
  designUpdates: false,
  platformAnnouncements: true,
  surveysFeedback: false,
})

const emailModel = ref(queryEmail.value || userEmail.value)
const emailError = ref('')

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
      console.log('EmailPreferences.vue:load', prefs)
      if (prefs) {
        isUnsubscribed.value = !!prefs.isUnsubscribed
        form.systemNotifications = true
        form.purchaseReceipts = !!prefs.purchaseReceipts
        form.licenseUpdates = !!prefs.licenseUpdates
        // If globally unsubscribed, default marketing toggles to false for clarity
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
    // Navigate to success page shortly after showing inline success message
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
/* Apple UI Design System */
.preferences-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.header-icon {
  flex-shrink: 0;
}

.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007aff, #5856d6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 3px 14px rgba(0, 122, 255, 0.25);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 2px 0;
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 14px;
  font-weight: 500;
}

.status-message.loading {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.status-message.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.2);
}

.status-message.error {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
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

/* Content */
.content-wrapper {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.preferences-form {
  display: flex;
  flex-direction: column;
}

/* Sections */
.section { border-bottom: 1px solid rgba(0, 0, 0, 0.04); }

.section:last-of-type {
  border-bottom: none;
}

.section-header { padding: 16px 16px 8px 16px; }

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 2px 0;
  letter-spacing: -0.2px;
}

.section-desc { font-size: 13px; color: #86868b; margin: 0; line-height: 1.3; }

/* Email Section */
.email-section .section-header {
  padding-bottom: 10px;
  text-align: center;
}

.input-wrapper {
  padding: 0 16px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.email-input {
  width: 100%;
  max-width: 420px;
  height: 44px;
  border: 1.2px solid #d1d1d6;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 16px;
  text-align: center;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.email-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.12);
}

.email-input.input-error {
  border-color: #ff3b30;
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.1);
}

.input-error-text {
  color: #ff3b30;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
  text-align: center;
}

/* Preferences List */
.preferences-list { padding: 0 16px 12px 16px; }

.preference-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-item:not(.disabled):hover {
  background: rgba(0, 122, 255, 0.02);
}

.preference-item.disabled {
  cursor: default;
  opacity: 0.6;
}

.preference-content {
  flex: 1;
}

.preference-main { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }

.preference-title { font-size: 15px; font-weight: 600; color: #1d1d1f; }

.preference-badge { font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px; }

.preference-badge.required {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.preference-desc { font-size: 13px; color: #86868b; margin: 0; line-height: 1.35; }

/* Toggle Switch */
.toggle-wrapper {
  position: relative;
  flex-shrink: 0;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle {
  width: 44px;
  height: 26px;
  background: #e5e5ea;
  border-radius: 14px;
  position: relative;
  transition: all 0.25s ease;
  cursor: pointer;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle.enabled {
  background: #34c759;
}

.toggle.enabled::after { transform: translateX(18px); }

.toggle.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Actions */
.actions-section { padding: 16px; display: flex; flex-direction: column; gap: 12px; align-items: center; }

.save-button {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.privacy-link {
  color: #007aff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.privacy-link:hover {
  opacity: 0.7;
}

/* Footer */
.page-footer { text-align: center; margin-top: 20px; padding: 0 16px; }

.page-footer p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container { padding: 16px 12px; }
  .page-header { margin-bottom: 16px; gap: 10px; }
  .page-title { font-size: 20px; }
  .page-subtitle { font-size: 13px; }
  .icon-circle { width: 40px; height: 40px; border-radius: 10px; }
  .section-header, .input-wrapper, .preferences-list, .actions-section { padding-left: 12px; padding-right: 12px; }
  .section-title { font-size: 15px; }
  .section-desc { font-size: 12px; }
  .email-input { height: 40px; font-size: 14px; }
  .preferences-list { padding-bottom: 8px; }
  .preference-item { padding: 8px 0; gap: 10px; }
  .preference-title { font-size: 14px; }
  .preference-desc { font-size: 12px; }
  .toggle { width: 40px; height: 24px; }
  .toggle::after { width: 20px; height: 20px; }
  .toggle.enabled::after { transform: translateX(16px); }
  .save-button { height: 42px; font-size: 15px; }
  .status-message { padding: 10px 12px; margin-bottom: 10px; }
}
</style>
