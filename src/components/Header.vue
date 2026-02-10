<template>
  <header class="header-bar">
    <div class="header-inner">
      <div class="logo-area">
        <router-link to="/" class="logo-text">WRISTO</router-link>
      </div>
      
      <!-- Mobile menu button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Desktop navigation -->
      <nav class="nav-area desktop-nav">
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
        <!-- <router-link to="/faq" class="nav-link">FAQ</router-link> -->
        <router-link to="/code" class="nav-link">Code</router-link>
        <!-- <router-link to="/top" class="nav-link">Top</router-link> -->
        <router-link to="/blog" class="nav-link">Blog</router-link>
      </nav>
      
      <!-- Current Device Display -->
      <DeviceDisplay 
        :selected-device="selectedDevice" 
        class="current-device-display" 
        @select-device="handleDeviceSelect"
        @device-selected="onDeviceSelected"
      />
      
      <!-- Desktop user area -->
      <div class="user-area desktop-user">
        <template v-if="isLoggedIn">
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
                <el-dropdown-item command="purchase-records">
                  <el-icon><Document /></el-icon>
                  <span>Purchases</span>
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
              <span>Sign In</span>
            </button>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Mobile navigation menu -->
    <div class="mobile-nav" :class="{ open: isMobileMenuOpen }">
      <div class="mobile-nav-content">
        <div class="mobile-nav-links">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">Home</router-link>
          <div class="mobile-dropdown">
            <button class="mobile-dropdown-trigger centered" @click="toggleCategoriesDropdown">
              <span class="dropdown-text">Categories</span>
              <el-icon :class="{ rotated: isCategoriesOpen }"><arrow-down /></el-icon>
            </button>
            <div class="mobile-dropdown-content" :class="{ open: isCategoriesOpen }">
              <router-link 
                v-for="series in seriesList"
                :key="series.id"
                :to="`/categories/${series.slug}`"
                class="mobile-dropdown-link"
                @click="closeMobileMenu"
              >
                {{ series.name }}
              </router-link>
            </div>
          </div>
          <!-- <router-link to="/faq" class="mobile-nav-link" @click="closeMobileMenu">FAQ</router-link> -->
          <router-link to="/code" class="mobile-nav-link" @click="closeMobileMenu">Code</router-link>
          <router-link to="/top" class="mobile-nav-link" @click="closeMobileMenu">Top</router-link>
          
          <!-- Mobile Device Display -->
          <DeviceDisplay 
            :selected-device="selectedDevice" 
            :is-mobile="true" 
            @select-device="handleDeviceSelect"
            @device-selected="onDeviceSelected"
          />
        </div>
        
        <template v-if="!isLoggedIn">
          <div class="mobile-auth-buttons-top">
            <button class="mobile-auth-btn login" @click="handleMobileLogin">
              Sign In
            </button>
          </div>
        </template>
        
        <div class="mobile-user-area">
          <template v-if="isLoggedIn">
            <div class="mobile-user-info">
              <div class="mobile-avatar-container">
                <img :src="userAvatar" class="mobile-user-avatar" alt="user avatar" />
                <span v-if="isSubscribed" class="mobile-premium-badge">Premium</span>
              </div>
            </div>
            <div class="mobile-user-actions">
              <button class="mobile-action-btn" @click="handleUserMenuCommand('info'); closeMobileMenu()">
                <el-icon><User /></el-icon>
                <span>User Info</span>
              </button>
              <button class="mobile-action-btn" @click="handleUserMenuCommand('purchase-records'); closeMobileMenu()">
                <el-icon><Document /></el-icon>
                <span>Purchases</span>
              </button>
              <button class="mobile-action-btn logout" @click="handleUserMenuCommand('logout'); closeMobileMenu()">
                <el-icon><SwitchButton /></el-icon>
                <span>Logout</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu overlay -->
    <div class="mobile-overlay" :class="{ active: isMobileMenuOpen }" @click="closeMobileMenu"></div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useProductStore } from '@/store/product';
import { useRouter } from 'vue-router';
import { ArrowDown, User, Document, SwitchButton } from '@element-plus/icons-vue';
import type { Series } from '@/types/product';
import { useUserStore } from '@/store/user';
import type { GarminDeviceVO } from '@/types';
import DeviceDisplay from './DeviceDisplay.vue';

const productStore = useProductStore();
const seriesList = ref<Series[]>([]);
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = ref(false);
const userAvatar = ref('https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png');

// Mobile menu state
const isMobileMenuOpen = ref(false);
const isCategoriesOpen = ref(false);

// Device selection state
const selectedDevice = ref<GarminDeviceVO | null>(null);

const loadSeries = async () => {
  seriesList.value = await productStore.getSeries();
};

const handleSelectSeries = (slug: string) => {
  router.push(`/categories/${slug}`);
};

