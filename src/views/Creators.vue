<template>
  <div class="creators-page">
    <section class="creators-hero" aria-labelledby="creators-title">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">
            <Icon icon="solar:watch-round-bold-duotone" width="19" height="19" aria-hidden="true" />
            {{ t('creators.heroEyebrow') }}
          </p>
          <h1 id="creators-title" class="hero-title">
            {{ t('creators.heroTitle') }}
          </h1>
          <p class="hero-subtitle">
            {{ t('creators.heroSubtitle') }}
          </p>
          <div class="hero-actions" :aria-label="t('creators.actionsAria')">
            <button class="btn-primary" type="button" @click="handleStart">
              <Icon icon="solar:arrow-right-up-linear" width="20" height="20" aria-hidden="true" />
              {{ t('creators.startStudio') }}
            </button>
            <button class="btn-secondary" type="button" @click="handleViewPath">
              <Icon icon="solar:map-arrow-right-linear" width="20" height="20" aria-hidden="true" />
              {{ t('creators.viewGrowthPath') }}
            </button>
            <button class="btn-secondary" type="button" @click="handleOpenAcademy">
              <Icon icon="solar:notebook-bookmark-linear" width="20" height="20" aria-hidden="true" />
              {{ t('creators.openAcademy') }}
            </button>
          </div>
          <div class="hero-metrics" :aria-label="t('creators.metricsAria')">
            <div v-for="metric in heroMetrics" :key="metric.label" class="metric-item">
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual" :aria-label="t('creators.previewAria')">
          <div class="creator-console">
            <div class="console-header">
              <span class="console-kicker">{{ t('creators.consoleKicker') }}</span>
              <span class="console-status">{{ t('creators.consoleStatus') }}</span>
            </div>
            <div class="watch-showcase">
              <div class="watch-frame">
                <div class="watch-screen">
                  <span class="watch-time">10:24</span>
                  <span class="watch-date">WED 24</span>
                  <span class="watch-ring"></span>
                </div>
              </div>
              <div class="showcase-copy">
                <span>{{ t('creators.showcaseName') }}</span>
                <strong>{{ t('creators.showcaseStatus') }}</strong>
              </div>
            </div>
            <div class="console-grid">
              <div v-for="stat in consoleStats" :key="stat.label" class="console-stat">
                <Icon :icon="stat.icon" width="22" height="22" aria-hidden="true" />
                <span>{{ stat.label }}</span>
                <strong>{{ stat.value }}</strong>
              </div>
            </div>
            <div class="console-progress">
              <div class="progress-label">
                <span>{{ t('creators.validationLabel') }}</span>
                <strong>68%</strong>
              </div>
              <span class="progress-track"><span class="progress-fill"></span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class="creators-main">
      <section class="value-band" aria-labelledby="creator-value-title">
        <div class="section-heading">
          <p class="section-kicker">{{ t('creators.valueKicker') }}</p>
          <h2 id="creator-value-title">{{ t('creators.valueTitle') }}</h2>
        </div>
        <div class="value-grid">
          <article v-for="item in valueProps" :key="item.title" class="value-card">
            <span class="icon-box">
              <Icon :icon="item.icon" width="24" height="24" aria-hidden="true" />
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section id="creator-growth-roadmap" class="roadmap-band" aria-labelledby="roadmap-title">
        <div class="roadmap-heading">
          <div class="section-heading">
            <p class="section-kicker">{{ t('creators.roadmapKicker') }}</p>
            <h2 id="roadmap-title">{{ t('creators.roadmapTitle') }}</h2>
            <p>
              {{ t('creators.roadmapSubtitle') }}
            </p>
          </div>
          <div class="stage-tabs" role="tablist" :aria-label="t('creators.stagesAria')">
            <button
              v-for="stage in stages"
              :id="`stage-tab-${stage.id}`"
              :key="stage.id"
              class="stage-tab"
              type="button"
              role="tab"
              :aria-selected="activeStage === stage.id"
              :aria-controls="`stage-panel-${stage.id}`"
              :class="{ active: activeStage === stage.id }"
              @click="goStage(stage.id)"
            >
              <span>{{ stage.id }}</span>
              {{ stage.shortTitle }}
            </button>
          </div>
        </div>

        <article
          :id="`stage-panel-${currentStage.id}`"
          class="stage-panel"
          role="tabpanel"
          :aria-labelledby="`stage-tab-${currentStage.id}`"
        >
          <div class="stage-panel-copy">
            <p class="stage-label">{{ t('creators.stageLabel') }} {{ currentStage.id }}</p>
            <h3>{{ currentStage.title }}</h3>
            <p>{{ currentStage.description }}</p>
          </div>
          <div class="stage-panel-detail">
            <ul class="check-list">
              <li v-for="point in currentStage.points" :key="point">
                <Icon icon="solar:check-circle-line-duotone" width="20" height="20" aria-hidden="true" />
                <span>{{ point }}</span>
              </li>
            </ul>
            <div class="stage-note">
              <Icon :icon="currentStage.noteIcon" width="22" height="22" aria-hidden="true" />
              <p>{{ currentStage.note }}</p>
            </div>
          </div>
        </article>

        <div class="path-controls">
          <button class="btn-quiet" type="button" :disabled="activeStage === 1" @click="handlePrevStage">
            <Icon icon="solar:arrow-left-linear" width="19" height="19" aria-hidden="true" />
            {{ t('creators.previous') }}
          </button>
          <span class="path-count">{{ stageCountText }}</span>
          <button class="btn-quiet" type="button" :disabled="activeStage === stages.length" @click="handleNextStage">
            {{ t('creators.next') }}
            <Icon icon="solar:arrow-right-linear" width="19" height="19" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section class="principles-band" aria-labelledby="principles-title">
        <div class="section-heading">
          <p class="section-kicker">{{ t('creators.principlesKicker') }}</p>
          <h2 id="principles-title">{{ t('creators.principlesTitle') }}</h2>
        </div>
        <div class="principles-layout">
          <article v-for="principle in principles" :key="principle.title" class="principle-card">
            <Icon :icon="principle.icon" width="26" height="26" aria-hidden="true" />
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.description }}</p>
          </article>
        </div>
      </section>

      <section class="promise-band" aria-labelledby="promise-title">
        <div class="promise-copy">
          <p class="section-kicker">{{ t('creators.promiseKicker') }}</p>
          <h2 id="promise-title">{{ t('creators.promiseTitle') }}</h2>
          <p>
            {{ t('creators.promiseBody') }}
          </p>
        </div>
        <button class="btn-primary" type="button" @click="handleStart">
          <Icon icon="solar:magic-stick-3-bold-duotone" width="20" height="20" aria-hidden="true" />
          {{ t('creators.joinFree') }}
        </button>
        <button class="btn-secondary promise-secondary" type="button" @click="handleOpenAcademy">
          <Icon icon="solar:notebook-bookmark-linear" width="20" height="20" aria-hidden="true" />
          {{ t('creators.openAcademy') }}
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '@/i18n'
import { getStudioUrl } from '@/utils/studio'

