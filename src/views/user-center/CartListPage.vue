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
  width: min(100% - 32px, 860px);
  margin: 48px auto 88px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 32px;
}

@media (max-width: 640px) {
  .cart-list-page {
    width: min(100% - 24px, 860px);
    margin: 28px auto 64px;
    padding: 20px;
  }
}
</style> 
