<template>
  <div class="unsubscribe-page">
    <div class="page-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-icon">
          <div class="icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="header-content">
          <h1 class="page-title">Unsubscribe</h1>
          <p class="page-subtitle">Stop receiving marketing emails from Wristo</p>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="loading" class="status-message loading">
        <div class="spinner"></div>
        <span>Processing your request...</span>
      </div>
      
      <div v-if="success" class="status-message success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>You have been unsubscribed from Wristo newsletters</span>
      </div>
      
      <div v-if="error" class="status-message error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Main Content -->
      <div v-if="!loading && !success" class="content-wrapper">
        <form @submit.prevent="handleSubmit" class="unsubscribe-form">
          <!-- Email Input Section -->
          <div class="section email-section">
            <div class="section-header">
              <h2 class="section-title">Email Address</h2>
              <p class="section-desc">Enter your email address to unsubscribe</p>
            </div>
            <div class="input-wrapper">
              <input 
                type="email" 
                v-model="emailModel" 
                placeholder="your@email.com"
                class="email-input"
                :class="{ 'input-error': inputError }"
              />
              <div v-if="inputError" class="input-error-text">{{ inputError }}</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="actions-section">
            <button type="submit" class="unsubscribe-button" :disabled="submitting || !isFormValid">
              <span v-if="submitting" class="button-spinner"></span>
              <span>{{ submitting ? 'Unsubscribing...' : 'Unsubscribe from Marketing' }}</span>
            </button>
            <router-link :to="{ name: 'EmailPreferences', query: { email: emailModel } }" class="preferences-link">
              Manage Email Preferences Instead
            </router-link>
          </div>
        </form>
      </div>

      <!-- Success Actions -->
      <div v-if="success" class="success-actions">
        <router-link :to="{ name: 'EmailPreferences', query: { email: emailModel } }" class="manage-button">
          Manage Email Preferences
        </router-link>
        <a href="https://www.wristo.io" class="home-button">Back to Wristo.io</a>
      </div>

      <!-- Footer -->
      <div class="page-footer">
        <p>Unsubscribing stops marketing emails only. You may still receive essential system emails like receipts or account notices.</p>
      </div>
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
/* Apple UI Design System */
.unsubscribe-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-top: calc(10vh + 40px);
  padding-bottom: 40px;
  padding-left: 20px;
  padding-right: 20px;
}

.page-container {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  margin-bottom: 16px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff3b30, #d70015);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 24px rgba(255, 59, 48, 0.3);
}

.icon-circle svg {
  width: 32px;
  height: 32px;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 17px;
  color: #86868b;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 500;
  font-size: 16px;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.unsubscribe-form {
  display: flex;
  flex-direction: column;
}

/* Email Section */
.section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.section:last-of-type {
  border-bottom: none;
}

.section-header {
  padding: 24px 24px 12px 24px;
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.section-desc {
  font-size: 15px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

.input-wrapper {
  padding: 0 24px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.email-input {
  width: 100%;
  max-width: 400px;
  height: 52px;
  border: 1.5px solid #d1d1d6;
  border-radius: 14px;
  padding: 0 18px;
  font-size: 22px;
  text-align: center;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.email-input:focus {
  outline: none;
  border-color: #ff3b30;
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.12);
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

/* Actions */
.actions-section {
  padding: 20px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.unsubscribe-button {
  width: 100%;
  max-width: 400px;
  height: 52px;
  background: linear-gradient(135deg, #ff3b30, #d70015);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.unsubscribe-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(255, 59, 48, 0.3);
}

.unsubscribe-button:disabled {
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

.preferences-link {
  color: #007aff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: opacity 0.2s ease;
  text-align: center;
}

.preferences-link:hover {
  opacity: 0.7;
}

/* Success Actions */
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.manage-button, .home-button {
  height: 52px;
  padding: 0 24px;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.manage-button {
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
}

.home-button {
  background: #fff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.manage-button:hover, .home-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Footer */
.page-footer {
  text-align: center;
  margin-top: 32px;
  padding: 0 20px;
}

.page-footer p {
  font-size: 15px;
  color: #86868b;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .unsubscribe-page {
    padding-top: calc(8vh + 20px);
    padding-bottom: 20px;
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }
  
  .icon-circle svg {
    width: 28px;
    height: 28px;
  }
  
  .section-header {
    padding: 20px 20px 10px 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .input-wrapper {
    padding: 0 20px 16px 20px;
  }
  
  .actions-section {
    padding: 16px 20px 20px 20px;
  }
  
  .email-input {
    height: 48px;
    font-size: 18px;
  }
  
  .unsubscribe-button {
    height: 48px;
    font-size: 16px;
  }
  
  .manage-button, .home-button {
    height: 48px;
    font-size: 16px;
  }
  
  .status-message {
    padding: 14px 16px;
    margin-bottom: 20px;
    font-size: 15px;
  }
}
</style>
