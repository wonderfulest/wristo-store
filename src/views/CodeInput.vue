<template>
  <div class="container">
    <Logo />
    <h1>Enter Code</h1>
    <p class="desc">
      Please enter the code shown on your smartwatch or device. A code will only appear after you install a clockface or app.
    </p>
    <div class="input-group">
      <label for="code" class="input-label">Code</label>
      <input id="code" v-model="code" maxlength="6" placeholder="000000" class="code-input" />
      <div class="input-desc">The code shown on your smartwatch.</div>
    </div>
    <div v-if="error" style="color: #e63946; margin-bottom: 8px; text-align: left;">
      {{ error }}
    </div>
    <div class="help">
      Not seeing your code?
      <a href="#" class="learn-more">Learn more</a>
    </div>
    <div class="button-group">
      <button class="btn outline">Already Purchased</button>
      <button class="btn" :disabled="code.length !== 6 || loading" @click="handleContinue">Continue</button>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { purchaseByCode } from '@/api/pay'
import { BizErrorCode } from '@/constant/errorCode'
import { useShopOptionsStore } from '@/store/shopOptions'
import Logo from '@/components/Logo.vue'
import Footer from '@/components/Footer.vue'

const code = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const store = useShopOptionsStore()

const handleContinue = async () => {
  if (code.value.length !== 6) return
  error.value = ''
  loading.value = true
  try {
    const res = await purchaseByCode(code.value)
    if (res.code == BizErrorCode.INVALID_PAYMENT_CODE) { // 无效的支付码
      error.value = 'Cannot find code. If you are sure you typed it correctly, it might have been expired. Please check our FAQ on how to do this.'
    } else {
      store.setData(res.data)
      router.push({ name: 'ShopOptions' })
    }
  } catch (e) {
    error.value = 'Network error, please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 24px 0 24px;
  text-align: center;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
}
.logo {
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-align: center;
}
.logo-bold {
  color: #222;
  font-weight: 700;
}
.logo-green {
  color: #7ca89c;
  font-weight: 700;
  margin-left: 2px;
}
h1 {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 16px;
}
.desc {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 32px;
}
.input-group {
  text-align: left;
  margin-bottom: 8px;
}
.input-label {
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}
.code-input {
  width: 100%;
  font-size: 1.5rem;
  padding: 16px 12px;
  border: 4px solid #cbd5e1;
  border-radius: 16px;
  margin-bottom: 4px;
  box-sizing: border-box;
  outline: none;
}
.code-input:focus {
  border-color: #64748b;
}
.input-desc {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 16px;
}
.help {
  margin: 24px 0 32px 0;
  color: #374151;
  font-size: 1.1rem;
}
.learn-more {
  color: #000;
  font-weight: bold;
  text-decoration: underline;
  margin-left: 4px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
}
.btn {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 16px 32px;
  border-radius: 32px;
  border: none;
  background: #000;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.outline {
  background: #fff;
  color: #000;
  border: 4px solid #000;
}
.btn:hover {
  background: #374151;
}
.btn.outline:hover {
  background: #f3f4f6;
}
.footer {
  color: #6b7280;
  font-size: 0.95rem;
  margin-top: 32px;
}
.footer a {
  color: #000;
  text-decoration: underline;
  margin: 0 2px;
}
</style> 