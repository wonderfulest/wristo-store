<template>
  <header class="header-bar">
    <div class="header-inner">
      <div class="logo-area">
        <router-link :to="localizedPath('/')" class="logo-link" aria-label="Wristo home">
          <img class="logo-image" src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-logo-horizontal.svg" alt="Wristo" />
        </router-link>
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="mobile-menu-btn"
        type="button"
        aria-label="Toggle navigation"
        @click="toggleMobileMenu"
        :class="{ active: isMobileMenuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Desktop navigation -->
      <nav class="nav-area desktop-nav">
        <router-link :to="localizedPath('/')" class="nav-link">{{ t('nav.home') }}</router-link>
        <el-dropdown @command="handleSelectSeries" trigger="hover" popper-class="category-nav-popper">
          <button type="button" class="nav-link nav-button dropdown-trigger">
            {{ t('nav.categories') }}
            <el-icon style="margin-left: 4px"><arrow-down /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu class="category-dropdown-menu">
              <div class="category-dropdown-head">
                <span>Explore categories</span>
                <strong>{{ visibleSeriesList.length }} collections</strong>
              </div>
              <el-dropdown-item
                v-for="series in visibleSeriesList"
                :key="series.id"
                :command="series.slug"
                class="category-dropdown-item"
              >
                <span class="category-dropdown-thumb-wrap">
                  <img v-if="series.image" :src="series.image" :alt="series.name" class="category-dropdown-thumb" />
                  <span v-else class="category-dropdown-fallback" aria-hidden="true">{{ series.name.slice(0, 1).toUpperCase() }}</span>
                </span>
                <span class="category-dropdown-copy">
                  <strong>{{ series.name }}</strong>
                  <span>{{ formatCategoryAppCount(series.appCount) }}</span>
                </span>
                <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- <router-link to="/faq" class="nav-link">FAQ</router-link> -->
        <router-link :to="localizedPath('/code')" class="nav-link">{{ t('nav.code') }}</router-link>
        <button type="button" class="nav-link nav-button" @click="openStudio">{{ t('nav.studio') }}</button>
        <!-- <router-link to="/top" class="nav-link">Top</router-link> -->
        <router-link :to="faqPath" class="nav-link">{{ t('nav.faq') }}</router-link>
        <LanguageSwitcher />
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
        <router-link
          v-if="isCartEnabled && cartStore.count"
          :to="localizedPath('/user/cart')"
          class="header-cart-link"
          :aria-label="t('cart.headerAria')"
          :title="t('cart.viewCart')"
        >
          <el-icon><ShoppingCart /></el-icon>
          <span class="header-cart-count">{{ cartStore.count }}</span>
        </router-link>
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleUserMenuCommand" trigger="click" popper-class="user-menu-popper">
            <button type="button" class="user-avatar-container" :aria-label="t('nav.accountMenu')">
              <img :src="userAvatar" class="user-avatar" alt="user avatar" />
              <span class="user-trigger-copy">
                <span>{{ userDisplayName }}</span>
                <small>{{ isSubscribed ? t('nav.premium') : t('nav.account') }}</small>
              </span>
              <span v-if="isSubscribed" class="premium-badge">{{ t('nav.premium') }}</span>
              <el-icon class="user-trigger-arrow"><arrow-down /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <div class="user-dropdown-profile">
                  <img :src="userAvatar" class="user-dropdown-avatar" alt="user avatar" />
                  <div class="user-dropdown-identity">
                    <strong>{{ userDisplayName }}</strong>
                    <span>{{ userEmail }}</span>
                  </div>
                  <span class="user-dropdown-status" :class="{ premium: isSubscribed }">
                    {{ isSubscribed ? t('nav.premium') : t('nav.account') }}
                  </span>
                </div>
                <div class="user-dropdown-section">
                  <span class="user-dropdown-section-title">{{ t('nav.accountSection') }}</span>
                  <el-dropdown-item command="info" class="user-dropdown-item">
                    <span class="user-dropdown-icon">
                      <el-icon><User /></el-icon>
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.userInfo') }}</strong>
                      <small>{{ t('nav.userInfoDesc') }}</small>
                    </span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
                  </el-dropdown-item>
                  <el-dropdown-item v-if="isCartEnabled" command="cart" class="user-dropdown-item">
                    <span class="user-dropdown-icon">
                      <el-icon><ShoppingCart /></el-icon>
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.cart') }}</strong>
                      <small>{{ cartStore.count ? t('nav.cartDescWithCount', { count: cartStore.count }) : t('nav.cartDesc') }}</small>
                    </span>
                    <span v-if="cartStore.count" class="user-dropdown-count">{{ cartStore.count }}</span>
                  </el-dropdown-item>
                </div>
                <div class="user-dropdown-section">
                  <span class="user-dropdown-section-title">{{ t('nav.purchaseSection') }}</span>
                  <el-dropdown-item command="purchase-records" class="user-dropdown-item">
                    <span class="user-dropdown-icon">
                      <el-icon><Document /></el-icon>
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.purchases') }}</strong>
                      <small>{{ t('nav.purchasesDesc') }}</small>
                    </span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
                  </el-dropdown-item>
                  <el-dropdown-item command="billing" class="user-dropdown-item">
                    <span class="user-dropdown-icon">
                      <Icon icon="solar:bill-list-line-duotone" width="18" height="18" aria-hidden="true" />
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.billing') }}</strong>
                      <small>{{ t('nav.billingDesc') }}</small>
                    </span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
                  </el-dropdown-item>
                </div>
                <div class="user-dropdown-section">
                  <span class="user-dropdown-section-title">{{ t('nav.creatorSection') }}</span>
                  <el-dropdown-item command="membership" class="user-dropdown-item">
                    <span class="user-dropdown-icon accent">
                      <Icon icon="material-symbols:workspace-premium-outline" width="18" height="18" aria-hidden="true" />
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.membership') }}</strong>
                      <small>{{ t('nav.membershipDesc') }}</small>
                    </span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
                  </el-dropdown-item>
                  <el-dropdown-item command="studio" class="user-dropdown-item">
                    <span class="user-dropdown-icon accent">
                      <Icon icon="solar:magic-stick-3-bold-duotone" width="18" height="18" aria-hidden="true" />
                    </span>
                    <span class="user-dropdown-copy">
                      <strong>{{ t('nav.studio') }}</strong>
                      <small>{{ t('nav.studioDesc') }}</small>
                    </span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="18" height="18" aria-hidden="true" />
                  </el-dropdown-item>
                </div>
                <el-dropdown-item divided command="logout" class="user-dropdown-item user-dropdown-logout">
                  <span class="user-dropdown-icon danger">
                    <el-icon><SwitchButton /></el-icon>
                  </span>
                  <span class="user-dropdown-copy">
                    <strong>{{ t('nav.logout') }}</strong>
                    <small>{{ t('nav.logoutDesc') }}</small>
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <button class="auth-btn login-btn" @click="goToLogin">
              <span>{{ t('nav.signIn') }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Mobile navigation menu -->
    <div class="mobile-nav" :class="{ open: isMobileMenuOpen }">
      <div class="mobile-nav-content">
        <div class="mobile-nav-head">
          <span class="mobile-nav-kicker">{{ t('nav.menu') }}</span>
          <strong>{{ t('nav.explore') }}</strong>
        </div>
        <div class="mobile-nav-links">
          <router-link :to="localizedPath('/')" class="mobile-nav-link" @click="closeMobileMenu">
            <Icon icon="solar:home-2-line-duotone" width="22" height="22" aria-hidden="true" />
            <span>{{ t('nav.home') }}</span>
          </router-link>
          <div class="mobile-dropdown">
            <button class="mobile-dropdown-trigger centered" type="button" @click="toggleCategoriesDropdown">
              <span class="dropdown-text">
                <Icon icon="solar:widget-6-line-duotone" width="22" height="22" aria-hidden="true" />
                <span>{{ t('nav.categories') }}</span>
              </span>
              <el-icon :class="{ rotated: isCategoriesOpen }"><arrow-down /></el-icon>
            </button>
            <div class="mobile-dropdown-content" :class="{ open: isCategoriesOpen }">
              <router-link 
                v-for="series in visibleSeriesList"
                :key="series.id"
                :to="localizedPath(`/categories/${series.slug}`)"
                class="mobile-dropdown-link"
                @click="closeMobileMenu"
              >
                <span class="mobile-category-thumb-wrap">
                  <img v-if="series.image" :src="series.image" :alt="series.name" class="mobile-category-thumb" />
                  <span v-else class="mobile-category-fallback" aria-hidden="true">{{ series.name.slice(0, 1).toUpperCase() }}</span>
                </span>
                <span class="mobile-category-copy">
                  <strong>{{ series.name }}</strong>
                  <span>{{ formatCategoryAppCount(series.appCount) }}</span>
                </span>
              </router-link>
            </div>
          </div>
          <!-- <router-link to="/faq" class="mobile-nav-link" @click="closeMobileMenu">FAQ</router-link> -->
          <router-link :to="localizedPath('/code')" class="mobile-nav-link" @click="closeMobileMenu">
            <Icon icon="solar:hashtag-circle-line-duotone" width="22" height="22" aria-hidden="true" />
            <span>{{ t('nav.code') }}</span>
          </router-link>
          <button type="button" class="mobile-nav-link mobile-nav-button" @click="openStudio(); closeMobileMenu()">
            <Icon icon="material-symbols:workspace-premium-outline" width="22" height="22" aria-hidden="true" />
            <span>{{ t('nav.studio') }}</span>
          </button>
          <router-link :to="faqPath" class="mobile-nav-link" @click="closeMobileMenu">
            <Icon icon="solar:document-text-line-duotone" width="22" height="22" aria-hidden="true" />
            <span>{{ t('nav.faq') }}</span>
          </router-link>
          <router-link
            v-if="isCartEnabled && cartStore.count"
            :to="localizedPath('/user/cart')"
            class="mobile-nav-link mobile-cart-link"
            @click="closeMobileMenu"
          >
            <el-icon><ShoppingCart /></el-icon>
            <span>{{ t('nav.cart') }}</span>
            <span class="mobile-cart-count">{{ cartStore.count }}</span>
          </router-link>
          <div class="mobile-language-row">
            <LanguageSwitcher />
          </div>
          <router-link :to="localizedPath('/top')" class="mobile-nav-link" @click="closeMobileMenu">
            <Icon icon="solar:ranking-line-duotone" width="22" height="22" aria-hidden="true" />
            <span>{{ t('nav.top') }}</span>
          </router-link>
          
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
              <Icon icon="solar:login-2-line-duotone" width="22" height="22" aria-hidden="true" />
              <span>{{ t('nav.signIn') }}</span>
            </button>
          </div>
        </template>
        
        <div class="mobile-user-area">
          <template v-if="isLoggedIn">
            <div class="mobile-user-info">
              <div class="mobile-avatar-container">
                <img :src="userAvatar" class="mobile-user-avatar" alt="user avatar" />
                <span v-if="isSubscribed" class="mobile-premium-badge">{{ t('nav.premium') }}</span>
              </div>
            </div>
            <div class="mobile-user-actions">
              <button class="mobile-action-btn" @click="handleUserMenuCommand('info'); closeMobileMenu()">
                <el-icon><User /></el-icon>
                <span>{{ t('nav.userInfo') }}</span>
              </button>
              <button class="mobile-action-btn" @click="handleUserMenuCommand('purchase-records'); closeMobileMenu()">
                <el-icon><Document /></el-icon>
                <span>{{ t('nav.purchases') }}</span>
              </button>
              <button class="mobile-action-btn" @click="handleUserMenuCommand('billing'); closeMobileMenu()">
                <Icon icon="solar:bill-list-line-duotone" width="18" height="18" aria-hidden="true" />
                <span>{{ t('nav.billing') }}</span>
              </button>
              <button v-if="isCartEnabled" class="mobile-action-btn" @click="handleUserMenuCommand('cart'); closeMobileMenu()">
                <el-icon><ShoppingCart /></el-icon>
                <span>{{ t('nav.cart') }}</span>
              </button>
              <button class="mobile-action-btn" @click="handleUserMenuCommand('studio'); closeMobileMenu()">
                <Icon icon="solar:magic-stick-3-bold-duotone" width="18" height="18" aria-hidden="true" />
                <span>{{ t('nav.studio') }}</span>
              </button>
              <button class="mobile-action-btn" @click="handleUserMenuCommand('membership'); closeMobileMenu()">
                <Icon icon="material-symbols:workspace-premium-outline" width="18" height="18" aria-hidden="true" />
                <span>{{ t('nav.membership') }}</span>
              </button>
              <button class="mobile-action-btn logout" @click="handleUserMenuCommand('logout'); closeMobileMenu()">
                <el-icon><SwitchButton /></el-icon>
                <span>{{ t('nav.logout') }}</span>
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
import { Icon } from '@iconify/vue';
import { ArrowDown, User, Document, ShoppingCart, SwitchButton } from '@element-plus/icons-vue';
import type { Series } from '@/types/product';
import { useUserStore } from '@/store/user';
import { useCartStore } from '@/store/cart';
import type { GarminDeviceVO } from '@/types';
import DeviceDisplay from './DeviceDisplay.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { buildFaqGuidePath } from '@/content/faq-guides';
import { addLocaleToPath, useLocaleStore } from '@/store/locale';
import { useI18n } from '@/i18n';
import { buildSsoLoginUrl } from '@/utils/ssoRedirect';
import { openStudio } from '@/utils/studio';
import { openPaddleCustomerPortal } from '@/utils/paddlePortal';
import { isCartEnabled } from '@/config/features';
import { formatApproxAppCount, formatExactCount } from '@/utils/downloadCount';

const productStore = useProductStore();
const seriesList = ref<Series[]>([]);
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const localeStore = useLocaleStore();
const { t } = useI18n();
const isLoggedIn = ref(false);
const userAvatar = ref('https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png');

// Mobile menu state
const isMobileMenuOpen = ref(false);
const isCategoriesOpen = ref(false);

// Device selection state
const selectedDevice = ref<GarminDeviceVO | null>(null);

const faqPath = computed(() => {
  return buildFaqGuidePath(localeStore.currentLocale, undefined)
})

const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)

