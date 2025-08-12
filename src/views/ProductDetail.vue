<template>
  <div class="product-detail-page">
    <div class="product-detail-main">
      <!-- 左侧大圆形图片 -->
      <div class="product-image-wrap">
        <img
          v-if="product?.heroFile?.url || product?.garminImageUrl"
          :src="product?.heroFile?.url || product?.garminImageUrl"
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
              <div class="qrcode-container">
                <qrcode-vue 
                  ref="qrcodeRef"
                  :value="product.garminStoreUrl" 
                  :size="128" 
                  :level="'M'" 
                  class="qrcode-img" 
                />
                <div class="qrcode-actions">
                  <button class="qrcode-action-btn" @click="saveQRCode" title="Save QR Code">
                    💾
                  </button>
                  <button class="qrcode-action-btn" @click="shareQRCode" title="Share QR Code">
                    📤
                  </button>
                </div>
              </div>
              <div class="qrcode-help">
                <span class="qrcode-help-text">💡 Long press QR code to save or scan with camera</span>
              </div>
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
          <button class="product-btn product-btn-already-purchased" @click="handleAlreadyPurchased">
            Already Purchased
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/store/product'
import type { ProductVO } from '@/types'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const product = ref<ProductVO | null>(null)

// const DownloadSvg = `<svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 2V16M11 16L6 11M11 16L16 11\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"3\" y=\"18\" width=\"16\" height=\"2\" rx=\"1\" fill=\"white\"/></svg>`

const handleDownload = () => {
  if (product.value && product.value.garminStoreUrl) {
    // 对于外部链接，保持在新标签页打开是最佳实践
    // 这样用户不会丢失当前页面的上下文
    window.open(product.value.garminStoreUrl, '_blank')
  } else {
    ElMessage.error('Download link is not available')
  }
}

const handleUnlock = () => {
  console.log(product.value)
  router.push('/code')
}

const handleAlreadyPurchased = () => {
  router.push('/already-purchased')
}

// QR Code functionality
const qrcodeRef = ref<any>(null)

const saveQRCode = async () => {
  try {
    if (!product.value?.garminStoreUrl) return
    
    // Create canvas from QR code
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const qrCodeElement = qrcodeRef.value?.$el?.querySelector('canvas') as HTMLCanvasElement
    
    if (qrCodeElement) {
      canvas.width = qrCodeElement.width
      canvas.height = qrCodeElement.height
      ctx?.drawImage(qrCodeElement, 0, 0)
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${product.value?.name || 'garmin-app'}-qrcode.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          ElMessage.success('QR Code saved successfully!')
        }
      }, 'image/png')
    }
  } catch (error) {
    console.error('Error saving QR code:', error)
    ElMessage.error('Failed to save QR code')
  }
}

const shareQRCode = async () => {
  try {
    if (!product.value?.garminStoreUrl) return
    
    // Check if Web Share API is supported
    if (navigator.share) {
      await navigator.share({
        title: `${product.value?.name} - Garmin App`,
        text: 'Check out this Garmin app!',
        url: product.value.garminStoreUrl
      })
      ElMessage.success('Shared successfully!')
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(product.value.garminStoreUrl)
      ElMessage.success('Link copied to clipboard!')
    }
  } catch (error) {
    console.error('Error sharing:', error)
    ElMessage.error('Failed to share')
  }
}

onMounted(async () => {
  let productId = route.params.id
  if (Array.isArray(productId)) productId = productId[0]
  if (productId) {
    product.value = await productStore.getProductDetail(productId) as ProductVO
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
  padding: 60px 20px 0 20px;
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

.product-btn-already-purchased {
  background: #fff;
  color: #111;
  border: 2px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  height: 56px;
  width: 340px;
  max-width: 100%;
  margin-bottom: 0;
  margin-top: 12px;
  border-radius: 999px;
  transition: all 0.2s;
}

.product-btn-already-purchased:hover {
  background: #f8f9fa;
  border-color: #d1d5db;
  box-shadow: 0 4px 18px 0 rgba(0,0,0,0.08);
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
.qrcode-container {
  position: relative;
  display: inline-block;
}

.qrcode-img {
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  background: #fff;
  padding: 8px;
  transition: transform 0.2s ease;
}

.qrcode-img:hover {
  transform: scale(1.05);
}

.qrcode-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.qrcode-container:hover .qrcode-actions {
  opacity: 1;
}

.qrcode-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-action-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  transform: scale(1.1);
}

.qrcode-help {
  margin-top: 8px;
  text-align: center;
}

.qrcode-help-text {
  font-size: 0.85rem;
  color: #6b7280;
  background: rgba(59, 130, 246, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  display: inline-block;
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
  .product-detail-page {
    padding: 40px 16px 120px 16px;
  }
  
  .product-detail-main {
    flex-direction: column;
    align-items: center;
    gap: 40px;
    max-width: 100%;
  }
  
  .product-info-wrap {
    margin-top: 0;
    align-items: center;
    min-width: 0;
    width: 100%;
    max-width: 400px;
  }
  
  .product-btn {
    width: 100%;
    max-width: 340px;
  }
  
  .product-image-wrap {
    width: 280px;
    height: 280px;
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
  
  .product-title {
    font-size: 2.2rem;
    text-align: center;
  }
  
  .product-price {
    text-align: center;
  }
  
  .product-desc {
    text-align: center;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .product-detail-page {
    padding: 32px 12px 100px 12px;
  }
  
  .product-detail-main {
    gap: 32px;
  }
  
  .product-image-wrap {
    width: 240px;
    height: 240px;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
  
  .product-btn {
    height: 56px;
    font-size: 1.1rem;
  }
  
  .product-btn-unlock {
    height: 56px;
    font-size: 1.1rem;
  }
  
  .product-btn-already-purchased {
    height: 48px;
    font-size: 1rem;
  }
  
  .install-title {
    font-size: 1.25rem;
  }
  
  .qrcode-img {
    width: 100px !important;
    height: 100px !important;
  }
  
  .qrcode-actions {
    top: -6px;
    right: -6px;
  }
  
  .qrcode-action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .qrcode-help-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .product-detail-page {
    padding: 24px 8px 80px 8px;
  }
  
  .product-image-wrap {
    width: 200px;
    height: 200px;
  }
  
  .product-title {
    font-size: 1.6rem;
  }
  
  .product-btn {
    height: 52px;
    font-size: 1rem;
  }
  
  .product-btn-unlock {
    height: 52px;
    font-size: 1rem;
  }
  
  .product-btn-already-purchased {
    height: 44px;
    font-size: 0.95rem;
  }
}
</style> 