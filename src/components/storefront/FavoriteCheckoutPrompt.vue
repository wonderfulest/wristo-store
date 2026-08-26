<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { ProductFavoriteRecord } from '@/utils/productFavorites'
import { useI18n } from '@/i18n'

const props = defineProps<{ visible: boolean; items: ProductFavoriteRecord[]; cartAppIds: number[] }>()
const emit = defineEmits<{ (event: 'dismiss'): void; (event: 'checkout', appIds: number[]): void }>()
const { t } = useI18n()
const selected = ref<number[]>([])
const sheet = ref<HTMLElement | null>(null)
const cartIds = computed(() => new Set(props.cartAppIds))
const eligible = (item: ProductFavoriteRecord) => item.isAvailable !== false && !item.isPurchased && !cartIds.value.has(item.appId)

watch(() => props.visible, (visible) => {
  document.body.style.overflow = visible ? 'hidden' : ''
  if (visible) {
    selected.value = props.items.filter(eligible).map((item) => item.appId)
    void nextTick(() => sheet.value?.focus())
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('dismiss')
}

onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="favorite-prompt-backdrop" @click.self="emit('dismiss')">
      <section ref="sheet" role="dialog" aria-modal="true" aria-labelledby="favorite-prompt-title" class="favorite-prompt-sheet" tabindex="-1" @keydown="handleKeydown">
        <div class="favorite-prompt-handle"></div>
        <h2 id="favorite-prompt-title">{{ t('favorites.promptTitle') }}</h2>
        <p>{{ t('favorites.promptDesc') }}</p>
        <div class="favorite-prompt-items">
          <label v-for="item in items" :key="item.appId" :class="{ disabled: !eligible(item) }">
            <input v-model="selected" type="checkbox" :value="item.appId" :disabled="!eligible(item)" />
            <img :src="item.imageUrl" :alt="item.name" />
            <span><strong>{{ item.name }}</strong><small v-if="cartIds.has(item.appId)">{{ t('favorites.alreadyInCart') }}</small><small v-else-if="!eligible(item)">{{ t('favorites.unavailable') }}</small></span>
          </label>
        </div>
        <button type="button" class="favorite-prompt-primary" :disabled="!selected.length && !cartAppIds.length" @click="emit('checkout', selected)">
          {{ selected.length ? t('favorites.addAndCheckout') : t('cart.goToCart') }}
        </button>
        <button type="button" class="favorite-prompt-secondary" @click="emit('dismiss')">{{ t('favorites.continueBrowsing') }}</button>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.favorite-prompt-backdrop { position: fixed; inset: 0; z-index: var(--layer-header-menu); display: flex; align-items: flex-end; justify-content: center; padding: 12px; background: rgba(3,18,18,.48); }
.favorite-prompt-sheet { width: min(100%, 560px); max-height: min(82vh, 720px); overflow: auto; padding: 10px 18px calc(18px + env(safe-area-inset-bottom)); border-radius: 28px 28px 20px 20px; background: #fff; box-shadow: 0 -20px 60px rgba(0,0,0,.24); }
.favorite-prompt-handle { width: 42px; height: 5px; margin: 0 auto 18px; border-radius: 99px; background: #c9d2d0; }
.favorite-prompt-sheet h2 { margin: 0 0 6px; }
.favorite-prompt-sheet > p { margin: 0 0 16px; color: var(--color-stage-muted); }
.favorite-prompt-items { display: grid; gap: 8px; margin-bottom: 16px; }
.favorite-prompt-items label { display: grid; grid-template-columns: 24px 58px 1fr; gap: 10px; align-items: center; padding: 8px; border: 1px solid var(--color-line); border-radius: 14px; }
.favorite-prompt-items label.disabled { opacity: .55; }
.favorite-prompt-items img { width: 58px; height: 58px; border-radius: 12px; object-fit: cover; }
.favorite-prompt-items span { display: flex; min-width: 0; flex-direction: column; }
.favorite-prompt-items small { color: var(--color-stage-muted); }
.favorite-prompt-primary, .favorite-prompt-secondary { width: 100%; min-height: 48px; border-radius: 999px; font: inherit; font-weight: 850; }
.favorite-prompt-primary { border: 0; color: #fff; background: var(--color-brand); }
.favorite-prompt-secondary { margin-top: 8px; border: 0; color: var(--color-brand-strong); background: transparent; }
</style>