const loadSeries = async () => {
  seriesList.value = await productStore.getSeries();
};

const visibleSeriesList = computed(() => {
  return [...seriesList.value]
    .filter((series) => Number(series.isActive ?? 1) === 1)
    .sort((a, b) => {
      const sortDiff = Number(b.sort || 0) - Number(a.sort || 0)
      if (sortDiff !== 0) return sortDiff
      return a.name.localeCompare(b.name)
    })
});

const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some((role) => role.roleCode === 'ROLE_ADMIN')
})

const formatCategoryAppCount = (count?: number | null) => {
  if (count == null) return 'View apps'
  const label = isAdmin.value ? formatExactCount(count) : formatApproxAppCount(count)
  if (label == null) return 'View apps'
  return `${label} ${label === '1' ? 'app' : 'apps'}`
}

const handleSelectSeries = (slug: string) => {
  router.push(localizedPath(`/categories/${slug}`));
};

const updateUserInfo = () => {
  isLoggedIn.value = !!userStore.userInfo;
  userAvatar.value = userStore.userInfo?.avatar || 'https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png';
};

const userDisplayName = computed(() => {
  return userStore.userInfo?.nickname || userStore.userInfo?.username || 'Wristo user'
})

const userEmail = computed(() => {
  return userStore.userInfo?.email || t('nav.accountEmailFallback')
})

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
      router.push(localizedPath('/user/profile'));
      break;
    case 'subscription':
      router.push(localizedPath('/subscription'));
      break;
    case 'purchase-records':
      router.push(localizedPath('/user/purchase-records'));
      break;
    case 'billing':
      openPaddleCustomerPortal();
      break;
    case 'orders':
      router.push(localizedPath('/user/orders'));
      break;
    case 'cart':
      if (isCartEnabled) {
        router.push(localizedPath('/user/cart'));
      }
      break;
    case 'membership':
      openStudio();
      break;
    case 'studio':
      openStudio();
      break;
    case 'logout':
      userStore.logout();
      router.push(localizedPath('/'));
      break;
  }
};

