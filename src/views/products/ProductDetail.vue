<template>
  <div class="product-detail-page">
    <div class="product-detail-main">
      <!-- 左侧兜底预览图 -->
      <div class="product-image-wrap">
        <img
          v-if="productPreviewFallback"
          :src="productPreviewFallback"
          :alt="product?.name || t('product.previewAlt')"
          class="product-image"
          loading="eager"
        />
        <div v-else class="product-image-fallback">W</div>
      </div>
      <!-- 右侧信息区 -->
      <div class="product-info-wrap">
        <h1 class="product-title">{{ product?.name }}</h1>
        <div class="product-price">${{ product?.price?.toFixed(2) }}</div>
        <section v-if="isAdmin && adminMetrics" class="admin-detail-panel">
          <div class="admin-detail-header">
            <span>管理员数据</span>
            <span :class="['admin-state', adminMetrics.storeVisibility === 'HIDDEN' ? 'hidden' : 'visible']">
              {{ adminMetrics.storeVisibility === 'HIDDEN' ? '已隐藏' : '展示中' }}
            </span>
          </div>
          <div class="admin-detail-grid">
            <div><strong>{{ formatNumber(adminMetrics.download) }}</strong><span>下载</span></div>
            <div><strong>{{ formatNumber(adminMetrics.purchase) }}</strong><span>购买</span></div>
            <div><strong>{{ formatScore(adminMetrics.score) }}</strong><span>评分</span></div>
            <div><strong>{{ adminMetrics.storeWeight ?? 20 }}</strong><span>权重</span></div>
          </div>
          <div class="admin-detail-lines">
            <div>设计师：{{ designerLabel }}</div>
            <div>上线时间：{{ formatDate(adminMetrics.lastGoLive) }}</div>
            <div v-if="adminMetrics.storeVisibilityReason">原因：{{ adminMetrics.storeVisibilityReason }}</div>
          </div>
          <div v-if="adminMetrics.categories?.length" class="admin-category-list">
            <span v-for="category in adminMetrics.categories" :key="category.id">
              {{ category.name }}
            </span>
          </div>
          <div class="admin-detail-actions">
            <button type="button" @click="toggleAdminVisibility">
              {{ adminMetrics.storeVisibility === 'HIDDEN' ? '恢复展示' : '隐藏应用' }}
            </button>
            <button type="button" @click="editAdminWeight">调整权重</button>
            <button type="button" @click="categoryEditorVisible = true">编辑分类</button>
            <button type="button" @click="handleOpenInStudio">跳转 Studio</button>
          </div>
        </section>
        <button
          v-if="product?.appId"
          type="button"
          class="product-btn product-btn-buy"
          :disabled="checkoutLoading"
          @click="handleBuyNow"
        >
          {{ checkoutLoading ? t('product.openingCheckout') : t('product.buyNow') }}
          <el-icon class="btn-icon"><CreditCard /></el-icon>
        </button>
        <button
          v-if="isCartEnabled && product?.appId"
          type="button"
          class="product-btn product-btn-cart"
          :class="{ active: isInCart }"
          @click="toggleCart"
        >
          {{ isInCart ? t('cart.goToCart') : t('product.addToCart') }}
          <el-icon class="btn-icon"><ShoppingCart /></el-icon>
        </button>
        <button
          v-if="product?.designId"
          type="button"
          class="product-btn product-btn-studio"
          @click="handleCustomizeInStudio"
        >
          {{ t('product.customizeInStudio') }}
          <el-icon class="btn-icon"><MagicStick /></el-icon>
        </button>
        <section v-if="product?.description" class="product-summary" aria-labelledby="product-summary-title">
          <h2 id="product-summary-title" class="product-section-title">{{ t('product.detailsTitle') }}</h2>
          <div class="product-desc" v-html="renderedProductDescription"></div>
        </section>
        <div v-if="product?.garminStoreUrl" class="install-section">
          <div class="install-title">{{ t('product.installTitle') }}</div>
          <div class="install-subtitle">{{ t('product.installSubtitle') }}</div>
          <div class="install-methods">
            <div class="qrcode-section">
              <div class="qrcode-title">{{ t('product.qrTitle') }}</div>
              <div class="qrcode-container" ref="qrcodeBoxRef">
                <qrcode-vue 
                  ref="qrcodeRef"
                  :value="product.garminStoreUrl" 
                  :size="128" 
                  :level="'M'" 
                  :render-as="'canvas'"
                  class="qrcode-img" 
                />
                <div class="qrcode-actions">
                  <button class="qrcode-action-btn" @click="saveQRCode" :title="t('product.saveQr')">
                    <el-icon><Download /></el-icon>
                  </button>
                  <button class="qrcode-action-btn" @click="shareQRCode" :title="t('product.shareQr')">
                    <el-icon><Share /></el-icon>
                  </button>
                </div>
              </div>
              <div class="qrcode-help">
                <span class="qrcode-help-text">{{ t('product.qrHelp') }}</span>
              </div>
            </div>
            <div class="install-or">or</div>
            <div class="button-section">
              <div class="button-title">{{ t('product.websiteConfirmTitle') }}</div>
              <button class="product-btn product-btn-download" @click="handleDownload">
                {{ t('product.websiteOption') }}
                <!-- <span class="icon-download-svg" v-html="DownloadSvg"></span> -->
              </button>
            </div>
          </div>
        </div>
        <!-- Supported Devices -->
        <div v-if="product?.devices && product.devices.length" class="devices-section">
          <div v-if="selectedSupportedDevice" class="current-device-support" role="status">
            <div class="current-device-icon" aria-hidden="true">
              <el-icon><Check /></el-icon>
            </div>
            <div class="current-device-copy">
              <div class="current-device-title">{{ t('product.deviceSupported') }}</div>
              <div class="current-device-name">{{ selectedSupportedDevice.displayName }}</div>
            </div>
          </div>
          <div v-else class="devices-header">
            <div class="devices-title">{{ t('product.supportedDevices') }}</div>
            <div class="devices-subtitle">
              {{ t('product.compatibleDevices', { count: product.devices.length }) }}
            </div>
          </div>
          <div v-if="!selectedSupportedDevice" class="devices-grid">
            <div
              v-for="d in displayedDevices"
              :key="d.id || d.deviceId || d.displayName"
              class="device-card"
              :title="d.displayName"
            >
              <div class="device-avatar">
                <img v-if="d.imageUrl" :src="d.imageUrl" :alt="d.displayName" />
                <div v-else class="device-fallback">W</div>
              </div>
              <div class="device-name">{{ d.displayName }}</div>
            </div>
          </div>
          <button
            v-if="!selectedSupportedDevice && product.devices.length > maxVisibleDevices"
            class="devices-toggle"
            @click="showAllDevices = !showAllDevices"
          >
            <span v-if="!showAllDevices">{{ t('product.showAllDevices', { count: product.devices.length }) }}</span>
            <span v-else>{{ t('product.showLess') }}</span>
          </button>
        </div>
        <div class="unlock-section">
          <div class="unlock-tip">{{ t('product.unlockTip') }}</div>
          <button class="product-btn product-btn-unlock" @click="handleUnlock">
            {{ t('product.unlockTrial') }} <el-icon class="btn-icon"><Lock /></el-icon>
          </button>
          <button class="product-btn product-btn-already-purchased" @click="handleAlreadyPurchased">
            {{ t('product.alreadyPurchased') }}
          </button>
        </div>
      </div>
    </div>
    <AdminCategoryEditorDialog
      v-if="isAdmin"
      v-model="categoryEditorVisible"
      :app-id="product?.appId ? Number(product.appId) : null"
      :selected-categories="adminMetrics?.categories || []"
      @saved="loadAdminMetrics"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  CreditCard,
  Download,
  Lock,
  MagicStick,
  Share,
  ShoppingCart,
} from '@element-plus/icons-vue'
import { useProductStore } from '@/store/product'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import type { GarminDeviceBaseVO, ProductStoreMetricsVO, ProductVO } from '@/types'
import QrcodeVue from 'qrcode.vue'
import { applySeo, productSeo } from '@/seo'
import { toGarminStoreBridge } from '@/utils/garminStore'
import { addLocaleToPath, getRouteLocaleParam, useLocaleStore } from '@/store/locale'
import { getProductImageUrl } from '@/utils/productImage'
import { fetchAdminStoreMetrics, updateProductStoreDisplay } from '@/api/product'
import { openStudioDesign, openStudioDesignCopy } from '@/utils/studio'
import { useCartCheckout } from '@/composables/useCartCheckout'
import { useI18n } from '@/i18n'
import { showAddedToCartMessage } from '@/utils/cartFeedback'
import { isCartEnabled } from '@/config/features'
import AdminCategoryEditorDialog from '@/components/AdminCategoryEditorDialog.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const localeStore = useLocaleStore()
const { loading: checkoutLoading, checkout } = useCartCheckout()
const { t } = useI18n()
const product = ref<ProductVO | null>(null)
const adminMetrics = ref<ProductStoreMetricsVO | null>(null)
const categoryEditorVisible = ref(false)
const localSelectedDevice = ref<GarminDeviceBaseVO | null>(null)
// const templateText = ref('your heart beat is {{hr}}, today walk {{steps}} steps.')

