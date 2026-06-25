<template>
  <main class="daily-page">
    <section class="daily-hero" :aria-labelledby="heroTitleId">
      <div class="hero-copy">
        <p class="eyebrow">Wristo Daily preview</p>
        <h1 :id="heroTitleId">{{ activeDaily.title }}</h1>
        <p class="hero-lede">{{ activeDaily.lede }}</p>
        <div class="hero-actions" aria-label="Daily preview navigation">
          <RouterLink
            v-for="daily in dailies"
            :key="daily.slug"
            class="daily-tab"
            :class="{ active: daily.slug === activeDaily.slug }"
            :to="dailyPath(daily.slug)"
            :aria-current="daily.slug === activeDaily.slug ? 'page' : undefined"
          >
            <Icon :icon="daily.icon" aria-hidden="true" />
            <span>{{ daily.shortTitle }}</span>
          </RouterLink>
        </div>
      </div>

      <aside class="watch-panel" :aria-label="`${activeDaily.title} watch preview`">
        <div class="watch-shell">
          <div class="watch-screen">
            <span class="screen-label">Wristo Daily</span>
            <strong>{{ activeDaily.watchTitle }}</strong>
            <p>{{ activeDaily.watchPrompt }}</p>
            <div class="watch-actions">
              <span>Done</span>
              <span>Skip</span>
            </div>
          </div>
        </div>
        <p class="panel-note">Cloud plan sync. Offline cache. Short prompts on the wrist.</p>
      </aside>
    </section>

    <section class="daily-overview" aria-label="How Wristo Daily works">
      <article v-for="step in workflow" :key="step.title" class="workflow-item">
        <span class="workflow-icon">
          <Icon :icon="step.icon" aria-hidden="true" />
        </span>
        <h2>{{ step.title }}</h2>
        <p>{{ step.body }}</p>
      </article>
    </section>

    <section class="daily-detail">
      <div class="detail-copy">
        <p class="section-kicker">{{ activeDaily.kicker }}</p>
        <h2>{{ activeDaily.detailTitle }}</h2>
        <p>{{ activeDaily.detailBody }}</p>
      </div>
      <div class="detail-grid">
        <article class="detail-card">
          <h3>Best for</h3>
          <ul>
            <li v-for="item in activeDaily.bestFor" :key="item">
              <Icon icon="material-symbols:check-rounded" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </article>
        <article class="detail-card">
          <h3>Plan inputs</h3>
          <ul>
            <li v-for="item in activeDaily.inputs" :key="item">
              <Icon icon="material-symbols:tune-rounded" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="prompt-section" :aria-labelledby="promptTitleId">
      <div class="section-heading">
        <p>Reminder tone</p>
        <h2 :id="promptTitleId">Short messages made for a glance</h2>
      </div>
      <div class="prompt-grid">
        <article v-for="prompt in activeDaily.prompts" :key="prompt" class="prompt-card">
          <Icon icon="material-symbols:vibration-rounded" aria-hidden="true" />
          <span>{{ prompt }}</span>
        </article>
      </div>
    </section>

    <section class="boundary-section" aria-label="Product boundaries">
      <div>
        <p class="section-kicker">MVP boundary</p>
        <h2>Simple reminders, not medical or race advice</h2>
      </div>
      <p>
        Wristo Daily is designed for gentle routines and checklist prompts. It does not provide
        medical guidance, real-time pacing, route navigation, or training-load analysis.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

interface DailyIntro {
  slug: string
  title: string
  shortTitle: string
  lede: string
  icon: string
  watchTitle: string
  watchPrompt: string
  kicker: string
  detailTitle: string
  detailBody: string
  bestFor: string[]
  inputs: string[]
  prompts: string[]
}

const route = useRoute()
const localeStore = useLocaleStore()
const heroTitleId = 'wristo-daily-title'
const promptTitleId = 'wristo-daily-prompts'

