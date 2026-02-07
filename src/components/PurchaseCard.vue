<template>
  <div :class="['purchase-card', { active: isSelected }]" @click="handleSelect">
    <!-- 折扣和Lifetime License标签 -->
    <div v-if="cappedDiscount > 0" class="discount-badge">
      {{ cappedDiscount }}% Off
    </div>
    
    <div class="lifetime-badge">
      Lifetime License
    </div>
    <!-- 名字和价格 -->
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <div class="price-info">
        <div v-if="originalPrice > currentPrice" class="price-container">
          <div class="price-group">
            <span :class="['original-price', 'original-price-float', { 'original-float-animate': animateDiscount }]">{{ currencySymbol }}{{ originalPrice.toFixed(2) }}</span>
            <span :class="['price', { 'discount-animate': animateDiscount, 'discounted-price': originalPrice > currentPrice }]">{{ currencySymbol }}{{ currentPrice.toFixed(2) }}</span>
          </div>
        </div>
        <div v-else class="price-container">
          <span class="price">{{ currencySymbol }}{{ currentPrice.toFixed(2) }}</span>
        </div>
      </div>
    </div>  
    <!-- 图片 -->
    <div class="card-image">
      <div v-if="type === 'product'" class="single-image">
        <img :src="imageUrl" :alt="title" />
      </div>
      <div v-else-if="type === 'bundle'" class="bundle-images">
        <div class="bundle-images-scroll" ref="scrollContainer" :class="{ 'mobile-scroll': isMobile }">
          <div v-for="item in bundleItems" :key="item.id" class="bundle-image-item">
            <img :src="item.imageUrl" :alt="item.name" />
            <!-- <div class="item-name">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="scroll-indicator" v-if="!isMobile">
          <span class="scroll-text">← Scroll to view all products →</span>
        </div>
        <div class="scroll-indicator" v-else>
          <span class="scroll-text">👆 Swipe to view all products</span>
        </div>
      </div>
    </div>
    
    <!-- 详情描述 -->
    <div class="card-info">
      <div v-if="type === 'bundle'" class="description" v-html="formattedDescription"></div>
      <div v-if="type === 'bundle' && appCount" class="product-count">
        <span class="product-count-main">
          Unlock {{ formatCountPlus(appCount) }} apps
        </span>
        <span class="product-count-sub">
          (Value <span class="product-count-original">{{ currencySymbol }}{{ appTotalPrice?.toFixed(2) }}</span>)
        </span>
      </div>
    </div>
    
    <!-- 购买按钮 -->
    <button
      v-if="showButton"
      :class="['buy-btn', type === 'bundle' ? 'buy-btn-bundle' : 'buy-btn-product']"
      @click="handleBuy"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const getCurrencySymbol = (code?: string) => {
  const normalized = String(code || 'USD').toUpperCase()
  const map: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  }
  return map[normalized] || '$'
}

interface BundleItem {
  id: string
  name: string
  imageUrl: string
}

interface Props {
  type: 'product' | 'bundle'
  title: string
  description: string
  imageUrl?: string
  bundleItems?: BundleItem[]
  priceId?: string
  originalPrice: number
  currentPrice: number
  discount: number
  isSelected: boolean
  buttonText: string
  showButton?: boolean
  appCount?: number
  appTotalPrice?: number
  currencyCode?: string
  animateDiscount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'product',
  bundleItems: () => [],
  showButton: true,
  currencyCode: 'USD',
  animateDiscount: false
})

const cappedDiscount = computed(() => {
  const n = Number(props.discount)
  if (!Number.isFinite(n)) return 0
  return Math.min(99, Math.max(0, Math.floor(n)))
})

const currencySymbol = computed(() => getCurrencySymbol(props.currencyCode))

const emit = defineEmits<{
  select: []
  buy: []
}>()

const formattedDescription = computed(() => {
  if (!props.description) return ''
  return props.description.replace(/\n/g, '<br>')
})

const formatCountPlus = (value?: number) => {
  if (value === undefined || value === null) return ''

  const n = Number(value)
  if (!Number.isFinite(n)) return ''

  if (n < 1000) return n.toLocaleString()

  const rounded = Math.floor(n / 1000) * 1000
  if (rounded >= n) return n.toLocaleString()
  return `${rounded.toLocaleString()}+`
}

const handleSelect = () => {
  emit('select')
}

const handleBuy = (event: Event) => {
  event.stopPropagation()
  emit('buy')
}

