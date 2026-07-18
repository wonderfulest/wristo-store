<template>
  <article v-if="!hasPremiumAccess" class="premium-suite-card" :aria-label="t('cart.premiumAria')">
    <div class="premium-price-badge">
      <span>{{ t('cart.premiumPriceLabel') }}</span>
      <strong>{{ premiumPriceText }}</strong>
    </div>

    <div class="premium-copy">
      <span class="premium-kicker">{{ t('cart.premiumKicker') }}</span>
      <h2>{{ t('cart.premiumTitle') }}</h2>
      <p>{{ t('cart.premiumDesc') }}</p>
      <div class="premium-benefits" :aria-label="t('cart.premiumBenefitsAria')">
        <span v-for="benefit in premiumBenefits" :key="benefit">
          <el-icon><Check /></el-icon>
          {{ benefit }}
        </span>
      </div>
    </div>

    <div class="premium-visual" aria-hidden="true">
      <span class="premium-orbit orbit-large"></span>
      <span class="premium-orbit orbit-small"></span>
      <span class="premium-watch watch-main">
        <Icon icon="material-symbols:workspace-premium-outline" width="34" height="34" />
        <strong>W</strong>
      </span>
      <span class="premium-watch watch-side watch-left">
        <Icon icon="material-symbols:watch-outline" width="26" height="26" />
      </span>
      <span class="premium-watch watch-side watch-right">
        <Icon icon="material-symbols:avg-time-outline" width="26" height="26" />
      </span>
    </div>

    <button type="button" class="premium-btn" @click="goPremium">
      <span>{{ t('cart.premiumCta') }}</span>
      <el-icon><ArrowRight /></el-icon>
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Check } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { getBundlesForPurchase } from '@/api/purchase'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { useI18n } from '@/i18n'
import { hasPremiumEntitlement } from '@/utils/entitlements'
import type { Bundle } from '@/types'

const router = useRouter()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { t } = useI18n()
const premiumBundle = ref<Bundle | null>(null)
const hasPremiumAccess = computed(() => hasPremiumEntitlement(userStore.userInfo))

const premiumBenefits = computed(() => [
  t('cart.premiumBenefitFaces'),
  t('cart.premiumBenefitUpdates'),
  t('cart.premiumBenefitValue'),
])

const formatPrice = (amount: number) => {
  const safe = Number.isFinite(Number(amount)) ? Number(amount) : 0
  return `$${safe.toFixed(2)}`
}

const premiumPriceText = computed(() => {
  if (!premiumBundle.value) return t('cart.premiumPriceFallback')
  return formatPrice(Number(premiumBundle.value.price))
})

const isGlobalPremiumBundle = (bundle: Bundle) => {
  const name = String(bundle.bundleName || '').toLowerCase()
  const type = String(bundle.bundleType || '').trim().toLowerCase()
  return name.includes('wristo premium') && (!type || type === 'global')
}

const goPremium = () => {
  router.push(addLocaleToPath('/premium', localeStore.currentLocale))
}

onMounted(async () => {
  if (hasPremiumAccess.value) return

  try {
    const bundles = await getBundlesForPurchase()
    premiumBundle.value = bundles.find(isGlobalPremiumBundle) || null
  } catch (error) {
    console.warn('Failed to load premium bundle price:', error)
  }
})
</script>

<style scoped>
.premium-suite-card {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) 210px minmax(150px, 0.46fr);
  align-items: center;
  gap: 22px;
  overflow: hidden;
  padding: 28px;
  border: 1px solid rgba(34, 197, 160, 0.22);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 76% 18%, rgba(45, 212, 191, 0.32), transparent 31%),
    linear-gradient(135deg, #071513 0%, #0f2c28 46%, #173f3a 100%);
  box-shadow: 0 22px 50px rgba(8, 37, 33, 0.24);
  color: #ecfffb;
}

.premium-suite-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: calc(var(--radius-lg) - 1px);
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 38%, rgba(255, 255, 255, 0.08));
  pointer-events: none;
}

.premium-price-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  min-width: 112px;
  width: max-content;
  padding: 10px 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(220, 252, 247, 0.94));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(255, 255, 255, 0.08);
  text-align: right;
  backdrop-filter: blur(14px);
}

.premium-price-badge span {
  display: block;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.premium-price-badge strong {
  display: block;
  margin-top: 2px;
  color: #052e2b;
  font-size: 1.84rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.premium-copy {
  min-width: 0;
  padding-right: 8px;
}

.premium-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(167, 243, 208, 0.32);
  border-radius: 999px;
  background: rgba(240, 253, 250, 0.1);
  color: #a7f3d0;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.premium-copy h2 {
  margin: 12px 0 8px;
  color: #ffffff;
  font-size: clamp(1.45rem, 3vw, 2.15rem);
  line-height: 1.08;
  letter-spacing: 0;
}

.premium-copy p {
  max-width: 520px;
  margin: 0;
  color: rgba(236, 255, 251, 0.78);
  font-size: 0.96rem;
  line-height: 1.55;
}

.premium-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.premium-benefits span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.84rem;
  font-weight: 800;
}

.premium-benefits .el-icon {
  color: #5eead4;
}

.premium-visual {
  position: relative;
  min-height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-orbit,
.premium-watch {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.premium-orbit {
  border: 1px solid rgba(167, 243, 208, 0.22);
  border-radius: 999px;
}

.orbit-large {
  width: 168px;
  height: 168px;
}

.orbit-small {
  width: 112px;
  height: 112px;
  border-color: rgba(255, 255, 255, 0.16);
}

.premium-watch {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.06));
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.watch-main {
  width: 92px;
  height: 92px;
  flex-direction: column;
  gap: 2px;
  border-radius: 28px;
  color: #d9fff8;
}

.watch-main strong {
  color: #ffffff;
  font-size: 1.15rem;
  line-height: 1;
}

.watch-side {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  color: rgba(236, 255, 251, 0.84);
}

.watch-left {
  left: 10px;
  bottom: 22px;
  transform: rotate(-12deg);
}

.watch-right {
  right: 4px;
  top: 24px;
  transform: rotate(10deg);
}

.premium-btn {
  min-height: 48px;
  align-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border-radius: 999px;
  background: #ffffff;
  color: #0f4f49;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.premium-btn:hover {
  background: #ecfffb;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.24);
  transform: translateY(-1px);
}

.premium-btn:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .premium-suite-card {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 20px;
    padding-top: 116px;
  }

  .premium-price-badge {
    top: 18px;
    right: 18px;
    min-width: 112px;
    padding: 10px 12px 12px;
  }

  .premium-price-badge strong {
    font-size: 1.84rem;
  }

  .premium-copy {
    padding-right: 0;
  }

  .premium-visual {
    order: -1;
    min-height: 138px;
  }

  .orbit-large {
    width: 136px;
    height: 136px;
  }

  .orbit-small {
    width: 92px;
    height: 92px;
  }

  .watch-main {
    width: 78px;
    height: 78px;
    border-radius: 24px;
  }

  .watch-side {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .premium-btn {
    transition: none;
  }

  .premium-btn:hover {
    transform: none;
  }
}
</style>
