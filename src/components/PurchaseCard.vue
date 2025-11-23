<template>
  <div :class="['purchase-card', { active: isSelected }]" @click="handleSelect">
    <!-- 折扣和Lifetime License标签 -->
    <div v-if="discount > 0" class="discount-badge">
      {{ discount }}% Off
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
          
            <span class="price">${{ currentPrice.toFixed(2) }}</span>
          </div>
        </div>
        <div v-else class="price-container">
          <span class="price">${{ currentPrice.toFixed(2) }}</span>
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
          Unlock {{ appCount.toLocaleString() }} apps
        </span>
        <span class="product-count-sub">
          (Value <span class="product-count-original">${{ appTotalPrice?.toFixed(2) }}</span>)
        </span>
      </div>
    </div>
    
    <!-- 购买按钮 -->
    <button class="buy-btn" @click="handleBuy">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

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
  originalPrice: number
  currentPrice: number
  discount: number
  isSelected: boolean
  buttonText: string
  appCount?: number
  appTotalPrice?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'product',
  bundleItems: () => []
})

const emit = defineEmits<{
  select: []
  buy: []
}>()

const formattedDescription = computed(() => {
  if (!props.description) return ''
  return props.description.replace(/\n/g, '<br>')
})

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
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border: 2px solid #e9ecef;
  cursor: pointer;
  position: relative;
  overflow: visible;
  margin-top: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: fit-content;
  height: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.purchase-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  transform: translateY(-4px);
}

.purchase-card.active {
  border-color: #2d6a4f;
  box-shadow: 0 12px 40px rgba(45, 106, 79, 0.4);
  background: linear-gradient(135deg, #f0f9f4 0%, #e6f7ed 100%);
  transform: translateY(-2px);
}

/* 折扣标签样式 */
.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #ff3b30, #ff6b6b);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 16px;
  border-top-left-radius: 10px;
  border-bottom-right-radius: 12px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

/* Lifetime License 标签样式 */
.lifetime-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ffcc02, #ffb000);
  color: #1d1d1f;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 12px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 204, 2, 0.3);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f3f4;
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
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
}

.price {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d6a4f;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
  order: -1;
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
  border: 2px solid #eee;
  background: #fafafa;
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
  background: #f1f1f1;
  border-radius: 3px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.bundle-images-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
  background: #fafafa;
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
  color: #999;
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
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.product-count {
  font-size: 0.9rem;
  color: #6b7280;
}

.product-count-main {
  font-weight: 500;
  color: #4b5563;
}

.product-count-sub {
  margin-left: 4px;
}

.product-count-original {
  text-decoration: line-through;
}

/* 购买按钮 */
.buy-btn {
  background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 18px 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: auto;
  width: 100%;
  box-shadow: 0 8px 24px rgba(45, 106, 79, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  min-height: 56px;
  position: relative;
  overflow: hidden;
}

.buy-btn:hover {
  box-shadow: 0 12px 32px rgba(45, 106, 79, 0.5);
  transform: translateY(-2px);
}

.buy-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(45, 106, 79, 0.3);
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
  .purchase-card {
    padding: 24px 20px;
    min-height: fit-content;
    border-radius: 18px;
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
    border-radius: 14px;
  }
}

/* 手机端优化 - 专门针对Chrome浏览器 */
@media (max-width: 480px) {
  .purchase-card {
    padding: 20px 16px 24px 16px;
    margin: 12px 0;
    min-height: fit-content;
    border-radius: 16px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
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
    border-radius: 16px;
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
    border-radius: 14px;
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
