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
            Categories
            <el-icon style="margin-left: 4px"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="series in seriesList"
                :key="series.id"
                :command="series.slug"
              >
                {{ series.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <router-link to="/faq" class="nav-link">FAQ</router-link>
      </nav>
      <div class="user-area">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleUserMenuCommand" trigger="click">
            <img :src="userAvatar" class="user-avatar" alt="user avatar" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">User Info</el-dropdown-item>
                <!-- <el-dropdown-item command="orders">Order History</el-dropdown-item> -->
                <!-- <el-dropdown-item command="cart">Cart</el-dropdown-item> -->
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="login-btn" @click="goToLogin">Login</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useProductStore } from "@/store/product";
import { useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
import type { Series } from "@/types";
import { useUserStore } from '@/store/user'

const productStore = useProductStore();
const seriesList = ref<Series[]>([]);
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = ref(false);
const userAvatar = ref('https://via.placeholder.com/32');

const loadSeries = async () => {
  seriesList.value = await productStore.getSeries();
};

const handleSelectSeries = (slug: string) => {
  router.push(`/categories/${slug}`);
};

const updateUserInfo = () => {
  isLoggedIn.value = !!userStore.userInfo;
  userAvatar.value = userStore.userInfo?.avatar || 'https://via.placeholder.com/32';
};

const goToLogin = () => {
  const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
  const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
  window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`
};


const handleUserMenuCommand = (command: string) => {
  if (command === 'info') {
    router.push('/user/profile')
  } else if (command === 'orders') {
    router.push('/user/orders')
  } else if (command === 'cart') {
    router.push('/user/cart')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/')
  }
}

onMounted(() => {
  loadSeries();
  updateUserInfo();
});

// 监听 userInfo 变化
watch(() => userStore.userInfo, updateUserInfo, { immediate: true });
</script>

<style scoped>
.header-bar {
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
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
.user-area {
  display: flex;
  align-items: center;
  margin-left: 24px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
.login-btn {
  background: #347cff;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 6px 18px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #245bb5;
}
</style>
