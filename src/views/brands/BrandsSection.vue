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

      <InfiniteCarousel
        class="brands-swiper"
        :items="carouselItems"
        :size="160"
        :space="18"
        :speed="8000"
        pause-on-hover
        @click="handleCarouselClick"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import InfiniteCarousel from '@/components/InfiniteCarousel.vue'

type InfiniteCarouselItem = {
  id: string | number
  avatar?: string
}

import { getTopMerchants } from '@/api/merchant'
import type { PublicMerchantVO } from '@/types/merchant'

const router = useRouter()

const merchants = ref<PublicMerchantVO[]>([])

const carouselItems = computed<InfiniteCarouselItem[]>(() =>
  (merchants.value || []).map((m) => ({
    id: m.userId,
    avatar: m.avatar,
  }))
)

const merchantById = computed(() => {
  const map = new Map<string, PublicMerchantVO>()
  for (const m of merchants.value || []) {
    map.set(String(m.userId), m)
  }
  return map
})

onMounted(async () => {
  try {
    const list = await getTopMerchants(12)
    merchants.value = list || []
  } catch (e) {
    merchants.value = []
  }
})

const goToBrands = () => {
  router.push('/brands')
}

const goToMerchant = (userId: number) => {
  router.push(`/brands/${userId}`)
}

const handleCarouselClick = (item: InfiniteCarouselItem) => {
  const m = merchantById.value.get(String(item.id))
  if (!m) return
  goToMerchant(Number(m.userId))
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
  mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
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
}

@media (max-width: 480px) {
  .brands-title {
    font-size: 1.75rem;
  }
}
</style>