const dailies: DailyIntro[] = [
  {
    slug: 'easy-run',
    title: 'Easy Run Routine',
    shortTitle: 'Easy Run',
    lede: 'Gentle prompts that help Garmin runners keep recovery runs relaxed, controlled, and low pressure.',
    icon: 'material-symbols:directions-run-rounded',
    watchTitle: 'Easy Run',
    watchPrompt: 'Keep it easy.',
    kicker: 'For daily runs',
    detailTitle: 'Keep the run conversational',
    detailBody:
      'Easy Run Routine sends short interval-based reminders after the activity starts, so runners can relax their shoulders, check breathing, drink a few sips, and keep the pace easy without configuring a complex data screen.',
    bestFor: ['Recovery runs', 'Daily easy mileage', 'Runners who tend to speed up too early'],
    inputs: ['Duration: 30, 45, 60, or 90 minutes', 'Interval: 5, 10, or 15 minutes', 'Tone: calm, direct, or encouraging'],
    prompts: ['Keep it easy.', 'Relax your shoulders.', 'Breathe smooth.', 'Drink a few sips.'],
  },
  {
    slug: 'race-week-checklist',
    title: 'Race Week Checklist',
    shortTitle: 'Race Week',
    lede: 'A race-week preparation plan for watch charging, gear checks, meals, bottles, alarms, and race-morning basics.',
    icon: 'material-symbols:checklist-rounded',
    watchTitle: 'D-3',
    watchPrompt: 'Charge your watch.',
    kicker: 'For the final week',
    detailTitle: 'Reduce missed details before race day',
    detailBody:
      'Race Week Checklist turns the final seven days into small dated reminders. It focuses on logistics, kit preparation, and calm race-morning routines instead of in-race pacing or fueling algorithms.',
    bestFor: ['5K to marathon race prep', 'Gear and logistics checks', 'Runners who want less race-week friction'],
    inputs: ['Race date', 'Race distance', 'Daily reminder time', 'Race morning reminders'],
    prompts: ['Review your race plan.', 'Prepare gels and bottles.', 'Lay out your race kit.', 'Start calm.'],
  },
  {
    slug: 'sleep-wind-down',
    title: 'Sleep Wind Down',
    shortTitle: 'Sleep',
    lede: 'A quiet evening routine that moves phone-free, lights-down, breathing, and bedtime prompts onto the watch.',
    icon: 'material-symbols:nightlight-rounded',
    watchTitle: 'Wind Down',
    watchPrompt: 'Dim the lights.',
    kicker: 'For evening routines',
    detailTitle: 'Make bedtime reminders less intrusive',
    detailBody:
      'Sleep Wind Down lets users set a target bedtime and receive a simple 30 or 60 minute routine on the Garmin watch. It keeps the prompts practical and avoids sleep diagnosis or health claims.',
    bestFor: ['Phone-free bedtime routines', '30 or 60 minute wind-down flows', 'Users who prefer wrist prompts over phone alerts'],
    inputs: ['Target bedtime', 'Routine length: 30 or 60 minutes', 'Tone: calm or minimal'],
    prompts: ['Start winding down.', 'Put your phone away.', 'Take 6 slow breaths.', 'Time for bed.'],
  },
]

const workflow = [
  {
    title: 'Choose a plan',
    body: 'Pick a daily template in the cloud and configure only the inputs that matter.',
    icon: 'material-symbols:dashboard-customize-rounded',
  },
  {
    title: 'Sync to Garmin',
    body: 'The watch app stays lightweight and pulls the active plan with offline cache support.',
    icon: 'material-symbols:sync-rounded',
  },
  {
    title: 'Act on the wrist',
    body: 'Short prompts appear at the right time with Done and Skip actions for simple feedback.',
    icon: 'material-symbols:watch-rounded',
  },
]

const activeDaily = computed(() => {
  const slugParam = Array.isArray(route.params.dailySlug) ? route.params.dailySlug[0] : route.params.dailySlug
  return dailies.find((daily) => daily.slug === slugParam) || dailies[0]
})

const dailyPath = (slug: string) => addLocaleToPath(`/daily/${slug}`, localeStore.currentLocale)
</script>

<style scoped>
.daily-page {
  --daily-ink: #10211f;
  --daily-muted: #61706d;
  --daily-line: rgba(16, 33, 31, 0.12);
  --daily-surface: #ffffff;
  --daily-soft: #edf7f4;
  --daily-warm: #fff7e6;
  width: 100%;
  overflow: hidden;
  color: var(--daily-ink);
  background:
    radial-gradient(circle at 84% 8%, rgba(245, 158, 11, 0.16), transparent 28rem),
    linear-gradient(180deg, #fbfdfc 0%, #f1f7f5 42%, #ffffff 100%);
}

.daily-hero,
.daily-overview,
.daily-detail,
.prompt-section,
.boundary-section {
  width: min(var(--container), calc(100% - 40px));
  margin: 0 auto;
}

.daily-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.8fr);
  gap: 48px;
  align-items: center;
  min-height: 620px;
  padding: 76px 0 56px;
}

.hero-copy {
  display: grid;
  gap: 24px;
}

.eyebrow,
.section-kicker,
.section-heading p {
  margin: 0;
  color: var(--color-brand-strong);
  font-size: 0.84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.hero-copy h1 {
  max-width: 720px;
  margin: 0;
  color: var(--daily-ink);
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 5.8rem);
  line-height: 0.98;
  letter-spacing: 0;
}

.hero-lede {
  max-width: 660px;
  margin: 0;
  color: var(--daily-muted);
  font-size: clamp(1.08rem, 2vw, 1.28rem);
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.daily-tab {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border: 1px solid var(--daily-line);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.76);
  color: var(--daily-ink);
  box-shadow: var(--shadow-sm);
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.daily-tab:hover {
  border-color: rgba(15, 107, 104, 0.38);
  background: #ffffff;
  color: var(--color-brand-strong);
  transform: translateY(-1px);
}

.daily-tab.active {
  border-color: rgba(15, 107, 104, 0.32);
  background: var(--color-brand);
  color: #ffffff;
}

.daily-tab svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.watch-panel {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 28px;
  border: 1px solid var(--daily-line);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-lg);
}

