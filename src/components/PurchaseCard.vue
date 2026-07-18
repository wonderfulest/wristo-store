<template>
  <article
    :class="['purchase-card', { active: isSelected }]"
    @click="handleSelect"
  >
    <!-- 折扣和Lifetime License标签 -->
    <div v-if="cappedDiscount > 0" class="discount-badge">
      {{ cappedDiscount }}% {{ t('purchaseCard.off') }}
    </div>
    
    <div class="lifetime-badge">
      {{ t('purchaseCard.lifetimeLicense') }}
    </div>
    <!-- 名字和价格 -->
    <div class="card-header">
      <div class="card-header-row card-header-meta">
        <span class="card-kicker">{{ type === 'bundle' ? t('purchaseCard.bestValueBundle') : t('purchaseCard.singleItem') }}</span>
        <span
          v-if="originalPrice > currentPrice"
          :class="['original-price', 'original-price-float', { 'original-float-animate': animateDiscount }]"
        >
          {{ currencySymbol }}{{ originalPrice.toFixed(2) }}
        </span>
      </div>
      <div class="card-header-row card-header-title">
        <h3 class="card-title">{{ displayTitle }}</h3>
        <span :class="['price', { 'discount-animate': animateDiscount, 'discounted-price': originalPrice > currentPrice }]">
          {{ currencySymbol }}{{ currentPrice.toFixed(2) }}
        </span>
      </div>
    </div>  
    <div class="value-strip">
      <span>{{ type === 'bundle' ? t('purchaseCard.lifetimeBundleAccess') : t('purchaseCard.lifetimeSingleAccess') }}</span>
      <span>{{ type === 'bundle' && appCount ? `${formatDisplayAppCount(appCount)} ${t('purchaseCard.appsIncluded')}` : t('purchaseCard.oneTimePayment') }}</span>
    </div>
    <!-- 图片 -->
    <div class="card-image">
      <div v-if="type === 'product'" class="single-image">
        <img :src="imageUrl" :alt="title" />
      </div>
      <div v-else-if="type === 'bundle'" class="bundle-images">
        <div
          class="bundle-images-scroll"
          ref="scrollContainer"
          :class="{ 'mobile-scroll': isMobile }"
          @mouseenter="pauseAutoScroll"
          @mouseleave="resumeAutoScroll"
          @focusin="pauseAutoScroll"
          @focusout="resumeAutoScroll"
          @scroll="handleBundleScroll"
        >
          <div v-for="item in visibleBundleItems" :key="item.id" class="bundle-image-item">
            <img :src="item.imageUrl" :alt="item.name" />
            <!-- <div class="item-name">{{ item.name }}</div> -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- 详情描述 -->
    <div class="card-info">
      <div v-if="type === 'bundle' && descriptionLines.length" class="description">
        <p
          v-for="(line, index) in descriptionLines"
          :key="`${line.text}-${index}`"
          :class="{ 'description-heading': line.kind === 'heading' }"
        >
          <template v-if="line.kind === 'reason'">
            <span class="description-reason-label">{{ line.label }}</span>
            <span class="description-reason-separator" aria-hidden="true">—</span>
            <span class="description-reason-detail">{{ line.detail }}</span>
          </template>
          <template v-else>{{ line.text }}</template>
        </p>
      </div>
      <div v-if="type === 'bundle' && appCount" class="product-count">
        <span class="product-count-main">
          {{ t('purchaseCard.unlock') }} {{ formatDisplayAppCount(appCount) }} {{ t('purchaseCard.apps') }}
        </span>
        <span class="product-count-sub">
          ({{ t('purchaseCard.value') }} <span class="product-count-original">{{ currencySymbol }}{{ appTotalPrice?.toFixed(2) }}</span>)
        </span>
      </div>
    </div>
    
    <!-- 购买按钮 -->
    <button
      v-if="showButton"
      type="button"
      :class="['buy-btn', 'commerce-primary-action', type === 'bundle' ? 'buy-btn-bundle' : 'buy-btn-product']"
      @click="handleBuy"
    >
      {{ buttonText }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useCountDisplay } from '@/composables/useCountDisplay'

const { t } = useI18n()
const { formatDisplayAppCount } = useCountDisplay()

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
  hasMoreBundleItems?: boolean
  bundleItemsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'product',
  bundleItems: () => [],
  showButton: true,
  currencyCode: 'USD',
  animateDiscount: false,
  hasMoreBundleItems: false,
  bundleItemsLoading: false
})

const BUNDLE_ITEMS_MAX_VISIBLE = 500

const cappedDiscount = computed(() => {
  const n = Number(props.discount)
  if (!Number.isFinite(n)) return 0
  return Math.min(99, Math.max(0, Math.floor(n)))
})

