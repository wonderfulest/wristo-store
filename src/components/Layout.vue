<template>
  <div class="layout-root">
    <Header />
    <main class="layout-main">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}
.layout-main {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}
</style> 