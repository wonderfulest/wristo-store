<template>
  <div class="merchant-detail-page">
    <div class="page-header">
      <button class="back-btn" type="button" @click="goBack">Back</button>
    </div>

    <div v-if="loading" class="loading-state">Loading...</div>

    <div v-else-if="!merchant" class="empty-state">
      <div class="empty-title">Brand not found</div>
      <div class="empty-subtitle">Please try again later.</div>
    </div>

    <div v-else class="content">
      <div class="hero">
        <div class="hero-banner">
          <img v-if="bannerUrl" class="hero-banner-img" :src="bannerUrl" :alt="displayName" loading="lazy" />
          <div class="hero-banner-overlay" />
        </div>

        <div class="hero-card">
          <div class="hero-top">
            <div class="hero-avatar">
              <img v-if="merchant.avatar" :src="merchant.avatar" :alt="displayName" loading="lazy" />
              <div v-else class="hero-avatar-fallback">BR</div>
            </div>

            <div class="hero-text">
              <div class="hero-name">{{ displayName }}</div>
              <div v-if="merchant.slogan" class="hero-slogan">{{ merchant.slogan }}</div>
            </div>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-label">Apps</div>
              <div class="stat-value">{{ formatNumber(merchant.appCount) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Downloads</div>
              <div class="stat-value">{{ formatNumber(merchant.totalDownloads) }}</div>
            </div>
          </div>

          <div v-if="hasAnySocial" class="social-row">
            <a v-if="merchant.instagramUrl" class="social-link" :href="merchant.instagramUrl" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a v-if="merchant.facebookUrl" class="social-link" :href="merchant.facebookUrl" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a v-if="merchant.xUrl" class="social-link" :href="merchant.xUrl" target="_blank" rel="noopener noreferrer">X</a>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">About</div>
        <div class="section-card">
          <div class="about-row">
            <div class="about-label">User ID</div>
            <div class="about-value">{{ merchant.userId }}</div>
          </div>
          <div class="about-row">
            <div class="about-label">Brand Name</div>
            <div class="about-value">{{ displayName }}</div>
          </div>
          <div v-if="merchant.slogan" class="about-row">
            <div class="about-label">Slogan</div>
            <div class="about-value">{{ merchant.slogan }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getMerchantDetail } from '@/api/merchant'
import type { PublicMerchantVO } from '@/types/merchant'

const router = useRouter()
const route = useRoute()

const merchant = ref<PublicMerchantVO | null>(null)
const loading = ref(true)

const userId = computed(() => {
  const raw = route.params.userId
  const v = Array.isArray(raw) ? raw[0] : raw
  return v ? String(v) : ''
})

onMounted(async () => {
  try {
    if (!userId.value) {
      merchant.value = null
      return
    }
    const detail = await getMerchantDetail(userId.value)
    merchant.value = detail || null
  } catch (e) {
    merchant.value = null
  } finally {
    loading.value = false
  }
})

const displayName = computed(() => {
  const m = merchant.value
  if (!m) return ''
  return (m.nickname || m.username || `User ${String(m.userId)}`).trim()
})

const bannerUrl = computed(() => {
  const m = merchant.value
  const img = m?.bannerImage
  if (!img) return ''
  const formats = img.formats || {}
  const preferred = ['large', 'medium', 'small', 'thumbnail']
  for (const k of preferred) {
    const u = formats[k]?.url
    if (u) return u
  }
  return img.url || ''
})

const hasAnySocial = computed(() => {
  const m = merchant.value
  return Boolean((m?.instagramUrl || '').trim() || (m?.facebookUrl || '').trim() || (m?.xUrl || '').trim())
})

const formatNumber = (value?: number) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/brands')
}
</script>

<style scoped>
.merchant-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 60%, #ffffff 100%);
  padding: 16px 0 56px;
}

.page-header {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 700;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.75);
  cursor: pointer;
}

.back-btn:hover {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

.loading-state {
  width: 100%;
  max-width: 1100px;
  margin: 24px auto 0;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
}

.empty-state {
  width: 100%;
  max-width: 520px;
  margin: 48px auto 0;
  padding: 18px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-title {
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}

.empty-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
}

.content {
  width: 100%;
  max-width: 1100px;
  margin: 18px auto 0;
  padding: 0 16px;
}

.hero {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.hero-banner {
  position: relative;
  width: 100%;
  height: 260px;
  background: linear-gradient(135deg, #f2f6ff 0%, #eef2f7 100%);
}

.hero-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
}

.hero-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.35) 100%);
}

.hero-card {
  position: relative;
  margin-top: -54px;
  padding: 18px 18px 16px;
}

.hero-top {
  display: flex;
  gap: 14px;
  align-items: center;
}

.hero-avatar {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-avatar-fallback {
  font-size: 12px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.55);
  letter-spacing: 0.12em;
}

.hero-text {
  min-width: 0;
}

.hero-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-slogan {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(15, 23, 42, 0.72);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat {
  border-radius: 16px;
  padding: 12px 12px;
  background: rgba(2, 132, 199, 0.06);
  border: 1px solid rgba(2, 132, 199, 0.1);
}

.stat-label {
  font-size: 11px;
  color: rgba(15, 23, 42, 0.58);
}

.stat-value {
  margin-top: 4px;
  font-weight: 900;
  font-size: 15px;
  color: #0b63d1;
  letter-spacing: -0.01em;
}

.social-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.78);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(15, 23, 42, 0.1);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.social-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.section {
  margin-top: 18px;
}

.section-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: rgba(15, 23, 42, 0.78);
  margin: 0 0 10px;
}

.section-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  padding: 14px 14px;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 14px;
}

.about-row + .about-row {
  margin-top: 6px;
}

.about-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.6);
}

.about-value {
  font-size: 12px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.85);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .hero-banner {
    height: 210px;
  }

  .hero-card {
    margin-top: -48px;
    padding: 16px 16px 14px;
  }

  .hero-avatar {
    width: 74px;
    height: 74px;
    border-radius: 20px;
  }

  .hero-name {
    font-size: 20px;
  }
}
</style>
