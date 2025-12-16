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
        <div class="new-scroll" ref="scrollContainer">
          <div class="new-scroll-track">
            <div v-for="product in loopProducts" :key="`${product.appId}-${product.__loopKey}`" class="new-slide">
              <button class="slide-btn" type="button" @click="$emit('product-click', product.__origin)">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ProductBaseVO } from '@/types';

const props = defineProps<{
  newProducts: ProductBaseVO[];
}>();

defineEmits(['product-click']);

const scrollContainer = ref<HTMLElement | null>(null)
const isMobile = ref(false)
let autoScrollInterval: number | null = null
let resumeTimer: number | null = null

const detectMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
}

const loopProducts = computed(() => {
  if (!props.newProducts || props.newProducts.length === 0) return [] as Array<ProductBaseVO & { __loopKey: string; __origin: ProductBaseVO }>
  if (props.newProducts.length === 1) return [{ ...props.newProducts[0], __loopKey: 'a', __origin: props.newProducts[0] }]
  return [
    ...props.newProducts.map(p => ({ ...p, __loopKey: 'a', __origin: p })),
    ...props.newProducts.map(p => ({ ...p, __loopKey: 'b', __origin: p })),
  ]
})

const normalizeLoopScroll = () => {
  const el = scrollContainer.value
  if (!el) return
  if (props.newProducts.length <= 1) return

  const half = el.scrollWidth / 2
  if (half <= 0) return

  if (el.scrollLeft <= 0) {
    el.scrollLeft = el.scrollLeft + half
    return
  }

  if (el.scrollLeft >= half) {
    el.scrollLeft = el.scrollLeft - half
  }
}

const startAutoScroll = () => {
  if (!scrollContainer.value) return
  if (props.newProducts.length <= 1) return
  if (isMobile.value) return

  stopAutoScroll()
  autoScrollInterval = window.setInterval(() => {
    const el = scrollContainer.value
    if (!el) return
    el.scrollLeft += 1
    normalizeLoopScroll()
  }, 30)
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    window.clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

const pauseAndCancelResume = () => {
  stopAutoScroll()
  if (resumeTimer) {
    window.clearTimeout(resumeTimer)
    resumeTimer = null
  }
}

const scheduleResume = () => {
  if (isMobile.value) return
  if (props.newProducts.length <= 1) return
  if (resumeTimer) window.clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(() => {
    startAutoScroll()
  }, 2000)
}

const handleInteractionStart = () => {
  pauseAndCancelResume()
}

const handleInteractionEnd = () => {
  scheduleResume()
}

onMounted(() => {
  isMobile.value = detectMobile()

  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', normalizeLoopScroll, { passive: true })
    scrollContainer.value.addEventListener('touchstart', handleInteractionStart, { passive: true })
    scrollContainer.value.addEventListener('touchend', handleInteractionEnd, { passive: true })
    scrollContainer.value.addEventListener('pointerdown', handleInteractionStart)
    scrollContainer.value.addEventListener('pointerup', handleInteractionEnd)
    scrollContainer.value.addEventListener('mouseenter', handleInteractionStart)
    scrollContainer.value.addEventListener('mouseleave', handleInteractionEnd)
  }

  if (!isMobile.value) {
    startAutoScroll()
  }
})

onUnmounted(() => {
  stopAutoScroll()
  if (resumeTimer) {
    window.clearTimeout(resumeTimer)
    resumeTimer = null
  }

  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', normalizeLoopScroll)
    scrollContainer.value.removeEventListener('touchstart', handleInteractionStart)
    scrollContainer.value.removeEventListener('touchend', handleInteractionEnd)
    scrollContainer.value.removeEventListener('pointerdown', handleInteractionStart)
    scrollContainer.value.removeEventListener('pointerup', handleInteractionEnd)
    scrollContainer.value.removeEventListener('mouseenter', handleInteractionStart)
    scrollContainer.value.removeEventListener('mouseleave', handleInteractionEnd)
  }
})
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
  font-size: 2rem;
  font-weight: bold;
  color: #222;
  letter-spacing: -0.02em;
}

.new-carousel-wrap {
  padding: 0 16px;
  position: relative;
}

.new-slide {
  height: auto;
  flex: 0 0 auto;
}

.new-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 44px;
}

.new-scroll::-webkit-scrollbar {
  display: none;
}

.new-scroll-track {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 0;
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
  width: 220px;
  height: 220px;
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

:deep(.new-scroll) {
  scroll-behavior: auto;
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

  .new-scroll {
    padding: 10px 0 24px;
  }

  .new-scroll-track {
    gap: 18px;
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

  .new-scroll-track {
    gap: 12px;
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
