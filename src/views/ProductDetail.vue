<template>
  <div class="product-detail">
    <div class="container mx-auto px-4 py-20">
      <div class="flex flex-col lg:flex-row gap-[50px] lg:gap-[100px]">
        <!-- 左侧商品图片 -->
        <div class="w-full md:w-auto flex-[1.5] max-w-[500px] lg:max-w-full mx-auto lg:mx-0">
          <div class="relative w-96 h-96 max-w-full mx-auto overflow-hidden rounded-full bg-white flex items-center justify-center">
            <el-image
              :src="product?.heroFile?.url"
              :alt="product?.heroFile?.name"
              fit="contain"
              class="w-full h-full"
            />
          </div>
        </div>

        <!-- 右侧商品信息 -->
        <div class="flex-[1] py-3">
          <!-- 商品标题 -->
          <div class="text-[34px] font-semibold mb-2 leading-tight">
            {{ product?.name }}
          </div>

          <!-- 商品副标题 -->
          <div class="text-lg font-semibold mb-5">
            {{ product?.description }}
          </div>

          <!-- 商品价格 -->
          <div class="flex items-center">
            <p class="mr-2 text-lg font-semibold">
              ¥{{ product?.price }}
            </p>
            <template v-if="product?.original_price">
              <p class="text-base font-medium line-through">
                ¥{{ product?.original_price }}
              </p>
              <p class="ml-auto text-base font-medium text-green-500">
                {{ getDiscountedPricePercentage(product?.original_price, product?.price) }}% 优惠
              </p>
            </template>
          </div>

          <!-- 下载按钮 -->
          <el-button
            type="primary"
            class="w-full py-4 mt-10 mb-4"
            @click="handleDownload"
          >
            <el-icon class="mr-2"><Download /></el-icon>
            下载
          </el-button>

          <!-- 试用解锁按钮 -->
          <el-button
            class="w-full py-4 mb-10"
            @click="handleUnlock"
          >
            <el-icon class="mr-2"><Unlock /></el-icon>
            解锁试用
          </el-button>

          <!-- 商品详情 -->
          <div class="mt-10">
            <div class="text-lg font-bold mb-5">商品详情</div>
            <div class="prose max-w-none" v-html="product?.description"></div>
          </div>
        </div>
      </div>

      <!-- 相关商品 -->
      <div class="mt-20">
        <h2 class="text-2xl font-bold mb-8">相关商品</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <product-card
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Download, Unlock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/store/product'

const route = useRoute()
const productStore = useProductStore()
const product = ref(null)
const relatedProducts = ref([])

const getDiscountedPricePercentage = (originalPrice: number, currentPrice: number) => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

const handleDownload = () => {
  if (product.value?.garminStoreUrl) {
    window.open(product.value.garminStoreUrl, '_blank')
  } else {
    ElMessage.error('下载链接不可用')
  }
}

const handleUnlock = () => {
  window.open('https://pay.wristo.io/code', '_blank')
}

onMounted(async () => {
  const productId = route.params.id
  if (productId) {
    // 获取商品详情
    product.value = await productStore.getProductDetail(productId)
    // 获取相关商品
    relatedProducts.value = await productStore.getRelatedProducts(productId)
  }
})
</script>

<style scoped>
.prose {
  @apply text-gray-600 leading-relaxed;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4) {
  @apply font-bold text-gray-900 mb-4;
}

.prose :deep(p) {
  @apply mb-4;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply mb-4 pl-6;
}

.prose :deep(li) {
  @apply mb-2;
}
</style> 