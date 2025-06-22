<template>
  <header class="header-bar">
    <div class="header-inner">
      <div class="logo-area">
        <router-link to="/" class="logo-text">WRISTO</router-link>
      </div>
      <nav class="nav-area">
        <router-link to="/" class="nav-link">Home</router-link>
        <el-dropdown @command="handleSelectSeries" trigger="hover">
          <span class="nav-link dropdown-trigger">
            Categories <el-icon style="margin-left: 4px;"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="series in seriesList" :key="series.id" :command="series.slug">
                {{ series.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- <router-link to="/faq" class="nav-link">FAQ</router-link> -->
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/store/product'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import type { Series } from '@/api/product'

const productStore = useProductStore()
const seriesList = ref<Series[]>([])
const router = useRouter()

const loadSeries = async () => {
  seriesList.value = await productStore.getSeries()
}

const handleSelectSeries = (slug: string) => {
  router.push(`/categories/${slug}`)
}

onMounted(() => {
  loadSeries()
})
</script>

<style scoped>
.header-bar {
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 20;
}
.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
}
.logo-area .logo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  letter-spacing: 6px;
  text-decoration: none;
}
.nav-area {
  display: flex;
  gap: 32px;
}
.nav-link {
  color: #222;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #347cff;
}
.dropdown-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style> 