const studioUrl = import.meta.env.VITE_WRISTO_STUDIO_URL || 'https://studio.wristo.io/'
const { t } = useI18n()
const academyUrl = new URL('/academy', getStudioUrl()).toString()

const heroMetrics = computed(() => [
  { value: t('creators.metricFreeValue'), label: t('creators.metricFreeLabel') },
  { value: t('creators.metricDownloadsValue'), label: t('creators.metricDownloadsLabel') },
  { value: t('creators.metricRevenueValue'), label: t('creators.metricRevenueLabel') },
])

const consoleStats = computed(() => [
  { icon: 'solar:download-minimalistic-line-duotone', label: t('creators.statDownloads'), value: '1.8k' },
  { icon: 'solar:star-line-duotone', label: t('creators.statFeedback'), value: '4.8' },
  { icon: 'solar:wallet-money-line-duotone', label: t('creators.statRevenue'), value: t('creators.statRevenueValue') },
])

const valueProps = computed(() => [
  {
    icon: 'solar:palette-round-line-duotone',
    title: t('creators.valueToolsTitle'),
    description: t('creators.valueToolsDesc'),
  },
  {
    icon: 'solar:chart-square-line-duotone',
    title: t('creators.valueSignalsTitle'),
    description: t('creators.valueSignalsDesc'),
  },
  {
    icon: 'solar:shop-line-duotone',
    title: t('creators.valueStorefrontTitle'),
    description: t('creators.valueStorefrontDesc'),
  },
])

