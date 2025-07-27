<template>
  <div class="already-purchased-page">
    <div class="content-container">
      <div class="header-section">
        <h1 class="title">Find My Purchase History</h1>
        <p class="desc">Enter your email address to receive your purchase records.</p>
      </div>
      
      <div class="tip-card">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <strong>Pro Tip:</strong> Register with your purchase email to view records directly.
        </div>
      </div>
      
      <form class="lookup-form" @submit.prevent="handleLookup">
        <div class="input-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your email address" 
            class="email-input" 
            required 
            @input="clearMessages"
          />
        </div>
        <button class="lookup-btn" :disabled="loading">
          <span v-if="loading">Sending...</span>
          <span v-else>Send to Email</span>
        </button>
      </form>
      
      <div v-if="error" class="message error-message">
        <div class="message-icon">⚠️</div>
        <div class="message-text">{{ error }}</div>
      </div>
      
      <div v-if="success" class="message success-message">
        <div class="message-icon">✅</div>
        <div class="message-text">Purchase records have been sent to your email!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getPurchaseRecordsByEmail } from '@/api/pay'
import { ElMessage } from 'element-plus'

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

function clearMessages() {
  error.value = ''
  success.value = false
}

async function handleLookup() {
  error.value = ''
  success.value = false
  if (!email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }
  loading.value = true
  try {
    const res = await getPurchaseRecordsByEmail(email.value)
    if (res.code === 0 && res.data === true) {
      success.value = true
      ElMessage.success('Purchase records have been sent to your email!')
    } else {
      error.value = res.msg || 'No purchase records found for this email.'
    }
  } catch (e) {
    error.value = 'Network error, please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.already-purchased-page {
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
  height: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-section {
  text-align: center;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  height: 60px;
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

.lookup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 120px;
  justify-content: center;
}

.input-group {
  position: relative;
  display: flex;
  justify-content: center;
}

.email-input {
  width: 90%;
  padding: 16px 20px;
  font-size: 1.1rem;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  background: #fff;
  color: #1d1d1f;
  transition: all 0.3s ease;
  outline: none;
}

.email-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.email-input::placeholder {
  color: #86868b;
}

.lookup-btn {
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
  margin: 0 auto;
}

.lookup-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.lookup-btn:disabled {
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
  height: 60px;
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

.error-message {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-message {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

@media (max-width: 480px) {
  .content-container {
    padding: 32px 24px;
    gap: 20px;
    width: 90%;
    height: 500px;
  }
  
  .header-section {
    height: 100px;
  }
  
  .tip-card {
    height: 100px;
  }
  
  .lookup-form {
    height: 100px;
  }
  
  .message {
    height: 60px;
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
  
  .lookup-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
}
</style> 