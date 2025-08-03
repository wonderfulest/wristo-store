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
        <router-link to="/subscription" class="nav-link">Premium</router-link>
        <router-link to="/faq" class="nav-link">FAQ</router-link>
        <router-link to="/code" class="nav-link">Code</router-link>
      </nav>
      <div class="user-area">
        <template v-if="isLoggedIn">
          <router-link 
            v-if="!isSubscribed" 
            to="/subscription" 
            class="upgrade-btn"
          >
            Upgrade to Premium
          </router-link>
          <!-- <div v-else class="subscription-badge">
            <span class="badge-text">{{ subscriptionPlanName }}</span>
            <span class="badge-days">{{ remainingDays }} days left</span>
          </div> -->
          <el-dropdown @command="handleUserMenuCommand" trigger="click">
            <div class="user-avatar-container">
              <img :src="userAvatar" class="user-avatar" alt="user avatar" />
              <span v-if="isSubscribed" class="premium-badge">Premium</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">
                  <el-icon><User /></el-icon>
                  <span>User Info</span>
                </el-dropdown-item>
                <el-dropdown-item command="subscription">
                  <el-icon><Star /></el-icon>
                  <span>Subscription</span>
                </el-dropdown-item>
                <el-dropdown-item command="purchase-records">
                  <el-icon><Document /></el-icon>
                  <span>Purchase Records</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>Logout</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <button class="auth-btn login-btn" @click="goToLogin">
              <span>Sign in</span>
            </button>
            <button class="auth-btn signup-btn" @click="goToSignup">
              <span>Sign Up</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useProductStore } from '@/store/product';
import { useRouter } from 'vue-router';
import { ArrowDown, User, Document, SwitchButton, Star } from '@element-plus/icons-vue';
import type { Series } from '@/types/product';
import { useUserStore } from '@/store/user';

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

// Check if user has an active subscription
const isSubscribed = computed(() => {
  if (!userStore.userInfo?.subscription) return false
  
  const subscription = userStore.userInfo.subscription
  const now = new Date()
  const endTime = new Date(subscription.endTime)
  
  // Check if subscription is still active
  return endTime > now
})

const handleUserMenuCommand = (command: string) => {
  switch (command) {
    case 'info':
      router.push('/user/profile');
      break;
    case 'subscription':
      router.push('/subscription');
      break;
    case 'purchase-records':
      router.push('/user/purchase-records');
      break;
    case 'orders':
      router.push('/user/orders');
      break;
    case 'cart':
      router.push('/user/cart');
      break;
    case 'logout':
      userStore.logout();
      router.push('/');
      break;
  }
};

const goToLogin = () => {
  const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
  const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
  window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`
};

const goToSignup = () => {
  const ssoBaseUrl = import.meta.env.VITE_SSO_SIGNUP_URL
  const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI;
  window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}&mode=signup`;
};

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
  gap: 16px;
  margin-left: 24px;
}

.subscription-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px 16px;
  background: linear-gradient(135deg, #30d158, #28c946);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(48, 209, 88, 0.3);
  transition: all 0.2s ease;
}

.subscription-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(48, 209, 88, 0.4);
}

.badge-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.badge-days {
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}
.user-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.2s ease;
}
.user-avatar-container:hover .user-avatar {
  border-color: #347cff;
  transform: scale(1.05);
}
.premium-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: 16px;
}

.auth-btn {
  position: relative;
  padding: 0 22px;
  height: 36px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  border: 1px solid transparent;
  background: none;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-font-smoothing: antialiased;
}

.auth-btn span {
  position: relative;
  z-index: 1;
  transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  border-radius: 20px;
}

.auth-btn:hover::before {
  opacity: 0.1;
}

.auth-btn:active {
  transform: scale(0.97);
}

.auth-btn:active span {
  transform: scale(0.98);
}

/* Login button */
.login-btn {
  color: #0066CC;
  border-color: #D0D0D0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #A0A0A0;
}

/* Signup button */
.signup-btn {
  background: #0071E3;
  color: white;
  border-color: #0071E3;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.signup-btn:hover {
  background: #0077ED;
  border-color: #0077ED;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.3);
}

.signup-btn:active {
  background: #0062C7;
  border-color: #0062C7;
}
</style>
