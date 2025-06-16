<template>
  <!-- <div class="logo">
    <span class="logo-bold">Wristo<span class="logo-green">Io</span></span>
    <slot />
  </div> -->
  <div>
  <img src="/logo.svg"/></div>
</template>

<script setup lang="ts">
// 通用 Logo 组件，无需特殊逻辑
</script>

<style scoped>
.logo {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #191919;
  text-align: center;
}
.logo-bold {
  font-weight: 700;
}
.logo-green {
  color: #6fcf97;
}
</style> 