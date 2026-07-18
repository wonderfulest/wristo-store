<template>
  <section class="home-banner" aria-labelledby="home-hero-title">
    <div
      class="banner-shell"
      @mouseenter="pauseCarousel"
      @mouseleave="resumeCarousel"
      @focusin="pauseCarousel"
      @focusout="resumeCarousel"
    >
      <div class="banner-content" :class="activeSlide.themeClass">
        <div class="banner-copy">
          <span class="banner-eyebrow">
            <Icon :icon="activeSlide.eyebrowIcon" width="20" height="20" aria-hidden="true" />
            {{ t(activeSlide.eyebrowKey) }}
          </span>
          <h1 id="home-hero-title" class="banner-title">
            {{ t(activeSlide.titleKey) }}
          </h1>
          <p class="banner-desc">
            {{ t(activeSlide.descKey) }}
          </p>

          <div class="banner-actions">
            <button class="banner-primary" type="button" @click="activeSlide.primaryAction">
              {{ t(activeSlide.primaryLabelKey) }}
              <Icon :icon="activeSlide.primaryIcon" width="20" height="20" aria-hidden="true" />
            </button>
            <template v-if="!activeSlide.compactActions">
              <button class="banner-code" type="button" @click="activeSlide.secondaryAction">
                <Icon :icon="activeSlide.secondaryIcon" width="20" height="20" aria-hidden="true" />
                {{ t(activeSlide.secondaryLabelKey) }}
              </button>
              <button class="banner-secondary" type="button" @click="activeSlide.tertiaryAction">
                {{ t(activeSlide.tertiaryLabelKey) }}
              </button>
            </template>
          </div>

          <div v-if="!activeSlide.hideMetrics" class="banner-metrics" :aria-label="t('home.heroHighlights')">
            <span>
              <strong>{{ t(activeSlide.metricOneValueKey) }}</strong>
              {{ t(activeSlide.metricOneLabelKey) }}
            </span>
            <span>
              <strong>{{ t(activeSlide.metricTwoValueKey) }}</strong>
              {{ t(activeSlide.metricTwoLabelKey) }}
            </span>
            <span>
              <strong>{{ t(activeSlide.metricThreeValueKey) }}</strong>
              {{ t(activeSlide.metricThreeLabelKey) }}
            </span>
          </div>
        </div>

        <div
          class="banner-stage"
          :class="{ 'banner-stage--poster': activeSlide.isPosterImage }"
          aria-hidden="true"
        >
          <span v-if="!activeSlide.isPosterImage" class="banner-stage__index">0{{ activeSlideIndex + 1 }}</span>
          <div v-if="!activeSlide.isPosterImage" class="banner-stage__halo"></div>
          <img
            :class="{ 'banner-stage__image--poster': activeSlide.isPosterImage }"
            :src="activeSlide.imageSrc"
            alt=""
            loading="eager"
          />
          <div v-if="!activeSlide.hideArtCaption" class="banner-stage__caption">
            <span>{{ t(activeSlide.artTopKey) }}</span>
            <strong>{{ t(activeSlide.artBottomKey) }}</strong>
          </div>
        </div>
      </div>

      <div class="banner-carousel" :aria-label="t('home.heroCarouselAria')">
        <button
          v-for="(slide, index) in visibleSlides"
          :key="slide.id"
          class="carousel-dot"
          :class="{ active: index === activeSlideIndex }"
          type="button"
          :aria-label="t(slide.dotLabelKey)"
          :aria-current="index === activeSlideIndex ? 'true' : undefined"
          @click="selectSlide(index)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { useI18n, type MessageKey } from '@/i18n'
import { hasBundleStoreEntryAccess } from '@/utils/entitlements'
import { openStudio } from '@/utils/studio'

const router = useRouter()
const localeStore = useLocaleStore()
const userStore = useUserStore()
const { t } = useI18n()
const activeSlideIndex = ref(0)
let carouselTimer: number | undefined

const goToSearch = () => {
  router.push(addLocaleToPath('/search', localeStore.currentLocale))
}

const goToCode = () => {
  router.push(addLocaleToPath('/code', localeStore.currentLocale))
}

