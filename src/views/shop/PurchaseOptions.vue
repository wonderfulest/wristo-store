<template>
  <div class="purchase-options">
    <!-- <Logo /> -->
    <h2 class="title">{{ t('purchase.title') }}</h2>
    <p class="desc">{{ t('purchase.desc') }}</p>

    <div
      v-if="activeDiscountCode"
      class="discount-banner"
    >
      <span class="badge-label">{{ t('purchase.coupon') }}</span>
      <span class="code-text">{{ activeDiscountCode }}</span>
      <span class="banner-text">{{ t('purchase.couponApplied') }}</span>
    </div>
    
    <div id="bundle-subscription-card" class="cards-container">
      <!-- 套餐卡片 -->
      <PurchaseCard
        v-for="(bundleItem, index) in bundles"
        :key="bundleItem.bundleId"
        v-if="bundles.length > 0"
        :class="{ 'bundle-subscription-target': index === 0 }"
        type="bundle"
        :title="localizedBundleTitle(bundleItem)"
        :description="localizedBundleDescription(bundleItem)"
        :bundle-items="getBundleItems(bundleItem)"
        :price-id="getPriceIdForBundle(bundleItem)"
        :original-price="getBundleOriginalPrice(bundleItem)"
        :current-price="getBundleCurrentPrice(bundleItem)"
        :discount="getBundleDiscount(bundleItem)"
        :is-selected="isBundleSelected(bundleItem)"
        :currency-code="getCurrencyCodeForBundle(bundleItem)"
        :animate-discount="shouldAnimateDiscount(getPriceIdForBundle(bundleItem))"
        :button-text="buyBundleText(bundleItem)"
        :has-more-bundle-items="hasMoreBundleItems(bundleItem)"
        :bundle-items-loading="loadingBundleProductIds.has(bundleItem.bundleId)"
        @select="() => selectBundle(bundleItem)"
        @buy="() => handleBuyBundle(bundleItem)"
        @load-more-bundle-items="() => loadMoreBundleItems(bundleItem)"
        :app-count="bundleItem.appCount"
        :app-total-price="bundleItem.appTotalPrice"
      />
    
      <!-- 单品卡片 -->
      <PurchaseCard
        v-if="product"
        type="product"
        :title="product.name"
        :description="product.description"
        :image-url="getProductImageUrl(product)"
        :price-id="getPriceIdForProduct(product)"
        :original-price="productOriginalPrice"
        :current-price="productCurrentPrice"
        :discount="productDiscount"
        :is-selected="isProductSelected"
        :currency-code="productCurrencyCode"
        :animate-discount="shouldAnimateDiscount(getPriceIdForProduct(product))"
        :creator-name="productCreatorName"
        :button-text="buyProductText"
        @select="selectProduct"
        @buy="handleBuyProduct"
      />
    
      <!-- 订阅盒子 -->
      <!-- <div class="box-container subscription-box">
        <div class="box-header">
          <h3 class="box-title">Subscription Plans</h3>
          <p class="lifetime-benefits">🔓 <strong>Subscribe to unlock ALL products & Permanently unlock the Single: {{ product.name }}!</strong></p>
        </div>
        <SubscriptionPlans
          :show-title="false"
          @plan-selected="selectSubscriptionPlan"
          @subscribe="handleBuySubscription"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useShopOptionsStore } from '@/store/shopOptions'
import PurchaseCard from '@/components/PurchaseCard.vue'
import type { PurchaseData, ProductVO, Bundle } from '@/types'
import type { SubscriptionPlan } from '@/api/subscription'
import { checkDiscount, getBundleProductsForPurchase, getBundlesForPurchase } from '@/api/purchase'
import { useI18n } from '@/i18n'
import { getProductImageUrl } from '@/utils/productImage'
import { getProductDetail } from '@/api/product'

const router = useRouter()
const route = useRoute()
const store = useShopOptionsStore()
const { t } = useI18n()

// 订阅计划相关
const selectedPlan = ref<SubscriptionPlan | null>(null)

// 直接使用 PurchaseData 类型
const purchaseData = computed<PurchaseData | null>(() => store.data as PurchaseData || null)
const isCodePurchaseEntry = computed(() => {
  const source = route.query?.source
  return (Array.isArray(source) ? source[0] : source) === 'code'
})