const goToLogin = () => {
  const loginUrl = buildSsoLoginUrl('store')
  
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
  localeStore.syncDocumentLang();
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
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid var(--color-line);
  box-shadow: 0 10px 35px rgba(17, 24, 39, 0.05);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  position: sticky;
  top: 0;
  z-index: 20;
}
.header-inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 24px;
}
.logo-link {
  display: inline-flex;
  align-items: center;
  width: 132px;
  height: 40px;
  text-decoration: none;
}

.logo-image {
  display: block;
  width: 100%;
  height: auto;
}
.nav-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  color: var(--color-muted);
  font-size: 0.95rem;
  font-weight: 650;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 999px;
  transition: color 0.18s ease, background 0.18s ease;
}
.nav-button {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
}
.dropdown-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
}

:global(.category-nav-popper) {
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  border-radius: 18px !important;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16) !important;
}

:global(.category-dropdown-menu) {
  width: 328px;
  max-height: min(70vh, 560px);
  padding: 10px !important;
  overflow-y: auto;
}

:global(.category-dropdown-head) {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 8px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  margin-bottom: 6px;
}

:global(.category-dropdown-head span) {
  color: var(--color-brand-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
}

:global(.category-dropdown-head strong) {
  color: #64748b;
  font-size: 0.78rem;
}

:global(.category-dropdown-item) {
  display: grid !important;
  grid-template-columns: 46px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 11px;
  min-height: 62px;
  padding: 8px !important;
  border-radius: 12px !important;
  color: var(--color-ink) !important;
}

:global(.category-dropdown-item:hover),
:global(.category-dropdown-item:focus) {
  background: var(--color-brand-soft) !important;
  color: var(--color-brand-strong) !important;
}

:global(.category-dropdown-thumb-wrap),
:global(.category-dropdown-thumb),
:global(.category-dropdown-fallback) {
  width: 46px;
  height: 46px;
  border-radius: 13px;
}

:global(.category-dropdown-thumb) {
  display: block;
  object-fit: cover;
}

:global(.category-dropdown-fallback) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-weight: 900;
}

