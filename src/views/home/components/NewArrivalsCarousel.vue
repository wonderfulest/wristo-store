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
        <el-carousel 
          :interval="2000" 
          type="card" 
          height="420px"
          :autoplay="true"
          :loop="true"
          :pause-on-hover="true"
          :initial-index="0"
          indicator-position="outside"
          class="custom-carousel"
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
            <div class="mt-6 text-center p-4">
              <div class="font-medium text-lg text-gray-800">{{ product.name }}</div>
              <div class="text-primary-500 font-semibold text-base mt-1">${{ product.price.toFixed(2) }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { ProductBaseVO } from '@/types';

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
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.new-header-icon-inner {
  color: #2563eb;
  font-size: 24px;
}

.new-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
}

.new-carousel-wrap {
  padding: 0 16px;
}

:deep(.el-carousel__item) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  box-shadow: none;
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
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
}

.circle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
</style>
