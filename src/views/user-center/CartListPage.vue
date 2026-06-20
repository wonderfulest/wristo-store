<template>
  <div class="cart-page-shell">
    <div class="cart-list-page">
      <CartList />
    </div>

    <PremiumSuiteCard class="cart-premium-suite" />
  </div>
</template>

<script setup lang="ts">
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'
import CartList from './CartList.vue'
</script>

<style scoped>
.cart-page-shell {
  width: min(100% - 32px, 960px);
  margin: 48px auto 88px;
}

.cart-list-page {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 32px;
}

.cart-premium-suite {
  margin-top: 18px;
}

@media (max-width: 640px) {
  .cart-page-shell {
    width: min(100% - 24px, 860px);
    margin: 28px auto 64px;
  }

  .cart-list-page {
    padding: 20px;
  }
}
</style>