// 自动滚动功能 - 移动端优化
const scrollContainer = ref<HTMLElement | null>(null)
let autoScrollInterval: number | null = null
let scrollDirection = 1 // 1为向右，-1为向左
let isMobile = false

// 检测是否为移动设备
const detectMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768
}

const startAutoScroll = () => {
  if (!scrollContainer.value || props.type !== 'bundle') return
  
  // 移动端禁用自动滚动，避免与手势冲突
  if (isMobile) return
  
  autoScrollInterval = window.setInterval(() => {
    if (scrollContainer.value) {
      const container = scrollContainer.value
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      const currentScroll = container.scrollLeft
      
      // 循环滚动逻辑
      if (scrollDirection === 1) {
        // 向右滚动
        if (currentScroll >= scrollWidth - clientWidth) {
          scrollDirection = -1 // 改变方向
        } else {
          container.scrollLeft += 1
        }
      } else {
        // 向左滚动
        if (currentScroll <= 0) {
          scrollDirection = 1 // 改变方向
        } else {
          container.scrollLeft -= 1
        }
      }
    }
  }, 50) // 增加间隔到50ms，减少CPU占用
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

// 移动端触摸事件处理
const handleTouchStart = () => {
  stopAutoScroll()
}

const handleTouchEnd = () => {
  if (!isMobile && props.type === 'bundle') {
    setTimeout(() => {
      startAutoScroll()
    }, 2000) // 2秒后重新开始自动滚动
  }
}

onMounted(() => {
  isMobile = detectMobile()
  
  if (props.type === 'bundle') {
    if (!isMobile) {
      startAutoScroll()
    }
    
    // 为移动端添加触摸事件监听
    if (scrollContainer.value && isMobile) {
      scrollContainer.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      scrollContainer.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }
})

onUnmounted(() => {
  stopAutoScroll()
  
  // 清理事件监听器
  if (scrollContainer.value && isMobile) {
    scrollContainer.value.removeEventListener('touchstart', handleTouchStart)
    scrollContainer.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style scoped>
.purchase-card {
  background-color: #f6f7fb;
  background-image:
    radial-gradient(at 88% 40%, rgba(255, 255, 255, 0.95) 0px, transparent 85%),
    radial-gradient(at 49% 30%, rgba(255, 255, 255, 0.90) 0px, transparent 85%),
    radial-gradient(at 14% 26%, rgba(255, 255, 255, 0.88) 0px, transparent 85%),
    radial-gradient(at 0% 64%, rgba(0, 122, 255, 0.16) 0px, transparent 80%),
    radial-gradient(at 41% 94%, rgba(175, 82, 222, 0.10) 0px, transparent 80%),
    radial-gradient(at 100% 99%, rgba(52, 199, 89, 0.10) 0px, transparent 85%);
  border-radius: 12px;
  box-shadow:
    0 18px 44px rgba(15, 23, 42, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.75) inset;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(15, 23, 42, 0.08);
  cursor: pointer;
  position: relative;
  overflow: visible;
  margin-top: 1rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
  min-height: fit-content;
  height: auto;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.purchase-card::before {
  content: '';
  pointer-events: none;
  position: absolute;
  z-index: 0;
  inset: -1px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.35) 100%);
  opacity: 0.85;
}

.purchase-card::after {
  content: '';
  pointer-events: none;
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 50%;
  width: 220%;
  height: 10rem;
  transform: translate(-50%, -50%) rotate(0deg);
  transform-origin: left;
  border-radius: 12px;
  background-image: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 122, 255, 0.55) 40%,
    rgba(0, 122, 255, 0.55) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0.10;
  animation: purchase-card-rotate 10s linear infinite;
}

.purchase-card:hover {
  box-shadow:
    0 22px 56px rgba(15, 23, 42, 0.16),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  transform: translateY(-6px);
  border-color: rgba(15, 23, 42, 0.12);
}

.purchase-card.active {
  border-color: rgba(0, 122, 255, 0.35);
  box-shadow:
    0 24px 62px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(0, 122, 255, 0.18) inset,
    0 0 0 4px rgba(0, 122, 255, 0.06) inset,
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 12px 34px rgba(0, 122, 255, 0.14);
  transform: translateY(-4px);
}

.purchase-card > * {
  position: relative;
  z-index: 1;
}

@keyframes purchase-card-rotate {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 折扣标签样式 */
.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.95), rgba(255, 107, 107, 0.85));
  color: rgba(255, 255, 255, 0.98);
  font-size: 14px;
  font-weight: 700;
  padding: 8px 16px;
  border-top-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 2;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Lifetime License 标签样式 */
.lifetime-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 204, 2, 0.95), rgba(255, 176, 0, 0.85));
  color: rgba(17, 17, 17, 0.95);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 12px;
  z-index: 2;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.discount-tip {
  margin-top: 26px;
  margin-bottom: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(240, 249, 255, 0.92) 0%, rgba(232, 244, 253, 0.85) 100%);
  border: 1px solid rgba(0, 122, 255, 0.18);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.78) inset;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: left;
}

