<template>
  <button class="product-card" type="button" @click="handleClick">
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
  </button>
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
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-line);
  box-shadow: var(--shadow-sm);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
  text-align: left;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 107, 104, 0.2);
  box-shadow: var(--shadow-md);
}

.product-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #eef5f3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
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
  color: var(--color-ink);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 1.2em;
  line-height: 1.4;
  letter-spacing: 0;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-brand);
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
