import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from '@/store/user'
import { createPageGuard } from '@/utils/guards'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_, __, savedPosition) {
    // Scroll to top when navigating to a new route
    if (savedPosition) {
      return savedPosition
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
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
    const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
    const ssoLoginUrl = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`

    if (requiresAuth && !userStore.userInfo) {
      window.location.href = ssoLoginUrl
      return
    }
    
    next()
  })
})

// GA page view tracking
router.afterEach((to) => {
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
  if (gtag) {
    gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_title: document.title
    })
  }
})


export default router
