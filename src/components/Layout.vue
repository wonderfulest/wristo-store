<template>
  <div class="layout-root">
    <Header />
    <main
      class="layout-main"
      :class="{ 'layout-main--content-sized': contentSizedMain }"
    >
      <slot />
    </main>
    <FloatingActions
      always-visible
      :show-page-actions="showFloatingActions"
    />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'
import FloatingActions from '@/components/FloatingActions/FloatingActions.vue'

const route = useRoute()

const showFloatingActions = computed(() => route.meta.showFloatingActions === true)
const contentSizedMain = computed(() => route.meta.contentSizedMain === true)
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-canvas);
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  scroll-padding-top: var(--header-height);
}
.layout-main {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout-main--content-sized {
  flex: 0 0 auto;
}

</style> 
