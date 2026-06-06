<template>
  <Teleport to="body">
    <Transition name="smartwatch-code-help">
      <div
        v-if="modelValue"
        class="code-help-overlay"
        role="presentation"
        @click.self="emitClose"
      >
        <section
          ref="dialogRef"
          class="code-help-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="smartwatch-code-help-title"
          tabindex="-1"
          @keydown.esc="emitClose"
        >
          <button class="code-help-close" type="button" :aria-label="t('code.helpClose')" @click="emitClose">
            <el-icon aria-hidden="true"><Close /></el-icon>
          </button>

          <div class="code-help-hero" aria-hidden="true">
            <div class="watch-visual">
              <div class="watch-strap watch-strap-top"></div>
              <div class="watch-face">
                <span class="watch-label">{{ t('code.helpWatchLabel') }}</span>
                <span class="watch-code">123456</span>
              </div>
              <div class="watch-strap watch-strap-bottom"></div>
            </div>
          </div>

          <div class="code-help-copy">
            <p class="code-help-eyebrow">{{ t('code.helpEyebrow') }}</p>
            <h2 id="smartwatch-code-help-title">{{ t('code.helpDialogTitle') }}</h2>
            <p class="code-help-lead">
              {{ t('code.helpLead') }}
            </p>

            <div class="code-help-steps" :aria-label="t('code.helpDetails')">
              <div class="code-help-step">
                <span class="step-icon">
                  <el-icon aria-hidden="true"><Timer /></el-icon>
                </span>
                <div>
                  <strong>{{ t('code.helpStepTrialTitle') }}</strong>
                  <span>{{ t('code.helpStepTrialDesc') }}</span>
                </div>
              </div>
              <div class="code-help-step">
                <span class="step-icon">
                  <el-icon aria-hidden="true"><Unlock /></el-icon>
                </span>
                <div>
                  <strong>{{ t('code.helpStepUnlockedTitle') }}</strong>
                  <span>{{ t('code.helpStepUnlockedDesc') }}</span>
                </div>
              </div>
            </div>

            <button class="code-help-primary" type="button" @click="emitClose">
              {{ t('code.helpGotIt') }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Close, Timer, Unlock } from '@element-plus/icons-vue'
import { useI18n } from '@/i18n'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const { t } = useI18n()

const emitClose = () => {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return
    await nextTick()
    dialogRef.value?.focus()
  },
)
</script>

<style scoped>
.code-help-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.code-help-dialog {
  position: relative;
  width: min(100%, 720px);
  max-height: min(88dvh, 720px);
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(220px, 0.82fr) minmax(0, 1fr);
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow:
    0 34px 90px rgba(15, 23, 42, 0.28),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  outline: none;
}

.code-help-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  color: #475467;
  background: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.code-help-close:hover,
.code-help-close:focus-visible {
  color: #0f172a;
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.code-help-close :deep(svg) {
  width: 20px;
  height: 20px;
}

.code-help-hero {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 24px 0 0 24px;
  background:
    radial-gradient(circle at 28% 22%, rgba(245, 158, 11, 0.24), transparent 12rem),
    radial-gradient(circle at 78% 72%, rgba(15, 107, 104, 0.22), transparent 13rem),
    linear-gradient(160deg, #f8fafc 0%, #e7f3f1 100%);
}

.watch-visual {
  width: 154px;
  display: grid;
  justify-items: center;
  filter: drop-shadow(0 28px 34px rgba(15, 23, 42, 0.22));
}

.watch-strap {
  width: 70px;
  height: 74px;
  background: linear-gradient(180deg, #18202f, #0f172a);
  border-inline: 8px solid rgba(255, 255, 255, 0.07);
}

.watch-strap-top {
  border-radius: 26px 26px 14px 14px;
  margin-bottom: -12px;
}

.watch-strap-bottom {
  border-radius: 14px 14px 26px 26px;
  margin-top: -12px;
}

.watch-face {
  position: relative;
  z-index: 1;
  width: 154px;
  height: 154px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 10px solid #101827;
  border-radius: 46px;
  color: #ecfeff;
  background:
    radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.20), transparent 3rem),
    linear-gradient(145deg, #0f6b68 0%, #0f172a 72%);
  box-shadow:
    0 0 0 5px rgba(15, 23, 42, 0.12),
    0 20px 36px rgba(15, 23, 42, 0.28) inset;
}

.watch-label {
  color: rgba(236, 254, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
}

.watch-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 1.56rem;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.code-help-copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 44px 36px 32px;
}

.code-help-eyebrow {
  margin: 0;
  color: #0f6b68;
  font-size: 0.78rem;
  font-weight: 850;
  text-transform: uppercase;
}

.code-help-copy h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 850;
  line-height: 1;
}

.code-help-lead {
  margin: 0;
  color: #475467;
  font-size: 1rem;
  line-height: 1.65;
}

.code-help-steps {
  display: grid;
  gap: 12px;
}

.code-help-step {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(15, 107, 104, 0.12);
  border-radius: 18px;
  background: rgba(15, 107, 104, 0.055);
}

.step-icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #0f6b68;
  background: rgba(15, 107, 104, 0.11);
}

.step-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.code-help-step strong {
  display: block;
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.35;
}

.code-help-step span:not(.step-icon) {
  display: block;
  margin-top: 4px;
  color: #667085;
  font-size: 0.9rem;
  line-height: 1.45;
}

.code-help-primary {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, #0f6b68 0%, #0b827d 56%, #f59e0b 100%);
  box-shadow:
    0 18px 42px rgba(15, 107, 104, 0.26),
    0 10px 24px rgba(245, 158, 11, 0.20);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 850;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.code-help-primary:hover,
.code-help-primary:focus-visible {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow:
    0 22px 56px rgba(15, 107, 104, 0.30),
    0 16px 34px rgba(245, 158, 11, 0.24);
}

.smartwatch-code-help-enter-active,
.smartwatch-code-help-leave-active {
  transition: opacity 180ms ease;
}

.smartwatch-code-help-enter-active .code-help-dialog,
.smartwatch-code-help-leave-active .code-help-dialog {
  transition: transform 220ms ease, opacity 180ms ease;
}

.smartwatch-code-help-enter-from,
.smartwatch-code-help-leave-to {
  opacity: 0;
}

.smartwatch-code-help-enter-from .code-help-dialog,
.smartwatch-code-help-leave-to .code-help-dialog {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .code-help-close,
  .code-help-primary,
  .smartwatch-code-help-enter-active,
  .smartwatch-code-help-leave-active,
  .smartwatch-code-help-enter-active .code-help-dialog,
  .smartwatch-code-help-leave-active .code-help-dialog {
    transition: none;
  }
}

@media (max-width: 680px) {
  .code-help-overlay {
    align-items: flex-end;
    padding: 12px;
  }

  .code-help-dialog {
    grid-template-columns: 1fr;
    max-height: 92dvh;
    border-radius: 24px;
  }

  .code-help-hero {
    min-height: 190px;
    border-radius: 24px 24px 0 0;
  }

  .watch-visual {
    width: 112px;
    transform: scale(0.78);
  }

  .code-help-copy {
    padding: 26px 18px 18px;
    gap: 14px;
  }

  .code-help-copy h2 {
    padding-right: 42px;
    font-size: 2rem;
  }

  .code-help-step {
    grid-template-columns: 40px minmax(0, 1fr);
    padding: 12px;
  }

  .step-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
