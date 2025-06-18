<template>
  <div class="product-detail-page">
    <div class="product-detail-main">
      <!-- 左侧大圆形图片 -->
      <div class="product-image-wrap">
        <img
          v-if="product?.heroFile?.url"
          :src="product.heroFile.url"
          :alt="product.name"
          class="product-image"
        />
      </div>
      <!-- 右侧信息区 -->
      <div class="product-info-wrap">
        <div class="product-title">{{ product?.name }}</div>
        <div class="product-price">${{ product?.price?.toFixed(2) }}</div>
        <div class="product-section-title" v-if="product?.description">Product Details</div>
        <div class="product-desc" v-if="product?.description" v-html="product?.description"></div>
        <div v-if="product?.garminStoreUrl" class="install-section">
          <div class="install-title">Install on your Garmin device</div>
          <div class="install-subtitle">Choose your preferred installation method</div>
          <div class="install-methods">
            <div class="qrcode-section">
              <div class="qrcode-title">Scan to open in Garmin Connect IQ App</div>
              <qrcode-vue :value="product.garminStoreUrl" :size="128" :level="'M'" class="qrcode-img" />
            </div>
            <div class="install-or">or</div>
            <div class="button-section">
              <div class="button-title">You will be redirected to Garmin Connect IQ Store in your browser.</div>
              <button class="product-btn product-btn-download" @click="handleDownload">
                Download 
                <!-- <span class="icon-download-svg" v-html="DownloadSvg"></span> -->
              </button>
            </div>
          </div>
        </div>
        <div class="unlock-section">
          <div class="unlock-tip">Enter the 6-digit code from your watch to unlock the trial.</div>
          <button class="product-btn product-btn-unlock" @click="handleUnlock">
            Unlock Trial <span class="iconfont icon-lock" style="margin-left:10px;font-size:1.2em;">🔒</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/store/product'
import type { Product } from '@/api/product'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const productStore = useProductStore()
const product = ref<Product | null>(null)

// const DownloadSvg = `<svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 2V16M11 16L6 11M11 16L16 11\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"3\" y=\"18\" width=\"16\" height=\"2\" rx=\"1\" fill=\"white\"/></svg>`

const handleDownload = () => {
  if (product.value && product.value.garminStoreUrl) {
    setTimeout(() => {
      window.open(product.value!.garminStoreUrl, '_blank')
    }, 600)
  } else {
    ElMessage.error('Download link is not available')
  }
}

const handleUnlock = () => {
  // window.open('https://wristo.io/code', '_blank')
  window.open('/code', '_blank')
}

onMounted(async () => {
  let productId = route.params.id
  if (Array.isArray(productId)) productId = productId[0]
  if (productId) {
    product.value = await productStore.getProductDetail(productId)
  }
})
</script>

<style scoped>
.product-detail-page {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 0 0 0;
}
.product-detail-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  gap: 80px;
}
.product-image-wrap {
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}
.product-info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 40px;
  min-width: 340px;
}
.product-title {
  font-size: 2.6rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.product-price {
  font-size: 1.3rem;
  color: #222;
  font-weight: 500;
  margin-bottom: 38px;
  margin-top: 0;
}
.product-btn {
  width: 300px;
  max-width: 100%;
  height: 64px;
  border-radius: 999px;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
  border: none;
}
.product-btn-download {
  background: #111;
  color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
}
.product-btn-download:hover {
  background: #222;
}
.product-btn-unlock {
  background: #111;
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 1.22rem;
  box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
  height: 64px;
  width: 340px;
  max-width: 100%;
  margin-bottom: 0;
  margin-top: 0;
  border-radius: 999px;
  transition: box-shadow 0.2s, background 0.2s;
}
.product-btn-unlock:hover {
  background: #222;
  box-shadow: 0 6px 24px 0 rgba(0,0,0,0.16);
}
.product-section-title {
  font-size: 1.15rem;
  font-weight: bold;
  margin: 38px 0 18px 0;
  color: #111;
  letter-spacing: 0.5px;
}
.product-desc {
  font-size: 1.08rem;
  color: #444;
  line-height: 1.7;
  max-width: 480px;
}
.install-section {
  margin: 0 0 32px 0;
  width: 100%;
}
.install-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #181818;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.2;
}
.install-subtitle {
  font-size: 1.08rem;
  color: #666;
  font-weight: 400;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: 0.1px;
}
.install-methods {
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  min-height: 220px;
}
.qrcode-section, .button-section {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.install-or {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #aaa;
  font-weight: 500;
  width: 48px;
  min-width: 48px;
  height: 100%;
  margin: 0;
  align-self: center;
}
.qrcode-title {
  font-size: 1.02rem;
  color: #888;
  margin-bottom: 10px;
  letter-spacing: 0.2px;
}
.qrcode-img {
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  background: #fff;
  padding: 8px;
}
.icon-download-svg {
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;
  width: 22px;
  height: 22px;
}
.button-title {
  font-size: 1.02rem;
  color: #888;
  margin-bottom: 12px;
  letter-spacing: 0.2px;
  text-align: center;
  max-width: 220px;
}
.button-section .product-btn-download {
  width: 160px;
  max-width: 100%;
  height: 48px;
  background: #fff;
  color: #888;
  border: 1.5px solid #e5e7eb;
  font-weight: 500;
  font-size: 1.08rem;
  box-shadow: none;
  border-radius: 16px;
  transition: none;
}
.button-section .product-btn-download:hover {
  background: #fff;
  color: #888;
  border: 1.5px solid #e5e7eb;
  box-shadow: none;
}
.unlock-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
}
.unlock-tip {
  font-size: 1.02rem;
  color: #888;
  margin-bottom: 12px;
  letter-spacing: 0.2px;
  text-align: center;
  max-width: 320px;
}
@media (max-width: 900px) {
  .product-detail-main {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
  .product-info-wrap {
    margin-top: 0;
    align-items: center;
    min-width: 0;
  }
  .product-btn {
    width: 100%;
  }
  .product-image-wrap {
    width: 320px;
    height: 320px;
  }
  .install-methods {
    flex-direction: column;
    gap: 18px;
  }
  .qrcode-section, .button-section {
    width: 100%;
    min-width: 0;
  }
  .install-or {
    width: 100%;
    min-width: 0;
    height: auto;
    margin: 8px 0;
  }
}
</style> 