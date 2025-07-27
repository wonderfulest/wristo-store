<template>
  <div class="unlock-page">
    <div class="unlock-container">
      <div class="unlock-header">
        <h1 class="title">Unlock Your Watch Face</h1>
        <p class="desc">Enter your email and the 6-digit code from your watch to unlock your purchase.</p>
      </div>
      
      <form class="unlock-form" @submit.prevent="handleUnlock">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            class="form-input"
            required
            @input="clearError"
          />
        </div>
        
        <div class="form-group">
          <label for="code" class="form-label">6-Digit Code</label>
          <input
            id="code"
            v-model="code"
            type="text"
            maxlength="6"
            placeholder="000000"
            class="form-input code-input"
            required
            @input="clearError"
          />
          <div class="code-hint">Enter the 6-digit code shown on your watch face</div>
        </div>
        
        <button type="submit" class="unlock-btn" :disabled="loading">
          <span v-if="loading">Unlocking...</span>
          <span v-else>Unlock</span>
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
      </div>
      
      <div v-if="success" class="success-message">
        <div class="success-icon">✅</div>
        <div class="success-text">
          <h3>Unlock Successful!</h3>
          <p>Your watch face has been unlocked. Please sync your device to see the changes.</p>
        </div>
      </div>
      
      <!-- <div class="help-links">
        <h3>Need Help?</h3>
        <ul>
          <li><a href="/faq">FAQ & Help Center</a></li>
          <li><a href="/contact">Contact Support</a></li>
          <li><a href="/already-purchased">Find Purchase History</a></li>
        </ul>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const email = ref('')
const code = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

function clearError() {
  if (error.value) {
    error.value = ''
  }
}

async function handleUnlock() {
  error.value = ''
  success.value = false
  
  if (!email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }
  
  if (!code.value.trim()) {
    error.value = 'Please enter the 6-digit code'
    return
  }
  
  if (code.value.length !== 6) {
    error.value = 'Please enter a 6-digit code'
    return
  }
  
  loading.value = true
  
  try {
    // 这里调用实际的解锁 API
    // const response = await unlockWatchFace(email.value, code.value)
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟成功响应
    if (email.value === 'test@example.com' && code.value === '123456') {
      success.value = true
      ElMessage.success('Watch face unlocked successfully!')
      email.value = ''
      code.value = ''
    } else {
      error.value = 'Invalid email or code. Please check and try again.'
    }
  } catch (e) {
    error.value = 'Network error. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.unlock-page {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unlock-container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 32px;
  max-width: 480px;
  width: 100%;
}

.unlock-header {
  text-align: center;
  margin-bottom: 24px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 8px;
}

.desc {
  color: #718096;
  font-size: 1rem;
  line-height: 1.5;
}

.unlock-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.code-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 2px;
}

.code-hint {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 4px;
}

.unlock-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.unlock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.unlock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.error-text {
  color: #c53030;
  font-weight: 500;
  font-size: 0.9rem;
}

.success-message {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.success-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.success-text h3 {
  color: #22543d;
  margin: 0 0 6px 0;
  font-size: 1rem;
}

.success-text p {
  color: #2f855a;
  margin: 0;
  line-height: 1.4;
  font-size: 0.9rem;
}

.help-links {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 16px;
}

.help-links h3 {
  color: #2d3748;
  font-size: 1rem;
  margin-bottom: 8px;
}

.help-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-links li {
  margin-bottom: 4px;
}

.help-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.9rem;
}

.help-links a:hover {
  color: #5a67d8;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .unlock-container {
    padding: 20px 16px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .desc {
    font-size: 0.9rem;
  }
  
  .form-group {
    margin-bottom: 12px;
  }
  
  .form-input {
    padding: 8px 12px;
  }
}
</style> 