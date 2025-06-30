<template>
  <div class="newsletter-bg">
    <div class="container">
      <div class="newsletter">
        <div class="title">Join Our Newsletter</div>
        <div class="subtitle">
          Don't miss out! Join our newsletter and get our favorite apps & faces in your inbox.<br>And no...we don't spam.
        </div>
        <div>
          <template v-if="loading">
            <div class="note">Submitting...</div>
          </template>
          <template v-else-if="success">
            <transition name="pop">
              <div class="note success">
                <div class="congrats-icon">🎉</div>
                <div class="congrats-title">Congratulations!</div>
                <div>Thank you for joining our newsletter!</div>
              </div>
            </transition>
          </template>
          <template v-else-if="unsubscribeSuccess">
            <transition name="pop">
              <div class="note unsubscribe-success">
                You have unsubscribed from our newsletter.
              </div>
            </transition>
          </template>
          <template v-else-if="error">
            <div class="note error">
              {{ error }}
              <button class="btn" @click="reset">Try Again</button>
            </div>
          </template>
          <template v-else>
            <div class="form-row">
              <input v-model="inputEmail" type="email" placeholder="Enter your email" class="input-email" />
              <button
                :disabled="loading"
                class="btn subscribe-btn"
                :class="{ 'unsubscribe-mode': showUnsubscribe }"
                @click="showUnsubscribe ? unsubscribeHandler() : joinNewsletterHandler()"
              >
                {{ showUnsubscribe ? 'Unsubscribe' : 'Join Newsletter' }}
              </button>
            </div>
            <div class="unsubscribe-row">
              <a href="#" @click.prevent="toggleSubscribe" class="unsubscribe-link">
                {{ showUnsubscribe ? 'Subscribe' : 'Unsubscribe?' }}
              </a>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { joinNewsletter, unsubscribeNewsletter } from '@/api/contact'

const route = useRoute()
const email = ref<string | null>(null)
const inputEmail = ref('')
const loading = ref(false)
const success = ref(false)
const unsubscribeSuccess = ref(false)
const error = ref('')
const showUnsubscribe = ref(false)

const joinNewsletterHandler = async () => {
  const targetEmail = email.value || inputEmail.value
  if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await joinNewsletter(targetEmail)
    success.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

const unsubscribeHandler = async () => {
  const targetEmail = inputEmail.value
  if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await unsubscribeNewsletter(targetEmail)
    unsubscribeSuccess.value = true
    showUnsubscribe.value = false
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Unsubscribe failed'
  } finally {
    loading.value = false
  }
}

const toggleSubscribe = () => {
  showUnsubscribe.value = !showUnsubscribe.value
}

const reset = () => {
  error.value = ''
  success.value = false
  unsubscribeSuccess.value = false
  inputEmail.value = ''
  showUnsubscribe.value = false
}

onMounted(() => {
  const queryEmail = route.query.email as string | undefined
  if (queryEmail && /^\S+@\S+\.\S+$/.test(queryEmail)) {
    email.value = queryEmail
    joinNewsletterHandler()
  }
})
</script>

<style scoped>
.newsletter-bg {
  background: linear-gradient(135deg, #f7faff 0%, #e3e6f3 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 64px;
  padding-bottom: 64px;
}
.container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 16px;
}
.newsletter {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 48px 40px 40px 40px;
  margin-top: 0;
  text-align: center;
  position: relative;
  max-width: 600px;
}
.title {
  font-size: 2.2em;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
.subtitle {
  color: #666;
  margin-bottom: 32px;
  font-size: 1.1em;
}
.form-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.input-email {
  padding: 14px 16px;
  width: 60%;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 1.08em;
  transition: border 0.2s;
  box-sizing: border-box;
  height: 48px;
}
.input-email:focus {
  border: 1.5px solid #222;
  outline: none;
}
.btn {
  display: inline-block;
  padding: 0 36px;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(90deg, #222 60%, #444 100%);
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  border: none;
  cursor: pointer;
  font-size: 1.15em;
  box-shadow: 0 2px 8px rgba(34,34,34,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn:disabled {
  background: #bcdcff;
  color: #fff;
  cursor: not-allowed;
}
.subscribe-btn {
  background: linear-gradient(90deg, #3b82f6 0%, #222 100%);
  box-shadow: 0 4px 16px rgba(59,130,246,0.10);
  font-size: 1.15em;
  padding: 0 36px;
  height: 48px;
  line-height: 48px;
}
.subscribe-btn.unsubscribe-mode {
  background: linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%);
  color: #555;
  box-shadow: none;
}
.unsubscribe-row {
  text-align: right;
  margin-top: 2px;
}
.unsubscribe-link {
  font-size: 0.95em;
  color: #aaa;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}
.unsubscribe-link:hover {
  color: #666;
}
.note {
  margin: 24px 0 0 0;
  font-size: 1.1em;
}
.success {
  color: #1aaf5d;
  font-weight: bold;
  background: linear-gradient(90deg, #e0ffe8 0%, #f7fff9 100%);
  border-radius: 12px;
  padding: 32px 0 24px 0;
  box-shadow: 0 2px 12px rgba(26,175,93,0.08);
}
.congrats-icon {
  font-size: 3.2em;
  margin-bottom: 12px;
  animation: pop 0.5s cubic-bezier(.68,-0.55,.27,1.55);
}
.congrats-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.unsubscribe-success {
  color: #888;
  background: #f7f7f7;
  border-radius: 10px;
  padding: 24px 0 16px 0;
}
.error {
  color: #d32f2f;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.pop-enter-active {
  animation: pop 0.5s;
}
@keyframes pop {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
</style>
