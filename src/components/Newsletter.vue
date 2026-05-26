<template>
  <div class="newsletter-bg">
    <div class="container">
      <div class="newsletter">
        <div class="eyebrow">Fresh drops, curated weekly</div>
        <div class="title">Join Our Newsletter</div>
        <div class="subtitle">
          Weekly Wristo picks and fresh watch faces. No spam.
        </div>
        <div class="newsletter-content">
          <template v-if="loading">
            <div class="note loading-note" aria-live="polite">Submitting...</div>
          </template>
          <template v-else-if="success">
            <transition name="pop">
              <div class="note success" role="status" aria-live="polite">
                <div class="congrats-icon" aria-hidden="true"></div>
                <div class="congrats-title">{{ lastAction === 'unsubscribe' ? 'Updated!' : 'Congratulations!' }}</div>
                <div>
                  {{ lastAction === 'unsubscribe' 
                    ? 'You have been unsubscribed from our marketing emails.' 
                    : 'Thank you for joining our newsletter!' }}
                </div>
              </div>
            </transition>
          </template>
          <template v-else-if="error">
            <div class="note error" role="alert">
              <span>{{ error }}</span>
              <button class="btn" @click="reset">Try Again</button>
            </div>
          </template>
          <template v-else>
            <div class="form-row">
              <label class="sr-only" for="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                v-model="inputEmail"
                type="email"
                placeholder="Enter your email"
                autocomplete="email"
                class="input-email"
              />
              <button
                :disabled="loading"
                class="btn subscribe-btn"
                @click="joinNewsletterHandler()"
              >
                Join Newsletter
              </button>
            </div>
            <div class="unsubscribe-row">
              <a href="#" @click.prevent="goToPreferences" class="unsubscribe-link">Email Preferences</a>
              <span class="divider">·</span>
              <a href="#" @click.prevent="unsubscribeHandler" class="unsubscribe-link">Unsubscribe?</a>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subscribeAll, unsubscribeAll } from '@/api/email-preferences'

const route = useRoute()
const router = useRouter()
const email = ref<string | null>(null)
const inputEmail = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const lastAction = ref<'subscribe' | 'unsubscribe'>('subscribe')
// Only subscription is handled here

const joinNewsletterHandler = async () => {
  const targetEmail = email.value || inputEmail.value
  if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await subscribeAll(targetEmail)
    lastAction.value = 'subscribe'
    success.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Request failed'
  } finally {
    loading.value = false
  }
}