const currencySymbol = computed(() => getCurrencySymbol(props.currencyCode))

const emit = defineEmits<{
  select: []
  buy: []
  loadMoreBundleItems: []
}>()

const stripLeadingDisplayMarks = (value: string) => {
  return value
    .replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\s]+/u, '')
    .trim()
}

const displayTitle = computed(() => stripLeadingDisplayMarks(props.title))

const descriptionLines = computed(() => {
  if (!props.description) return []

  return props.description
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n+/)
    .map(line => stripLeadingDisplayMarks(line))
    .filter(Boolean)
    .map((text, index) => {
      if (index === 0) return { kind: 'heading' as const, text }

      const separatorIndex = text.indexOf(' - ')
      if (separatorIndex < 0) return { kind: 'plain' as const, text }

      return {
        kind: 'reason' as const,
        text,
        label: text.slice(0, separatorIndex).trim(),
        detail: text.slice(separatorIndex + 3).trim(),
      }
    })
})

const visibleBundleItems = computed(() => {
  if (props.type !== 'bundle') return []
  return props.bundleItems.slice(0, BUNDLE_ITEMS_MAX_VISIBLE)
})

const handleSelect = () => {
  emit('select')
}

const handleBuy = (event: Event) => {
  event.stopPropagation()
  emit('buy')
}

const loadNextBundleItemsBatch = () => {
  if (!props.hasMoreBundleItems || props.bundleItemsLoading) return
  emit('loadMoreBundleItems')
}

const handleBundleScroll = () => {
  const container = scrollContainer.value
  if (!container || props.type !== 'bundle') return

  const distanceToEnd = container.scrollWidth - container.clientWidth - container.scrollLeft
  if (distanceToEnd <= 24) {
    loadNextBundleItemsBatch()
  }
}

// 自动滚动功能 - 移动端优化
const scrollContainer = ref<HTMLElement | null>(null)
let autoScrollInterval: number | null = null
let scrollDirection = 1 // 1为向右，-1为向左
const isMobile = ref(false)
let autoScrollPausedByHover = false

// 检测是否为移动设备
const detectMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768
}

const startAutoScroll = () => {
  if (!scrollContainer.value || props.type !== 'bundle') return
  if (autoScrollInterval || autoScrollPausedByHover) return
  
  // 移动端禁用自动滚动，避免与手势冲突
  if (isMobile.value) return

  const container = scrollContainer.value
  if (container.scrollWidth <= container.clientWidth) return
  
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

const pauseAutoScroll = () => {
  if (props.type !== 'bundle') return
  autoScrollPausedByHover = true
  stopAutoScroll()
}

const resumeAutoScroll = () => {
  if (props.type !== 'bundle') return
  autoScrollPausedByHover = false
  startAutoScroll()
}

watch(
  () => [props.type, props.title],
  () => {
    scrollDirection = 1
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = 0
    }
  }
)

// 移动端触摸事件处理
const handleTouchStart = () => {
  stopAutoScroll()
}

const handleTouchEnd = () => {
  if (!isMobile.value && props.type === 'bundle') {
    setTimeout(() => {
      startAutoScroll()
    }, 2000) // 2秒后重新开始自动滚动
  }
}

onMounted(() => {
  isMobile.value = detectMobile()
  
  if (props.type === 'bundle') {
    if (!isMobile.value) {
      startAutoScroll()
    }
    
    // 为移动端添加触摸事件监听
    if (scrollContainer.value && isMobile.value) {
      scrollContainer.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      scrollContainer.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }
})

onUnmounted(() => {
  stopAutoScroll()
  
  // 清理事件监听器
  if (scrollContainer.value && isMobile.value) {
    scrollContainer.value.removeEventListener('touchstart', handleTouchStart)
    scrollContainer.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style scoped>
.purchase-card {
  background-color: rgba(255, 255, 255, 0.92);
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%),
    radial-gradient(circle at 85% 12%, rgba(212, 175, 55, 0.22) 0, transparent 30%),
    radial-gradient(circle at 12% 18%, rgba(15, 23, 42, 0.08) 0, transparent 28%);
  border-radius: 18px;
  box-shadow:
    0 18px 50px rgba(15, 23, 42, 0.10),
    0 3px 14px rgba(15, 23, 42, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.75) inset;
  padding: 28px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(23, 23, 23, 0.10);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-top: 0;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
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
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(212, 175, 55, 0.10), rgba(255, 255, 255, 0.2));
  opacity: 0.72;
}

.purchase-card::after {
  content: '';
  pointer-events: none;
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.46), transparent 24%, transparent 76%, rgba(255, 255, 255, 0.54));
  opacity: 0.56;
}

