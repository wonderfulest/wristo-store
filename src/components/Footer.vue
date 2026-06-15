<template>
  <footer
    class="footer"
    :class="{ expanded: isExpanded, visible: isVisible }"
    tabindex="0"
    @click="toggle"
    @blur="collapse"
  >
    <!-- 桌面端布局 -->
    <div v-if="!isExpanded && !isMobile" class="footer-main desktop-layout">
      <div class="footer-brand">
        <img class="footer-mark" src="https://cdn.wristo.io/brands/wristo-logo/svg/wristo-mark.svg" alt="" aria-hidden="true" />
        <span>© 2025 WuKong OÜ</span>
      </div>
      <nav class="footer-nav" :aria-label="t('footer.quickLinks')">
        <a :href="localizedPath('/terms-and-conditions')">{{ t('footer.termsOfUse') }}</a>
        <a :href="localizedPath('/privacy-policy')">{{ t('footer.privacy') }}</a>
        <a :href="localizedPath('/contact')">{{ t('footer.contact') }}</a>
        <!-- <a href="/faq">FAQ</a> -->
      </nav>
    </div>
    
    <!-- 移动端布局 -->
    <div v-if="!isExpanded && isMobile" class="footer-main mobile-layout">
      <div class="mobile-footer-header">
        <div class="drag-indicator"></div>
        <span class="footer-title">{{ t('footer.quickLinks') }}</span>
      </div>
      
      <div class="mobile-footer-content">
        <div class="footer-actions">
          <a :href="localizedPath('/faq/support')" class="footer-action" :aria-label="t('footer.help')">
            <div class="action-icon">?</div>
            <span>{{ t('footer.help') }}</span>
          </a>
          
          <a :href="localizedPath('/terms-and-conditions')" class="footer-action" :aria-label="t('footer.terms')">
            <div class="action-icon">T</div>
            <span>{{ t('footer.terms') }}</span>
          </a>
          
          <a href="mailto:support@wristo.io" class="footer-action" :aria-label="t('footer.support')">
            <div class="action-icon">@</div>
            <span>{{ t('footer.support') }}</span>
          </a>
          
          <button @click="scrollToTop" class="footer-action" type="button" :aria-label="t('footer.top')">
            <div class="action-icon">↑</div>
            <span>{{ t('footer.top') }}</span>
          </button>
        </div>
        
        <div class="footer-copyright">
          © 2025 WuKong OÜ
        </div>
      </div>
    </div>
    <transition name="footer-expand">
      <div v-if="isExpanded" class="footer-detail">
        <div class="footer-detail-title">© 2025 WuKong OÜ. {{ t('footer.rights') }}</div>
        <div class="footer-detail-block">
          <strong>{{ t('footer.address') }}:</strong><br>
          Harju maakond, Tallinn, Kesklinna linnaosa, Ahtri tn 12, 15551, Estonia
        </div>
        <div class="footer-detail-block">
          <strong>{{ t('footer.email') }}:</strong>
          <a href="mailto:support@wristo.io">support@wristo.io</a>
        </div>
        <div class="footer-detail-block">
          <strong>{{ t('footer.privacy') }}:</strong>
          <a :href="localizedPath('/privacy-policy')" target="_blank">{{ t('footer.viewDetails') }}</a>
        </div>
        <!-- <div class="footer-detail-block">
          <strong>Contact us on SLACK:</strong>
          <a href="https://join.slack.com/t/wristo/shared_invite/zt-37oujfc82-w6vpl_hzGNYYmsmN5vNOzg" target="_blank">Join Slack Channel</a>
        </div> -->
        <div class="footer-detail-links">
          <a :href="localizedPath('/terms-and-conditions')">{{ t('footer.termsOfUse') }}</a> |
          <a :href="localizedPath('/privacy-policy')">{{ t('footer.privacy') }}</a> |
          <a :href="localizedPath('/contact')">{{ t('footer.contact') }}</a> |
          <!-- <a href="/faq">FAQ</a> -->
        </div>
      </div>
    </transition>
    <slot />
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

const isExpanded = ref(false)
const isVisible = ref(true)
const isMobile = ref(false)
const localeStore = useLocaleStore()
const { t } = useI18n()
let ticking = false

const localizedPath = (path: string) => addLocaleToPath(path, localeStore.currentLocale)

// 滚动到顶部功能
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  // 滚动后隐藏footer
  setTimeout(() => {
    isVisible.value = false
  }, 500)
}

// 
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

// 
function handleScroll() {
  if (!ticking && isMobile.value) {
    requestAnimationFrame(updateFooterVisibility)
    ticking = true
  }
}

