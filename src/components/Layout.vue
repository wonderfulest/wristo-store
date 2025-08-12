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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.layout-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 移动端宽度修复 */
@media (max-width: 768px) {
  .layout-root {
    width: 100vw;
    max-width: 100vw;
    min-width: 100vw;
    overflow-x: hidden;
    position: relative;
  }
  
  .layout-main {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    contain: layout style;
  }
}

/* 全局重置，防止子元素溢出 */
.layout-root * {
  box-sizing: border-box;
}

/* 确保所有子元素不超出容器宽度 */
.layout-root *:not(svg):not(path) {
  max-width: 100%;
}
</style> 