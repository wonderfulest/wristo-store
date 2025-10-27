<template>
  <div class="bundle-products-page">
    <h1 class="bundle-title">Bundle Products</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="bundle-info">
        <h2>{{ bundle?.bundleName }}</h2>
        <p>{{ bundle?.bundleDesc }}</p>
      </div>
      <div class="products-list">
        <div v-for="product in bundle?.products || []" :key="product.appId" class="product-item">
          <img
            :src="product.heroFile?.url || product.garminImageUrl"
            class="product-img"
            :alt="product.name"
            @click="goToProduct(product.appId)"
          />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <a :href="product.garminStoreUrl" target="_blank" class="garmin-link">Garmin Store</a>
          </div>
          <div class="qrcode">
            <qrcode-vue :value="product.garminStoreUrl" :size="72" :level="'M'" class="qrcode-img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { getBundleById } from '@/api/bundle'

const route = useRoute()
const router = useRouter()
const bundle = ref<any>(null)
const loading = ref(true)
const error = ref('')

function goToProduct(appId: number) {
  router.push({ name: 'product-detail', params: { id: appId } })
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  const bundleId = route.query.bundleId || route.params.bundleId
  if (!bundleId) {
    error.value = 'Bundle ID is required.'
    loading.value = false
    return
  }
  try {
    let deviceId: number | undefined
    try {
      const stored = localStorage.getItem('selectedDevice')
      console.log('stored', stored)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed.id === 'number') {
          deviceId = parsed.id
        }
      }
    } catch (e) {
    }

    const data = await getBundleById(Number(bundleId), deviceId ? { device: deviceId } : undefined)
    bundle.value = data
  } catch (e: any) {
    error.value = e?.msg || e?.message || 'Request failed.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bundle-products-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
}
.bundle-title {
  text-align: center;
  font-size: 2.2em;
  font-weight: bold;
  margin-bottom: 16px;
}
.bundle-info {
  text-align: center;
  margin-bottom: 32px;
}
.products-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.product-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  min-height: 80px;
}
.product-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #f7f7f7;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.product-img:hover {
  box-shadow: 0 2px 12px 0 rgba(59,130,246,0.18);
}
.product-info {
  flex: 1;
  min-width: 0;
}
.product-name {
  font-size: 1.08em;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.garmin-link {
  color: #2563eb;
  text-decoration: underline;
  font-size: 0.98em;
}
.qrcode-img {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #eee;
}
.loading, .error {
  text-align: center;
  font-size: 1.2em;
  margin: 40px 0;
}
</style> 