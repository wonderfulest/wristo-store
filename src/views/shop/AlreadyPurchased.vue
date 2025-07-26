<template>
  <div class="already-purchased-page">
    <h1 class="title">Find My Purchase History</h1>
    <p class="desc">Please enter the email address you used when purchasing. We will send your purchase records to your email.</p>
    <div class="tip-box">
      <div class="tip-icon">💡</div>
      <div class="tip-content">
        <strong>Pro Tip:</strong> Register with your purchase email in the top-right corner to view your purchase records directly without email lookup.
      </div>
    </div>
    <form class="lookup-form" @submit.prevent="handleLookup">
      <input v-model="email" type="email" placeholder="Enter your email" class="email-input" required />
      <button class="lookup-btn" :disabled="loading">
        <span v-if="loading">Sending...</span>
        <span v-else>Send to Email</span>
      </button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">
      <div class="success-icon">✅</div>
      <div class="success-text">Purchase records have been sent to your email!</div>
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
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 24px 0 24px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #222;
  min-height: 100vh;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  text-align: center;
}
.desc {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.tip-box {
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.tip-content {
  color: #0c4a6e;
  font-size: 0.95rem;
  line-height: 1.5;
}
.lookup-form {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
  justify-content: center;
}
.email-input {
  flex: 1;
  padding: 12px;
  font-size: 1.1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
}
.lookup-btn {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.lookup-btn:disabled {
  background: #b7b7b7;
  cursor: not-allowed;
}
.error {
  color: #e63946;
  margin-bottom: 1.2rem;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
}
.success {
  color: #059669;
  margin-bottom: 1.2rem;
  text-align: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.success-icon {
  font-size: 1.2rem;
}
.success-text {
  font-weight: 600;
}
</style> 