const productPreviewFallback = computed(() => {
  return getProductImageUrl(product.value)
})

const isInCart = computed(() => cartStore.hasItem(product.value?.appId))
const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some((role) => role.roleCode === 'ROLE_ADMIN')
})
const designerLabel = computed(() => {
  const designer = adminMetrics.value?.designer
  if (!designer) return '-'
  const name = designer.nickname || designer.username || 'Designer'
  return `${name} #${designer.id}`
})

const toggleCart = () => {
  if (!isCartEnabled) return
  if (!product.value?.appId) return
  if (cartStore.hasItem(product.value.appId)) {
    router.push(addLocaleToPath('/user/cart', localeStore.currentLocale))
    return
  }
  cartStore.toggle(product.value)
  showAddedToCartMessage(router, localeStore.currentLocale, {
    added: t('cart.added'),
    viewCart: t('cart.viewCart'),
  })
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const promptCheckoutEmail = async () => {
  const accountEmail = userStore.userInfo?.email
  if (accountEmail) return normalizeEmail(accountEmail)
  const result = await ElMessageBox.prompt(t('cart.emailNote'), t('cart.checkoutEmail'), {
    confirmButtonText: t('cart.continue'),
    cancelButtonText: t('subscriptionManagement.cancel'),
    inputType: 'email',
    inputPlaceholder: t('cart.emailPlaceholder'),
    inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    inputErrorMessage: t('cart.error.emailInvalid'),
  })
  return normalizeEmail(String(result.value || ''))
}

const handleBuyNow = async () => {
  if (!product.value?.appId) return
  try {
    const email = await promptCheckoutEmail()
    if (!email) return
    checkout([{ appId: product.value.appId, quantity: 1 }], email)
  } catch (error) {
    // User cancelled the prompt.
  }
}

const handleDownload = () => {
  if (product.value && product.value.garminStoreUrl) {
    // 保存当前页面状态到sessionStorage，防止页面刷新时丢失
    try {
      sessionStorage.setItem('productDetailState', JSON.stringify({
        productId: route.params.id,
        scrollPosition: window.scrollY,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save page state:', error)
    }
    
    router.push(toGarminStoreBridge({
      url: product.value.garminStoreUrl,
      name: product.value.name,
      imageUrl: productPreviewFallback.value,
      sourcePath: route.fullPath,
    }))
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

const handleCustomizeInStudio = () => {
  const designId = product.value?.designId?.trim()
  if (!designId) {
    ElMessage.error('Studio design is not available')
    return
  }

  openStudioDesignCopy(designId)
}

const handleOpenInStudio = () => {
  const designId = product.value?.designId?.trim()
  if (!designId) {
    ElMessage.error('Studio design is not available')
    return
  }

  openStudioDesign(designId)
}

const formatNumber = (value?: number | null) => {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatScore = (value?: number | null) => {
  if (value == null) return '-'
  return Number(value).toFixed(2)
}

const formatDate = (value?: string | null) => {
  if (!value) return '未上线'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未上线'
  return date.toLocaleString()
}

const loadAdminMetrics = async () => {
  if (!isAdmin.value || !product.value?.appId) return
  try {
    const list = await fetchAdminStoreMetrics([Number(product.value.appId)])
    adminMetrics.value = list?.[0] || null
  } catch (error) {
    adminMetrics.value = null
  }
}

const toggleAdminVisibility = async () => {
  if (!product.value?.appId || !adminMetrics.value) return
  const hidden = adminMetrics.value.storeVisibility === 'HIDDEN'
  let reason = adminMetrics.value.storeVisibilityReason || ''
  if (!hidden) {
    const result = await ElMessageBox.prompt('隐藏原因', '隐藏应用', {
      confirmButtonText: '隐藏',
      cancelButtonText: '取消',
      inputValue: reason,
    })
    reason = String(result.value || '').trim()
  }
  await updateProductStoreDisplay(Number(product.value.appId), {
    storeVisibility: hidden ? 'VISIBLE' : 'HIDDEN',
    weight: adminMetrics.value.storeWeight ?? 20,
    reason,
  })
  ElMessage.success(hidden ? '应用已恢复展示' : '应用已隐藏')
  await loadAdminMetrics()
}

const editAdminWeight = async () => {
  if (!product.value?.appId || !adminMetrics.value) return
  const result = await ElMessageBox.prompt('请输入 0-99 的整数，数值越大越靠前', '展示权重', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: String(adminMetrics.value.storeWeight ?? 20),
    inputPattern: /^(?:[0-9]|[1-9][0-9])$/,
    inputErrorMessage: '请输入 0-99 的整数',
  })
  await updateProductStoreDisplay(Number(product.value.appId), {
    storeVisibility: adminMetrics.value.storeVisibility || 'VISIBLE',
    weight: Number(result.value),
    reason: adminMetrics.value.storeVisibilityReason || '',
  })
  ElMessage.success('权重已更新')
  await loadAdminMetrics()
}

// QR Code functionality
const qrcodeRef = ref<any>(null)
const qrcodeBoxRef = ref<HTMLElement | null>(null)

// Devices show more/less
const maxVisibleDevices = 12
const showAllDevices = ref(false)
const displayedDevices = computed(() => {
  const list = product.value?.devices || []
  if (showAllDevices.value) return list
  return list.slice(0, maxVisibleDevices)
})

const currentDevice = computed(() => {
  return localSelectedDevice.value || userStore.userInfo?.device || null
})

const selectedSupportedDevice = computed(() => {
  const selected = currentDevice.value
  const devices = product.value?.devices || []
  if (!selected || !devices.length) return null

  const selectedId = selected.id ? String(selected.id) : ''
  const selectedDeviceId = selected.deviceId ? String(selected.deviceId) : ''

  const isSupported = devices.some((device) => {
    return (
      (selectedId && String(device.id) === selectedId) ||
      (selectedDeviceId && String(device.deviceId) === selectedDeviceId)
    )
  })

  return isSupported ? selected : null
})

const loadSelectedDeviceFromStorage = () => {
  try {
    const stored = localStorage.getItem('selectedDevice')
    localSelectedDevice.value = stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load selected device:', error)
    localSelectedDevice.value = null
  }
}

const renderedProductDescription = computed(() => {
  return renderProductDescription(product.value?.description || '')
})

const getNotFoundPath = () => {
  const routeLang = Array.isArray(route.params.lang) ? route.params.lang[0] : route.params.lang
  const locale = getRouteLocaleParam(routeLang)
  return locale ? `/${locale}/404` : '/404'
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderInlineMarkdown = (value: string) => {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )
}

const isChipSectionTitle = (value: string) => {
  return /metrics|data types|date|time|goal|charts/i.test(value)
}

const renderProductDescription = (description: string) => {
  const lines = description
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  const html: string[] = []
  let paragraph: string[] = []
  let list: string[] = []
  let chips: string[] = []
  let collectingChips = false

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (!list.length) return
    html.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`)
    list = []
  }

  const flushChips = () => {
    if (!chips.length) return
    html.push(
      `<div class="detail-chip-grid">${chips
        .map((item) => `<span>${renderInlineMarkdown(item)}</span>`)
        .join('')}</div>`
    )
    chips = []
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
    flushChips()
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      return
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushAll()
      const level = heading[1].length <= 1 ? 'h3' : 'h4'
      const title = heading[2].trim()
      collectingChips = isChipSectionTitle(title)
      html.push(`<${level}>${renderInlineMarkdown(title)}</${level}>`)
      return
    }

    const bullet = line.match(/^[-*+]\s+(.+)$/)
    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (bullet || numbered) {
      flushParagraph()
      flushChips()
      list.push((bullet?.[1] || numbered?.[1] || '').trim())
      return
    }

    if (collectingChips && line.length <= 64 && !/[.!?。！？]$/.test(line)) {
      flushParagraph()
      flushList()
      chips.push(line)
      return
    }

    flushList()
    flushChips()
    paragraph.push(line)
  })

  flushAll()

  return html.join('')
}

const saveQRCode = async () => {
  try {
    if (!product.value?.garminStoreUrl) return

    // Wait for DOM to ensure QR is rendered
    await nextTick()

    // Prefer querying inside container to avoid instance differences
    const container = qrcodeBoxRef.value
    let el: HTMLCanvasElement | SVGElement | (HTMLElement & { toBlob?: any; toDataURL?: any; }) | undefined | null = null

    const tryLocate = () => {
      return (container?.querySelector('canvas') as HTMLCanvasElement | null)
        || (container?.querySelector('svg') as SVGElement | null)
        || (qrcodeRef.value?.$el as HTMLElement | undefined)
    }

    el = tryLocate()
    // Retry up to 3 times with short delays
    for (let i = 0; !el && i < 3; i++) {
      await new Promise((r) => setTimeout(r, 50))
      el = tryLocate()
    }

    if (!el) {
      ElMessage.error(t('product.qrNotReady'))
      return
    }

    // If rendered as canvas (default)
    if (el instanceof HTMLCanvasElement) {
      // Prefer toBlob when available
      if (el.toBlob) {
        el.toBlob((blob) => {
          if (!blob) {
            ElMessage.error('Failed to generate image')
            return
          }
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${product.value?.name || 'garmin-app'}-qrcode.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          ElMessage.success(t('product.qrSaved'))
        }, 'image/png')
      } else {
        // Fallback for older browsers
        const dataUrl = el.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${product.value?.name || 'garmin-app'}-qrcode.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        ElMessage.success(t('product.qrSaved'))
      }
      return
    }

    // If rendered as SVG (in case render-as changes)
    if (el instanceof SVGElement) {
      const serializer = new XMLSerializer()
      const svgStr = serializer.serializeToString(el)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product.value?.name || 'garmin-app'}-qrcode.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      ElMessage.success(t('product.qrSaved'))
      return
    }

    // As a final fallback, try querying a canvas inside
    const canvas = el.querySelector?.('canvas') as HTMLCanvasElement | null
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${product.value?.name || 'garmin-app'}-qrcode.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      ElMessage.success(t('product.qrSaved'))
      return
    }

    ElMessage.error(t('product.qrAccessFailed'))
  } catch (error) {
    console.error('Error saving QR code:', error)
      ElMessage.error(t('product.qrSaveFailed'))
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
  loadSelectedDeviceFromStorage()

  let productId = route.params.id
  if (Array.isArray(productId)) productId = productId[0]
  if (!productId) {
    await router.replace(getNotFoundPath())
    return
  }

  const productDetail = await productStore.getProductDetail(productId)
  if (!productDetail?.appId) {
    await router.replace(getNotFoundPath())
    return
  }

  product.value = productDetail
  await loadAdminMetrics()
  applySeo(productSeo(product.value, route.path))

  // 恢复页面状态（如果用户从外部链接返回）
  try {
    const savedState = sessionStorage.getItem('productDetailState')
    if (savedState) {
      const state = JSON.parse(savedState)
      // 检查是否是同一个产品页面，且时间不超过30分钟
      if (state.productId === productId && (Date.now() - state.timestamp) < 30 * 60 * 1000) {
        // 恢复滚动位置
        setTimeout(() => {
          window.scrollTo(0, state.scrollPosition)
        }, 100)

        // 清除已使用的状态
        sessionStorage.removeItem('productDetailState')
      }
    }
  } catch (error) {
    console.warn('Failed to restore page state:', error)
  }
})
</script>

<style scoped>
.product-detail-page {
  width: 100vw;
  min-height: 100vh;
  background:
    linear-gradient(180deg, #fbfdfc 0%, #f4f7f6 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 64px 20px 96px;
}
.product-detail-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: var(--container);
  gap: 64px;
}
.product-image-wrap {
  position: relative;
  width: min(42vw, 460px);
  height: min(42vw, 460px);
  min-width: 320px;
  min-height: 320px;
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, #fff 0%, #eef5f3 100%);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-line);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
  display: block;
}
.product-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand);
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: 0;
}
.product-info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 12px;
  min-width: 340px;
}
.product-title {
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 12px;
  letter-spacing: 0;
  line-height: 1.08;
}
.product-price {
  font-size: 1.35rem;
  color: var(--color-brand);
  font-weight: 800;
  margin-bottom: 34px;
  margin-top: 0;
}
.admin-detail-panel {
  width: 340px;
  max-width: 100%;
  display: grid;
  gap: 12px;
  margin: 0 0 22px;
  padding: 14px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
  color: #334155;
}
.admin-detail-header,
.admin-detail-actions,
.admin-category-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.admin-detail-header {
  justify-content: space-between;
  font-weight: 750;
  color: var(--color-ink);
}
.admin-state {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.78rem;
}
.admin-state.visible {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
}
.admin-state.hidden {
  color: #b42318;
  background: rgba(180, 35, 24, 0.1);
}
.admin-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.admin-detail-grid div {
  display: grid;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 8px;
  background: #f8fafc;
  text-align: center;
}
.admin-detail-grid strong {
  color: var(--color-ink);
  font-size: 0.95rem;
}
.admin-detail-grid span,
.admin-detail-lines {
  font-size: 0.76rem;
  color: #64748b;
}
.admin-detail-lines {
  display: grid;
  gap: 4px;
}
.admin-category-list span {
  padding: 3px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.76rem;
}
.admin-detail-actions button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
.admin-detail-actions button:hover {
  border-color: rgba(15, 107, 104, 0.34);
  color: var(--color-brand-strong);
}
.product-btn {
  width: 300px;
  max-width: 100%;
  min-height: 56px;
  border-radius: 999px;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
  cursor: pointer;
  outline: none;
  border: none;
}

.btn-icon {
  margin-left: 10px;
  font-size: 1.15em;
}
.product-btn-download {
  background: var(--color-brand);
  color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
}
.product-btn-download:hover {
  background: var(--color-brand-strong);
}
.product-btn-buy {
  width: 340px;
  height: 56px;
  margin-bottom: 14px;
  color: #fff;
  background: var(--color-brand);
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.22);
}
.product-btn-buy:hover:not(:disabled) {
  background: var(--color-brand-strong);
  transform: translateY(-1px);
}
.product-btn-buy:disabled {
  cursor: wait;
  opacity: 0.72;
}
.product-btn-cart {
  width: 340px;
  height: 56px;
  margin-bottom: 26px;
  color: var(--color-brand);
  background: #fff;
  border: 1px solid rgba(15, 107, 104, 0.24);
  box-shadow: var(--shadow-sm);
}
.product-btn-cart:hover,
.product-btn-cart.active {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.34);
}
.product-btn-studio {
  width: 340px;
  height: 56px;
  margin-bottom: 26px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  border: 1px solid rgba(15, 107, 104, 0.22);
  box-shadow: 0 14px 30px rgba(15, 107, 104, 0.18);
}
.product-btn-studio:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(15, 107, 104, 0.22);
}
.product-btn-unlock {
  background: var(--color-brand);
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 1.22rem;
  box-shadow: 0 14px 30px rgba(15, 107, 104, 0.18);
  height: 64px;
  width: 340px;
  max-width: 100%;
  margin-bottom: 0;
  margin-top: 0;
  border-radius: 999px;
  transition: box-shadow 0.2s, background 0.2s;
}
.product-btn-unlock:hover {
  background: var(--color-brand-strong);
  box-shadow: 0 18px 38px rgba(15, 107, 104, 0.22);
}

.product-btn-already-purchased {
  background: #fff;
  color: var(--color-ink);
  border: 1px solid var(--color-line);
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
  background: var(--color-surface-soft);
  border-color: rgba(15, 107, 104, 0.2);
  box-shadow: 0 4px 18px 0 rgba(0,0,0,0.08);
}
.product-section-title {
  font-size: 1.18rem;
  font-weight: 800;
  margin: 0 0 18px 0;
  color: var(--color-ink);
  letter-spacing: 0;
}
.product-summary {
  width: 100%;
  max-width: 560px;
  margin: 6px 0 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.product-desc {
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.72;
  max-width: 100%;
}
.product-desc :deep(h3),
.product-desc :deep(h4) {
  color: var(--color-ink);
  line-height: 1.25;
  letter-spacing: 0;
}
.product-desc :deep(h3) {
  margin: 24px 0 12px;
  font-size: 1.12rem;
  font-weight: 800;
}
.product-desc :deep(h4) {
  margin: 20px 0 10px;
  font-size: 0.98rem;
  font-weight: 800;
}
.product-desc :deep(h3:first-child),
.product-desc :deep(h4:first-child),
.product-desc :deep(p:first-child) {
  margin-top: 0;
}
.product-desc :deep(p) {
  margin: 0 0 14px;
}
.product-desc :deep(strong) {
  color: var(--color-ink);
  font-weight: 800;
}
.product-desc :deep(a) {
  color: var(--color-brand);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
.product-desc :deep(a:hover) {
  color: var(--color-brand-strong);
}
.product-desc :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92em;
}
.product-desc :deep(ul) {
  display: grid;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}
.product-desc :deep(li) {
  position: relative;
  padding-left: 20px;
  color: var(--color-muted);
}
.product-desc :deep(li::before) {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.78em;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--color-accent);
  transform: translateY(-50%);
}
.product-desc :deep(.detail-chip-grid) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 18px;
}
.product-desc :deep(.detail-chip-grid span) {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-size: 0.9rem;
  font-weight: 700;
}
.install-section {
  margin: 0 0 32px 0;
  width: 100%;
  padding: 24px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
/* Devices */
.devices-section {
  width: 100%;
  margin: 12px 0 24px 0;
}
.current-device-support {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 560px;
  padding: 16px 18px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, #ffffff 0%, var(--color-brand-soft) 100%);
  box-shadow: var(--shadow-sm);
}
.current-device-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--color-brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  font-size: 1.25rem;
}
.current-device-copy {
  min-width: 0;
}
.current-device-title {
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}
.current-device-name {
  margin-top: 4px;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.devices-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}
.devices-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: 0.3px;
}
.devices-subtitle {
  font-size: 0.95rem;
  color: var(--color-muted);
}
.devices-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.device-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  min-width: 0;
}
.device-avatar {
  width: 48px;
  height: 48px;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px; /* prevent squeezing */
}
.device-avatar img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain; /* do not squeeze/crop image */
  padding: 6px;
  display: block;
  background: #fff;
}
.device-fallback {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-brand);
  line-height: 1;
}
.device-name {
  font-size: 0.98rem;
  color: var(--color-ink);
  line-height: 1.2;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  flex: 1 1 auto;
}
.devices-toggle {
  margin-top: 10px;
  background: #fff;
  border: 1px solid var(--color-line);
  color: var(--color-brand);
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.devices-toggle:hover {
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.2);
}
.install-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-ink);
  margin-bottom: 6px;
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.2;
}
.install-subtitle {
  font-size: 1.08rem;
  color: var(--color-muted);
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
  color: var(--color-subtle);
  font-weight: 500;
  width: 48px;
  min-width: 48px;
  height: 100%;
  margin: 0;
  align-self: center;
}
.qrcode-title {
  font-size: 1.02rem;
  color: var(--color-muted);
  margin-bottom: 10px;
  letter-spacing: 0.2px;
}
.qrcode-container {
  position: relative;
  display: inline-block;
}

.qrcode-img {
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-line);
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
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.25);
  transform: scale(1.1);
}

.qrcode-help {
  margin-top: 8px;
  text-align: center;
}

.qrcode-help-text {
  font-size: 0.85rem;
  color: var(--color-muted);
  background: var(--color-brand-soft);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(15, 107, 104, 0.1);
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
  color: var(--color-muted);
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
  color: var(--color-brand);
  border: 1px solid var(--color-line);
  font-weight: 500;
  font-size: 1.08rem;
  box-shadow: none;
  border-radius: 16px;
  transition: none;
}
.button-section .product-btn-download:hover {
  background: #fff;
  color: var(--color-brand-strong);
  border: 1px solid rgba(15, 107, 104, 0.2);
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
  color: var(--color-muted);
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
    min-width: 280px;
    min-height: 280px;
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
  .devices-header {
    align-items: center;
  }
  .current-device-support {
    max-width: 100%;
  }
  .devices-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .devices-grid {
    grid-template-columns: 1fr;
  }
  .current-device-support {
    align-items: flex-start;
    padding: 14px;
  }
  .current-device-icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
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