const stages = computed(() => [
  {
    id: 1,
    shortTitle: t('creators.stage1Short'),
    title: t('creators.stage1Title'),
    description: t('creators.stage1Desc'),
    points: [
      t('creators.stage1Point1'),
      t('creators.stage1Point2'),
      t('creators.stage1Point3'),
      t('creators.stage1Point4'),
    ],
    note: t('creators.stage1Note'),
    noteIcon: 'solar:leaf-line-duotone',
  },
  {
    id: 2,
    shortTitle: t('creators.stage2Short'),
    title: t('creators.stage2Title'),
    description: t('creators.stage2Desc'),
    points: [
      t('creators.stage2Point1'),
      t('creators.stage2Point2'),
      t('creators.stage2Point3'),
      t('creators.stage2Point4'),
    ],
    note: t('creators.stage2Note'),
    noteIcon: 'solar:bolt-circle-line-duotone',
  },
  {
    id: 3,
    shortTitle: t('creators.stage3Short'),
    title: t('creators.stage3Title'),
    description: t('creators.stage3Desc'),
    points: [
      t('creators.stage3Point1'),
      t('creators.stage3Point2'),
      t('creators.stage3Point3'),
      t('creators.stage3Point4'),
    ],
    note: t('creators.stage3Note'),
    noteIcon: 'solar:wallet-money-line-duotone',
  },
  {
    id: 4,
    shortTitle: t('creators.stage4Short'),
    title: t('creators.stage4Title'),
    description: t('creators.stage4Desc'),
    points: [
      t('creators.stage4Point1'),
      t('creators.stage4Point2'),
      t('creators.stage4Point3'),
      t('creators.stage4Point4'),
    ],
    note: t('creators.stage4Note'),
    noteIcon: 'solar:refresh-circle-line-duotone',
  },
])

const principles = computed(() => [
  {
    icon: 'solar:shield-check-line-duotone',
    title: t('creators.principlePenaltyTitle'),
    description: t('creators.principlePenaltyDesc'),
  },
  {
    icon: 'solar:document-text-line-duotone',
    title: t('creators.principleRulesTitle'),
    description: t('creators.principleRulesDesc'),
  },
  {
    icon: 'solar:users-group-rounded-line-duotone',
    title: t('creators.principleAgencyTitle'),
    description: t('creators.principleAgencyDesc'),
  },
])

const activeStage = ref(1)
const currentStage = computed(() => stages.value.find((stage) => stage.id === activeStage.value) || stages.value[0])
const stageCountText = computed(() => t('creators.stageCount')
  .replace('{current}', String(activeStage.value))
  .replace('{total}', String(stages.value.length)))

const handleStart = () => {
  window.open(studioUrl, '_blank', 'noopener')
}

const handleViewPath = () => {
  const el = document.getElementById('creator-growth-roadmap')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleOpenAcademy = () => {
  window.open(academyUrl, '_blank', 'noopener')
}

const handleNextStage = () => {
  if (activeStage.value < stages.value.length) {
    activeStage.value += 1
  }
}

const handlePrevStage = () => {
  if (activeStage.value > 1) {
    activeStage.value -= 1
  }
}

const goStage = (stage: number) => {
  activeStage.value = stage
}
</script>

<style scoped>
.creators-page {
  --creator-ink: #10201f;
  --creator-muted: #5f716f;
  --creator-line: rgba(16, 32, 31, 0.12);
  --creator-brand: #0f6b68;
  --creator-brand-dark: #074b49;
  --creator-mint: #ddf4ee;
  --creator-amber: #f2a51f;
  min-height: 100vh;
  color: var(--creator-ink);
  background:
    radial-gradient(circle at 78% 12%, rgba(15, 107, 104, 0.16), transparent 28rem),
    linear-gradient(180deg, #f8fbfa 0%, #edf5f2 48%, #f7faf8 100%);
}

.creators-hero {
  padding: clamp(72px, 9vw, 118px) 24px clamp(44px, 7vw, 80px);
  border-bottom: 1px solid rgba(15, 107, 104, 0.1);
}

.hero-inner,
.creators-main {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.78fr);
  align-items: center;
  gap: clamp(36px, 7vw, 88px);
}

.hero-copy {
  max-width: 690px;
}

.eyebrow,
.section-kicker,
.console-kicker,
.stage-label {
  margin: 0;
  color: var(--creator-brand-dark);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: var(--shadow-sm);
}

.hero-title {
  max-width: 720px;
  margin: 22px 0 0;
  color: var(--creator-ink);
  font-family: var(--font-display);
  font-size: clamp(2.65rem, 6vw, 5.65rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 650px;
  margin: 24px 0 0;
  color: var(--creator-muted);
  font-size: clamp(1.02rem, 1.6vw, 1.22rem);
  line-height: 1.7;
}

.hero-actions,
.hero-metrics,
.path-controls,
.promise-band {
  display: flex;
  align-items: center;
}

.hero-actions {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary,
.btn-quiet,
.stage-tab {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  font-weight: 800;
}

.btn-primary {
  border: 1px solid var(--creator-brand-dark);
  padding: 13px 22px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--creator-brand-dark), var(--creator-brand));
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.24);
}

