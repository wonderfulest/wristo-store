<template>
  <div class="purchases-history-page">
    <div class="content-container">
      <div class="header-section">
        <h1 class="title">Purchase History</h1>
        <p class="desc">Enter your email address to receive your complete purchase history via email.</p>
      </div>
      
      <div class="tip-card">
        <div class="tip-icon">📧</div>
        <div class="tip-content">
          <strong>Email Delivery:</strong> Your purchase records will be sent directly to your inbox within a few minutes.
        </div>
      </div>
      
      <form class="history-form" @submit.prevent="handleSendHistory">
        <div class="input-group">
          <label class="input-label">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your email address" 
            class="email-input" 
            required 
            :disabled="loading"
            @input="clearMessages"
          />
          <div v-if="emailError" class="input-desc error">{{ emailError }}</div>
        </div>
        
        <button class="send-btn" :disabled="loading || !isFormValid">
          <span v-if="loading">Sending...</span>
          <span v-else>Send Purchase History</span>
        </button>
      </form>
      
      <div v-if="successMessage" class="message success-message">
        <div class="message-icon">✅</div>
        <div class="message-text">{{ successMessage }}</div>
      </div>
      
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <strong>Tip:</strong> For easier access to your purchase history and subscription management, we recommend 
          <a href="https://sso.wristo.io/login?client=store&redirect_uri=https%3A%2F%2Fwristo.io%2Fauth%2Fcallback" 
             target="_blank" 
             class="register-link">
            creating an account
          </a>. 
          Once registered, you can view your purchase history directly from the user menu in the top right corner.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getPurchaseRecordsByEmail } from '@/api/pay'
import { ElMessage } from 'element-plus'

const email = ref('')
const loading = ref(false)
const emailError = ref('')
const successMessage = ref('')

const isFormValid = computed(() => {
  return email.value && validateEmail(email.value)
})

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const clearMessages = () => {
  emailError.value = ''
  successMessage.value = ''
}

const handleSendHistory = async () => {
  emailError.value = ''
  successMessage.value = ''
  
  if (!email.value) {
    emailError.value = 'Please enter your email address'
    return
  }
  
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }
  
  loading.value = true
  
  try {
    await getPurchaseRecordsByEmail(email.value)
    successMessage.value = `Purchase history has been sent to ${email.value}. Please check your email inbox (and spam folder).`
    email.value = ''
  } catch (error) {
    ElMessage.error('Failed to send purchase history. Please try again later.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.purchases-history-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 480px;
  min-height: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.header-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.desc {
  color: #86868b;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
}

.tip-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 50px;
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-content {
  color: #0c4a6e;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.history-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.email-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  background: #fff;
  color: #1d1d1f;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.email-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.email-input::placeholder {
  color: #86868b;
}

.input-desc {
  font-size: 0.85rem;
  color: #86868b;
  margin-top: 4px;
  line-height: 1.4;
}

.input-desc.error {
  color: #dc2626;
}

.send-btn {
  background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  width: 100%;
  margin-top: auto;
  margin-bottom: 16px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.send-btn:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  min-height: 60px;
  justify-content: center;
}

.message-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-text {
  margin: 0;
  line-height: 1.4;
}

.success-message {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.info-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content {
  color: #92400e;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.register-link {
  color: #007aff;
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #0056cc;
}

@media (max-width: 480px) {
  .content-container {
    padding: 32px 24px;
    gap: 16px;
    width: 90%;
    min-height: 400px;
    max-height: 95vh;
  }
  
  .tip-card {
    min-height: auto;
    padding: 12px;
  }
  
  .history-form {
    gap: 12px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .desc {
    font-size: 1rem;
  }
  
  .email-input {
    padding: 14px 16px;
    font-size: 1rem;
  }
  
  .send-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
}
</style>
