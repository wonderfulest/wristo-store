<template>
  <div class="brands-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Brands</h1>
        <div class="page-subtitle">Explore the official watch faces from your favorite brands.</div>
      </div>
      <button class="back-btn" type="button" @click="goBack">Back</button>
    </div>

    <div v-if="loading" class="loading-state">Loading...</div>

    <div v-else class="brands-grid">
      <button v-for="m in merchants" :key="m.userId" class="brand-card" type="button" @click="handlePrimaryClick(m)">
        <div class="brand-banner">
          <img v-if="getBannerUrl(m)" class="brand-banner-img" :src="getBannerUrl(m)" :alt="getDisplayName(m)" loading="lazy" />
          <div class="brand-banner-overlay" />
        </div>

        <div class="brand-body">
          <div class="brand-identity">
            <div class="brand-avatar">
              <img v-if="m.avatar" :src="m.avatar" :alt="getDisplayName(m)" loading="lazy" />
              <div v-else class="brand-avatar-fallback">BR</div>
            </div>

            <div class="brand-text">
              <div class="brand-name">{{ getDisplayName(m) }}</div>
              <div v-if="m.slogan" class="brand-slogan">{{ m.slogan }}</div>
            </div>
          </div>

          <div class="brand-stats">
            <div class="brand-stat">
              <div class="brand-stat-label">Apps</div>
              <div class="brand-stat-value">{{ formatNumber(m.appCount) }}</div>
            </div>
            <div class="brand-stat">
              <div class="brand-stat-label">Downloads</div>
              <div class="brand-stat-value">{{ formatNumber(m.totalDownloads) }}</div>
            </div>
          </div>

          <div class="brand-actions" @click.stop>
            <a v-if="m.instagramUrl" class="brand-link" :href="m.instagramUrl" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a v-if="m.facebookUrl" class="brand-link" :href="m.facebookUrl" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a v-if="m.xUrl" class="brand-link" :href="m.xUrl" target="_blank" rel="noopener noreferrer">X</a>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAllMerchants } from '@/api/merchant'
import type { PublicMerchantVO } from '@/types/merchant'

const router = useRouter()

const merchants = ref<PublicMerchantVO[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const list = await getAllMerchants()
    merchants.value = (list || []).slice()
  } catch (e) {
    merchants.value = []
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}

const getDisplayName = (m: PublicMerchantVO) => {
  return (m.nickname || m.username || `User ${String(m.userId)}`).trim()
}

const getBannerUrl = (m: PublicMerchantVO) => {
  const img = m.bannerImage
  if (!img) return ''
  const formats = img.formats || {}
  const preferred = ['large', 'medium', 'small', 'thumbnail']
  for (const k of preferred) {
    const u = formats[k]?.url
    if (u) return u
  }
  return img.url || ''
}

const formatNumber = (value?: number) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

const handlePrimaryClick = (m: PublicMerchantVO) => {
  router.push(`/brands/${String(m.userId)}`)
}
</script>

<style scoped>
.brands-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 60%, #ffffff 100%);
  padding: 26px 0 48px;
}

.page-header {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.header-left {
  min-width: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.page-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
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
  white-space: nowrap;
}

.back-btn:hover {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

.loading-state {
  width: 100%;
  max-width: 1200px;
  margin: 28px auto 0;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
}

.brands-grid {
  width: 100%;
  max-width: 1200px;
  margin: 24px auto 0;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.brand-card {
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.brand-card:active {
  transform: scale(0.995);
}

.brand-banner {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f2f6ff 0%, #eef2f7 100%);
}

.brand-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
}

.brand-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.28) 100%);
}

.brand-body {
  border-radius: 0 0 18px 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-top: none;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  padding: 16px 16px 14px;
}

.brand-identity {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand-avatar {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-avatar-fallback {
  font-size: 12px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.55);
  letter-spacing: 0.12em;
}

.brand-text {
  min-width: 0;
}

.brand-name {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-slogan {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(15, 23, 42, 0.72);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.brand-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.brand-stat {
  border-radius: 14px;
  padding: 10px 10px;
  background: rgba(2, 132, 199, 0.06);
  border: 1px solid rgba(2, 132, 199, 0.1);
}

.brand-stat-label {
  font-size: 11px;
  color: rgba(15, 23, 42, 0.58);
}

.brand-stat-value {
  margin-top: 3px;
  font-weight: 800;
  font-size: 14px;
  color: #0b63d1;
  letter-spacing: -0.01em;
}

.brand-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.78);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.1);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.brand-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

@media (max-width: 1024px) {
  .brands-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .brands-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.75rem;
  }
}
</style>