.btn-primary:hover {
  transform: translateY(-2px);
  border-color: #063b39;
  box-shadow: 0 20px 42px rgba(15, 107, 104, 0.28);
}

.btn-secondary,
.btn-quiet {
  border: 1px solid rgba(15, 107, 104, 0.18);
  color: var(--creator-brand-dark);
  background: rgba(255, 255, 255, 0.78);
}

.btn-secondary {
  padding: 13px 20px;
}

.btn-secondary:hover,
.btn-quiet:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #ffffff;
  box-shadow: var(--shadow-md);
}

.btn-quiet {
  padding: 10px 16px;
  min-width: 112px;
}

.btn-quiet:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.hero-metrics {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.metric-item {
  min-width: 150px;
  padding: 16px 18px;
  border-left: 1px solid rgba(15, 107, 104, 0.24);
}

.metric-item strong {
  display: block;
  color: var(--creator-brand-dark);
  font-size: 1.45rem;
  line-height: 1;
}

.metric-item span {
  display: block;
  margin-top: 8px;
  color: var(--creator-muted);
  font-size: 0.92rem;
  line-height: 1.35;
}

.hero-visual {
  min-width: 0;
}

.creator-console {
  position: relative;
  padding: 24px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(230, 244, 239, 0.82)),
    #ffffff;
  box-shadow: 0 28px 80px rgba(16, 32, 31, 0.16);
  overflow: hidden;
}

.creator-console::before {
  content: "";
  position: absolute;
  inset: auto -58px -70px auto;
  width: 210px;
  height: 210px;
  border: 34px solid rgba(242, 165, 31, 0.24);
  border-radius: 50%;
}

.console-header,
.watch-showcase,
.console-grid,
.progress-label,
.roadmap-heading {
  display: flex;
}

