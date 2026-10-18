<template>
  <a :href="FACEBOOK_PAGE_URL" target="_blank" rel="noopener noreferrer" class="facebook-link">
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 8.6V7.2c0-1 .8-1.8 1.8-1.8H18V3h-2.8A4.2 4.2 0 0 0 11 7.2v1.4H8.5V11H11v10h3V11h3l.8-2.4H14Z" fill="currentColor" />
    </svg>
    <slot>Facebook</slot>
  </a>
</template>

<script setup lang="ts">
import { FACEBOOK_PAGE_URL } from '@/config/social'
</script>

<style scoped>
.facebook-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  color: inherit;
}
.facebook-link svg {
  flex-shrink: 0;
}
</style>
