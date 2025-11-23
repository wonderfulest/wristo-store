<template>
  <div class="template-page">
    <div class="template-page-inner">
      <div class="template-page-header">
        <div class="template-page-title">Watch Text Template</div>
        <div class="template-page-subtitle">
          Design the dynamic text that will appear on your watch face using live data variables.
        </div>
      </div>
      <TemplateExamples @select="handleExampleSelect" />
      <TemplateEditor v-model="template" />
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
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 88px 16px 40px;
  background: radial-gradient(circle at top, #e0f2fe 0, #f8fafc 42%, #ffffff 100%);
}

.template-page-inner {
  width: 100%;
  max-width: 1100px;
}

.template-page-header {
  margin-bottom: 20px;
}

.template-page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.template-page-subtitle {
  margin-top: 4px;
  font-size: 0.98rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .template-page {
    padding: 64px 12px 32px;
  }

  .template-page-title {
    font-size: 1.6rem;
  }
}
</style>
