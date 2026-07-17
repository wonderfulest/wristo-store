<template>
  <main class="cart-page-shell commerce-page">
    <div class="cart-list-page commerce-panel">
      <CartList />
    </div>

    <PremiumSuiteCard class="cart-premium-suite" />
  </main>
</template>

<script setup lang="ts">
import PremiumSuiteCard from '@/components/PremiumSuiteCard.vue'
import CartList from './CartList.vue'
</script>

<style scoped>
.cart-page-shell {
  --commerce-page-width: 1180px;
  --commerce-page-padding-block: 0;
  --commerce-page-gutter: 16px;
  --commerce-page-mobile-padding-block: 0;
  --commerce-page-mobile-gutter: 12px;
  margin: 48px auto 88px;
}

.cart-list-page {
  --commerce-panel-background: rgba(255, 255, 255, 0.92);
  --commerce-panel-border: 1px solid var(--color-line);
  --commerce-panel-radius: var(--radius-lg);
  --commerce-panel-shadow: var(--shadow-md);
  padding: 32px;
}

.cart-premium-suite {
  margin-top: 18px;
}

@media (max-width: 640px) {
  .cart-page-shell {
    --commerce-page-width: 860px;
    --commerce-page-mobile-gutter: 12px;
    margin: 28px auto 64px;
  }

  .cart-list-page {
    padding: 20px;
  }
}
</style>
