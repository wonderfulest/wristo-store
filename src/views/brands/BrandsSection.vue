<template>
  <section v-if="merchants.length" class="brands-section">
    <div class="brands-container">
      <div class="brands-header">
        <div class="brands-header-left">
          <h2 class="brands-title">Find your favorite brands</h2>
          <div class="brands-subtitle">
            Explore the official watch faces from your favorite brands.
          </div>
        </div>

        <button class="brands-more" type="button" @click="goToBrands">
          MORE
        </button>
      </div>

      <Swiper
        class="brands-swiper"
        :modules="swiperModules"
        :loop="merchants.length > 1"
        :loop-additional-slides="merchants.length"
        :free-mode="{ enabled: true, momentum: false }"
        :grab-cursor="true"
        :speed="7000"
        :autoplay="
          merchants.length > 1
            ? {
                delay: 1,                // ⭐ 关键：不能是 0
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        "
        :breakpoints="{
          0: { slidesPerView: 'auto', spaceBetween: 14 },
          480: { slidesPerView: 'auto', spaceBetween: 16 },
          768: { slidesPerView: 'auto', spaceBetween: 18 },
          1024: { slidesPerView: 'auto', spaceBetween: 20 },
        }"
      >
        <SwiperSlide
          v-for="m in merchants"
          :key="m.userId"
          class="brands-slide"
        >
          <button
            class="brand-avatar-btn"
            type="button"
            @click="goToMerchant(m.userId)"
          >
            <img
              v-if="m.avatar"
              class="brand-avatar-img"
              :src="m.avatar"
              :alt="getDisplayName(m)"
              loading="lazy"
            />
            <div v-else class="brand-avatar-fallback">
              BR
            </div>
          </button>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, FreeMode } from 'swiper/modules'

import 'swiper/css'

import { getTopMerchants } from '@/api/merchant'
import type { PublicMerchantVO } from '@/types/merchant'

const router = useRouter()

const merchants = ref<PublicMerchantVO[]>([])
const swiperModules = [Autoplay, FreeMode]

onMounted(async () => {
  try {
    const list = await getTopMerchants(12)
    merchants.value = list || []
    await nextTick() // 确保 DOM 完整后再跑 Swiper
  } catch (e) {
    merchants.value = []
  }
})

const getDisplayName = (m: PublicMerchantVO) =>
  (m.nickname || m.username || `User ${m.userId}`).trim()

const goToBrands = () => {
  router.push('/brands')
}

const goToMerchant = (userId: number) => {
  router.push(`/brands/${userId}`)
}
</script>

<style scoped>
.brands-section {
  padding: 28px 0;
  background: #fff;
}

.brands-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.brands-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.brands-header-left {
  min-width: 0;
  text-align: left;
}

.brands-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.brands-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
}

.brands-more {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 700;
  font-size: 12px;
  color: #0b63d1;
  cursor: pointer;
  white-space: nowrap;
}

.brands-more:hover {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

.brands-swiper {
  width: 100%;
  padding: 14px 0 4px;
}

/* ⭐ 连续滚动核心 */
.brands-swiper :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}

.brands-slide {
  height: auto;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-avatar-btn {
  width: 160px;
  height: 160px;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  /* box-shadow: 0 14px 36px rgba(0, 0, 0, 0.12); */
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.brand-avatar-btn:hover {
  transform: translateY(-1px);
}

.brand-avatar-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.brand-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.55);
  letter-spacing: 0.12em;
}

@media (max-width: 768px) {
  .brands-section {
    padding: 22px 0;
  }

  .brands-title {
    font-size: 1.35rem;
  }

  .brands-swiper {
    padding: 12px 0 4px;
  }

  .brands-slide {
    width: 120px;
  }

  .brand-avatar-btn {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .brands-title {
    font-size: 1.75rem;
  }

  .brands-slide {
    width: 96px;
  }

  .brand-avatar-btn {
    width: 96px;
    height: 96px;
  }
}
</style>
