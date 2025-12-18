<template>
  <Swiper
    v-if="items.length"
    ref="swiperRef"
    class="infinite-brand-carousel"
    :modules="modules"
    :loop="items.length > 1"
    :looped-slides="items.length"
    :loop-additional-slides="items.length"
    :slides-per-view="'auto'"
    :space-between="space"
    :free-mode="{ enabled: true, momentum: false }"
    :allow-touch-move="false"
    :speed="speed"
    :autoplay="items.length > 1 ? {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: pauseOnHover,
      waitForTransition: false,
    } : false"
  >
    <SwiperSlide
      v-for="item in items"
      :key="item.id"
      class="carousel-slide"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <button class="carousel-btn" type="button" @click="$emit('click', item)">
        <img v-if="item.avatar" :src="item.avatar" class="carousel-img" loading="lazy" />
        <div v-else class="carousel-fallback">
          {{ fallbackText }}
        </div>
      </button>
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, FreeMode } from 'swiper/modules'

import 'swiper/css'

export interface InfiniteCarouselItem {
  id: string | number
  avatar?: string
}

withDefaults(
  defineProps<{
    items: InfiniteCarouselItem[]
    size?: number
    space?: number
    speed?: number
    pauseOnHover?: boolean
    fallbackText?: string
  }>(),
  {
    size: 120,
    space: 18,
    speed: 5000,
    pauseOnHover: true,
    fallbackText: 'BR',
  }
)

defineEmits<{
  (e: 'click', item: InfiniteCarouselItem): void
}>()

const swiperRef = ref()
const modules = [Autoplay, FreeMode]
</script>

<style scoped>
.infinite-brand-carousel {
  width: 100%;
  padding: 12px 0;
}

.infinite-brand-carousel :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}

.carousel-slide {
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-btn {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.carousel-btn:hover {
  transform: translateY(-1px);
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.carousel-fallback {
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
