<template>
  <footer class="footer">
    © 2025 Wristo. <a href="/terms-and-conditions">Terms of Use</a>. <a href="/privacy-policy">Privacy Policy</a>.
    <!-- Wristo is not affiliated with Garmin. -->
    <slot />
  </footer>
</template>

<script setup lang="ts">
// 通用 Footer 组件，无需特殊逻辑
</script>

<style scoped>
.footer {
  margin-top: 32px;
  color: #888;
  font-size: 0.98rem;
}
.footer a {
  color: #888;
  text-decoration: underline;
  margin: 0 4px;
}
</style> 