const bundlesFromApi = ref<Bundle[]>([])
const productDetail = ref<ProductVO | null>(null)
const loadingBundleProductIds = ref<Set<number>>(new Set())

const normalizedBundleType = (bundleItem?: Bundle | null) => {
  return String(bundleItem?.bundleType || '').trim().toLowerCase()
}

const isWristoPremiumBundle = (bundleItem: Bundle) => {
  const name = String(bundleItem.bundleName || '').toLowerCase()
  const type = normalizedBundleType(bundleItem)
  return name.includes('wristo premium') || type === 'global'
}

const isGlobalPremiumBundle = (bundleItem: Bundle) => {
  const type = normalizedBundleType(bundleItem)
  return isWristoPremiumBundle(bundleItem) && (!type || type === 'global')
}

const product = computed<ProductVO | null>(() => {
  if (!isCodePurchaseEntry.value) return null

  const baseProduct = purchaseData.value?.product
  if (!baseProduct) return null

  if (productDetail.value && String(productDetail.value.appId) === String(baseProduct.appId)) {
    return {
      ...baseProduct,
      ...productDetail.value,
    } as ProductVO
  }

  return baseProduct as ProductVO
})
const bundles = computed(() => {
  const bundlesList = (isCodePurchaseEntry.value && purchaseData.value?.bundles && purchaseData.value.bundles.length > 0)
    ? purchaseData.value.bundles
    : bundlesFromApi.value
  const visibleBundles = bundlesList.filter(isGlobalPremiumBundle)
  // 按实际金额从大到小排序
  return [...visibleBundles].sort((a, b) => {
    const priceA = parseFloat(String(a.price))
    const priceB = parseFloat(String(b.price))
    return priceB - priceA
  })
})

const discountCodeFromQuery = computed(() => {
  const raw = route.query?.discountCode
  const code = Array.isArray(raw) ? raw[0] : raw
  return (code ? String(code) : '').trim()
})

const activeDiscountCode = computed(() => {
  // 优先使用 store 中的 discountCode，退回到 query
  return (store.discountCode || discountCodeFromQuery.value || '').trim()
})

const priceIdFromQuery = computed(() => {
  const raw = route.query?.priceId
  const id = Array.isArray(raw) ? raw[0] : raw
  return (id ? String(id) : '').trim()
})

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

const getPriceIdForProduct = (p?: ProductVO | null) => {
  return p?.payment?.paddlePriceId || ''
}

const getPriceIdForBundle = (b?: Bundle | null) => {
  return (b as any)?.paddlePriceId || ''
}

const getDiscountInfoByPriceId = (priceId: string) => {
  if (!priceId) return null
  return store.discountsByPriceId?.[priceId] || null
}

const animatedPriceIds = ref<Set<string>>(new Set())

const shouldAnimateDiscount = (priceId: string) => {
  if (!priceId) return false
  return animatedPriceIds.value.has(priceId)
}

const productCurrencyCode = computed(() => {
  const priceId = getPriceIdForProduct(product.value)
  const discountInfo = getDiscountInfoByPriceId(priceId)
  return (discountInfo?.valid && discountInfo.currency) ? String(discountInfo.currency) : 'USD'
})

const getCreatorNameFromProduct = (p?: ProductVO | null) => {
  const productLike = p as any
  const creator = productLike?.user || productLike?.creator || productLike?.merchant || productLike?.author
  return (
    creator?.nickname ||
    creator?.username ||
    creator?.name ||
    productLike?.creatorName ||
    productLike?.merchantName ||
    productLike?.authorName ||
    ''
  )
}

const productCreatorName = computed(() => getCreatorNameFromProduct(product.value))

