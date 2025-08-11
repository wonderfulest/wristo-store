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
            <span class="original-price">${{ originalPrice.toFixed(2) }}</span>
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
        <div class="bundle-images-scroll" ref="scrollContainer">
          <div v-for="item in bundleItems" :key="item.id" class="bundle-image-item">
            <img :src="item.imageUrl" :alt="item.name" />
            <!-- <div class="item-name">{{ item.name }}</div> -->
          </div>
        </div>
        <div class="scroll-indicator">
          <span class="scroll-text">← Scroll to view all products →</span>
        </div>
      </div>
    </div>
    
    <!-- 详情描述 -->
    <div class="card-info">
      <div class="description" v-html="formattedDescription"></div>
      <div v-if="type === 'bundle' && bundleItems" class="product-count">
        Total {{ bundleItems.length }} apps
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

// 自动滚动功能
const scrollContainer = ref<HTMLElement | null>(null)
let autoScrollInterval: number | null = null

const startAutoScroll = () => {
  if (!scrollContainer.value || props.type !== 'bundle') return
  
  autoScrollInterval = window.setInterval(() => {
    if (scrollContainer.value) {
      const container = scrollContainer.value
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      const currentScroll = container.scrollLeft
      
      // 如果滚动到末尾，回到开始
      if (currentScroll >= scrollWidth - clientWidth) {
        container.scrollLeft = 0
      } else {
        container.scrollLeft += 1
      }
    }
  }, 30) // 每30ms滚动1px
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

onMounted(() => {
  if (props.type === 'bundle') {
    startAutoScroll()
  }
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<style scoped>
.purchase-card {
  background: transparent;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border: 2px solid #e9ecef;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.purchase-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.purchase-card.active {
  border-color: #2d6a4f;
  box-shadow: 0 8px 30px rgba(45, 106, 79, 0.3);
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
  border-bottom-left-radius: 12px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 204, 2, 0.3);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
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
  margin-bottom: 24px;
  text-align: center;
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
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
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
  margin-bottom: 24px;
}

.description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.product-count {
  color: #2d6a4f;
  font-weight: 500;
  font-size: 0.95rem;
}

/* 购买按钮 */
.buy-btn {
  background-color: #2d6a4f;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: auto;
  width: 100%;
  box-shadow: 0 4px 15px rgba(45, 106, 79, 0.3);
  transition: all 0.2s ease;
}

.buy-btn:hover {
  box-shadow: 0 6px 20px rgba(45, 106, 79, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .purchase-card {
    padding: 24px 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .single-image img {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 1.2rem;
  }
}
</style>
