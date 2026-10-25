<template>
  <article v-if="!hasPremiumAccess" class="premium-suite-card" :aria-label="t('home.premiumEyebrow')">
    <div class="premium-copy">
      <span class="premium-kicker">{{ t('home.premiumEyebrow') }}</span>
      <h2>{{ t('home.premiumTitle') }}</h2>
      <p>{{ t('home.premiumDesc') }}</p>
    </div>
    <button type="button" class="premium-btn" @click="goPremium">
      <span>{{ t('home.premiumCta') }}</span>
      <Icon icon="solar:arrow-right-up-linear" width="20" height="20" aria-hidden="true" />
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { useI18n } from '@/i18n'
import { hasPremiumEntitlement } from '@/utils/entitlements'

const router = useRouter()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { t } = useI18n()
const hasPremiumAccess = computed(() => hasPremiumEntitlement(userStore.userInfo))

const goPremium = () => {
  router.push({
    path: addLocaleToPath('/purchase-options', localeStore.currentLocale),
    hash: '#bundle-subscription-card'
  })
}
</script>

<style scoped>
.premium-suite-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 32px 40px;
  border: 1px solid #dce3d4;
  border-radius: 24px;
  background: #eef1e8;
  color: #243b30;
}

.premium-copy { min-width: 0; }

.premium-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.premium-copy h2 {
  margin: 12px 0 8px;
  color: #243b30;
  font-size: clamp(24px, 2.5vw, 32px);
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: -.035em;
}

.premium-copy p {
  margin: 0;
  color: #5a685c;
  font-size: 16px;
  line-height: 1.7;
}

.premium-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 30px;
  min-height: 48px;
  padding: 12px 22px;
  border: 0;
  border-radius: 8px;
  background: #294c3b;
  color: #fff;
  font-size: 15px;
  font-weight: 650;
  cursor: pointer;
}

.premium-btn:hover { background: #183a28; }
.premium-btn:focus-visible { outline: 3px solid #7f995d; outline-offset: 4px; }

@media (max-width: 768px) {
  .premium-suite-card {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
    padding: 28px 24px;
  }
}
</style>