const loadProductDetailForCreator = async () => {
  const currentData = purchaseData.value
  const appId = currentData?.product?.appId
  if (!currentData || !appId || getCreatorNameFromProduct(product.value)) return
  if (productDetail.value && String(productDetail.value.appId) === String(appId)) return

  try {
    const detail = await getProductDetail(String(appId))
    if (!detail) return
    productDetail.value = detail
    store.setData({
      ...currentData,
      product: {
        ...currentData.product,
        ...detail,
      },
    })
    if (
      store.selectedProduct &&
      !('bundleId' in store.selectedProduct) &&
      String(store.selectedProduct.appId) === String(appId)
    ) {
      store.setSelectedProduct({
        ...store.selectedProduct,
        ...detail,
      } as ProductVO)
    }
  } catch (error) {
    console.warn('Failed to load product detail for creator display:', error)
  }
}

const getCurrencyCodeForBundle = (bundleItem: Bundle) => {
  const priceId = getPriceIdForBundle(bundleItem)
  const discountInfo = getDiscountInfoByPriceId(priceId)
  return (discountInfo?.valid && discountInfo.currency) ? String(discountInfo.currency) : 'USD'
}

const formatPrice = (amount: number, currencyCode?: string) => {
  const symbol = getCurrencySymbol(currencyCode)
  const safe = Number.isFinite(Number(amount)) ? Number(amount) : 0
  return `${symbol}${safe.toFixed(2)}`
}

const localizedBundleTitle = (bundleItem: Bundle) => {
  return isWristoPremiumBundle(bundleItem) ? t('purchase.premiumBundleName') : bundleItem.bundleName
}

const localizedBundleDescription = (bundleItem: Bundle) => {
  return isWristoPremiumBundle(bundleItem) ? t('purchase.premiumBundleDesc') : bundleItem.bundleDesc
}

const buyBundleText = (bundleItem: Bundle) => {
  return `${t('purchase.buyBundleFor')} ${formatPrice(getBundleCurrentPrice(bundleItem), getCurrencyCodeForBundle(bundleItem))}`
}

const buyProductText = computed(() => {
  return `${t('purchase.buyFor')} ${formatPrice(productCurrentPrice.value, productCurrencyCode.value)}`
})

const normalizePercentageValue = (value?: number) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (n <= 0) return null
  if (n > 100) return null
  return n
}

const normalizeFlatAmount = (value?: number, basePrice?: number) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (n <= 0) return null

  const base = Number(basePrice)
  if (Number.isFinite(base) && base > 0 && n > base * 1.5) {
    return n / 100
  }
  return n
}

const computeDiscountedPrice = (basePrice: number, discount?: { type?: string; value?: number }) => {
  const base = Number.isFinite(Number(basePrice)) ? Number(basePrice) : 0
  const type = String(discount?.type || '').toLowerCase()

  if (!discount || !type) return { finalPrice: base, applied: false }

  if (type === 'percentage') {
    const pct = normalizePercentageValue(discount.value)
    if (!pct) return { finalPrice: base, applied: false }
    const final = Math.max(0, base * (1 - pct / 100))
    return { finalPrice: Number(final.toFixed(2)), applied: final < base }
  }

  if (type === 'flat') {
    const flat = normalizeFlatAmount(discount.value, base)
    if (!flat) return { finalPrice: base, applied: false }
    const final = Math.max(0, base - flat)
    return { finalPrice: Number(final.toFixed(2)), applied: final < base }
  }

  return { finalPrice: base, applied: false }
}

// 价格计算 - 产品
const productOriginalPrice = computed(() => {
  if (!product.value) return 0
  return parseFloat(String(product.value.price))
})

const productCurrentPrice = computed(() => {
  if (!product.value) return 0
  const base = parseFloat(String(product.value.price))
  const priceId = getPriceIdForProduct(product.value)
  const discountInfo = getDiscountInfoByPriceId(priceId)
  if (discountInfo?.valid) return Number(discountInfo.finalPrice)
  return base
})

const productDiscount = computed(() => {
  if (productOriginalPrice.value <= productCurrentPrice.value) return 0
  return Math.round(((productOriginalPrice.value - productCurrentPrice.value) / productOriginalPrice.value) * 100)
})