:global(.category-dropdown-copy) {
  display: grid;
  min-width: 0;
}

:global(.category-dropdown-copy strong),
:global(.category-dropdown-copy span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.category-dropdown-copy strong) {
  font-size: 0.94rem;
  line-height: 1.35;
}

:global(.category-dropdown-copy span) {
  color: #64748b;
  font-size: 0.78rem;
}

:global(.category-nav-popper .el-popper__arrow::before) {
  border-color: rgba(15, 23, 42, 0.08) !important;
}
.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
}

.header-cart-link {
  position: relative;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 107, 104, 0.14);
  background: rgba(255, 255, 255, 0.86);
  color: var(--color-brand-strong);
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.header-cart-link:hover {
  color: var(--color-brand-strong);
  border-color: rgba(15, 107, 104, 0.32);
  background: var(--color-brand-soft);
  transform: translateY(-1px);
}

.header-cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #111827;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  border: 2px solid #fff;
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 4px 11px 4px 5px;
  border: 1px solid rgba(15, 107, 104, 0.12);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  color: var(--color-ink);
  font-family: inherit;
  box-shadow:
    0 10px 24px rgba(17, 24, 39, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  touch-action: manipulation;
}

.user-avatar-container:hover,
.user-avatar-container:focus-visible {
  border-color: rgba(15, 107, 104, 0.28);
  background: var(--color-brand-soft);
  box-shadow:
    0 14px 30px rgba(15, 107, 104, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.95) inset;
  transform: translateY(-1px);
}

