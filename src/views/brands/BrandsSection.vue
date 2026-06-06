<template>
  <section v-if="merchants.length" class="brands-section">
    <div class="brands-container">
      <div class="brands-header">
        <div class="brands-header-left">
          <h2 class="brands-title">{{ t('home.brandsTitle') }}</h2>
          <div class="brands-subtitle">
            {{ t('home.brandsSubtitle') }}
          </div>
        </div>

        <button class="brands-more" type="button" @click="goToBrands">
          {{ t('home.brandsMore') }}
        </button>
      </div>

      <div class="brands-grid" :aria-label="t('home.brandsAria')">
        <button
          v-for="merchant in merchants"
          :key="merchant.userId"
          class="brand-card"
          type="button"
          @click="goToMerchant(Number(merchant.userId))"
        >
          <img v-if="merchant.avatar" :src="merchant.avatar" :alt="merchant.username || 'Brand avatar'" class="brand-avatar" loading="lazy" />
          <span v-else class="brand-fallback">{{ getInitial(merchant.username) }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { getTopMerchants } from '@/api/merchant'
import type { PublicMerchantVO } from '@/types/merchant'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'

const router = useRouter()
const localeStore = useLocaleStore()
const { t } = useI18n()

const merchants = ref<PublicMerchantVO[]>([])

onMounted(async () => {
  try {
    const list = await getTopMerchants(12)
    merchants.value = list || []
  } catch (e) {
    merchants.value = []
  }
})

const goToBrands = () => {
  router.push(addLocaleToPath('/brands', localeStore.currentLocale))
}

const goToMerchant = (userId: number) => {
  router.push(addLocaleToPath(`/brands/${userId}`, localeStore.currentLocale))
}

const getInitial = (name?: string) => {
  return (name || 'W').trim().charAt(0).toUpperCase()
}
</script>

<style scoped>
.brands-section {
  padding: 46px 0;
  background: #fff;
}

.brands-container {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 16px;
}

.brands-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.brands-header-left {
  min-width: 0;
  text-align: left;
}

.brands-title {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--color-ink);
}

.brands-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-muted);
}

.brands-more {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 700;
  font-size: 12px;
  color: var(--color-brand);
  cursor: pointer;
  white-space: nowrap;
}

.brands-more:hover {
  box-shadow: var(--shadow-sm);
  background: var(--color-brand-soft);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.brand-card {
  min-height: 150px;
  display: grid;
  place-items: center;
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.brand-card:hover {
  border-color: rgba(15, 107, 104, 0.24);
  background: var(--color-brand-soft);
  transform: translateY(-2px);
}

.brand-avatar,
.brand-fallback {
  width: 96px;
  height: 96px;
  border-radius: 999px;
}

.brand-avatar {
  display: block;
  object-fit: cover;
}

.brand-fallback {
  display: grid;
  place-items: center;
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  font-size: 2rem;
  font-weight: 800;
}

@media (max-width: 768px) {
  .brands-section {
    padding: 22px 0;
  }

  .brands-title {
    font-size: 1.35rem;
  }

  .brands-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .brand-card {
    min-height: 112px;
    padding: 12px;
  }

  .brand-avatar,
  .brand-fallback {
    width: 72px;
    height: 72px;
  }
}

@media (max-width: 480px) {
  .brands-title {
    font-size: 1.75rem;
  }

  .brands-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