// 多个套餐的价格计算函数
const getBundleOriginalPrice = (bundleItem: Bundle) => {
  if (!bundleItem) return 0
  // 如果有折扣，返回 bundle 原价（折扣前）
  const priceId = getPriceIdForBundle(bundleItem)
  const discountInfo = getDiscountInfoByPriceId(priceId)
  if (discountInfo?.valid) return Number(discountInfo.originalPrice)
  // 如果有appTotalPrice，返回appTotalPrice
  if (bundleItem.appTotalPrice) return Number(bundleItem.appTotalPrice)
  // 如果没有折扣 和 appTotalPrice，返回bundle里所有产品的价格总和
  let bundlePrice = 0
  for (const product of bundleItem.products) {
    bundlePrice += parseFloat(String(product.price))
  }
  return bundlePrice
}

// 价格计算 - 套餐
const getBundleCurrentPrice = (bundleItem: Bundle) => {
  if (!bundleItem) return 0
  const base = parseFloat(String(bundleItem.price))
  const priceId = getPriceIdForBundle(bundleItem)
  const discountInfo = getDiscountInfoByPriceId(priceId)
  if (discountInfo?.valid) return Number(discountInfo.finalPrice)
  return base
}

// 价格计算 - 套餐折扣
const getBundleDiscount = (bundleItem: Bundle) => {
  const originalPrice = getBundleOriginalPrice(bundleItem)
  const currentPrice = getBundleCurrentPrice(bundleItem)
  if (originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

// 获取套餐项目数据
const getBundleItems = (bundleItem: Bundle) => {
  if (!bundleItem?.products) return []
  return bundleItem.products.map(p => ({
    id: String(p.appId),
    name: p.name,
    imageUrl: getProductImageUrl(p)
  }))
}

const hasMoreBundleItems = (bundleItem: Bundle) => {
  const loadedCount = bundleItem.products?.length || 0
  const totalCount = Math.min(Number(bundleItem.appCount || 0), 500)
  return loadedCount < totalCount
}

const loadMoreBundleItems = async (bundleItem: Bundle) => {
  const bundleId = Number(bundleItem.bundleId)
  if (!bundleId || !hasMoreBundleItems(bundleItem) || loadingBundleProductIds.value.has(bundleId)) return

  const loadingIds = new Set(loadingBundleProductIds.value)
  loadingIds.add(bundleId)
  loadingBundleProductIds.value = loadingIds

  try {
    const loadedCount = bundleItem.products?.length || 0
    const products = await getBundleProductsForPurchase(bundleId, {
      offset: loadedCount,
      limit: 50
    })
    const existingAppIds = new Set((bundleItem.products || []).map((p) => String(p.appId)))
    const newProducts = (products || []).filter((p) => !existingAppIds.has(String(p.appId)))
    bundleItem.products = [...(bundleItem.products || []), ...newProducts].slice(0, 500)
  } catch (error) {
    console.warn('Failed to load more bundle products:', error)
  } finally {
    const loadingIds = new Set(loadingBundleProductIds.value)
    loadingIds.delete(bundleId)
    loadingBundleProductIds.value = loadingIds
  }
}

// 判断产品是否被选中
const isProductSelected = computed(() => {
  // 确保产品存在且已被选中（而不是订阅被选中）
  if (!product.value || !store.selectedProduct || selectedPlan.value) return false;
  
  // 如果是ProductVO类型，比较designId
  if ('designId' in store.selectedProduct && 'designId' in product.value) {
    return store.selectedProduct.designId === product.value.designId;
  }
  
  return false;
});

// 判断特定套餐是否被选中
const isBundleSelected = (bundleItem: Bundle) => {
  // 确保套餐存在且已被选中（而不是订阅被选中）
  if (!bundleItem || !store.selectedProduct || selectedPlan.value) return false;
  
  // 如果是Bundle类型，比较bundleId
  if ('bundleId' in store.selectedProduct && 'bundleId' in bundleItem) {
    return store.selectedProduct.bundleId === bundleItem.bundleId;
  }
  
  return false;
};

// 选择单个产品
const selectProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO);
    selectedPlan.value = null;
  }
};

// 选择套餐
const selectBundle = (bundleItem?: Bundle) => {
  console.log('bundleItem', bundleItem)
  const targetBundle = bundleItem
  if (targetBundle) {
    store.setSelectedProduct(targetBundle)
    selectedPlan.value = null // 清除订阅选择
  }
};

