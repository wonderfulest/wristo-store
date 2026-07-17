<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>

<template>
  <div class="product-grid-skeleton" aria-hidden="true">
    <div v-for="item in count" :key="item" class="product-grid-skeleton__card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="circle" class="product-grid-skeleton__image" />
          <el-skeleton-item variant="h3" class="product-grid-skeleton__title" />
          <el-skeleton-item variant="text" class="product-grid-skeleton__meta" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style scoped>
.product-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-5);
}

.product-grid-skeleton__card {
  padding: var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--surface-raised);
}

.product-grid-skeleton__image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
}

.product-grid-skeleton__title {
  display: block;
  width: 74%;
  margin-top: var(--space-4);
}

.product-grid-skeleton__meta {
  display: block;
  width: 48%;
  margin-top: var(--space-2);
}

@media (max-width: 1200px) {
  .product-grid-skeleton { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .product-grid-skeleton { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 600px) {
  .product-grid-skeleton {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}
</style>