.user-avatar-container:focus-visible {
  outline: 3px solid rgba(15, 107, 104, 0.22);
  outline-offset: 3px;
}

.user-avatar-container:active {
  transform: translateY(0) scale(0.98);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(15, 107, 104, 0.12);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.user-avatar-container:hover .user-avatar {
  box-shadow: 0 0 0 2px rgba(15, 107, 104, 0.22);
  transform: scale(1.03);
}

.user-trigger-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  max-width: 116px;
  text-align: left;
}

.user-trigger-copy span,
.user-trigger-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-trigger-copy span {
  color: var(--color-ink);
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1.2;
}

.user-trigger-copy small {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 750;
  line-height: 1.2;
}

.user-trigger-arrow {
  color: #64748b;
  font-size: 13px;
  transition: transform 0.18s ease, color 0.18s ease;
}

.user-avatar-container:hover .user-trigger-arrow {
  color: var(--color-brand-strong);
  transform: translateY(1px);
}

.premium-badge {
  position: absolute;
  bottom: -7px;
  left: 24px;
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  color: #111827;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

:global(.user-menu-popper) {
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow:
    0 28px 70px rgba(15, 23, 42, 0.18),
    0 1px 0 rgba(255, 255, 255, 0.86) inset !important;
}

:global(.user-menu-popper .el-popper__arrow::before) {
  border-color: rgba(15, 23, 42, 0.08) !important;
}

:global(.user-dropdown-menu) {
  width: 344px;
  padding: 10px !important;
}

:global(.user-dropdown-profile) {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid rgba(15, 107, 104, 0.10);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(15, 107, 104, 0.09), rgba(245, 179, 68, 0.10)),
    #fff;
}

