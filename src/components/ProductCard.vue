<template>
  <div class="product-card" @click="handleClick">
    <div class="product-img-wrap">
      <img 
        :src="product?.heroFile?.url || product?.garminImageUrl" 
        :alt="product?.name" 
        class="product-img" 
      />
    </div>
    <div class="product-info">
      <div class="product-name">{{ product?.name }}</div>
      <div class="product-price">${{ product?.price?.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  product: any
}>()

const router = useRouter()

const handleClick = () => {
  if (props.product?.appId) {
    router.push({ name: 'product-detail', params: { id: props.product.appId } })
  }
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.product-img {
  max-width: 80%;
  max-height: 80%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
  margin: 0 auto;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 1.2em;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 500;
  color: #86868b;
  margin-top: auto;
}

@media (max-width: 768px) {
  .product-name {
    font-size: 0.95rem;
  }
  
  .product-price {
    font-size: 1rem;
  }
}
</style> 