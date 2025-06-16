<template>
  <div class="product-card" @click="handleClick">
    <div class="relative group">
      <!-- 商品图片 -->
      <div class="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <el-image
          :src="product?.heroFile?.url"
          :alt="product?.name"
          fit="cover"
          class="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>

      <!-- 商品信息 -->
      <div class="mt-4 flex justify-between">
        <div>
          <h3 class="text-sm text-gray-700">
            <a :href="product?.garminStoreUrl" target="_blank">
              <span aria-hidden="true" class="absolute inset-0" />
              {{ product?.name }}
            </a>
          </h3>
          <p class="mt-1 text-sm text-gray-500">{{ product?.description }}</p>
        </div>
        <p class="text-sm font-medium text-gray-900">¥{{ product?.price }}</p>
      </div>

      <!-- 下载量 -->
      <div class="mt-2 flex items-center text-sm text-gray-500">
        <el-icon class="mr-1"><Download /></el-icon>
        <span>{{ formatDownloadCount(product?.download) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  product: any
}>()

const router = useRouter()

const formatDownloadCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count
}

const handleClick = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.product-card {
  @apply cursor-pointer transition-all duration-300 hover:transform hover:scale-105;
}
</style> 