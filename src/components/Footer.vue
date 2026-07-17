<template>
  <footer
    class="footer"
    :class="{ expanded: isExpanded, visible: isVisible }"
    tabindex="0"
    :aria-expanded="isExpanded"
    @click="handleFooterClick"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
    @blur="collapse"
  >
    <div class="storefront-container footer-container">
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
        <button
          class="mobile-footer-header"
          type="button"
          :aria-expanded="isExpanded"
          :aria-label="t('footer.viewDetails')"
          @click.stop="toggle"
        >
          <div class="drag-indicator"></div>
          <span class="footer-title">© 2025 WuKong OÜ</span>
        </button>
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
    </div>
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

function handleFooterClick(event: MouseEvent) {
  if (isMobile.value && event.target instanceof Element && event.target.closest('a, button')) {
    return
  }
  toggle()
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
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  border-top: 1px solid var(--color-line);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.72);
  padding: 14px 0;
  padding-bottom: max(14px, env(safe-area-inset-bottom));
  text-align: center;
  cursor: pointer;
  outline: none;
  transition: background var(--motion-base) ease, border-color var(--motion-base) ease, transform var(--motion-base) ease;
  position: relative;
  z-index: var(--layer-footer);
  min-height: 24px; /* 最小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.footer:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.footer-container {
  width: 100%;
}

/* */
@media (max-width: 768px) {
  .footer {
    position: relative;
    z-index: var(--layer-footer);
    transform: none;
    transition: background var(--motion-base) ease, border-color var(--motion-base) ease;
    backdrop-filter: blur(20px);
    background: color-mix(in srgb, var(--color-surface) 96%, transparent);
    border-top: 1px solid var(--color-line);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    box-shadow: 0 -10px 24px rgba(25, 48, 45, 0.08);
    padding: 0;
    min-height: auto;
    margin-top: 32px;
  }
  
  .footer.visible {
    transform: none;
  }
  
  .footer.expanded {
    transform: none;
    background: color-mix(in srgb, var(--color-surface) 98%, transparent);
    backdrop-filter: blur(25px);
  }
  
  /* */
  .mobile-layout {
    width: 100%;
    padding: 0;
    display: block;
  }
  
  .mobile-footer-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 12px 0 max(12px, env(safe-area-inset-bottom));
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
    border-top: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
  }
  
  .drag-indicator {
    width: 36px;
    height: 4px;
    background: var(--color-subtle);
    border-radius: 2px;
    margin-bottom: 8px;
  }
  
  .footer-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-ink);
    letter-spacing: 0;
  }

  .desktop-layout {
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--color-muted);
  font-size: 0.95rem;
  letter-spacing: 0;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink);
  font-weight: 700;
}

.footer-mark {
  width: 22px;
  height: 22px;
  padding: 3px;
  border: 1px solid rgba(11, 116, 109, 0.18);
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
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  color: var(--color-muted);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  margin: 0;
  transition: background var(--motion-fast) ease, color var(--motion-fast) ease, box-shadow var(--motion-fast) ease;
}

.footer-nav a:hover,
.footer-nav a:focus-visible,
.footer-detail a:hover,
.footer-detail a:focus-visible {
  background: rgba(11, 116, 109, 0.1);
  color: var(--color-brand-strong);
  outline: none;
  box-shadow: var(--focus-ring);
}

.footer-detail {
  margin-top: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  animation: fadeIn 0.3s;
  padding: 16px 0;
  background: var(--color-surface);
  width: 100%;
}

.footer-detail-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--color-ink);
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