// 
function updateFooterVisibility() {
  const currentScrollY = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 
  const distanceFromBottom = documentHeight - (currentScrollY + windowHeight)
  
  // 
  if (distanceFromBottom <= 100) {
    isVisible.value = true
  } else {
    isVisible.value = false
    // 
    if (isExpanded.value) {
      isExpanded.value = false
    }
  }
  
  ticking = false
}

// 
function handleResize() {
  checkMobile()
  if (!isMobile.value) {
    isVisible.value = true // 
  }
}

function toggle() {
  isExpanded.value = !isExpanded.value
}

function collapse() {
  isExpanded.value = false
}

onMounted(() => {
  checkMobile()
  if (isMobile.value) {
    // 
    isVisible.value = false
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    // 
    updateFooterVisibility()
  }
})

onUnmounted(() => {
  if (isMobile.value) {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.footer {
  color: var(--color-muted);
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.8);
  padding: 14px 16px;
  padding-bottom: max(14px, env(safe-area-inset-bottom));
  text-align: center;
  cursor: pointer;
  outline: none;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.3s ease;
  position: relative;
  min-height: 24px; /* 最小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* */
@media (max-width: 768px) {
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid rgba(17, 24, 39, 0.08);
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -16px 34px rgba(17, 24, 39, 0.12);
    padding: 0;
    min-height: auto;
  }
  
  .footer.visible {
    transform: translateY(0);
  }
  
  .footer.expanded {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(25px);
  }
  
  /* */
  .mobile-layout {
    width: 100%;
    padding: 0;
  }
  
  .mobile-footer-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0 8px 0;
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  }
  
  .drag-indicator {
    width: 36px;
    height: 4px;
    background: rgba(17, 24, 39, 0.22);
    border-radius: 2px;
    margin-bottom: 8px;
  }
  
  .footer-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0;
  }
  
  .mobile-footer-content {
    padding: 16px 20px 20px 20px;
  }
  
  .footer-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .footer-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: #374151;
    padding: 12px 8px;
    min-height: 64px;
    border-radius: var(--radius-sm);
    background: #fff;
    border: 1px solid var(--color-line);
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    cursor: pointer;
    font-family: inherit;
  }
  
  .footer-action:hover,
  .footer-action:active {
    background: var(--color-brand-soft);
    border-color: rgba(15, 107, 104, 0.2);
    transform: translateY(-1px);
  }

  .footer-action:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(15, 107, 104, 0.16);
  }
  
  .action-icon {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--color-brand-strong);
    background: #eef9f6;
    margin-bottom: 4px;
  }
  
  .footer-action span {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6B7280;
  }
  
  .footer-action:hover span {
    color: var(--color-brand-strong);
  }
  
  .footer-copyright {
    text-align: center;
    font-size: 0.8rem;
    color: #9CA3AF;
    padding-top: 12px;
    border-top: 1px solid rgba(17, 24, 39, 0.08);
  }
  
  /* */
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

/* */
@media (min-width: 769px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

.footer-main {
  width: min(100%, 1180px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: #4b5563;
  font-size: 0.95rem;
  letter-spacing: 0;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-weight: 700;
}

.footer-mark {
  width: 22px;
  height: 22px;
  padding: 3px;
  border: 1px solid rgba(15, 107, 104, 0.18);
  border-radius: 999px;
  background: var(--color-brand-soft);
}

.footer-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.footer-nav a,
.footer-detail a {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  color: #4b5563;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  margin: 0;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.footer-nav a:hover,
.footer-nav a:focus-visible,
.footer-detail a:hover,
.footer-detail a:focus-visible {
  background: rgba(15, 107, 104, 0.1);
  color: var(--color-brand-strong);
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 107, 104, 0.14);
}

.footer-detail {
  margin-top: 0;
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.7;
  animation: fadeIn 0.3s;
  padding: 16px 0;
  background: #fff;
  width: 100%;
}

.footer-detail-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #111827;
}
.footer-detail-links {
  margin-top: 18px;
  color: var(--color-brand-strong);
  font-size: 0.95rem;
}
.footer-detail-links a {
  color: var(--color-brand-strong);
  margin: 0 4px;
}
.footer-expand-enter-active,
.footer-expand-leave-active {
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
}
.footer-expand-enter-from,
.footer-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.footer-expand-enter-to,
.footer-expand-leave-from {
  max-height: 300px;
  opacity: 1;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .footer-detail {
    padding: 18px 20px max(24px, env(safe-area-inset-bottom));
  }
}
</style> 