.console-header {
  position: relative;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.console-status {
  padding: 7px 10px;
  border-radius: 999px;
  color: #7c4d03;
  background: rgba(242, 165, 31, 0.18);
  font-size: 0.78rem;
  font-weight: 800;
}

.watch-showcase {
  position: relative;
  align-items: center;
  gap: 22px;
  margin-top: 26px;
}

.watch-frame {
  width: 152px;
  aspect-ratio: 1;
  padding: 13px;
  border-radius: 50%;
  background: #101918;
  box-shadow: inset 0 0 0 8px #273534, 0 22px 40px rgba(16, 32, 31, 0.28);
}

.watch-screen {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #e8fbf6;
  background:
    radial-gradient(circle at 50% 50%, rgba(242, 165, 31, 0.24), transparent 36%),
    linear-gradient(145deg, #0a2322, #102f2c);
  overflow: hidden;
}

.watch-time,
.watch-date,
.watch-ring {
  position: absolute;
}

.watch-time {
  top: 36px;
  font-size: 1.8rem;
  font-weight: 800;
}

.watch-date {
  bottom: 34px;
  color: rgba(232, 251, 246, 0.74);
  font-size: 0.74rem;
  font-weight: 800;
}

.watch-ring {
  width: 72px;
  height: 72px;
  border: 7px solid rgba(221, 244, 238, 0.2);
  border-top-color: var(--creator-amber);
  border-radius: 50%;
}

.showcase-copy span,
.console-stat span,
.progress-label span {
  color: var(--creator-muted);
  font-size: 0.9rem;
}

.showcase-copy strong {
  display: block;
  margin-top: 7px;
  color: var(--creator-ink);
  font-size: 1.55rem;
  line-height: 1.1;
}

.console-grid {
  position: relative;
  grid-template-columns: repeat(3, 1fr);
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.console-stat {
  min-width: 0;
  padding: 15px 14px;
  border: 1px solid rgba(15, 107, 104, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.76);
}

.console-stat svg {
  color: var(--creator-brand);
}

.console-stat span,
.console-stat strong {
  display: block;
}

.console-stat span {
  margin-top: 10px;
}

.console-stat strong {
  margin-top: 4px;
  color: var(--creator-ink);
  font-size: 1.18rem;
}

.console-progress {
  position: relative;
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(16, 32, 31, 0.06);
}

.progress-label {
  justify-content: space-between;
  gap: 16px;
}

.progress-track {
  display: block;
  height: 9px;
  margin-top: 12px;
  border-radius: 999px;
  background: rgba(15, 107, 104, 0.14);
  overflow: hidden;
}

.progress-fill {
  display: block;
  width: 68%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--creator-brand), var(--creator-amber));
}

.creators-main {
  padding: 64px 0 88px;
}

.value-band,
.roadmap-band,
.principles-band,
.promise-band {
  margin-top: clamp(40px, 7vw, 76px);
}

.value-band {
  margin-top: 0;
}

.section-heading {
  max-width: 720px;
}

.section-heading h2,
.promise-copy h2 {
  margin: 10px 0 0;
  color: var(--creator-ink);
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.45rem);
  line-height: 1.05;
  letter-spacing: 0;
}

.section-heading p:not(.section-kicker),
.promise-copy p:not(.section-kicker) {
  margin: 16px 0 0;
  color: var(--creator-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}

.value-grid,
.principles-layout {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 28px;
}

.value-card,
.principle-card {
  min-width: 0;
  border: 1px solid var(--creator-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: var(--shadow-sm);
}

.value-card {
  padding: 24px;
}

.icon-box {
  width: 48px;
  height: 48px;
  display: inline-grid;
  place-items: center;
  border-radius: 14px;
  color: var(--creator-brand-dark);
  background: var(--creator-mint);
}

.value-card h3,
.principle-card h3 {
  margin: 18px 0 0;
  color: var(--creator-ink);
  font-size: 1.12rem;
  line-height: 1.25;
}

.value-card p,
.principle-card p {
  margin: 10px 0 0;
  color: var(--creator-muted);
  line-height: 1.65;
}

.roadmap-heading {
  align-items: end;
  justify-content: space-between;
  gap: 28px;
}

.stage-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 10px;
  min-width: 360px;
}

.stage-tab {
  justify-content: flex-start;
  padding: 8px 14px 8px 8px;
  border: 1px solid rgba(15, 107, 104, 0.15);
  color: var(--creator-muted);
  background: rgba(255, 255, 255, 0.72);
}

.stage-tab span {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  color: var(--creator-brand-dark);
  background: rgba(15, 107, 104, 0.12);
  font-size: 0.85rem;
}

.stage-tab.active {
  color: #ffffff;
  border-color: var(--creator-brand-dark);
  background: var(--creator-brand-dark);
}

.stage-tab.active span {
  color: var(--creator-brand-dark);
  background: #ffffff;
}

.stage-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(0, 1fr);
  gap: 28px;
  margin-top: 28px;
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(221, 244, 238, 0.58)),
    #ffffff;
  box-shadow: var(--shadow-md);
}

.stage-panel-copy h3 {
  margin: 10px 0 0;
  font-size: clamp(1.75rem, 3vw, 2.6rem);
  line-height: 1.05;
}

.stage-panel-copy p:not(.stage-label) {
  margin: 16px 0 0;
  color: var(--creator-muted);
  font-size: 1.08rem;
  line-height: 1.65;
}