// 处理购买单个产品
const handleBuyProduct = () => {
  if (product.value) {
    store.setSelectedProduct(product.value as ProductVO)
    router.push({ name: 'Checkout' })
  }
}

// 处理购买套餐
const handleBuyBundle = (bundleItem?: Bundle) => {
  const targetBundle = bundleItem
  if (targetBundle) {
    store.setSelectedProduct(targetBundle)
    router.push({ name: 'Checkout' })
  }
}

// // 处理订阅计划购买
// const handleBuySubscription = (plan: SubscriptionPlan) => {
//   if (plan) {
//     console.log('selectedPlan.value', plan)
//     selectedPlan.value = plan
//     setTimeout(() => {
//       // 设置选中的订阅计划
//       store.setSelectedSubscription(plan);
//       router.push({ name: 'CheckoutSubscription' });
//     }, 200);
//   }
// };

// // 处理订阅计划选择
// const selectSubscriptionPlan = (plan: SubscriptionPlan) => {
//   selectedPlan.value = plan;
// };

const runDiscountChecks = () => {
  if (!discountCodeFromQuery.value) return

  store.setDiscountCode(discountCodeFromQuery.value)

  const requests: Array<{ priceId: string; discountCode: string; basePrice: number }> = []
  const productPriceId = getPriceIdForProduct(product.value)
  const shouldCheckByQueryPriceId = !!priceIdFromQuery.value
  const productMatchesQuery = !shouldCheckByQueryPriceId || priceIdFromQuery.value === productPriceId
  if (productPriceId && productMatchesQuery) {
    requests.push({ priceId: productPriceId, discountCode: discountCodeFromQuery.value, basePrice: parseFloat(String(product.value?.price || 0)) })
  }
  for (const b of bundles.value) {
    const pid = getPriceIdForBundle(b)
    const bundleMatchesQuery = !shouldCheckByQueryPriceId || priceIdFromQuery.value === pid
    if (pid && bundleMatchesQuery) {
      requests.push({ priceId: pid, discountCode: discountCodeFromQuery.value, basePrice: parseFloat(String((b as any)?.price || 0)) })
    }
  }

  if (!requests.length) return

  Promise.all(
    requests.map(async (req) => {
      try {
        const res = await checkDiscount({ priceId: req.priceId, discountCode: req.discountCode })

        const base = Number.isFinite(Number(req.basePrice)) ? Number(req.basePrice) : 0
        const computed = computeDiscountedPrice(base, res.discount)
        const isValid = !!res.valid && !!computed.applied

        store.setDiscountForPriceId(req.priceId, {
          valid: isValid,
          originalPrice: base,
          finalPrice: computed.finalPrice,
          currency: 'USD',
          discount: res.discount,
          discountCode: req.discountCode
        })

        if (isValid) {
          animatedPriceIds.value.add(req.priceId)
          window.setTimeout(() => {
            animatedPriceIds.value.delete(req.priceId)
          }, 1000)
        }
      } catch {
        store.setDiscountForPriceId(req.priceId, {
          valid: false,
          originalPrice: 0,
          finalPrice: 0,
          currency: 'USD',
          discountCode: req.discountCode
        })
      }
    })
  )
}