.discount-tip-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgba(15, 23, 42, 0.92);
}

.discount-tip-desc {
  margin-top: 4px;
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.64);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
  margin: 0;
}

.price-info {
  text-align: right;
}

.price-container {
  display: flex;
  align-items: baseline;
}

.price-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
}

.price {
  font-size: 1.6rem;
  font-weight: 700;
  color: #007aff;
}

.original-price {
  font-size: 1.2rem;
  color: rgba(15, 23, 42, 0.45);
  order: -1;
}

.original-price-float {
  position: absolute;
  right: 0;
  top: -1.05rem;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(15, 23, 42, 0.35);
  opacity: 0.72;
  pointer-events: none;
  white-space: nowrap;
}

.original-float-animate {
  animation: original-float-in 620ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

@keyframes original-float-in {
  from {
    transform: translateY(6px);
    opacity: 0;
    filter: blur(1px);
  }
  to {
    transform: translateY(0);
    opacity: 0.72;
    filter: blur(0);
  }
}

.discounted-price {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.98) 0%, rgba(52, 199, 89, 0.92) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 14px 30px rgba(0, 122, 255, 0.18);
}

.discount-animate {
  animation: discount-price-pop 900ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

@keyframes discount-price-pop {
  0% {
    transform: translateY(2px) scale(0.98);
    filter: blur(1px);
    opacity: 0.65;
  }
  45% {
    transform: translateY(-2px) scale(1.06);
    filter: blur(0);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 图片区域 */
.card-image {
  margin-bottom: 32px;
  text-align: center;
  flex-shrink: 0;
}

.single-image img {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(255, 255, 255, 0.70);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
}

/* Bundle 图片样式 */
.bundle-images {
  position: relative;
}

.bundle-images-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 12px 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  /* 移动端性能优化 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: scroll-position;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* 禁用自动滚动在移动端 */
  pointer-events: auto;
}

.bundle-images-scroll::-webkit-scrollbar {
  height: 6px;
}

.bundle-images-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 12px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.18);
  border-radius: 12px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.26);
}

.bundle-image-item {
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  min-width: 80px;
}

.bundle-image-item:hover {
  transform: scale(1.05);
}

.bundle-image-item img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  /* border: 2px solid #eee; */
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.10);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
  margin-bottom: 8px;
}

.bundle-image-item .item-name {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
}

.scroll-indicator {
  margin-top: 12px;
  text-align: center;
}

.scroll-text {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.50);
  font-style: italic;
}

/* 卡片信息 */
.card-info {
  flex: 1;
  text-align: left;
  margin-bottom: 32px;
  min-height: auto;
}

.description {
  color: rgba(15, 23, 42, 0.66);
  margin-bottom: 16px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.product-count {
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.62);
}

.product-count-main {
  font-weight: 500;
  color: rgba(15, 23, 42, 0.78);
}

.product-count-sub {
  margin-left: 4px;
}

.product-count-original {
  text-decoration: line-through;
}

/* 购买按钮 */
.buy-btn {
  border: none;
  border-radius: 14px;
  padding: 18px 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.4px;
  margin-top: auto;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  min-height: 56px;
  position: relative;
  overflow: hidden;
}

.buy-btn-bundle {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.98) 0%, rgba(64, 156, 255, 0.94) 55%, rgba(0, 122, 255, 0.90) 100%);
  color: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 18px 42px rgba(0, 122, 255, 0.32),
    0 16px 36px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.22) inset;
}

.buy-btn-product {
  background: rgba(255, 255, 255, 0.88);
  color: rgba(0, 122, 255, 0.95);
  border: 1px solid rgba(0, 122, 255, 0.26);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.72) inset;
}

.buy-btn:hover {
  transform: translateY(-2px);
}