const goToBundles = () => {
  router.push({
    path: addLocaleToPath('/purchase-options', localeStore.currentLocale),
    hash: '#bundle-subscription-card'
  })
}

const goToCreators = () => {
  router.push(addLocaleToPath('/creators', localeStore.currentLocale))
}

const goToStudio = () => {
  openStudio()
}

type HeroSlide = {
  id: string
  requiresBundle?: boolean
  themeClass: string
  eyebrowIcon: string
  eyebrowKey: MessageKey
  titleKey: MessageKey
  descKey: MessageKey
  primaryLabelKey: MessageKey
  primaryIcon: string
  primaryAction: () => void
  secondaryLabelKey: MessageKey
  secondaryIcon: string
  secondaryAction: () => void
  tertiaryLabelKey: MessageKey
  tertiaryAction: () => void
  metricOneValueKey: MessageKey
  metricOneLabelKey: MessageKey
  metricTwoValueKey: MessageKey
  metricTwoLabelKey: MessageKey
  metricThreeValueKey: MessageKey
  metricThreeLabelKey: MessageKey
  imageSrc: string
  compactActions?: boolean
  hideMetrics?: boolean
  isPosterImage?: boolean
  hideArtCaption?: boolean
  artTopIcon: string
  artTopKey: MessageKey
  artBottomIcon: string
  artBottomKey: MessageKey
  dotLabelKey: MessageKey
}

const allSlides: HeroSlide[] = [
  {
    id: 'store',
    themeClass: 'theme-store',
    eyebrowIcon: 'solar:watch-round-bold-duotone',
    eyebrowKey: 'home.heroEyebrow',
    titleKey: 'home.heroTitle',
    descKey: 'home.heroDesc',
    primaryLabelKey: 'home.heroExplore',
    primaryIcon: 'solar:arrow-right-up-linear',
    primaryAction: goToSearch,
    secondaryLabelKey: 'home.heroCode',
    secondaryIcon: 'solar:ticket-sale-linear',
    secondaryAction: goToCode,
    tertiaryLabelKey: 'home.heroBundles',
    tertiaryAction: goToBundles,
    metricOneValueKey: 'home.heroMetricFacesValue',
    metricOneLabelKey: 'home.heroMetricFacesLabel',
    metricTwoValueKey: 'home.heroMetricCheckoutValue',
    metricTwoLabelKey: 'home.heroMetricCheckoutLabel',
    metricThreeValueKey: 'home.heroMetricGarminValue',
    metricThreeLabelKey: 'home.heroMetricGarminLabel',
    compactActions: true,
    hideMetrics: true,
    imageSrc: '/home-hero-watchfaces-access-en.png',
    isPosterImage: true,
    hideArtCaption: true,
    artTopIcon: 'solar:palette-round-linear',
    artTopKey: 'home.heroArtSeries',
    artBottomIcon: 'solar:bolt-circle-linear',
    artBottomKey: 'home.heroArtBattery',
    dotLabelKey: 'home.heroStoreSlide'
  },
  {
    id: 'studio',
    requiresBundle: true,
    themeClass: 'theme-studio',
    eyebrowIcon: 'solar:magic-stick-3-bold-duotone',
    eyebrowKey: 'home.studioEyebrow',
    titleKey: 'home.studioTitle',
    descKey: 'home.studioDesc',
    primaryLabelKey: 'home.studioCta',
    primaryIcon: 'solar:arrow-right-up-linear',
    primaryAction: goToStudio,
    secondaryLabelKey: 'home.studioPcBadge',
    secondaryIcon: 'solar:monitor-bold-duotone',
    secondaryAction: goToStudio,
    tertiaryLabelKey: 'home.studioLearn',
    tertiaryAction: goToCreators,
    metricOneValueKey: 'home.studioMetricTemplateValue',
    metricOneLabelKey: 'home.studioMetricTemplateLabel',
    metricTwoValueKey: 'home.studioMetricEditorValue',
    metricTwoLabelKey: 'home.studioMetricEditorLabel',
    metricThreeValueKey: 'home.studioMetricPublishValue',
    metricThreeLabelKey: 'home.studioMetricPublishLabel',
    imageSrc: '/home-hero-watch-gallery.svg',
    artTopIcon: 'solar:monitor-bold-duotone',
    artTopKey: 'home.studioArtPc',
    artBottomIcon: 'solar:layers-minimalistic-bold-duotone',
    artBottomKey: 'home.studioArtDesign',
    dotLabelKey: 'home.heroStudioSlide'
  }
]