.watch-shell {
  width: min(340px, 100%);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    linear-gradient(135deg, rgba(16, 33, 31, 0.96), rgba(31, 49, 46, 0.95)),
    var(--daily-ink);
  box-shadow: inset 0 0 0 14px #1f2f2d, inset 0 0 0 16px rgba(255, 255, 255, 0.08);
}

.watch-screen {
  width: 68%;
  aspect-ratio: 1;
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 28px;
  border-radius: 50%;
  background: #071311;
  color: #f7fffc;
  text-align: center;
  box-shadow: inset 0 0 28px rgba(45, 212, 191, 0.18);
}

.screen-label {
  color: #88d9cf;
  font-size: 0.78rem;
  font-weight: 800;
}

.watch-screen strong {
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  line-height: 1.1;
}

.watch-screen p,
.panel-note {
  margin: 0;
}

.watch-screen p {
  color: rgba(247, 255, 252, 0.82);
  line-height: 1.35;
}

.watch-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
}

.watch-actions span {
  min-height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(136, 217, 207, 0.34);
  border-radius: var(--radius-sm);
  color: #dffbf6;
  font-size: 0.78rem;
  font-weight: 800;
}

.panel-note {
  max-width: 320px;
  color: var(--daily-muted);
  text-align: center;
  line-height: 1.55;
}

.daily-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  padding: 0 0 68px;
}

.workflow-item,
.detail-card,
.prompt-card,
.boundary-section {
  border: 1px solid var(--daily-line);
  border-radius: var(--radius-sm);
  background: var(--daily-surface);
  box-shadow: var(--shadow-sm);
}

.workflow-item {
  display: grid;
  gap: 14px;
  padding: 24px;
}

.workflow-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--daily-soft);
  color: var(--color-brand-strong);
}

.workflow-icon svg {
  width: 24px;
  height: 24px;
}

.workflow-item h2,
.detail-copy h2,
.section-heading h2,
.boundary-section h2 {
  margin: 0;
  color: var(--daily-ink);
  letter-spacing: 0;
}

.workflow-item h2 {
  font-size: 1.05rem;
}

.workflow-item p,
.detail-copy p,
.boundary-section p {
  margin: 0;
  color: var(--daily-muted);
  line-height: 1.65;
}

.daily-detail {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 32px;
  align-items: start;
  padding: 72px 0;
  border-top: 1px solid var(--daily-line);
}

.detail-copy {
  display: grid;
  gap: 16px;
  position: sticky;
  top: 96px;
}

.detail-copy h2,
.section-heading h2,
.boundary-section h2 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-card {
  padding: 24px;
}

.detail-card h3 {
  margin: 0 0 16px;
  color: var(--daily-ink);
  font-size: 1rem;
}

.detail-card ul {
  display: grid;
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.detail-card li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  color: var(--daily-muted);
  line-height: 1.5;
}

.detail-card li svg {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  color: var(--color-brand);
}

.prompt-section {
  display: grid;
  gap: 26px;
  padding: 68px 0;
}

.section-heading {
  display: grid;
  gap: 10px;
  max-width: 620px;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.prompt-card {
  min-height: 132px;
  display: grid;
  align-content: space-between;
  gap: 18px;
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, var(--daily-warm) 100%);
}

.prompt-card svg {
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.prompt-card span {
  color: var(--daily-ink);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.3;
}

.boundary-section {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 32px;
  align-items: center;
  margin-bottom: 76px;
  padding: 28px;
  background: #10211f;
  color: #ffffff;
}

.boundary-section .section-kicker,
.boundary-section h2,
.boundary-section p {
  color: #ffffff;
}

.boundary-section p {
  opacity: 0.78;
}

@media (max-width: 980px) {
  .daily-hero,
  .daily-detail,
  .boundary-section {
    grid-template-columns: 1fr;
  }

  .daily-overview,
  .prompt-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-copy {
    position: static;
  }
}

@media (max-width: 640px) {
  .daily-hero,
  .daily-overview,
  .daily-detail,
  .prompt-section,
  .boundary-section {
    width: calc(100% - 24px);
  }

  .daily-hero {
    min-height: auto;
    gap: 28px;
    padding: 44px 0 40px;
  }

  .hero-copy h1 {
    font-size: clamp(2.7rem, 17vw, 4rem);
  }

  .daily-tab {
    width: 100%;
    justify-content: center;
  }

  .watch-panel {
    padding: 18px;
  }

  .watch-shell {
    width: min(300px, 100%);
  }

  .daily-overview,
  .detail-grid,
  .prompt-grid {
    grid-template-columns: 1fr;
  }

  .daily-detail,
  .prompt-section {
    padding: 48px 0;
  }

  .boundary-section {
    margin-bottom: 48px;
    padding: 22px;
  }
}
</style>
