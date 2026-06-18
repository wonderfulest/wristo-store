<template>
  <div class="template-page">
    <div class="template-page-inner">
      <div class="template-page-header">
        <div class="template-page-copy">
          <div class="template-page-badge">Wristo text templates</div>
          <h1 class="template-page-title">Watch Text Template</h1>
          <p class="template-page-subtitle">
            Design the dynamic text that will appear on your watch face using live data variables.
          </p>
        </div>
        <div class="template-page-metrics" aria-label="Template editor highlights">
          <span>Live preview</span>
          <span>Cursor insert</span>
          <span>Garmin data</span>
        </div>
      </div>
      <div class="template-example-shell" aria-label="Template examples">
        <TemplateExamples @select="handleExampleSelect" />
      </div>
      <div class="template-editor-shell">
        <TemplateEditor v-model="template" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
import TemplateExamples from '@/views/home/components/TemplateExamples.vue'

const template = ref('your heart beat is {{hr}}, today walk {{steps}} steps.')

const handleExampleSelect = (value: string) => {
  template.value = value
}
</script>

<style scoped>
.template-page {
  min-height: 100dvh;
  width: 100%;
  padding: 104px 16px 56px;
  background:
    radial-gradient(circle at 16% 4%, rgba(15, 107, 104, 0.13), transparent 24rem),
    radial-gradient(circle at 88% 14%, rgba(245, 158, 11, 0.16), transparent 22rem),
    linear-gradient(180deg, #fbfdfc 0%, var(--color-canvas) 58%, #ffffff 100%);
}

.template-page-inner {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
}

.template-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.template-page-copy {
  max-width: 720px;
}

.template-page-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  margin-bottom: 14px;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.12);
  background: rgba(15, 107, 104, 0.1);
  color: var(--color-brand-strong);
  font-size: 0.78rem;
  font-weight: 800;
}

.template-page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.35rem, 5vw, 4.3rem);
  line-height: 1.02;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: 0;
}

.template-page-subtitle {
  margin: 14px 0 0;
  max-width: 620px;
  font-size: 1.04rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.template-page-metrics {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 360px;
}

.template-page-metrics span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--color-brand-strong);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 107, 104, 0.13);
  box-shadow: var(--shadow-sm);
  font-size: 0.82rem;
  font-weight: 800;
}

.template-example-shell {
  position: relative;
  height: 172px;
  margin: 2px 0 22px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(15, 107, 104, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(238, 245, 243, 0.42));
}

.template-editor-shell {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .template-page {
    padding: 82px 12px 36px;
  }

  .template-page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }

  .template-page-metrics {
    justify-content: flex-start;
  }

  .template-example-shell {
    height: 156px;
    border-radius: 20px;
    margin-bottom: 18px;
  }
}
</style>