const unsubscribeHandler = () => {
  const targetEmail = inputEmail.value || email.value || ''
  if (!/^\S+@\S+\.\S+$/.test(targetEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  error.value = ''
  unsubscribeAll(targetEmail)
    .then(() => { lastAction.value = 'unsubscribe'; success.value = true })
    .catch((e: any) => { error.value = e?.response?.data?.message || e.message || 'Request failed' })
    .finally(() => { loading.value = false })
}

const goToPreferences = () => {
  const targetEmail = inputEmail.value || email.value || ''
  const query = /^\S+@\S+\.\S+$/.test(targetEmail) ? { email: targetEmail } : undefined
  router.push({ name: 'EmailPreferences', query })
}

const reset = () => {
  error.value = ''
  success.value = false
  inputEmail.value = ''
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
  background:
    radial-gradient(circle at 12% 18%, rgba(245, 158, 11, 0.16), transparent 28rem),
    radial-gradient(circle at 88% 8%, rgba(15, 107, 104, 0.16), transparent 26rem),
    linear-gradient(135deg, #fbfdfc 0%, var(--color-surface-soft) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 40px 16px;
  box-sizing: border-box;
}
.container {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}
.newsletter {
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.88) 100%);
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 32px 36px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  width: 100%;
  max-width: 720px;
  box-sizing: border-box;
}
.newsletter::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(15, 107, 104, 0.12), rgba(245, 158, 11, 0.12)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.56), transparent 34%);
  pointer-events: none;
}
.newsletter::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 176px;
  height: 176px;
  background:
    linear-gradient(135deg, rgba(15, 107, 104, 0.18), rgba(245, 158, 11, 0.18));
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  opacity: 0.9;
  pointer-events: none;
}
.newsletter > * {
  position: relative;
  z-index: 1;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 5px 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 999px;
  background: rgba(223, 245, 241, 0.78);
  color: var(--color-brand-strong);
  font-size: 0.84rem;
  font-weight: 700;
  text-transform: uppercase;
}
.title {
  color: var(--color-ink);
  font-size: clamp(1.8rem, 4vw, 2.55rem);
  line-height: 1.05;
  font-weight: 800;
  margin-bottom: 10px;
}
.subtitle {
  color: var(--color-muted);
  max-width: 560px;
  margin: 0 auto 22px;
  font-size: 1rem;
  line-height: 1.55;
}
.newsletter-content {
  max-width: 608px;
  margin: 0 auto;
}
.form-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-sm);
}
.input-email {
  flex: 1;
  min-width: 0;
  padding: 0 18px;
  width: auto;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--color-ink);
  font-size: 1rem;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  box-sizing: border-box;
  height: 52px;
  min-height: 48px;
  line-height: 52px;
}
.input-email:focus {
  border-color: rgba(15, 107, 104, 0.38);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(15, 107, 104, 0.12);
  outline: none;
}
.input-email::placeholder {
  color: var(--color-subtle);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 28px;
  background: var(--color-brand);
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 800;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 10px 22px rgba(15, 107, 104, 0.20);
  transition: background 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  white-space: nowrap;
}
.btn:hover {
  background: var(--color-brand-strong);
  border-color: transparent;
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.26);
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn:disabled {
  background: #9bb8b5;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.subscribe-btn {
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
}
.subscribe-btn.unsubscribe-mode {
  background: linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%);
  color: #555;
  box-shadow: none;
}
.unsubscribe-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
}
.unsubscribe-link {
  font-size: 0.92rem;
  color: var(--color-muted);
  text-decoration: none;
  cursor: pointer;
  transition: color 180ms ease;
}
.unsubscribe-row .divider { color: var(--color-subtle); }
.unsubscribe-link:hover {
  color: var(--color-brand-strong);
  text-decoration: underline;
}
.note {
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.55;
}
.loading-note {
  color: var(--color-brand-strong);
  font-weight: 700;
}
.success {
  color: var(--color-brand-strong);
  font-weight: 700;
  background: linear-gradient(135deg, rgba(223, 245, 241, 0.92) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: 18px;
  padding: 24px 22px 22px;
  box-shadow: 0 16px 40px rgba(15, 107, 104, 0.1);
}
.congrats-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: var(--color-brand);
  box-shadow: 0 14px 28px rgba(15, 107, 104, 0.24);
  animation: pop 0.5s cubic-bezier(.68,-0.55,.27,1.55);
  position: relative;
}
.congrats-icon::after {
  content: "";
  position: absolute;
  left: 18px;
  top: 15px;
  width: 16px;
  height: 25px;
  border: solid #fff;
  border-width: 0 4px 4px 0;
  transform: rotate(45deg);
}
.congrats-title {
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 8px;
}
.unsubscribe-success {
  color: #888;
  background: #f7f7f7;
  border-radius: 10px;
  padding: 24px 0 16px 0;
}
.error {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  color: #b42318;
  background: #fff3f0;
  border: 1px solid rgba(180, 35, 24, 0.16);
  border-radius: 18px;
  padding: 22px;
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
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .newsletter-bg {
    padding: 32px 12px;
  }
  
  .newsletter {
    padding: 28px 22px 24px;
    border-radius: 20px;
  }
  
  .title {
    margin-bottom: 12px;
  }
  
  .subtitle {
    font-size: 1rem;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  .form-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    padding: 8px;
  }
  
  .input-email {
    width: 100%;
    font-size: 1rem;
    padding: 0 16px;
    height: 48px;
    min-height: 48px;
    line-height: 48px;
    background: #fff;
  }
  
  .btn, .subscribe-btn {
    width: 100%;
    font-size: 1rem;
    padding: 0 24px;
    min-height: 48px;
  }
  
  .unsubscribe-row {
    justify-content: center;
    margin-top: 12px;
  }
  
  .success {
    padding: 24px 16px 20px 16px;
    margin: 20px 0 0 0;
  }
  
  .congrats-icon {
    font-size: 2.8em;
  }
  
  .congrats-title {
    font-size: 1.3em;
  }
}

@media (max-width: 480px) {
  .newsletter-bg {
    padding: 28px 8px;
  }
  
  .newsletter {
    padding: 24px 18px 22px;
    border-radius: 16px;
  }
  
  .eyebrow {
    font-size: 0.72rem;
    padding: 6px 10px;
    margin-bottom: 14px;
  }
  
  .subtitle {
    font-size: 0.95rem;
    margin-bottom: 18px;
  }
  
  .form-row {
    gap: 8px;
  }

  .eyebrow {
    display: none;
  }
  
  .input-email {
    font-size: 0.95rem;
    padding: 0 14px;
    height: 46px;
    min-height: 46px;
    line-height: 46px;
  }
  
  .btn, .subscribe-btn {
    font-size: 0.95rem;
    min-height: 46px;
    padding: 0 20px;
  }
  
  .success {
    padding: 20px 12px 16px 12px;
  }
  
  .congrats-icon {
    font-size: 2.4em;
  }
  
  .congrats-title {
    font-size: 1.2em;
  }
  
  .note {
    font-size: 1rem;
  }
}
</style>
