<template>
  <section class="new-section">
    <div class="new-container">
      <div class="new-header">
        <div class="new-header-icon">
          <el-icon class="new-header-icon-inner"><Plus /></el-icon>
        </div>
        <h2 class="new-title">New Arrivals</h2>
      </div>
      <div class="new-carousel-wrap">
        <Swiper
          class="new-swiper"
          :modules="swiperModules"
          :loop="newProducts.length > 1"
          :loop-additional-slides="newProducts.length"
          :free-mode="{ enabled: true, momentum: false }"
          :centered-slides="true"
          :grab-cursor="true"
          :speed="7000"
          :autoplay="newProducts.length > 1 ? { delay: 1, disableOnInteraction: false, pauseOnMouseEnter: true } : false"
          :pagination="{ clickable: true }"
          :navigation="newProducts.length > 1"
          :breakpoints="{
            0: { slidesPerView: 1.1, spaceBetween: 14 },
            480: { slidesPerView: 1.25, spaceBetween: 16 },
            768: { slidesPerView: 2.1, spaceBetween: 22 },
            1024: { slidesPerView: 3, spaceBetween: 28 },
          }"
        >
          <SwiperSlide v-for="product in newProducts" :key="product.appId" class="new-slide">
            <button class="slide-btn" type="button" @click="$emit('product-click', product)">
              <div class="product-circle-img">
                <img
                  :src="product.heroFile?.url || product.garminImageUrl"
                  :alt="product.name"
                  class="circle-img"
                  loading="lazy"
                />
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">${{ product.price.toFixed(2) }}</div>
              </div>
            </button>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { ProductBaseVO } from '@/types';
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, FreeMode, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const swiperModules = [Autoplay, Pagination, Navigation, FreeMode]

defineProps<{
  newProducts: ProductBaseVO[];
}>();

defineEmits(['product-click']);
</script>

<style scoped>
.new-section {
  background: #fff;
}

.new-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.new-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.new-header-icon-inner {
  color: #2563eb;
  font-size: 24px;
}

.new-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
  letter-spacing: -0.02em;
}

.new-carousel-wrap {
  padding: 0 16px;
  position: relative;
}

.new-swiper {
  width: 100%;
  padding: 0 44px;
}

.new-slide {
  height: auto;
}

.slide-btn {
  width: 100%;
  border: none;
  background: transparent;
  padding: 22px 10px 18px;
  cursor: pointer;
}

.slide-btn:active {
  transform: scale(0.99);
}

.product-circle-img {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 4px solid rgba(255, 255, 255, 0.8);
  margin: 0 auto;
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-btn:hover .product-circle-img {
  transform: scale(1.03);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.16);
}

.circle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.product-info {
  margin-top: 24px;
  text-align: center;
  padding: 0 16px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: -0.01em;
}

/* ⭐ 连续滚动核心 */
.new-swiper :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}

:deep(.new-swiper .swiper-pagination) {
  bottom: 8px !important;
}

:deep(.new-swiper .swiper-pagination-bullet) {
  width: 7px;
  height: 7px;
  opacity: 1;
  background: rgba(0, 0, 0, 0.18);
  margin: 0 4px !important;
}

:deep(.new-swiper .swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.42);
}

:deep(.new-swiper .swiper-button-prev),
:deep(.new-swiper .swiper-button-next) {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

:deep(.new-swiper .swiper-button-prev:after),
:deep(.new-swiper .swiper-button-next:after) {
  font-size: 16px;
  color: #111827;
}

/* Responsive styles */
@media (max-width: 768px) {
  .new-section {
    padding: 24px 0;
  }
  
  .new-container {
    width: 95%;
    padding: 0 12px;
  }
  
  .new-header-icon {
    width: 36px;
    height: 36px;
    margin-right: 12px;
  }
  
  .new-header-icon-inner {
    font-size: 20px;
  }
  
  .new-title {
    font-size: 2rem;
  }
  
  .new-carousel-wrap {
    padding: 0 8px;
  }

  .new-swiper {
    padding: 10px 0 42px;
  }

  .product-circle-img {
    width: 250px;
    height: 250px;
    border-width: 3px;
  }
}

@media (max-width: 480px) {
  .new-section {
    padding: 20px 0;
  }
  
  .new-container {
    width: 100%;
    padding: 0 8px;
  }
  
  .new-title {
    font-size: 1.75rem;
  }
  
  .new-carousel-wrap {
    padding: 0;
  }

  .slide-btn {
    padding: 18px 6px 14px;
  }

  .product-circle-img {
    width: 220px;
    height: 220px;
  }

  .product-name {
    font-size: 16px;
  }

  .product-price {
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .product-circle-img {
    width: 190px;
    height: 190px;
  }

  .product-name {
    font-size: 15px;
  }

  .product-price {
    font-size: 14px;
  }
}
</style>
