<template>
  <section v-if="showPremium || downloads.hasLinks" class="home-promotions storefront-container"
    :aria-label="t('home.heroCarouselAria')" aria-roledescription="carousel"
    @mouseenter="hovered = true; stop()" @mouseleave="hovered = false; start()" @focusin="focused = true; stop()" @focusout="onFocusOut">
    <div v-if="slides.length > 1" class="home-promotions__controls" role="group" :aria-label="t('home.heroCarouselAria')">
      <button class="home-promotions__arrow" type="button" :aria-label="t('creators.previous')" @click="step(-1)">
        <span aria-hidden="true">←</span>
      </button>
      <div class="home-promotions__choices">
        <button v-for="(slide, index) in slides" :key="slide" class="home-promotions__choice" type="button"
          :aria-pressed="active === slide" :aria-controls="`home-promotion-${slide}`" @click="select(slide)">
          <span class="home-promotions__number" aria-hidden="true">{{ index + 1 }}</span>
          <span>{{ slide === 'premium' ? 'Wristo Premium' : 'Wristo App' }}</span>
        </button>
      </div>
      <button class="home-promotions__arrow" type="button" :aria-label="t('creators.next')" @click="step(1)">
        <span aria-hidden="true">→</span>
      </button>
    </div>
    <div class="home-promotions__slides">
      <div id="home-promotion-premium" v-if="showPremium" :class="{ 'is-active': active === 'premium' }" :inert="active !== 'premium'" :aria-hidden="active !== 'premium'" class="home-promotions__slide">
        <div class="promotion promotion--premium">
          <div class="promotion__copy">
            <span class="promotion__eyebrow">WRISTO PREMIUM</span>
            <h1>{{ t('home.promoPremiumTitle') }}</h1>
            <p class="promotion__price">{{ t('home.promoPremiumValue') }}</p>
            <RouterLink class="promotion__cta" :to="premiumUrl">{{ t('home.premiumCta') }} <span aria-hidden="true">↗</span></RouterLink>
          </div>
          <div class="promotion__art" aria-hidden="true"><img src="https://cdn.wristo.io/store/home/home-premium-art-450f93619da55c16.png" alt="" width="1536" height="1024" fetchpriority="high" /></div>
        </div>
      </div>
      <div id="home-promotion-app" v-if="downloads.hasLinks" :class="{ 'is-active': active === 'app' }" :inert="active !== 'app'" :aria-hidden="active !== 'app'" class="home-promotions__slide">
        <div class="promotion promotion--app">
          <div class="promotion__copy">
            <span class="promotion__eyebrow">WRISTO APP</span>
            <h2>{{ t('appDownload.title') }}</h2>
            <p>{{ t('appDownload.description') }}</p>
            <AppDownloadLinks />
          </div>
          <div class="promotion__phone-stage" aria-hidden="true">
            <div class="promotion__phone"><img src="https://cdn.wristo.io/store/home/home-app-screen-55bd9d46c92e3fb2.jpg" alt="" width="442" height="960" /></div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppDownloadLinks from '@/components/AppDownloadLinks.vue'
import { RouterLink } from 'vue-router'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useCompanionAppsStore } from '@/store/companionApps'
import { useUserStore } from '@/store/user'
import { hasPremiumEntitlement } from '@/utils/entitlements'
import { useI18n } from '@/i18n'
const { t } = useI18n()
const locale = useLocaleStore()
const premiumUrl = computed(() => ({ path: addLocaleToPath('/purchase-options', locale.currentLocale), hash: '#bundle-subscription-card' }))
const downloads = useCompanionAppsStore()
const user = useUserStore()
const showPremium = computed(() => !hasPremiumEntitlement(user.userInfo))
type Slide = 'premium' | 'app'
const slides = computed<Slide[]>(() => [ ...(showPremium.value ? ['premium' as const] : []), ...(downloads.hasLinks ? ['app' as const] : []) ])
const active = ref<Slide>(slides.value[0] ?? 'premium')
let timer: ReturnType<typeof setInterval> | undefined
const hovered = ref(false)
const focused = ref(false)
function stop() { if (timer) clearInterval(timer); timer = undefined }
function start() {
  stop()
  if (hovered.value || focused.value || slides.value.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => { active.value = slides.value[(slides.value.indexOf(active.value) + 1) % slides.value.length] }, 2000)
}
function select(slide: Slide) { active.value = slide; start() }
function step(direction: number) {
  if (slides.value.length < 2) return
  select(slides.value[(slides.value.indexOf(active.value) + direction + slides.value.length) % slides.value.length])
}
function onFocusOut(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) { focused.value = false; start() }
}
watch(slides, value => { if (!value.includes(active.value) && value[0]) active.value = value[0]; start() })
onMounted(() => { void downloads.load(); start() })
onBeforeUnmount(stop)
</script>

