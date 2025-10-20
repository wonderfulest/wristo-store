<template>
  <div class="success-page">
    <div class="card">
      <div class="icon-circle">🎉</div>
      <h1 class="title">Preferences Saved</h1>
      <p class="desc">Your email preferences have been updated successfully.</p>
      <p class="desc subtle">You’ll continue receiving only the types of messages you selected.</p>

      <div class="actions">
        <a class="btn primary" :href="homeUrl" target="_self">Back to Wristo.io</a>
        <router-link class="btn ghost" :to="{ name: 'EmailPreferences', query: { email } }" @click="cancelTimer">Edit Again</router-link>
      </div>

      <div class="auto-redirect">Redirecting in {{ countdown }}s...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const email = (route.query.email as string) || ''
const homeUrl = 'https://www.wristo.io'
const countdown = ref(3)
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      if (timer) { clearInterval(timer); timer = null }
      window.location.href = homeUrl
    }
  }, 1000)
})

function cancelTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card {
  width: 100%;
  max-width: 560px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(16,24,40,0.08);
  padding: 28px 24px;
  text-align: center;
}

.icon-circle {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px auto;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #34c759, #0fb67a);
  color: #fff;
  font-size: 28px;
  box-shadow: 0 6px 18px rgba(52,199,89,0.25);
}

.title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

.desc {
  margin: 0;
  color: #555;
}
.desc.subtle { color: #6b7280; margin-top: 4px; }

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0 8px 0;
}

.btn {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn.primary {
  background: linear-gradient(135deg,#3b82f6,#1d4ed8);
  color: #fff;
  box-shadow: 0 8px 20px rgba(59,130,246,.25);
}

.btn.ghost {
  background: #fff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.auto-redirect {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .card { padding: 24px 18px; }
  .icon-circle { width: 56px; height: 56px; font-size: 24px; }
  .title { font-size: 22px; }
  .btn { height: 42px; }
}
</style>