:global(.user-dropdown-avatar) {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

:global(.user-dropdown-identity) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

:global(.user-dropdown-identity strong),
:global(.user-dropdown-identity span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.user-dropdown-identity strong) {
  color: var(--color-ink);
  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1.25;
}

:global(.user-dropdown-identity span) {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 650;
}

:global(.user-dropdown-status) {
  align-self: start;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
  font-size: 0.68rem;
  font-weight: 900;
}

:global(.user-dropdown-status.premium) {
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  color: #111827;
}

:global(.user-dropdown-section) {
  display: grid;
  gap: 4px;
  padding: 7px 0;
  border-top: 1px solid rgba(15, 23, 42, 0.07);
}

:global(.user-dropdown-section-title) {
  padding: 0 8px 2px;
  color: var(--color-brand-strong);
  font-size: 0.7rem;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
}

:global(.user-dropdown-item) {
  display: grid !important;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 8px !important;
  border-radius: 14px !important;
  color: var(--color-ink) !important;
  line-height: 1.2 !important;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease !important;
}

:global(.user-dropdown-item:hover),
:global(.user-dropdown-item:focus) {
  background: var(--color-brand-soft) !important;
  color: var(--color-brand-strong) !important;
  transform: translateY(-1px);
}

:global(.user-dropdown-icon) {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(15, 107, 104, 0.09);
  color: var(--color-brand-strong);
}

:global(.user-dropdown-icon.accent) {
  background: rgba(245, 179, 68, 0.16);
  color: #92400e;
}

:global(.user-dropdown-icon.danger) {
  background: rgba(220, 38, 38, 0.10);
  color: #b91c1c;
}

:global(.user-dropdown-copy) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

:global(.user-dropdown-copy strong),
:global(.user-dropdown-copy small) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.user-dropdown-copy strong) {
  color: inherit;
  font-size: 0.9rem;
  font-weight: 850;
}

:global(.user-dropdown-copy small) {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 650;
}

:global(.user-dropdown-item:hover .user-dropdown-copy small),
:global(.user-dropdown-item:focus .user-dropdown-copy small) {
  color: #0f766e;
}