.purchase-card:hover {
  box-shadow:
    0 24px 62px rgba(15, 23, 42, 0.14),
    0 6px 18px rgba(15, 23, 42, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  transform: translateY(-4px);
  border-color: rgba(212, 175, 55, 0.42);
}

.purchase-card.active {
  border-color: rgba(212, 175, 55, 0.68);
  box-shadow:
    0 26px 70px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(212, 175, 55, 0.22) inset,
    0 0 0 4px rgba(212, 175, 55, 0.10) inset,
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 12px 34px rgba(212, 175, 55, 0.18);
  transform: translateY(-3px);
}

.purchase-card.bundle-subscription-target {
  border-color: rgba(212, 175, 55, 0.54);
}

.purchase-card > * {
  position: relative;
  z-index: 1;
}

/* 折扣标签样式 */
.discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #b42318, #dc2626);
  color: rgba(255, 255, 255, 0.98);
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-top-left-radius: 18px;
  border-bottom-right-radius: 14px;
  z-index: 2;
  box-shadow: 0 10px 24px rgba(180, 35, 24, 0.24);
}

/* Lifetime License 标签样式 */
.lifetime-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #f8e7a2, #d4af37);
  color: #171717;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 14px;
  border-top-right-radius: 18px;
  border-bottom-left-radius: 14px;
  z-index: 2;
  box-shadow: 0 10px 24px rgba(151, 120, 24, 0.20);
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
  flex-direction: column;
  gap: 8px;
  margin-top: 30px;
  margin-bottom: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.card-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  width: 100%;
}

.card-header-meta {
  min-height: 1.05rem;
}

.card-header-title {
  align-items: flex-end;
}

.card-kicker {
  display: inline-flex;
  min-width: 0;
  color: #7c5f12;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.55rem;
  line-height: 1.18;
  font-weight: 800;
  color: #171717;
  margin: 0;
  min-width: 0;
}

.price {
  font-size: 1.7rem;
  font-weight: 900;
  color: #171717;
  line-height: 1;
  flex-shrink: 0;
  white-space: nowrap;
}

.original-price {
  font-size: 1.2rem;
  color: rgba(15, 23, 42, 0.45);
}

.original-price-float {
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(15, 23, 42, 0.35);
  opacity: 0.72;
  pointer-events: none;
  white-space: nowrap;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, #171717 0%, #8a6d1d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 14px 30px rgba(138, 109, 29, 0.16);
}

.value-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.value-strip span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(23, 23, 23, 0.055);
  color: #44403c;
  font-size: 0.82rem;
  font-weight: 700;
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
  margin-bottom: 24px;
  text-align: center;
  flex-shrink: 0;
}

.single-image img {
  width: 132px;
  height: 132px;
  border-radius: 16px;
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
  align-items: center;
  gap: 0;
  overflow-x: scroll;
  overflow-y: hidden;
  min-height: 176px;
  padding: 0;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.07);
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
  transition: min-width 220ms ease, transform 220ms ease;
  min-width: 82px;
  position: relative;
  z-index: 0;
  display: flex;
  justify-content: center;
}

.bundle-image-item:hover {
  min-width: 164px;
  transform: translateY(-3px);
  z-index: 2;
}

.bundle-image-item img {
  width: 82px;
  height: 82px;
  border-radius: 14px;
  object-fit: cover;
  /* border: 2px solid #eee; */
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.10);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
  margin: 0;
  transition: width 220ms ease, height 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  transform-origin: center;
}

.bundle-image-item:hover img {
  width: 164px;
  height: 164px;
  border-color: rgba(212, 175, 55, 0.46);
  box-shadow:
    0 18px 36px rgba(15, 23, 42, 0.20),
    0 0 0 4px rgba(212, 175, 55, 0.12);
}

.bundle-image-item .item-name {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
}

/* 卡片信息 */
.card-info {
  flex: 1;
  text-align: left;
  margin-bottom: 32px;
  min-height: auto;
}

.description {
  color: #57534e;
  margin-bottom: 16px;
  line-height: 1.6;
  font-size: 0.95rem;
}

.description p {
  position: relative;
  margin: 0 0 10px;
  padding-left: 16px;
}

.description p::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #d4af37;
}

.description-heading {
  padding-left: 0 !important;
  color: #171717;
  font-weight: 800;
}

.description-heading::before {
  display: none;
}

.description-reason-label {
  color: #171717;
  font-weight: 750;
}

.description-reason-separator {
  margin: 0 0.45em;
  color: rgba(87, 83, 78, 0.48);
}

