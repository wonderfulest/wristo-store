<template>
  <div class="cart-list-page">
    <CartList />
  </div>
</template>

<script setup lang="ts">
import CartList from './CartList.vue'
</script>

<style scoped>
.cart-list-page {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 32px 24px;
}
</style> 