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
            <button class="banner-code" type="button" @click="activeSlide.secondaryAction">
              <Icon :icon="activeSlide.secondaryIcon" width="20" height="20" aria-hidden="true" />
              {{ t(activeSlide.secondaryLabelKey) }}
            </button>
            <button class="banner-secondary" type="button" @click="activeSlide.tertiaryAction">
              {{ t(activeSlide.tertiaryLabelKey) }}
            </button>
          </div>

          <div class="banner-metrics" :aria-label="t('home.heroHighlights')">
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

        <div class="banner-art" aria-hidden="true">
          <img :src="activeSlide.imageSrc" alt="" loading="eager" />
          <span class="art-label art-label-top">
            <Icon :icon="activeSlide.artTopIcon" width="18" height="18" />
            {{ t(activeSlide.artTopKey) }}
          </span>
          <span class="art-label art-label-bottom">
            <Icon :icon="activeSlide.artBottomIcon" width="18" height="18" />
            {{ t(activeSlide.artBottomKey) }}
          </span>
        </div>
      </div>

      <div class="banner-carousel" :aria-label="t('home.heroCarouselAria')">
        <button
          v-for="(slide, index) in slides"
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n, type MessageKey } from '@/i18n'
import { openStudio } from '@/utils/studio'

const router = useRouter()
const localeStore = useLocaleStore()
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
  artTopIcon: string
  artTopKey: MessageKey
  artBottomIcon: string
  artBottomKey: MessageKey
  dotLabelKey: MessageKey
}

const slides: HeroSlide[] = [
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
    imageSrc: '/home-hero-garmin-watch.svg',
    artTopIcon: 'solar:palette-round-linear',
    artTopKey: 'home.heroArtSeries',
    artBottomIcon: 'solar:bolt-circle-linear',
    artBottomKey: 'home.heroArtBattery',
    dotLabelKey: 'home.heroStoreSlide'
  },
  {
    id: 'studio',
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

const activeSlide = computed(() => slides[activeSlideIndex.value])

const selectSlide = (index: number) => {
  activeSlideIndex.value = index
  restartCarousel()
}

const nextSlide = () => {
  activeSlideIndex.value = (activeSlideIndex.value + 1) % slides.length
}

const pauseCarousel = () => {
  if (carouselTimer) {
    window.clearInterval(carouselTimer)
    carouselTimer = undefined
  }
}

const resumeCarousel = () => {
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
  padding: 24px 0 18px;
  background:
    radial-gradient(560px 320px at 12% 4%, rgba(245, 158, 11, 0.16), transparent 70%),
    radial-gradient(620px 360px at 88% 8%, rgba(15, 107, 104, 0.16), transparent 70%);
}

.banner-shell {
  width: min(var(--container), calc(100% - 32px));
  min-height: 560px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 251, 250, 0.78) 48%, rgba(223, 245, 241, 0.82) 100%);
  box-shadow:
    var(--shadow-lg),
    0 1px 0 rgba(255, 255, 255, 0.7) inset;
  border: 1px solid var(--color-line);
}

.banner-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.82) 42%, rgba(255, 255, 255, 0.28) 100%),
    radial-gradient(760px 420px at 74% 50%, rgba(15, 107, 104, 0.12), transparent 64%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 2;
  min-height: 560px;
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(360px, 0.96fr);
  align-items: center;
  gap: 26px;
  padding: 56px 56px 48px;
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
  background: rgba(237, 233, 254, 0.78);
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
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.18);
}

.banner-secondary {
  padding: 0 18px;
  color: var(--color-brand-strong);
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(15, 107, 104, 0.14);
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

.banner-art {
  position: relative;
  justify-self: end;
  width: min(100%, 540px);
}

.banner-art img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  border-radius: 32px;
  box-shadow: 0 28px 70px rgba(17, 24, 39, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.72);
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
  width: 36px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 107, 104, 0.18);
  cursor: pointer;
  transition:
    width 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.carousel-dot.active {
  width: 52px;
  background: var(--color-brand-strong);
}

.carousel-dot:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.28);
  outline-offset: 3px;
}

.carousel-dot:active {
  transform: scale(0.96);
}

.art-label {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 800;
  font-size: 0.9rem;
}

.art-label-top {
  top: 22px;
  left: -20px;
}

.art-label-bottom {
  right: -16px;
  bottom: 30px;
}

@media (max-width: 1024px) {
  .banner-content {
    grid-template-columns: 1fr;
    padding: 44px 44px 64px;
  }

  .banner-art {
    justify-self: center;
    width: min(100%, 480px);
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

  .art-label {
    position: absolute;
    min-height: 34px;
    padding: 7px 10px;
    font-size: 0.82rem;
  }

  .art-label-top {
    top: 12px;
    left: 12px;
  }

  .art-label-bottom {
    right: 12px;
    bottom: 12px;
  }

  .banner-art img {
    border-radius: 22px;
  }

  .banner-art {
    width: min(100%, 310px);
    justify-self: center;
  }

  .banner-carousel {
    left: 20px;
    bottom: 20px;
  }

  .carousel-dot {
    width: 30px;
  }

  .carousel-dot.active {
    width: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-dot {
    transition: none;
  }
}
</style>
