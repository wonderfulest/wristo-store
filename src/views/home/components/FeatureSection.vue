<template>
  <section class="feature-section">
    <div class="feature-panel">
      <div class="feature-copy">
        <div class="feature-badge">{{ t('home.featureBadge') }}</div>
        <h2 class="feature-title">{{ t('home.featureTitle') }}</h2>
        <p class="feature-desc">
          {{ t('home.featureDesc') }}
        </p>

        <div class="feature-actions">
          <button class="feature-cta" @click="goToPurchaseOptions">{{ t('home.featureCta') }}</button>
          <span class="feature-note">{{ t('home.featureNote') }}</span>
        </div>
      </div>

      <div class="feature-showcase" :aria-label="t('home.featureAria')">
        <div class="watch-orbit" aria-hidden="true">
          <div class="watch-body">
            <div class="watch-screen">
              <span class="watch-time">10:28</span>
              <span class="watch-label">WRISTO</span>
              <div class="watch-metrics">
                <span>HR 72</span>
                <span>8.4K</span>
              </div>
            </div>
          </div>
        </div>

        <div class="feature-points">
          <div class="feature-point">
            <div class="feature-icon feature-icon-blue">
              <Icon icon="solar:stars-line-duotone" width="24" height="24" aria-hidden="true" />
            </div>
            <div>
              <div class="feature-card-title">{{ t('home.featureStyleTitle') }}</div>
              <div class="feature-card-desc">{{ t('home.featureStyleDesc') }}</div>
            </div>
          </div>

          <div class="feature-point">
            <div class="feature-icon feature-icon-green">
              <Icon icon="solar:pulse-2-line-duotone" width="24" height="24" aria-hidden="true" />
            </div>
            <div>
              <div class="feature-card-title">{{ t('home.featureDataTitle') }}</div>
              <div class="feature-card-desc">{{ t('home.featureDataDesc') }}</div>
            </div>
          </div>

          <div class="feature-point">
            <div class="feature-icon feature-icon-purple">
              <Icon icon="solar:battery-charge-minimalistic-line-duotone" width="24" height="24" aria-hidden="true" />
            </div>
            <div>
              <div class="feature-card-title">{{ t('home.featureBatteryTitle') }}</div>
              <div class="feature-card-desc">{{ t('home.featureBatteryDesc') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'

const router = useRouter()
const localeStore = useLocaleStore()
const { t } = useI18n()

const goToPurchaseOptions = () => {
  router.push(addLocaleToPath('/purchase-options', localeStore.currentLocale))
}
</script>

<style scoped>
.feature-section {
  width: 100%;
  background:
    linear-gradient(180deg, #f8fbfa 0%, #eef5f3 100%);
  padding: 18px 16px;
  margin: 0;
  box-sizing: border-box;
}

.feature-panel {
  max-width: var(--container);
  margin: 34px auto;
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 251, 249, 0.9) 52%, rgba(223, 245, 241, 0.78) 100%);
  box-shadow:
    0 22px 60px rgba(17, 24, 39, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  border: 1px solid var(--color-line);
  padding: 34px;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(460px, 1.1fr);
  align-items: center;
  gap: 34px;
}

.feature-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 83% 18%, rgba(245, 158, 11, 0.16), transparent 18rem),
    radial-gradient(circle at 8% 100%, rgba(15, 107, 104, 0.12), transparent 18rem);
  pointer-events: none;
}

.feature-copy,
.feature-showcase {
  position: relative;
  z-index: 1;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  background: rgba(15, 107, 104, 0.1);
  color: var(--color-brand-strong);
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 5px 12px;
  margin-bottom: 14px;
  letter-spacing: 0;
  border: 1px solid rgba(15, 107, 104, 0.12);
}

.feature-title {
  font-size: clamp(2rem, 4.4vw, 3.2rem);
  line-height: 1.03;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-ink);
  margin: 0 0 14px;
  max-width: 620px;
}

.feature-desc {
  font-size: 1.03rem;
  color: var(--color-muted);
  max-width: 520px;
  margin: 0;
  line-height: 1.58;
}

