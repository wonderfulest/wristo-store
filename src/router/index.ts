import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from '@/store/user'
import { getRouteLocaleParam, useLocaleStore } from '@/store/locale'
import { createPageGuard } from '@/utils/guards'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _, savedPosition) {
    // Scroll to top when navigating to a new route
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        top: 24,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guard
const pageGuard = createPageGuard()

// Route guards
router.beforeEach((to, from, next) => {
  // Handle page title and meta tags
  pageGuard(to, from, () => {
    // Handle authentication
    const userStore = useUserStore()
    const localeStore = useLocaleStore()
    const routeLang = Array.isArray(to.params.lang) ? to.params.lang[0] : to.params.lang
    const normalizedRouteLang = getRouteLocaleParam(routeLang)
    if (normalizedRouteLang && normalizedRouteLang !== localeStore.currentLocale) {
      localeStore.setLocale(normalizedRouteLang)
    }
    localeStore.syncDocumentLang()

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !userStore.userInfo) {
      redirectToSsoLogin('store')
      return
    }
    
    next()
  })
})

// GA page view tracking
router.afterEach((to) => {
  console.log('page_view', to.fullPath, document.title)
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
  if (gtag) {
    console.log('gtag event', to.fullPath, document.title)
    gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_title: document.title
    })
  }
})


export default router