<style scoped>
.home-promotions { position: relative; margin: 24px auto 0; border-radius: 26px; overflow: hidden; background: #f4edde; box-shadow: 0 2px 5px #19382708; }
.home-promotions__slides { display: grid; }
.home-promotions__slide { grid-area: 1 / 1; min-width: 0; visibility: hidden; opacity: 0; transition: opacity 450ms ease; }
.home-promotions__slide.is-active { visibility: visible; opacity: 1; z-index: 1; }
.promotion { position: relative; min-height: 340px; height: 100%; box-sizing: border-box; overflow: hidden; display: grid; grid-template-columns: 50% 50%; }
.promotion__copy { position: relative; z-index: 2; padding: 32px 0 42px 40px; align-self: center; }
.promotion__eyebrow { display: block; font-size: 12px; font-weight: 750; letter-spacing: .2em; color: #123e33; }
.promotion__eyebrow::after { content: ''; display: block; width: 64px; height: 2px; margin-top: 12px; background: #a77a30; }
.promotion h1 { max-width: 510px; font-family: var(--font-display); font-size: clamp(32px, 3.8vw, 50px); line-height: 1.04; letter-spacing: -.035em; margin: 16px 0 12px; color: #12291f; white-space: pre-line; }
.promotion p { margin: 14px 0 22px; color: #304b3e; font-size: 16px; line-height: 1.6; max-width: 470px; }
.promotion p.promotion__price { font-family: var(--font-display); font-size: 26px; margin: 0 0 20px; }
.promotion__cta { display: inline-flex; align-items: center; gap: 24px; padding: 13px 22px; border-radius: 8px; background: #00594f; color: white; text-decoration: none; font-size: 16px; font-weight: 650; }
.promotion__cta:hover { background: #003e38; }
.promotion__cta:focus-visible { outline: 3px solid #a77a30; outline-offset: 4px; }
.promotion--premium { background: #f4edde; }
.promotion__art { position: absolute; inset: 0 0 0 45%; background: #17140f; }
.promotion__art img { width: 100%; height: 100%; object-fit: cover; }
.promotion__art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, #f4edde 0%, #f4edde00 25%); }
.promotion--app { background: radial-gradient(ellipse at 86% 80%, #bfceb5, transparent 65%), #e9eddf; grid-template-columns: 57% 43%; }
.promotion--app .promotion__eyebrow::after { background: #8a9980; }
.promotion h2 { margin: 20px 0 14px; color: #0c3024; font-size: clamp(28px, 3.2vw, 42px); line-height: 1.12; font-weight: 700; letter-spacing: -.04em; }
.promotion--app p { max-width: 480px; }
.promotion__phone-stage { position: relative; min-width: 0; }
.promotion__phone { position: absolute; top: 24px; left: 8%; width: 268px; padding: 5px; border: 2px solid #797d75; border-radius: 37px; background: #171b17; box-shadow: 10px 8px 0 #5a5c54, 20px 24px 32px #1d311a40; transform: rotate(12deg); }
.promotion__phone img { width: 100%; height: auto; display: block; border-radius: 30px; }
.home-promotions__controls { position: relative; z-index: 3; display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #fffdf9; border-bottom: 1px solid #d8dfd2; }
.home-promotions__choices { display: flex; flex: 1; justify-content: center; gap: 10px; min-width: 0; }
.home-promotions__controls button { min-width: 0; min-height: 48px; border: 1px solid #a6b5a5; border-radius: 12px; cursor: pointer; color: #164c3b; background: #edf2e8; font-weight: 700; }
.home-promotions__choice { display: inline-flex; align-items: center; justify-content: center; gap: 10px; flex: 1; max-width: 260px; padding: 10px 16px; font-size: 15px; }
.home-promotions__number { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #dce6d6; font-size: 12px; }
.home-promotions__controls button[aria-pressed="true"] { color: white; background: #00594f; border-color: #00594f; box-shadow: 0 2px 6px #00594f26; }
.home-promotions__choice[aria-pressed="true"] .home-promotions__number { background: #ffffff26; }
.home-promotions__controls button:hover { border-color: #00594f; box-shadow: 0 0 0 2px #00594f26; }
.home-promotions__arrow { padding: 0; flex: 0 0 48px; font-size: 26px; line-height: 1; }
.home-promotions__controls button:focus-visible { outline: 3px solid #a77a30; outline-offset: 2px; }
@media (max-width: 900px) {
  .promotion { min-height: 330px; }
  .promotion__copy { padding-left: 28px; }
  .promotion__phone { width: 230px; left: 3%; top: 35px; }
  .promotion__art { inset-inline-start: 43%; }
  .promotion--app :deep(.app-download-link) { min-width: 0; padding: 8px 10px; gap: 7px; }
  .promotion--app :deep(.app-download-link strong) { font-size: 16px; }
}
@media (max-width: 600px) {
  .home-promotions { margin-top: 16px; border-radius: 22px; }
  .promotion, .promotion--app { display: flex; flex-direction: column; min-height: 490px; }
  .promotion__copy { padding: 26px 24px 0; align-self: stretch; }
  .promotion h1 { font-size: 34px; margin-top: 16px; }
  .promotion h2 { font-size: 29px; margin-top: 16px; }
  .promotion p { font-size: 14px; margin: 12px 0 16px; }
  .promotion p.promotion__price { font-size: 23px; margin-bottom: 16px; }
  .promotion__art { position: relative; inset: auto; height: 210px; width: 100%; margin-top: 12px; }
  .promotion__art img { object-fit: contain; }
  .promotion__art::after { background: linear-gradient(#f4edde, transparent 24%); }
  .promotion__phone-stage { flex: 1; min-height: 240px; }
  .promotion__phone { width: 196px; left: calc(50% - 98px); top: 24px; }
  .promotion--app :deep(.app-download-links) { flex-wrap: nowrap; gap: 8px; }
  .promotion--app :deep(.app-download-link) { flex: 1; min-width: 0; gap: 6px; padding: 8px; }
  .promotion--app :deep(.app-download-link strong) { font-size: 14px; }
  .promotion--app :deep(.app-download-link img) { width: 20px; flex-basis: 20px; }
  .home-promotions__controls { gap: 6px; padding: 10px 8px; }
  .home-promotions__choices { gap: 6px; }
  .home-promotions__choice { padding: 8px 4px; font-size: 12px; gap: 0; }
  .home-promotions__number { display: none; }
  .home-promotions__arrow { flex-basis: 44px; }
  .home-promotions__controls button { border-radius: 8px; }
}
@media (prefers-reduced-motion: reduce) { .home-promotions__slide { transition: none; } }
</style>