const scrollToBundleSubscriptionCard = async () => {
  if (route.hash !== '#bundle-subscription-card') return

  await nextTick()
  window.setTimeout(() => {
    document.getElementById('bundle-subscription-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 80)
}

const loadBundlesForCurrentEntry = () => {
  if (isCodePurchaseEntry.value && purchaseData.value) return

  getBundlesForPurchase()
    .then((list) => {
      bundlesFromApi.value = list || []
      runDiscountChecks()
    })
    .catch(() => {
      bundlesFromApi.value = []
    })
}

const syncEntryContext = () => {
  const shouldResetByPremiumPath = route.path === '/premium' || route.name === 'Premium'
  const shouldResetProductContext = shouldResetByPremiumPath || !isCodePurchaseEntry.value
  if (shouldResetProductContext) {
    store.reset()
  }

  loadBundlesForCurrentEntry()
  runDiscountChecks()
  loadProductDetailForCreator()
  scrollToBundleSubscriptionCard()
}

onMounted(() => {
  syncEntryContext()
})

watch(
  () => purchaseData.value?.product?.appId,
  () => {
    loadProductDetailForCreator()
  }
)

watch(
  () => [route.hash, bundles.value.length],
  () => {
    scrollToBundleSubscriptionCard()
  }
)

watch(
  () => [route.name, route.query.source],
  () => {
    syncEntryContext()
  }
)
</script>

<style scoped>
.purchase-options {
  max-width: 1400px;
  margin: 0px auto 40px;
  padding: 40px 16px 56px;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
  color: #171717;
}

.title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1.12;
  margin: 0 0 0.7rem;
  color: #171717;
  font-weight: 800;
}

.desc {
  max-width: 680px;
  color: #57534e;
  margin: 0 auto 1.25rem;
  font-size: 1.05rem;
  line-height: 1.6;
}

.discount-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #047857;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.badge-label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.8rem;
}

.code-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-weight: 600;
}

.banner-text {
  opacity: 0.9;
}

.cards-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 22px;
  justify-content: center;
  align-items: stretch;
  min-height: fit-content;
  scroll-margin-top: 32px;
}

/* 统一卡片宽度 */
.cards-container > * {
  flex: 1 1 380px;
  width: min(100%, 420px);
  max-width: 480px;
}

#bundle-subscription-card:target .bundle-subscription-target {
  animation: bundle-target-pulse 1200ms ease-out 1;
}

@keyframes bundle-target-pulse {
  0% {
    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.18),
      0 0 0 0 rgba(245, 158, 11, 0.44);
  }
  60% {
    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.18),
      0 0 0 12px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow:
      0 18px 44px rgba(15, 23, 42, 0.12),
      0 0 0 0 rgba(245, 158, 11, 0);
  }
}

.box-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-box {
  padding: 0 30px 0 30px;
}

.bundle-box {
  padding: 0 30px 0 30px;
}

.subscription-box {
  padding: 0 30px 0 30px;
}

.box-header {
  text-align: center;
  margin-bottom: 24px;
}

.box-title {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #1d1d1f;
  font-weight: 600;
}