.feature-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.feature-cta {
  border: none;
  border-radius: 999px;
  min-height: 46px;
  padding: 12px 22px;
  font-weight: 700;
  letter-spacing: 0;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  box-shadow: 0 10px 30px rgba(15, 107, 104, 0.18);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.feature-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(15, 107, 104, 0.22);
  filter: saturate(1.05);
}

.feature-cta:active {
  transform: translateY(0px) scale(0.99);
}

.feature-note {
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.feature-showcase {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  align-items: center;
  gap: 24px;
}

.watch-orbit {
  width: 216px;
  height: 216px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.82) 0 38%, rgba(15, 107, 104, 0.1) 39% 61%, rgba(245, 158, 11, 0.12) 62% 100%);
  box-shadow: 0 20px 50px rgba(6, 78, 75, 0.12);
}

.watch-body {
  width: 154px;
  height: 154px;
  border-radius: 50%;
  padding: 12px;
  background:
    linear-gradient(145deg, #1f2937 0%, #050f12 100%);
  box-shadow:
    0 18px 34px rgba(17, 24, 39, 0.26),
    0 0 0 7px rgba(17, 24, 39, 0.06);
}

.watch-screen {
  height: 100%;
  border-radius: 50%;
  color: #f8fafc;
  padding: 22px 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    radial-gradient(circle at 28% 20%, rgba(245, 158, 11, 0.55), transparent 30%),
    linear-gradient(160deg, #0f6b68 0%, #064e4b 48%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.watch-time {
  font-size: 1.84rem;
  line-height: 1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.watch-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.72);
}

.watch-metrics {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.84);
}

.feature-points {
  display: grid;
  gap: 10px;
}

.feature-point {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.07);
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.feature-point:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 34px rgba(17, 24, 39, 0.1);
}

.feature-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
}

.feature-icon-blue {
  background: var(--color-brand-soft);
  color: var(--color-brand);
}

.feature-icon-green {
  background: #ecfdf3;
  color: #34c759;
}

.feature-icon-purple {
  background: #fff7ed;
  color: var(--color-accent);
}

.feature-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 3px;
}

.feature-card-desc {
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.45;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .feature-panel {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .feature-copy {
    text-align: center;
  }

  .feature-title,
  .feature-desc {
    margin-left: auto;
    margin-right: auto;
  }

  .feature-actions {
    justify-content: center;
  }

  .feature-showcase {
    grid-template-columns: 196px minmax(0, 1fr);
  }

  .watch-orbit {
    width: 196px;
    height: 196px;
  }
}

@media (max-width: 768px) {
  .feature-section {
    padding: 16px 12px;
  }
  
  .feature-panel {
    padding: 26px 18px;
    margin: 24px auto;
    border-radius: 20px;
    width: 100%;
    gap: 24px;
  }

  .feature-badge {
    font-size: 0.72rem;
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 2.04rem;
    margin-bottom: 12px;
    line-height: 1.2;
    padding: 0;
  }

  .feature-desc {
    font-size: 1rem;
    padding: 0;
    line-height: 1.55;
  }

  .feature-actions {
    margin-top: 20px;
  }

  .feature-showcase {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 18px;
  }

  .watch-orbit {
    width: 172px;
    height: 172px;
  }

  .watch-body {
    width: 126px;
    height: 126px;
    border-radius: 50%;
    padding: 9px;
  }

  .watch-screen {
    border-radius: 50%;
    padding: 17px 14px;
  }

  .watch-time {
    font-size: 1.5rem;
  }

  .feature-points {
    width: 100%;
  }

  .feature-point {
    min-height: 72px;
  }
  
}

@media (max-width: 480px) {
  .feature-section {
    padding: 14px 8px;
  }
  
  .feature-panel {
    padding: 22px 14px;
    margin: 16px auto;
    border-radius: 18px;
  }
  
  .feature-title {
    font-size: 1.82rem;
    padding: 0;
  }
  
  .feature-desc {
    font-size: 0.95rem;
    padding: 0;
  }
  
  .feature-actions {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
  
  .feature-cta {
    width: 100%;
  }
  
  .feature-card-title {
    font-size: 0.98rem;
  }
  
  .feature-card-desc {
    font-size: 0.86rem;
  }
}
</style>