const canShowBundleEntries = computed(() => hasBundleStoreEntryAccess(userStore.userInfo))
const visibleSlides = computed(() => allSlides.filter((slide) => !slide.requiresBundle || canShowBundleEntries.value))
const activeSlide = computed(() => visibleSlides.value[activeSlideIndex.value] || visibleSlides.value[0])

watch(visibleSlides, (slides) => {
  if (activeSlideIndex.value >= slides.length) {
    activeSlideIndex.value = 0
  }
})

const selectSlide = (index: number) => {
  activeSlideIndex.value = index
  restartCarousel()
}

const nextSlide = () => {
  activeSlideIndex.value = (activeSlideIndex.value + 1) % visibleSlides.value.length
}

const pauseCarousel = () => {
  if (carouselTimer) {
    window.clearInterval(carouselTimer)
    carouselTimer = undefined
  }
}

const resumeCarousel = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!carouselTimer) {
    carouselTimer = window.setInterval(nextSlide, 6500)
  }
}

const restartCarousel = () => {
  pauseCarousel()
  resumeCarousel()
}

onMounted(resumeCarousel)
onBeforeUnmount(pauseCarousel)
</script>

<style scoped>
.home-banner {
  width: 100%;
  padding: var(--space-5) 0 var(--space-4);
  background: var(--color-canvas);
}

.banner-shell {
  width: min(var(--container), calc(100% - 32px));
  min-height: 560px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-line);
}

.banner-content {
  position: relative;
  z-index: 2;
  min-height: 560px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr);
  align-items: center;
  gap: 26px;
  padding: 56px 56px 48px;
}

.banner-content.theme-store {
  grid-template-columns: minmax(320px, 0.72fr) minmax(520px, 1.28fr);
  gap: 32px;
}

.banner-content.theme-store .banner-copy {
  max-width: 430px;
}

.banner-content.theme-store .banner-title {
  font-size: clamp(3.2rem, 5vw, 5.4rem);
  line-height: 0.96;
}

.banner-content.theme-store .banner-actions {
  margin-top: 26px;
}

.banner-content.theme-studio .banner-title {
  max-width: 760px;
}

.banner-content.theme-studio .banner-eyebrow {
  color: #7c3aed;
  background: rgba(237, 233, 254, 0.76);
  border-color: rgba(124, 58, 237, 0.16);
}

.banner-content.theme-studio .banner-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #0f6b68 100%);
  box-shadow: 0 16px 34px rgba(124, 58, 237, 0.22);
}

.banner-content.theme-studio .banner-code {
  color: #5b21b6;
  background: transparent;
  border-color: rgba(124, 58, 237, 0.18);
}

.banner-copy {
  max-width: 650px;
}

.banner-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: rgba(223, 245, 241, 0.72);
  border: 1px solid rgba(15, 107, 104, 0.14);
  font-size: 0.86rem;
  font-weight: 800;
  text-transform: uppercase;
}

.banner-title {
  margin: 18px 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 6.4vw, 6.7rem);
  font-weight: 700;
  line-height: 0.92;
}

.banner-desc {
  max-width: 520px;
  margin: 0;
  color: #475467;
  font-size: clamp(1.04rem, 1.4vw, 1.22rem);
  line-height: 1.62;
}

.banner-actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 30px;
}

.banner-primary,
.banner-code,
.banner-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 999px;
  font-weight: 800;
}

.banner-primary {
  gap: 8px;
  padding: 0 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.24);
}

.banner-code {
  gap: 8px;
  padding: 0 18px;
  color: var(--color-brand-strong);
  background: transparent;
  border-color: rgba(15, 107, 104, 0.32);
}

.banner-secondary {
  padding: 0 18px;
  color: var(--color-brand-strong);
  background: transparent;
  border-color: transparent;
}

.banner-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 34px;
  max-width: 570px;
}

