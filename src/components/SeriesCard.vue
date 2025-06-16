<template>
  <div class="series-card" @click="handleClick">
    <div class="relative group">
      <!-- 系列图片 -->
      <div class="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <el-image
          :src="series?.heroFile?.url"
          :alt="series?.name"
          fit="cover"
          class="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>

      <!-- 系列信息 -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-gray-900">
          <a :href="series?.url" target="_blank">
            <span aria-hidden="true" class="absolute inset-0" />
            {{ series?.name }}
          </a>
        </h3>
        <p class="mt-1 text-sm text-gray-500">{{ series?.description }}</p>
      </div>

      <!-- 系列统计 -->
      <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center">
          <el-icon class="mr-1"><Collection /></el-icon>
          <span>{{ series?.productCount }} 个商品</span>
        </div>
        <div class="flex items-center">
          <el-icon class="mr-1"><Download /></el-icon>
          <span>{{ formatDownloadCount(series?.totalDownloads) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Collection, Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  series: any
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
  router.push(`/series/${props.series.id}`)
}
</script>

<style scoped>
.series-card {
  @apply cursor-pointer transition-all duration-300 hover:transform hover:scale-105;
}
</style> 