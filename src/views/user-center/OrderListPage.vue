<template>
  <div class="order-list-page">
    <OrderList />
  </div>
</template>

<script setup lang="ts">
import OrderList from './OrderList.vue'
</script>

<style scoped>
.order-list-page {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 32px 24px;
}
</style> 