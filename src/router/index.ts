import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
  const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
  const ssoLoginUrl = `${ssoBaseUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`

  if (requiresAuth && !userStore.userInfo) {
    window.location.href = ssoLoginUrl
    return
  } else {
    next()
  }
})


export default router
