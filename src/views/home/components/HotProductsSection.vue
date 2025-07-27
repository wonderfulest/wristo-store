<template>
  <section class="hot-section">
    <div class="hot-container">
      <div class="hot-header">
        <div class="hot-header-icon">
          <span class="hot-header-icon-inner">🔥</span>
        </div>
        <h2 class="hot-title">Trending Now</h2>
      </div>
      <div class="hot-grid">
        <div 
          v-for="product in hotProducts" 
          :key="product.appId" 
          class="hot-item" 
          @click="$emit('product-click', product)"
        >
          <div class="hot-img-wrap">
            <img :src="product.garminImageUrl" :alt="product.name" class="hot-img" />
          </div>
          <div class="hot-name">{{ product.name }}</div>
          <div class="hot-price">${{ product.price.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductBaseVO } from '@/types';

defineProps<{
  hotProducts: ProductBaseVO[];
}>();

defineEmits(['product-click']);
</script>

<style scoped>
.hot-section {
  padding: 64px 0;
  background: #fff;
  border-top: 2px solid #f3f4f6;
}

.hot-container {
  width: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  max-width: 100%;
}

.hot-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  justify-content: center;
}

.hot-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffedd5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.hot-header-icon-inner {
  color: #fb923c;
  font-size: 24px;
}

.hot-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
  margin: 0;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 48px 24px;
  justify-items: center;
  align-items: start;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
  place-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hot-item:hover {
  transform: translateY(-5px);
}

.hot-img-wrap {
  width: 100%;
  max-width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 4px 24px 0 rgba(80, 110, 255, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hot-item:hover .hot-img-wrap {
  transform: scale(1.05);
  box-shadow: 0 8px 32px 0 rgba(80, 110, 255, 0.15);
}

.hot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: transform 0.5s ease;
}

.hot-item:hover .hot-img {
  transform: scale(1.1);
}

.hot-name {
  font-size: 1.18rem;
  font-weight: 600;
  color: #222;
  margin-top: 22px;
  text-align: center;
  transition: color 0.3s ease;
}

.hot-item:hover .hot-name {
  color: #4a3aff;
}

.hot-price {
  font-size: 1.1rem;
  color: #888;
  margin-top: 6px;
  text-align: center;
  font-weight: 500;
  transition: color 0.3s ease;
}

.hot-item:hover .hot-price {
  color: #4a3aff;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .hot-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 36px 20px;
  }

  .hot-img-wrap {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .hot-section {
    padding: 48px 0;
  }

  .hot-header {
    margin-bottom: 32px;
  }

  .hot-title {
    font-size: 2rem;
  }

  .hot-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px 16px;
  }

  .hot-img-wrap {
    height: 240px;
  }

  .hot-name {
    font-size: 1.1rem;
    margin-top: 18px;
  }

  .hot-price {
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .hot-grid {
    grid-template-columns: 1fr;
    max-width: 320px;
    margin: 0 auto;
  }

  .hot-img-wrap {
    height: 280px;
  }
}
</style>