:global(.user-dropdown-count) {
  min-width: 25px;
  height: 25px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

:global(.user-dropdown-logout) {
  margin-top: 6px !important;
  color: #b91c1c !important;
}

:global(.user-dropdown-logout.el-dropdown-menu__item--divided::before) {
  margin: 0 0 6px !important;
  background: rgba(15, 23, 42, 0.07) !important;
}

:global(.user-dropdown-logout:hover),
:global(.user-dropdown-logout:focus) {
  background: rgba(220, 38, 38, 0.08) !important;
  color: #991b1b !important;
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
  min-height: 44px;
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
  color: #fff;
  border-color: var(--color-brand);
  background: var(--color-brand);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.login-btn:hover {
  background: var(--color-brand-strong);
  border-color: var(--color-brand-strong);
  box-shadow: 0 12px 26px rgba(15, 107, 104, 0.18);
}

/* Signup button */
.signup-btn {
  background: var(--color-brand);
  color: white;
  border-color: var(--color-brand);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.signup-btn:hover {
  background: var(--color-brand-strong);
  border-color: var(--color-brand-strong);
  box-shadow: 0 12px 26px rgba(15, 107, 104, 0.18);
}

.signup-btn:active {
  background: var(--color-brand-strong);
  border-color: var(--color-brand-strong);
}

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  border: 1px solid rgba(15, 107, 104, 0.12);
  border-radius: 16px;
  cursor: pointer;
  padding: 0;
  z-index: 42;
  box-shadow:
    0 12px 28px rgba(17, 24, 39, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.mobile-menu-btn span {
  width: 20px;
  height: 2px;
  background: var(--color-ink);
  border-radius: 1px;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.mobile-menu-btn.active {
  background:
    linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  border-color: rgba(15, 107, 104, 0.18);
  box-shadow: 0 16px 34px rgba(15, 107, 104, 0.22);
}

.mobile-menu-btn.active span {
  background: #fff;
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
  top: 84px;
  left: 12px;
  right: 12px;
  max-height: calc(100dvh - 100px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow:
    0 28px 80px rgba(15, 23, 42, 0.22),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  transform: translateY(-14px) scale(0.98);
  opacity: 0;
  visibility: hidden;
  transition: transform 220ms ease, opacity 220ms ease, visibility 220ms ease;
  z-index: 41;
  overflow-y: auto;
  pointer-events: none;
}

.mobile-nav.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.mobile-nav-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mobile-nav-head {
  display: grid;
  gap: 2px;
  padding: 2px 4px 8px;
}

.mobile-nav-kicker {
  color: var(--color-brand);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.mobile-nav-head strong {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.55rem;
  line-height: 1.1;
}

.mobile-nav-links {
  display: grid;
  gap: 8px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 0 14px;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 750;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 16px;
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.mobile-nav-button {
  width: 100%;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.mobile-nav-link:hover {
  color: var(--color-brand-strong);
  background: rgba(15, 107, 104, 0.07);
  transform: translateY(-1px);
}

.mobile-nav-link.router-link-active {
  color: var(--color-brand-strong);
  background: var(--color-brand-soft);
  border-color: rgba(15, 107, 104, 0.12);
  box-shadow: 0 12px 28px rgba(15, 107, 104, 0.10);
}

.mobile-cart-link {
  background: rgba(15, 107, 104, 0.08);
  border-color: rgba(15, 107, 104, 0.14);
}

.mobile-cart-count {
  margin-left: auto;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #111827;
  font-size: 12px;
  font-weight: 900;
}

.mobile-language-row {
  padding: 0;
}

/* Mobile dropdown */
.mobile-dropdown {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.62);
}

.mobile-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  padding: 0 14px;
  background: none;
  border: none;
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 750;
  text-align: left;
  cursor: pointer;
}

.mobile-dropdown-trigger.centered {
  justify-content: space-between;
  position: relative;
}

.mobile-dropdown-trigger.centered .dropdown-text {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.mobile-dropdown-trigger.centered .el-icon {
  position: static;
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
  transition: max-height 0.22s ease;
  background: rgba(238, 245, 243, 0.82);
}

.mobile-dropdown-content.open {
  max-height: 420px;
  overflow-y: auto;
}

.mobile-dropdown-link {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin: 8px;
  min-height: 56px;
  padding: 7px 10px;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 14px;
  transition: all 0.2s;
}

.mobile-dropdown-link:hover {
  color: var(--color-brand-strong);
  background: rgba(15, 107, 104, 0.1);
}

.mobile-category-thumb-wrap,
.mobile-category-thumb,
.mobile-category-fallback {
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

.mobile-category-thumb {
  display: block;
  object-fit: cover;
}

.mobile-category-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: var(--color-brand-strong);
  font-weight: 900;
}

.mobile-category-copy {
  display: grid;
  min-width: 0;
}

.mobile-category-copy strong,
.mobile-category-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-category-copy strong {
  color: var(--color-ink);
  font-size: 0.94rem;
  line-height: 1.35;
}

.mobile-category-copy span {
  color: #64748b;
  font-size: 0.78rem;
}

/* Mobile user area */
.mobile-user-area {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding-top: 14px;
  margin-top: 4px;
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
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  color: #111827;
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
  min-height: 48px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.mobile-action-btn:hover {
  background: var(--color-brand-soft);
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
  margin: 2px 0 0;
  padding: 0;
}

/* Mobile auth buttons */
.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-auth-btn {
  min-height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mobile-auth-btn.login {
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%);
  color: #fff;
  border: 1px solid var(--color-brand);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.mobile-auth-btn.login:hover {
  background: var(--color-brand-strong);
  border-color: var(--color-brand-strong);
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(15, 107, 104, 0.18);
}

.mobile-auth-btn.signup {
  background: var(--color-brand);
  color: white;
  box-shadow: 0 12px 26px rgba(15, 107, 104, 0.18);
}

.mobile-auth-btn.signup:hover {
  background: var(--color-brand-strong);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(15, 107, 104, 0.2);
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
  bottom: auto;
  height: 100vh;
  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 40;
  pointer-events: none;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Responsive styles */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
  }
  
  .logo-link {
    width: 126px;
    height: 38px;
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
  
  .logo-link {
    width: 116px;
    height: 36px;
  }
  
  .mobile-nav-content {
    padding: 14px;
  }
  
  .mobile-nav-link {
    min-height: 48px;
    font-size: 15px;
  }
  
  .mobile-dropdown-trigger {
    min-height: 48px;
    font-size: 15px;
  }
  
  .mobile-auth-buttons-top {
    flex-direction: column;
    gap: 8px;
  }
  
  .mobile-auth-btn {
    min-height: 50px;
    padding: 0 14px;
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
