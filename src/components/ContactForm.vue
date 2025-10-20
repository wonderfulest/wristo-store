<template>
  <div class="contact-form-container">
    <div class="contact-header">
      <h2>Still need help?</h2>
      <p>Please contact us via the following methods:</p>
    </div>
    <div class="contact-methods">
      <div class="contact-method">
        <div class="method-icon">📧</div>
        <div class="method-content">
          <span class="method-label">Email</span>
          <a href="mailto:support@wristo.io" class="method-link">support@wristo.io</a>
        </div>
      </div>
      <div class="contact-method">
        <div class="method-icon">💬</div>
        <div class="method-content">
          <span class="method-label">Message</span>
          <span class="method-desc">Leave a message below, we will reply as soon as possible.</span>
        </div>
      </div>
    </div>
    <div class="contact-form">
      <div v-if="!userEmail" class="email-input-group">
        <label class="email-label">Your Email</label>
        <input 
          type="email" 
          v-model="email"
          placeholder="Enter your email address"
          class="email-input"
          :class="{ 'email-input-error': email && !isValidEmail(email) }"
        />
        <div v-if="email && !isValidEmail(email)" class="email-error">
          Please enter a valid email address
        </div>
      </div>
      <textarea 
        placeholder="Please enter your question or feedback..." 
        v-model="message"
        class="contact-textarea"
        rows="6"
      ></textarea>
      <button class="contact-send-btn" @click="sendMessage" :disabled="loading">
        <span class="send-icon">{{ loading ? '⏳' : '📤' }}</span>
        <span>{{ loading ? 'Sending...' : 'Send Message' }}</span>
      </button>
    </div>
    <div v-if="showMessage" class="message-alert" :class="messageType">
      <span class="message-icon">{{ messageType === 'success' ? '✅' : '⚠️' }}</span>
      <span class="message-text">{{ alertMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { sendContactMessage } from '@/api/contact'

const message = ref('')
const email = ref('')
const showMessage = ref(false)
const alertMessage = ref('')
const messageType = ref<'success' | 'error'>('success')
const loading = ref(false)

const userStore = useUserStore()

const userEmail = computed(() => userStore.userInfo?.email || '')

const emit = defineEmits<{
  send: [message: string, email?: string]
}>()

// 邮箱格式校验
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showAlert(text: string, type: 'success' | 'error' = 'success') {
  alertMessage.value = text
  messageType.value = type
  showMessage.value = true
  
  // 3秒后自动隐藏
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

async function sendMessage() {
  if (!message.value.trim()) {
    showAlert('Please enter your question or feedback', 'error')
    return
  }
  
  if (!userEmail.value && !email.value.trim()) {
    showAlert('Please enter your email address', 'error')
    return
  }
  
  const finalEmail = userEmail.value || email.value.trim()
  
  // 校验邮箱格式
  if (!userEmail.value && !isValidEmail(finalEmail)) {
    showAlert('Please enter a valid email address', 'error')
    return
  }
  
  try {
    loading.value = true
    await sendContactMessage({
      email: finalEmail,
      content: message.value
    })
    
    showAlert('Message sent successfully! We will reply as soon as possible.')
    message.value = ''
    email.value = ''
    emit('send', message.value, finalEmail)
  } catch (error) {
    showAlert('Failed to send message. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-form-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.contact-header {
  text-align: center;
  margin-bottom: 32px;
}

.contact-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.contact-header p {
  color: #86868b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.4;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.contact-method:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.method-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff, #5856d6);
  border-radius: 10px;
  color: white;
  font-size: 1.2rem;
}

.method-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method-link {
  color: #007aff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.method-link:hover {
  color: #0056b3;
}

.method-desc {
  color: #1d1d1f;
  font-size: 0.95rem;
  line-height: 1.4;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.email-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.email-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.3px;
}

.email-input {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
  font-family: inherit;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.email-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.email-input::placeholder {
  color: #86868b;
}

.email-input-error {
  border-color: #ff3b30;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.email-error {
  color: #ff3b30;
  font-size: 0.8rem;
  margin-top: 4px;
}

.contact-textarea {
  min-height: 100px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.contact-textarea:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.contact-textarea::placeholder {
  color: #86868b;
}

.contact-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.contact-send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.contact-send-btn:active {
  transform: translateY(0);
}

.contact-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.contact-send-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.send-icon {
  font-size: 1.1rem;
}

.message-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.message-alert.success {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.2);
  color: #34c759;
}

.message-alert.error {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.message-icon {
  font-size: 1.1rem;
}

.message-text {
  flex: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .contact-form-container {
    padding: 24px;
    margin-top: 32px;
  }
  
  .contact-header h2 {
    font-size: 1.3rem;
  }
  
  .contact-method {
    padding: 12px;
  }
  
  .method-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}
</style> 