.banner-metrics span {
  min-height: 76px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  color: #667085;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: var(--shadow-sm);
}

.banner-metrics strong {
  color: var(--color-ink);
  font-size: 1.04rem;
}

.banner-stage {
  position: relative;
  justify-self: end;
  width: min(100%, 540px);
  min-height: 440px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: var(--radius-display);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 42%),
    var(--color-stage);
  box-shadow: 0 28px 70px rgba(7, 35, 33, 0.24);
}

.banner-stage img {
  position: relative;
  z-index: 2;
  display: block;
  width: min(88%, 470px);
  aspect-ratio: 4 / 3;
  object-fit: contain;
  filter: drop-shadow(0 28px 32px rgba(0, 0, 0, 0.36));
}

.banner-stage img.banner-stage__image--poster {
  width: min(94%, 510px);
  aspect-ratio: 3 / 4;
  filter: none;
}

.banner-stage.banner-stage--poster {
  width: min(100%, 600px);
  min-height: 680px;
  background: #090d11;
}

.banner-stage__index {
  position: absolute;
  top: var(--space-5);
  left: var(--space-5);
  z-index: 3;
  color: rgba(255, 255, 255, 0.48);
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.banner-stage__halo {
  position: absolute;
  width: 68%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(216, 239, 234, 0.28), rgba(11, 116, 109, 0.08) 54%, transparent 72%);
}

.banner-stage__caption {
  position: absolute;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: 3;
  display: grid;
  text-align: right;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.banner-stage__caption strong {
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: 0;
  text-transform: none;
}

.banner-carousel {
  position: absolute;
  z-index: 3;
  left: 56px;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.carousel-dot {
  position: relative;
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: transform 180ms ease;
}

.carousel-dot::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 107, 104, 0.18);
  transform: translate(-50%, -50%);
  transition: width 180ms ease, background-color 180ms ease;
}

.carousel-dot.active::before {
  width: 36px;
  background: var(--color-brand-strong);
}

.carousel-dot:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.28);
  outline-offset: 3px;
}

.carousel-dot:active {
  transform: scale(0.96);
}

@media (max-width: 1040px) {
  .banner-content.theme-store {
    grid-template-columns: 1fr;
  }

  .banner-content.theme-store .banner-stage--poster {
    justify-self: center;
  }
}

@media (max-width: 900px) {
  .banner-content {
    grid-template-columns: 1fr;
    padding: 44px 44px 64px;
  }

  .banner-content.theme-store {
    grid-template-columns: 1fr;
  }

  .banner-stage {
    justify-self: center;
    width: min(100%, 480px);
    min-height: min(420px, 62vw);
  }

  .banner-stage.banner-stage--poster {
    width: min(100%, 510px);
    min-height: 640px;
  }

  .banner-stage img.banner-stage__image--poster {
    width: min(94%, 480px);
  }
}

@media (max-width: 768px) {
  .home-banner {
    padding: 12px 0 8px;
  }

  .banner-shell {
    width: calc(100% - 24px);
    min-height: 0;
    border-radius: var(--radius-md);
  }

  .banner-content {
    min-height: 0;
    padding: 30px 20px 58px;
    gap: 20px;
  }

  .banner-title {
    font-size: clamp(2.6rem, 14vw, 3.55rem);
  }

  .banner-content.theme-store .banner-title {
    font-size: clamp(2.6rem, 14vw, 3.55rem);
  }

  .banner-desc {
    font-size: 1rem;
  }

  .banner-actions {
    align-items: stretch;
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .banner-primary,
  .banner-code,
  .banner-secondary {
    width: 100%;
  }

  .banner-metrics {
    display: none;
  }

  .banner-stage {
    width: min(100%, 310px);
    min-height: min(360px, 92vw);
    justify-self: center;
  }

  .banner-stage.banner-stage--poster {
    width: min(100%, 360px);
    min-height: min(480px, 128vw);
  }

  .banner-stage img.banner-stage__image--poster {
    width: min(100%, 360px);
  }

  .banner-carousel {
    left: 20px;
    bottom: 20px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .carousel-dot,
  .carousel-dot::before,
  .banner-stage img {
    transition: none;
  }
}
</style>
