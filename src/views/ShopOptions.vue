<template>
  <div class="shop-options">
    <Logo />
    <h2 class="title">Decision Time</h2>
    <p class="desc">Looks like this creator has some options for you:</p>
    <div class="options">
      <!-- Bundle 卡片 -->
      <template v-for="product in products" :key="product.productId">
        <div v-if="product.isBundle" class="option-card">
          <div class="discount-badge" v-if="product.discount">{{ product.discount }}</div>
          <div class="images">
            <img v-for="item in product.products" :key="item.productId" :src="item.imageUrl" :alt="item.productName" />
          </div>
          <h3>{{ product.productName }}</h3>
          <div class="license">Lifetime License</div>
          <div class="author">By {{ product.merchantName }}</div>
          <ul class="features">
            <li v-if="product.productDescription">{{ product.productDescription }}</li>
            <li v-if="product.website">😈 Website: <a :href="product.website" target="_blank">{{ product.website }}</a></li>
            <li v-if="product.bundleContent">📦 {{ product.bundleContent }}</li>
            <li v-if="product.limitedOffer">⏰ {{ product.limitedOffer }}</li>
            <li v-if="product.newFaceTip">➕ {{ product.newFaceTip }}</li>
          </ul>
          <button class="buy-btn" @click="handleBuy(product)">
            Buy for <del v-if="product.originalPrice">${{ product.originalPrice }}</del> ${{ product.price }}
          </button>
        </div>
        <!-- 单品卡片 -->
        <div v-else class="option-card">
          <div class="images single">
            <img :src="product.imageUrl" :alt="product.productName" />
          </div>
          <h3>{{ product.productName }}</h3>
          <div class="license">Lifetime License</div>
          <div class="author">By {{ product.merchantName }}</div>
          <div class="features">{{ product.productDescription }}</div>
          <button class="buy-btn" @click="handleBuy(product)">Buy for ${{ product.price }}</button>
        </div>
      </template>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useShopOptionsStore } from '@/store/shopOptions'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import Footer from '@/components/Footer.vue'
import Logo from '@/components/Logo.vue'

interface Product {
  productName: string
  productDescription: string
  productId: number
  isBundle: boolean
  merchantName: string
  price: number
  imageUrl: string
  licenseValidityDurationInDays: number | null
  appId: number
  allowTipping: boolean | null
  bundleContent: string | null
  products?: Product[]
  discount?: string
  website?: string
  limitedOffer?: string
  newFaceTip?: string
  originalPrice?: number
}

const store = useShopOptionsStore()
const router = useRouter()
const products = computed(() => store.data?.products || [])

function handleBuy(product: Product) {
  store.selectedProduct = product // 你需要在 store 里加 selectedProduct 字段
  router.push({ name: 'Checkout' })
}
</script>

<style scoped>
.shop-options {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px 0 16px;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}
.logo {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.logo span {
  color: #6fcf97;
}
.title {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.desc {
  color: #444;
  margin-bottom: 2rem;
}
.options {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.option-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 #0001;
  padding: 28px 20px 20px 20px;
  width: 320px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.discount-badge {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  background: #e63946;
  color: #fff;
  font-weight: bold;
  border-radius: 12px;
  padding: 4px 18px;
  font-size: 1rem;
  box-shadow: 0 2px 8px #e6394633;
}
.images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}
.images img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
  background: #fafafa;
}
.images.single img {
  width: 80px;
  height: 80px;
}
h3 {
  margin: 10px 0 4px 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.license {
  background: #ffb703;
  color: #222;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 2px 10px;
  display: inline-block;
  margin-bottom: 4px;
}
.author {
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 8px;
}
.features {
  text-align: left;
  margin: 0 0 16px 0;
  padding: 0 0 0 18px;
  color: #444;
  font-size: 0.98rem;
}
.features li {
  margin-bottom: 4px;
}
.buy-btn {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.buy-btn:hover {
  background: #40916c;
}
del {
  color: #888;
  margin-right: 4px;
}
</style> 