.check-list {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.check-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--creator-ink);
  line-height: 1.55;
}

.check-list svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--creator-brand);
}

.stage-note {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  padding: 16px;
  border-radius: 8px;
  color: #694305;
  background: rgba(242, 165, 31, 0.16);
}

.stage-note svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.stage-note p {
  margin: 0;
  line-height: 1.6;
}

.path-controls {
  justify-content: space-between;
  gap: 18px;
  margin-top: 22px;
}

.path-count {
  color: var(--creator-muted);
  font-size: 0.92rem;
  font-weight: 700;
}

.principle-card {
  padding: 26px;
}

.principle-card svg {
  color: var(--creator-brand);
}

.promise-band {
  justify-content: space-between;
  gap: 28px;
  padding: clamp(28px, 5vw, 46px);
  border-radius: 8px;
  color: #ffffff;
  background:
    linear-gradient(135deg, rgba(16, 32, 31, 0.92), rgba(7, 75, 73, 0.94)),
    var(--creator-brand-dark);
  box-shadow: 0 26px 70px rgba(16, 32, 31, 0.22);
}

.promise-copy {
  max-width: 760px;
}

.promise-copy .section-kicker,
.promise-copy h2 {
  color: #ffffff;
}

.promise-copy p:not(.section-kicker) {
  color: rgba(255, 255, 255, 0.76);
}

.promise-band .btn-primary {
  flex: 0 0 auto;
  color: var(--creator-brand-dark);
  border-color: #ffffff;
  background: #ffffff;
  box-shadow: none;
}

.promise-band .promise-secondary {
  flex: 0 0 auto;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.12);
}

.promise-band .promise-secondary:hover {
  background: rgba(255, 255, 255, 0.18);
}

@media (max-width: 980px) {
  .hero-inner,
  .stage-panel,
  .roadmap-heading,
  .promise-band {
    grid-template-columns: 1fr;
  }

  .hero-inner,
  .stage-panel {
    display: grid;
  }

  .roadmap-heading,
  .promise-band {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-copy {
    max-width: none;
  }

  .stage-tabs {
    min-width: 0;
  }

  .value-grid,
  .principles-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .creators-hero {
    padding: 48px 16px 36px;
  }

  .hero-inner,
  .creators-main {
    width: min(100%, calc(100% - 32px));
  }

  .hero-title {
    font-size: 2.08rem;
    line-height: 1.02;
  }

  .hero-subtitle {
    margin-top: 18px;
    font-size: 0.96rem;
    line-height: 1.62;
  }

  .hero-actions,
  .path-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-quiet {
    width: 100%;
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 24px;
  }

  .metric-item {
    min-width: 0;
    padding: 10px 8px;
    border-left: 0;
    border-top: 1px solid rgba(15, 107, 104, 0.18);
  }

  .metric-item strong {
    font-size: 1.08rem;
  }

  .metric-item span {
    font-size: 0.68rem;
    line-height: 1.28;
  }

  .creator-console {
    padding: 14px;
    border-radius: 22px;
  }

  .watch-showcase {
    align-items: center;
    gap: 14px;
  }

  .watch-frame {
    width: 96px;
    padding: 9px;
  }

  .watch-time {
    top: 25px;
    font-size: 1.18rem;
  }

  .watch-date {
    bottom: 23px;
    font-size: 0.62rem;
  }

  .watch-ring {
    width: 48px;
    height: 48px;
    border-width: 5px;
  }

  .showcase-copy strong {
    font-size: 1.12rem;
  }

  .console-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    margin-top: 16px;
  }

  .console-stat {
    padding: 10px 8px;
    border-radius: 12px;
  }

  .console-stat span {
    margin-top: 6px;
    font-size: 0.68rem;
  }

  .console-stat strong {
    font-size: 0.88rem;
  }

  .console-progress {
    margin-top: 12px;
    padding: 12px;
  }

  .stage-tabs {
    grid-template-columns: 1fr;
  }

  .path-count {
    text-align: center;
  }

  .promise-band {
    align-items: stretch;
    flex-direction: column;
  }

  .promise-band .btn-primary,
  .promise-band .promise-secondary {
    width: 100%;
  }
}
</style>
