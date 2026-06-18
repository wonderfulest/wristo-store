<template>
  <svg
    class="base-icon"
    :class="`base-icon-${name}`"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'chat'">
      <path d="M7.5 18.25L4.75 20.5V7.25C4.75 4.9 6.65 3 9 3H15C17.35 3 19.25 4.9 19.25 7.25V14C19.25 16.35 17.35 18.25 15 18.25H7.5Z" />
      <path d="M8.5 9H15.5" />
      <path d="M8.5 12.25H13.25" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M7.25 7.25L16.75 16.75" />
      <path d="M16.75 7.25L7.25 16.75" />
    </template>
    <template v-else-if="name === 'send'">
      <path d="M4.75 4.75L20 12L4.75 19.25L7.5 12L4.75 4.75Z" />
      <path d="M7.75 12H20" />
    </template>
    <template v-else-if="name === 'external'">
      <path d="M10 6.25H6.75C5.65 6.25 4.75 7.15 4.75 8.25V17.25C4.75 18.35 5.65 19.25 6.75 19.25H15.75C16.85 19.25 17.75 18.35 17.75 17.25V14" />
      <path d="M13.25 4.75H19.25V10.75" />
      <path d="M19 5L11.75 12.25" />
    </template>
    <template v-else-if="name === 'search'">
      <path d="M10.75 17.25C14.34 17.25 17.25 14.34 17.25 10.75C17.25 7.16 14.34 4.25 10.75 4.25C7.16 4.25 4.25 7.16 4.25 10.75C4.25 14.34 7.16 17.25 10.75 17.25Z" />
      <path d="M15.5 15.5L19.75 19.75" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M4 5.25H5.85L7.35 15.25H17.25C18.2 15.25 19 14.59 19.2 13.66L20.25 8.75H6.4" />
      <path d="M9 19.25H9.01" />
      <path d="M16.5 19.25H16.51" />
    </template>
    <template v-else-if="name === 'user'">
      <path d="M12 12.25C14.21 12.25 16 10.46 16 8.25C16 6.04 14.21 4.25 12 4.25C9.79 4.25 8 6.04 8 8.25C8 10.46 9.79 12.25 12 12.25Z" />
      <path d="M5.75 19.75C6.68 17.26 9.08 15.5 12 15.5C14.92 15.5 17.32 17.26 18.25 19.75" />
    </template>
    <template v-else-if="name === 'watch'">
      <path d="M9 4.25H15L16 7.25V16.75L15 19.75H9L8 16.75V7.25L9 4.25Z" />
      <path d="M8 8.25H16" />
      <path d="M8 15.75H16" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M5.5 12.5L10 17L18.5 7" />
    </template>
    <template v-else-if="name === 'info'">
      <path d="M12 20.25C16.56 20.25 20.25 16.56 20.25 12C20.25 7.44 16.56 3.75 12 3.75C7.44 3.75 3.75 7.44 3.75 12C3.75 16.56 7.44 20.25 12 20.25Z" />
      <path d="M12 10.75V16" />
      <path d="M12 8H12.01" />
    </template>
    <template v-else-if="name === 'warning'">
      <path d="M10.3 5.7L3.75 17.25C3.2 18.22 3.9 19.42 5.02 19.42H18.98C20.1 19.42 20.8 18.22 20.25 17.25L13.7 5.7C13.08 4.6 10.92 4.6 10.3 5.7Z" />
      <path d="M12 9.75V13.25" />
      <path d="M12 16.25H12.01" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name:
    | 'chat'
    | 'close'
    | 'send'
    | 'external'
    | 'search'
    | 'cart'
    | 'user'
    | 'watch'
    | 'arrow-right'
    | 'check'
    | 'info'
    | 'warning'
  size?: number | string
}>()
</script>

<style scoped>
.base-icon {
  display: block;
  flex: 0 0 auto;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
</style>