const updateUserInfo = () => {
  isLoggedIn.value = !!userStore.userInfo;
  userAvatar.value = userStore.userInfo?.avatar || 'https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png';
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
  const loginUrl = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`
  
  // 移动端兼容性更好的跳转方式
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    // 移动端使用延迟跳转
    setTimeout(() => {
      window.location.replace(loginUrl)
    }, 100)
  } else {
    window.location.href = loginUrl
  }
};

// signup 已不再需要，移动端和桌面统一走登录入口（支持 Google / 邮箱验证码）

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
    isCategoriesOpen.value = false;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
  isCategoriesOpen.value = false;
};

const toggleCategoriesDropdown = () => {
  isCategoriesOpen.value = !isCategoriesOpen.value;
};

// Mobile auth functions
const handleMobileLogin = () => {
  closeMobileMenu();
  goToLogin();
};

onMounted(() => {
  loadSeries();
  updateUserInfo();
});

// 监听 userInfo 变化
watch(() => userStore.userInfo, updateUserInfo, { immediate: true });

// Device selection methods
const selectDevice = (device: GarminDeviceVO) => {
  selectedDevice.value = device;
};

const clearSelectedDevice = () => {
  selectedDevice.value = null;
};

// Handle device selection
const handleDeviceSelect = () => {
  console.log('Device selection requested');
};

// Handle device selected from DeviceDisplay
const onDeviceSelected = (device: GarminDeviceVO) => {
  selectedDevice.value = device;
  console.log('Device selected:', device);
};

// Expose methods for external use
defineExpose({
  selectDevice,
  clearSelectedDevice,
  handleDeviceSelect,
  onDeviceSelected
});
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

/* Current Device Display */
.current-device-display {
  margin-left: 16px;
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

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 31;
}

.mobile-menu-btn span {
  width: 20px;
  height: 2px;
  background: #333;
  border-radius: 1px;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile navigation */
.mobile-nav {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 30;
  overflow-y: auto;
}

.mobile-nav.open {
  transform: translateX(0);
}

.mobile-nav-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-nav-links {
  flex: 1;
}

.mobile-nav-link {
  display: block;
  padding: 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.2s;
}

.mobile-nav-link:hover {
  color: #347cff;
}

.mobile-nav-link.router-link-active {
  color: #347cff;
  font-weight: 600;
}

/* Mobile dropdown */
.mobile-dropdown {
  border-bottom: 1px solid #f0f0f0;
}

.mobile-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.mobile-dropdown-trigger.centered {
  justify-content: center;
  position: relative;
}

.mobile-dropdown-trigger.centered .dropdown-text {
  flex: 1;
  text-align: center;
}

.mobile-dropdown-trigger.centered .el-icon {
  position: absolute;
  right: 0;
}

.mobile-dropdown-trigger .el-icon {
  transition: transform 0.3s ease;
}

.mobile-dropdown-trigger .el-icon.rotated {
  transform: rotate(180deg);
}

.mobile-dropdown-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 0 -12px 12px;
}

.mobile-dropdown-content.open {
  max-height: 300px;
}

.mobile-dropdown-link {
  display: block;
  padding: 12px 24px;
  color: #666;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.mobile-dropdown-link:hover {
  color: #347cff;
  background: rgba(52, 124, 255, 0.1);
}

/* Mobile user area */
.mobile-user-area {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
  margin-top: 24px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.mobile-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
}

.mobile-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.mobile-premium-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.mobile-action-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.mobile-action-btn.logout {
  color: #dc3545;
}

.mobile-action-btn.logout:hover {
  background: rgba(220, 53, 69, 0.1);
}

/* Mobile auth buttons at top */
.mobile-auth-buttons-top {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding: 0 8px;
}

/* Mobile auth buttons */
.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-auth-btn {
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  flex: 1;
}

.mobile-auth-btn.login {
  background: rgba(255, 255, 255, 0.9);
  color: #0066CC;
  border: 1px solid #D0D0D0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.mobile-auth-btn.login:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #A0A0A0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
}

.mobile-auth-btn.signup {
  background: #0071E3;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.mobile-auth-btn.signup:hover {
  background: #0077ED;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.4);
}

.mobile-auth-btn:active {
  transform: translateY(0);
}

/* Mobile overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 25;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Responsive styles */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
  }
  
  .logo-area .logo-text {
    font-size: 1.5rem;
    letter-spacing: 3px;
  }
  
  .desktop-nav,
  .desktop-user,
  .current-device-display {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
}

@media (max-width: 480px) {
  .header-inner {
    padding: 0 12px;
  }
  
  .logo-area .logo-text {
    font-size: 1.3rem;
    letter-spacing: 2px;
  }
  
  .mobile-nav-content {
    padding: 0px 16px;
  }
  
  .mobile-nav-link {
    font-size: 16px;
  }
  
  .mobile-dropdown-trigger {
    font-size: 16px;
  }
  
  .mobile-auth-buttons-top {
    flex-direction: column;
    gap: 8px;
  }
  
  .mobile-auth-btn {
    padding: 14px;
    font-size: 15px;
  }
}

@media (min-width: 769px) {
  .mobile-menu-btn,
  .mobile-nav,
  .mobile-overlay {
    display: none !important;
  }
}
</style>
