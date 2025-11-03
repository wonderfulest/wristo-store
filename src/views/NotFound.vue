<template>
  <div class="nf-wrap">
    <div class="nf-card">
      <div class="nf-logo">
        <Logo />
      </div>
      <div class="nf-status">404</div>
      <h1 class="nf-title">Page Not Found</h1>
      <p class="nf-desc">The page you’re looking for doesn’t exist or was moved.</p>
      <div class="nf-actions">
        <button class="btn primary" @click="goHome">Go Home</button>
        <button class="btn ghost" @click="goContact">Contact Support</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goContact() {
  router.push('/contact')
}
</script>

<style scoped>
.nf-wrap {
  min-height: calc(100vh - 64px - 58px);
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.nf-card {
  width: 100%;
  max-width: 680px;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 28px;
  text-align: center;
  backdrop-filter: saturate(150%) blur(10px);
}

.nf-logo { display: flex; justify-content: center; margin-bottom: 10px; }

.nf-status {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #007aff, #0056cc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-title { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 8px; }
.nf-desc { font-size: 16px; color: #475569; margin-top: 8px; }

.nf-actions { display: flex; gap: 12px; margin-top: 20px; justify-content: center; }

.btn {
  appearance: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
  border: none;
}
.btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,122,255,0.25); }

.btn.ghost {
  background: #fff;
  color: #0f172a;
  border: 1px solid #e5e7eb;
}
.btn.ghost:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

@media (max-width: 640px) {
  .nf-card { padding: 20px; border-radius: 16px; }
  .nf-status { font-size: 52px; }
  .nf-title { font-size: 20px; }
  .nf-desc { font-size: 15px; }
  .nf-actions { flex-direction: column; }
  .btn { width: 100%; }
}
</style>