.buy-btn-bundle:hover {
  box-shadow:
    0 22px 56px rgba(0, 122, 255, 0.38),
    0 18px 48px rgba(15, 23, 42, 0.20),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}

.buy-btn-product:hover {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(0, 122, 255, 0.34);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(0, 122, 255, 0.10) inset;
}

.buy-btn:active {
  transform: translateY(0);
}

.buy-btn-bundle:active {
  box-shadow:
    0 12px 30px rgba(0, 122, 255, 0.26),
    0 10px 26px rgba(0, 0, 0, 0.32),
    0 0 0 1px rgba(255, 255, 255, 0.18) inset;
}

.buy-btn-product:active {
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.10),
    0 0 0 1px rgba(0, 122, 255, 0.16) inset;
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
  .purchase-card {
    padding: 24px 20px;
    min-height: fit-content;
    border-radius: 12px;
    margin-top: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    margin-top: 24px;
    margin-bottom: 24px;
    padding-bottom: 18px;
  }
  
  .single-image img {
    width: 140px;
    height: 140px;
  }
  
  .bundle-image-item img {
    width: 90px;
    height: 90px;
  }
  
  .card-info {
    margin-bottom: 24px;
    min-height: auto;
  }
  
  .buy-btn {
    padding: 16px 1.5rem;
    font-size: 1.05rem;
    margin-top: 20px;
    min-height: 52px;
    border-radius: 12px;
  }
}

/* 手机端优化 - 专门针对Chrome浏览器 */
@media (max-width: 480px) {
  .purchase-card {
    padding: 20px 16px 24px 16px;
    margin: 12px 0;
    min-height: fit-content;
    border-radius: 12px;
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.55),
      0 -14px 22px rgba(255, 255, 255, 0.14) inset;
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    margin-top: 20px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    gap: 12px;
  }
  
  .card-title {
    font-size: 1.3rem;
    line-height: 1.4;
  }
  
  .price {
    font-size: 1.5rem;
    font-weight: 800;
  }
  
  .original-price {
    font-size: 1.1rem;
  }
  
  .card-image {
    margin-bottom: 24px;
  }
  
  .single-image img {
    width: 120px;
    height: 120px;
    border-radius: 12px;
  }
  
  .bundle-image-item img {
    width: 80px;
    height: 80px;
    border-radius: 12px;
  }
  
  .card-info {
    margin-bottom: 24px;
    min-height: auto;
    flex: 1;
  }
  
  .description {
    font-size: 0.95rem;
    line-height: 1.6;
  }
  
  .buy-btn {
    padding: 16px 1.2rem;
    font-size: 1rem;
    font-weight: 700;
    min-height: 56px;
    border-radius: 12px;
    margin-top: auto;
    margin-bottom: 0;
    letter-spacing: 0.6px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .purchase-card {
    padding: 18px 14px 22px 14px;
    min-height: fit-content;
  }
  
  .card-title {
    font-size: 1.2rem;
  }
  
  .price {
    font-size: 1.4rem;
  }
  
  .single-image img {
    width: 100px;
    height: 100px;
  }
  
  .bundle-image-item img {
    width: 70px;
    height: 70px;
  }
  
  .buy-btn {
    padding: 14px 1rem;
    font-size: 0.95rem;
    min-height: 52px;
  }
}

/* 移动端滚动优化 */
.mobile-scroll {
  -webkit-overflow-scrolling: touch !important;
  overflow-x: scroll !important;
  scroll-snap-type: x mandatory;
  -webkit-scroll-snap-type: x mandatory;
}

.mobile-scroll .bundle-image-item {
  scroll-snap-align: center;
  -webkit-scroll-snap-align: center;
}

/* Chrome浏览器特殊优化 */
@supports (-webkit-appearance: none) {
  @media (max-width: 480px) {
    .purchase-card {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      will-change: transform;
    }
    
    .bundle-images-scroll {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      -webkit-perspective: 1000px;
      perspective: 1000px;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
    
    .bundle-image-item {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      will-change: transform;
    }
    
    .bundle-image-item img {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      will-change: auto;
    }
    
    .buy-btn {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
  }
}

/* 移动端特殊优化 - 减少重绘和回流 */
@media (max-width: 768px) {
  .bundle-images-scroll {
    contain: layout style paint;
    isolation: isolate;
  }
  
  .bundle-image-item {
    contain: layout style paint;
  }
  
  .bundle-image-item:hover {
    transform: none; /* 移动端禁用hover效果 */
  }
}
</style>