.lifetime-benefits {
  font-size: 0.9rem;
  color: #86868b;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

.lifetime-benefits strong {
  color: #007aff;
  font-weight: 600;
  background: linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.product-box {
  flex: 0 0 calc(25% - 1px);
  position: relative;
}

.bundle-box {
  flex: 0 0 calc(25% - 1px);
  position: relative;
}

.subscription-box {
  flex: 0 0 calc(75% - 1px);
  position: relative;
}

/* 分割线 */
/* .product-box::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background-color: #e5e5e5;
  margin-right: -0.5px;
} */

.subscription-cards-container {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
}

/* 卡片容器样式保留用于布局 */

/* 统一按钮样式 */

/* 响应式设计 */
@media (max-width: 1024px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
  }
  
  .cards-container > * {
    flex: none;
    width: 100%;
    max-width: 500px;
    margin-bottom: 24px;
  }
  
  .product-box, .bundle-box, .subscription-box {
    flex: 1 1 100%;
    width: 100%;
    max-width: 500px;
    margin-bottom: 30px;
  }
  
  .product-box::after {
    display: none;
  }
  
  .subscription-cards-container {
    flex-wrap: wrap;
  }
  
  .subscription-card {
    flex: 1 1 calc(50% - 16px);
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .purchase-options {
    padding: 28px 16px 80px 16px;
  }
  
  .cards-container {
    padding: 0;
  }
  
  .cards-container > * {
    width: 100%;
    max-width: 450px;
  }
  
  .box-container {
    padding: 0 15px;
  }
  
  .option-card, .subscription-card {
    padding: 24px 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .subscription-cards-container {
    flex-direction: column;
  }
  
  .subscription-card {
    margin-bottom: 16px;
  }
  
  .product-image img {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .purchase-options {
    padding: 16px 12px 100px 12px;
  }
  
  .cards-container {
    padding: 0;
  }
  
  .cards-container > * {
    width: 100%;
    max-width: 380px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .desc {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .box-title {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  .box-container {
    padding: 0 10px;
  }
  
  .card-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 360px) {
  .purchase-options {
    padding: 16px 8px 100px 8px;
  }
  
  .cards-container {
    padding: 0;
  }
  
  .cards-container > * {
    width: 100%;
    max-width: 320px;
  }
  
  .title {
    font-size: 1.4rem;
  }
  
  .desc {
    font-size: 0.95rem;
  }
}
/* 选项卡样式 */
.purchase-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  gap: 8px;
}

.tab-button {
  padding: 10px 24px;
  border: none;
  background-color: #f5f5f7;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #e8e8ed;
}

.tab-button.active {
  background-color: #0071e3;
  color: white;
}

/* 订阅容器样式 */
.subscription-container {
  width: 100%;
  margin-top: 20px;
}

.loading-container,
.error-container,
.no-plans-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 113, 227, 0.2);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #ff3b30;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
}

/* 订阅计划网格 */
.subscription-plans-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

/* 订阅卡片样式 */
.subscription-card {
  padding: 32px 24px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border: 2px solid transparent;
  width: 100%;
}

.subscription-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 订阅卡片选中状态 - 根据不同类型使用不同边框颜色 */
.subscription-card.active.plan-monthly {
  border-color: #5856d6;
}

.subscription-card.active.plan-yearly {
  border-color: #007aff;
}

.subscription-card.active.plan-lifetime {
  border-color: #34c759;
}

/* 计划类型特定样式 */
.plan-monthly {
  background: linear-gradient(to bottom right, #ffffff, #f9f9ff);
}

.plan-yearly {
  background: linear-gradient(to bottom right, #ffffff, #f0f7ff);
}

.plan-lifetime {
  background: linear-gradient(to bottom right, #ffffff, #f0fff7);
}

/* 推荐标签 */
.recommended-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #34c759;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-bottom-right-radius: 12px;
}

/* 价格信息 */
.price {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.original-price {
  font-size: 16px;
  color: #86868b;
  text-decoration: line-through;
  margin-left: 8px;
}

.price-period {
  font-size: 14px;
  color: #86868b;
}

/* 计划权益 */
.plan-benefits {
  margin: 24px 0;
  flex-grow: 1;
}

.plan-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.plan-benefits li {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.check-icon {
  color: #34c759;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

/* 订阅按钮 */
.subscription-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  margin-top: 24px;
}

/* 按钮颜色区分 */
.button-monthly {
  background-color: #5856d6;
}

.button-monthly:hover {
  background-color: #4a49b7;
  transform: translateY(-2px);
}

.button-yearly {
  background-color: #007aff;
}

.button-yearly:hover {
  background-color: #0066d6;
  transform: translateY(-2px);
}

.button-lifetime {
  background-color: #34c759;
}

.button-lifetime:hover {
  background-color: #28a745;
  transform: translateY(-2px);
}

.subscription-btn:active {
  transform: translateY(0);
}

/* 订阅提示样式 */
.subscription-prompt {
  margin-top: 24px;
  padding: 20px;
  background: rgba(0, 113, 227, 0.08);
  border-radius: 16px;
  text-align: center;
}

.subscription-prompt p {
  font-size: 16px;
  color: #1d1d1f;
  margin-bottom: 12px;
  font-weight: 500;
}

.subscription-prompt-btn {
  background-color: #0071e3;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscription-prompt-btn:hover {
  background-color: #0077ed;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .cards-container {
    max-width: 1100px;
  }
  
  .subscription-card {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .cards-container {
    max-width: 900px;
  }
  
  .product-box {
    flex: 0 0 calc(30% - 18px);
  }
  
  .subscription-box {
    flex: 0 0 calc(70% - 18px);
  }
  
  .subscription-cards-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .subscription-card {
    width: calc(50% - 8px);
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .product-box,
  .subscription-box {
    flex: 0 0 100%;
    width: 100%;
    max-width: 500px;
  }
  
  .subscription-cards-container {
    flex-direction: column;
  }
  
  .subscription-card,
  .option-card {
    width: 100%;
  }
  
  .purchase-options {
    padding: 24px 12px 60px;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .desc {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
}
</style> 