.description-reason-detail {
  color: #57534e;
  font-weight: 400;
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
  --commerce-primary-width: 100%;
  --commerce-primary-min-height: 56px;
  --commerce-primary-padding: 18px 2rem;
  --commerce-primary-border: 0;
  --commerce-primary-radius: 16px;
  --commerce-primary-font-size: 1rem;
  --commerce-primary-font-weight: 700;
  --commerce-primary-hover-transform: translateY(-2px);
  letter-spacing: 0;
  margin-top: auto;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.buy-btn-bundle {
  --commerce-primary-background: linear-gradient(135deg, #171717 0%, #2f2a20 55%, #8a6d1d 100%);
  --commerce-primary-color: rgba(255, 255, 255, 0.98);
  --commerce-primary-shadow:
    0 18px 42px rgba(23, 23, 23, 0.22),
    0 16px 36px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.22) inset;
  --commerce-primary-hover-background: linear-gradient(135deg, #171717 0%, #2f2a20 55%, #8a6d1d 100%);
  --commerce-primary-hover-shadow:
    0 22px 56px rgba(23, 23, 23, 0.26),
    0 18px 48px rgba(15, 23, 42, 0.20),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
  --commerce-primary-active-shadow:
    0 12px 30px rgba(0, 122, 255, 0.26),
    0 10px 26px rgba(0, 0, 0, 0.32),
    0 0 0 1px rgba(255, 255, 255, 0.18) inset;
}

.buy-btn-product {
  --commerce-primary-background: rgba(255, 255, 255, 0.88);
  --commerce-primary-color: #171717;
  --commerce-primary-border: 1px solid rgba(23, 23, 23, 0.18);
  --commerce-primary-shadow:
    0 12px 28px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.72) inset;
  --commerce-primary-hover-background: rgba(255, 255, 255, 0.94);
  --commerce-primary-hover-border-color: rgba(212, 175, 55, 0.48);
  --commerce-primary-hover-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(0, 122, 255, 0.10) inset;
  --commerce-primary-active-shadow:
    0 10px 24px rgba(15, 23, 42, 0.10),
    0 0 0 1px rgba(0, 122, 255, 0.16) inset;
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
  .purchase-card {
    padding: 24px 20px;
    min-height: fit-content;
    border-radius: 16px;
    margin-top: 16px;
  }
  
  .card-header {
    gap: 14px;
    text-align: left;
    margin-top: 24px;
    margin-bottom: 24px;
    padding-bottom: 18px;
  }

  .price-info {
    text-align: left;
  }

  .price-group {
    align-items: flex-start;
  }

  .original-price-float {
    transform: none;
  }
  
  .single-image img {
    width: 140px;
    height: 140px;
  }
  
  .bundle-image-item img {
    width: 90px;
    height: 90px;
  }

  .bundle-image-item {
    min-width: 90px;
  }

  .bundle-image-item:hover {
    min-width: 180px;
  }

  .bundle-image-item:hover img {
    width: 180px;
    height: 180px;
  }
  
  .card-info {
    margin-bottom: 24px;
    min-height: auto;
  }
  
  .buy-btn {
    --commerce-primary-padding: 16px 1.5rem;
    --commerce-primary-font-size: 1.05rem;
    --commerce-primary-mobile-min-height: 52px;
    --commerce-primary-radius: 12px;
    margin-top: 20px;
  }
}

/* 手机端优化 - 专门针对Chrome浏览器 */
@media (max-width: 480px) {
  .purchase-card {
    padding: 20px 16px 24px 16px;
    margin: 12px 0;
    min-height: fit-content;
    border-radius: 16px;
    box-shadow:
      0 18px 50px rgba(15, 23, 42, 0.13),
      0 1px 0 rgba(255, 255, 255, 0.72) inset;
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
    line-height: 1.24;
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

  .bundle-image-item {
    min-width: 80px;
  }

  .bundle-images-scroll {
    min-height: 172px;
  }

  .bundle-image-item:hover {
    min-width: 160px;
  }

  .bundle-image-item:hover img {
    width: 160px;
    height: 160px;
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
    --commerce-primary-padding: 16px 1.2rem;
    --commerce-primary-font-size: 1rem;
    --commerce-primary-font-weight: 700;
    --commerce-primary-mobile-min-height: 56px;
    --commerce-primary-radius: 12px;
    margin-top: auto;
    margin-bottom: 0;
    letter-spacing: 0;
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

  .bundle-image-item {
    min-width: 70px;
  }

  .bundle-images-scroll {
    min-height: 150px;
  }

  .bundle-image-item:hover {
    min-width: 140px;
  }

  .bundle-image-item:hover img {
    width: 140px;
    height: 140px;
  }
  
  .buy-btn {
    --commerce-primary-padding: 14px 1rem;
    --commerce-primary-font-size: 0.95rem;
    --commerce-primary-mobile-min-height: 52px;
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
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .purchase-card,
  .bundle-image-item,
  .discount-animate,
  .original-float-animate {
    animation: none !important;
    transition: none !important;
  }
}
</style>
