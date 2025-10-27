<template>
  <div class="bundle-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading Bundle...</div>
    </div>
    
    <div v-else-if="bundle" class="bundle-container">
      <!-- Bundle Header -->
      <div class="bundle-header">
        <div class="bundle-info">
          <h1 class="bundle-title">{{ bundle.bundleName }}</h1>
          <div class="bundle-description" v-html="formatDescription(bundle.bundleDesc)"></div>
          <div class="bundle-meta">
            <div class="bundle-count">
              <span class="count-label">Products:</span>
              <span class="count-value">{{ bundle.products?.length || 0 }} items</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products Grid -->
      <div class="products-section">
        <h2 class="section-title">Included Products</h2>
        <div v-if="bundle.products && bundle.products.length > 0" class="products-grid">
          <div 
            v-for="product in bundle.products" 
            :key="product.appId" 
            class="product-card"
            @click="handleProductClick(product)"
          >
            <div class="product-img-wrap">
              <img :src="product.garminImageUrl" :alt="product.name" class="product-img" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-products">
          No products found in this bundle.
        </div>
      </div>
    </div>
    
    <div v-else class="error-container">
      <div class="error-icon">❌</div>
      <div class="error-message">Bundle not found</div>
      <button class="back-btn" @click="$router.push('/')">Back to Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBundleById } from '@/api/bundle'
import type { Bundle, ProductBaseVO } from '@/types/product'


const route = useRoute()
const router = useRouter()

const bundle = ref<Bundle | null>(null)
const loading = ref(true)

const formatDescription = (description: string) => {
  if (!description) return ''
  return description.replace(/\n/g, '<br>')
}

const handleProductClick = (product: ProductBaseVO) => {
  router.push(`/product/${product.appId}`)
}

onMounted(async () => {
  const bundleId = route.params.id as string
  if (!bundleId || isNaN(Number(bundleId))) {
    loading.value = false
    return
  }
  
  try {
    let deviceId: number | undefined
    try {
      const stored = localStorage.getItem('selectedDevice')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed.id === 'number') {
          deviceId = parsed.id
        }
      }
    } catch (e) {
    }
    bundle.value = await getBundleById(Number(bundleId), deviceId ? { device: deviceId } : undefined)
  } catch (error) {
    console.error('Failed to load bundle:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bundle-detail-page {
  min-height: 100vh;
  background: #f6f8fa;
  padding: 32px 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 1.1rem;
}

.bundle-container {
  max-width: 1200px;
  margin: 0 auto;
}

.bundle-header {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.bundle-info {
  flex: 1;
}

.bundle-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 16px;
  line-height: 1.2;
  text-align: left;
}

.bundle-description {
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: left;
}

.bundle-meta {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
}

.bundle-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-label {
  color: #6b7280;
  font-weight: 500;
}

.count-value {
  font-weight: 600;
  color: #374151;
}

.products-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  /* margin-bottom: 24px; */
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  padding: 20px 0;
}

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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 1.2em;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.no-products {
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
  padding: 48px 0;
}

.creator-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.creator-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.creator-username {
  color: #6b7280;
  font-size: 0.9rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.error-icon {
  font-size: 3rem;
}

.error-message {
  font-size: 1.25rem;
  color: #6b7280;
}

.back-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .bundle-header {
    padding: 20px;
  }
  
  .bundle-title {
    font-size: 1.8rem;
  }
  
  .bundle-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .products-section,
  .creator-section {
    padding: 24px;
  }
  
  .product-name {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .bundle-detail-page {
    padding: 16px 8px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
