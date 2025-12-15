<template>
  <section v-if="banners.length" class="home-banner">
    <div class="banner-shell">
      <Swiper
        class="banner-swiper"
        :modules="swiperModules"
        :slides-per-view="1"
        :loop="banners.length > 1"
        :speed="700"
        :autoplay="banners.length > 1 ? { delay: 4500, disableOnInteraction: false } : false"
        :pagination="{ clickable: true }"
        :effect="'fade'"
      >
        <SwiperSlide v-for="banner in banners" :key="banner.id">
          <button class="banner-slide" type="button" @click="handleClick(banner)">
            <img
              class="banner-image"
              :src="getBannerImageUrl(banner)"
              :alt="banner.image?.alternativeText || banner.remark || 'Home banner'"
              loading="lazy"
            />
            <div class="banner-overlay" />
          </button>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

import { getActiveHomeBanners } from '@/api/website'
import type { HomeBannerVO } from '@/types/website'

const router = useRouter()

const banners = ref<HomeBannerVO[]>([])

const swiperModules = [Autoplay, Pagination, EffectFade]

onMounted(async () => {
  try {
    const list = await getActiveHomeBanners()
    banners.value = (list || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  } catch (e) {
    banners.value = []
  }
})

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url)

const normalizeTarget = (target?: string) => {
  const t = (target || '').trim().toLowerCase()
  if (!t) return '_self'
  if (t === 'blank') return '_blank'
  if (t === 'self') return '_self'
  if (t === '_blank' || t === '_self') return t
  return target
}

const getBannerImageUrl = (banner: HomeBannerVO) => {
  const img = banner.image
  if (!img) return ''

  const formats = img.formats || {}
  const preferredKeys = ['large', 'medium', 'small', 'thumbnail']
  for (const k of preferredKeys) {
    const u = formats[k]?.url
    if (u) return u
  }
  return img.url || ''
}

const handleClick = (banner: HomeBannerVO) => {
  const linkUrl = (banner.linkUrl || '').trim()
  if (!linkUrl) return

  const target = normalizeTarget(banner.openTarget)

  if (isAbsoluteUrl(linkUrl)) {
    if (target === '_blank') {
      window.open(linkUrl, '_blank', 'noopener,noreferrer')
      return
    }
    window.location.href = linkUrl
    return
  }

  // relative / internal
  if (target === '_blank') {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(linkUrl)
}
</script>

<style scoped>
.home-banner {
  width: 100%;
  padding: 18px 0 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 70%, rgba(246, 248, 251, 0) 100%);
}

.banner-shell {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
}

.banner-swiper {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.7) inset;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.banner-slide {
  position: relative;
  display: block;
  width: 100%;
  height: 420px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
  transition: transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.banner-slide:hover .banner-image {
  transform: scale(1.04);
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 420px at 10% 0%, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0) 60%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0) 46%, rgba(0, 0, 0, 0.22) 100%);
  pointer-events: none;
}

:deep(.swiper-pagination) {
  bottom: 12px !important;
}

:deep(.swiper-pagination-bullet) {
  width: 7px;
  height: 7px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 1;
  margin: 0 4px !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

:deep(.swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
}

@media (max-width: 1024px) {
  .banner-slide {
    height: 360px;
  }
}

@media (max-width: 768px) {
  .home-banner {
    padding: 14px 0 8px;
  }

  .banner-shell {
    width: calc(100% - 24px);
  }

  .banner-swiper {
    border-radius: 16px;
  }

  .banner-slide {
    height: 260px;
  }
}
</style>
