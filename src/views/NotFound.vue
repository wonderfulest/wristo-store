<template>
  <main class="not-found" aria-labelledby="not-found-title">
    <section class="nf-shell">
      <div class="nf-copy">
        <router-link class="nf-logo-link" :to="homePath" aria-label="Wristo home">
          <Logo />
        </router-link>

        <span class="nf-eyebrow">
          <Icon icon="solar:compass-bold-duotone" width="19" height="19" aria-hidden="true" />
          404
        </span>

        <h1 id="not-found-title" class="nf-title">{{ t('notFound.title') }}</h1>
        <p class="nf-desc">{{ t('notFound.desc') }}</p>

        <div class="nf-actions" aria-label="404 navigation actions">
          <button class="nf-btn primary" type="button" @click="goHome">
            {{ t('notFound.home') }}
            <Icon icon="solar:arrow-right-up-linear" width="20" height="20" aria-hidden="true" />
          </button>
          <button class="nf-btn secondary" type="button" @click="goContact">
            <Icon icon="solar:letter-linear" width="20" height="20" aria-hidden="true" />
            {{ t('notFound.contact') }}
          </button>
        </div>
      </div>

      <div class="nf-visual" aria-hidden="true">
        <div class="watch-face">
          <div class="watch-ring">
            <span class="watch-time">04:04</span>
            <span class="watch-label">Route lost</span>
            <div class="watch-dial">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div class="nf-mini-card card-top">
          <Icon icon="solar:watch-round-linear" width="20" height="20" />
          <span>Wristo</span>
        </div>
        <div class="nf-mini-card card-bottom">
          <Icon icon="solar:map-arrow-right-linear" width="20" height="20" />
          <span>Back on track</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Logo from '@/components/Logo.vue'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useI18n } from '@/i18n'

const router = useRouter()
const localeStore = useLocaleStore()
const { t } = useI18n()

const homePath = computed(() => addLocaleToPath('/', localeStore.currentLocale))

function goHome() {
  router.push(homePath.value)
}

function goContact() {
  router.push(addLocaleToPath('/contact', localeStore.currentLocale))
}
</script>

<style scoped>
.not-found {
  width: 100%;
  min-height: calc(100vh - 64px - 58px);
  padding: 28px 0 48px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(560px 320px at 10% 4%, rgba(245, 158, 11, 0.14), transparent 70%),
    radial-gradient(640px 360px at 90% 8%, rgba(15, 107, 104, 0.16), transparent 70%),
    linear-gradient(180deg, #fbfdfc 0%, var(--color-canvas) 100%);
}

.nf-shell {
  width: min(var(--container), calc(100% - 32px));
  min-height: 520px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.82fr);
  align-items: center;
  gap: 28px;
  position: relative;
  overflow: hidden;
  padding: 54px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-line);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 250, 0.84) 48%, rgba(223, 245, 241, 0.84) 100%);
  box-shadow:
    var(--shadow-lg),
    0 1px 0 rgba(255, 255, 255, 0.76) inset;
}

.nf-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.7) 44%, rgba(255, 255, 255, 0.24) 100%),
    radial-gradient(620px 360px at 80% 50%, rgba(15, 107, 104, 0.13), transparent 66%);
}

.nf-shell > * {
  position: relative;
  z-index: 1;
}

.nf-copy {
  max-width: 640px;
}

.nf-logo-link {
  display: inline-flex;
  align-items: center;
  width: 132px;
  margin-bottom: 22px;
  color: inherit;
}

.nf-logo-link :deep(.logo) {
  width: 100%;
  height: auto;
  display: block;
}

.nf-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: rgba(223, 245, 241, 0.76);
  border: 1px solid rgba(15, 107, 104, 0.14);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nf-title {
  max-width: 620px;
  margin: 18px 0 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(3.1rem, 6vw, 6.1rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: 0;
}

.nf-desc {
  max-width: 500px;
  margin: 18px 0 0;
  color: #475467;
  font-size: clamp(1.03rem, 1.3vw, 1.18rem);
  line-height: 1.62;
}

.nf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.nf-btn {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background 180ms ease;
}

.nf-btn.primary {
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  border-color: transparent;
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.24);
}

.nf-btn.secondary {
  color: var(--color-brand-strong);
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(15, 107, 104, 0.16);
}

.nf-btn:hover {
  transform: translateY(-2px);
}

.nf-btn.primary:hover {
  box-shadow: 0 20px 40px rgba(15, 107, 104, 0.3);
}

.nf-btn.secondary:hover {
  border-color: rgba(15, 107, 104, 0.3);
  box-shadow: var(--shadow-sm);
}

.nf-visual {
  min-height: 390px;
  display: grid;
  place-items: center;
  position: relative;
}

.watch-face {
  width: min(100%, 360px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 36px;
  background:
    linear-gradient(145deg, #12211f 0%, #0a1514 100%);
  box-shadow:
    0 28px 70px rgba(17, 24, 39, 0.18),
    0 0 0 12px rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.watch-ring {
  width: 76%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  border-radius: 50%;
  color: #ffffff;
  background:
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2), transparent 35%),
    conic-gradient(from 220deg, rgba(245, 158, 11, 0.94), rgba(15, 107, 104, 0.92), rgba(223, 245, 241, 0.42), rgba(245, 158, 11, 0.94));
  box-shadow: inset 0 0 0 18px #0d1a18;
}

.watch-time {
  font-size: clamp(2.6rem, 5vw, 4.8rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
}

.watch-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.watch-dial {
  width: 88px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 10px;
}

.watch-dial span {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.watch-dial span:nth-child(2) {
  background: var(--color-accent);
}

.nf-mini-card {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 13px;
  border-radius: 999px;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 0.9rem;
  font-weight: 800;
}

.card-top {
  top: 28px;
  left: 10px;
}

.card-bottom {
  right: 0;
  bottom: 42px;
}

@media (max-width: 1024px) {
  .nf-shell {
    grid-template-columns: 1fr;
    padding: 44px;
  }

  .nf-visual {
    min-height: 330px;
  }

  .watch-face {
    width: min(100%, 320px);
  }
}

@media (max-width: 640px) {
  .not-found {
    padding: 14px 0 132px;
    place-items: start center;
  }

  .nf-shell {
    width: calc(100% - 24px);
    min-height: 0;
    padding: 28px 20px 22px;
    border-radius: var(--radius-md);
    gap: 22px;
  }

  .nf-logo-link {
    width: 112px;
    margin-bottom: 18px;
  }

  .nf-title {
    font-size: clamp(2.65rem, 14vw, 3.55rem);
  }

  .nf-desc {
    font-size: 1rem;
  }

  .nf-actions {
    flex-direction: column;
  }

  .nf-btn {
    width: 100%;
  }

  .nf-visual {
    min-height: 250px;
  }

  .watch-face {
    width: min(100%, 240px);
    border-radius: 28px;
    box-shadow:
      0 20px 46px rgba(17, 24, 39, 0.16),
      0 0 0 8px rgba(255, 255, 255, 0.68);
  }

  .watch-ring {
    box-shadow: inset 0 0 0 13px #0d1a18;
  }

  .nf-mini-card {
    min-height: 34px;
    padding: 7px 10px;
    font-size: 0.82rem;
  }

  .card-top {
    top: 6px;
    left: 0;
  }

  .card-bottom {
    right: 0;
    bottom: 38px;
  }
}
</style>
