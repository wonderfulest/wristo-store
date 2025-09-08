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
        <!-- Desktop carousel -->
        <el-carousel 
          ref="carouselRef"
          :interval="1200" 
          type="card" 
          height="420px"
          :autoplay="true"
          :loop="true"
          :pause-on-hover="false"
          :initial-index="0"
          indicator-position="outside"
          class="custom-carousel desktop-carousel"
        >
          <el-carousel-item 
            v-for="product in newProducts" 
            :key="product.appId" 
            class="flex flex-col items-center justify-center carousel-item"
            @click="$emit('product-click', product)"
          >
            <div class="product-circle-img transform transition-transform duration-300 hover:scale-105">
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
          </el-carousel-item>
        </el-carousel>
        
        <!-- Mobile carousel -->
        <el-carousel 
          ref="mobileCarouselRef"
          :interval="4000" 
          height="380px"
          :autoplay="true"
          :loop="true"
          :pause-on-hover="false"
          :initial-index="0"
          indicator-position="outside"
          class="mobile-carousel"
          arrow="hover"
        >
          <el-carousel-item 
            v-for="product in newProducts" 
            :key="`mobile-${product.appId}`" 
            class="mobile-carousel-item"
            @click="$emit('product-click', product)"
          >
            <div class="mobile-product-card">
              <div class="mobile-product-img">
                <img
                  :src="product.heroFile?.url || product.garminImageUrl"
                  :alt="product.name"
                  class="mobile-img"
                  loading="lazy"
                />
              </div>
              <div class="mobile-product-info">
                <div class="mobile-product-name">{{ product.name }}</div>
                <div class="mobile-product-price">${{ product.price.toFixed(2) }}</div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { ProductBaseVO } from '@/types';

const carouselRef = ref();
const mobileCarouselRef = ref();

onMounted(() => {
  // Ensure carousels start automatically
  if (carouselRef.value) {
    carouselRef.value.setActiveItem(0);
    // start autoplay programmatically to avoid any interaction requirement
    carouselRef.value.play && carouselRef.value.play();
  }
  if (mobileCarouselRef.value) {
    mobileCarouselRef.value.setActiveItem(0);
    mobileCarouselRef.value.play && mobileCarouselRef.value.play();
  }
});

defineProps<{
  newProducts: ProductBaseVO[];
}>();

defineEmits(['product-click']);
</script>

<style scoped>
.new-section {
  padding: 32px 0;
  background: #fff;
}

.new-container {
  width: 80%;
  margin: 0 auto;
  padding: 0 16px;
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

/* Desktop carousel */
.desktop-carousel {
  display: block;
}

.mobile-carousel {
  display: none;
}

:deep(.desktop-carousel .el-carousel__item) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
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

/* Mobile carousel styles */
:deep(.mobile-carousel .el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  padding: 20px;
  box-sizing: border-box;
}

.mobile-carousel-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.mobile-product-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 320px;
  text-align: center;
  transition: all 0.3s ease;
  margin: 0 auto;
  box-sizing: border-box;
}

.mobile-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.mobile-product-img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.mobile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.mobile-product-info {
  text-align: center;
}

.mobile-product-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.mobile-product-price {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: -0.01em;
}

/* Mobile carousel arrows */
:deep(.mobile-carousel .el-carousel__arrow) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #374151;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.mobile-carousel .el-carousel__arrow:hover) {
  background: rgba(255, 255, 255, 1);
  color: #2563eb;
  transform: scale(1.05);
}

/* Mobile carousel indicators */
:deep(.mobile-carousel .el-carousel__indicators) {
  bottom: -40px;
}

:deep(.mobile-carousel .el-carousel__indicator) {
  padding: 8px 4px;
}

:deep(.mobile-carousel .el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  border: none;
}

:deep(.mobile-carousel .el-carousel__indicator.is-active .el-carousel__button) {
  background: #2563eb;
  transform: scale(1.2);
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
  
  .desktop-carousel {
    display: none;
  }
  
  .mobile-carousel {
    display: block;
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
  
  .mobile-product-card {
    padding: 28px 16px;
    max-width: 360px;
  }
  
  .mobile-product-img {
    width: 220px;
    height: 220px;
    margin-bottom: 16px;
  }
  
  .mobile-product-name {
    font-size: 16px;
  }
  
  .mobile-product-price {
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .mobile-product-card {
    padding: 16px;
    max-width: 240px;
  }
  
  .mobile-product-img {
    width: 160px;
    height: 160px;
  }
  
  .mobile-product-name {
    font-size: 15px;
  }
  
  .mobile-product-price {
    font-size: 14px;
  }
}
</style>
