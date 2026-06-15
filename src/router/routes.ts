import type { RouteRecordRaw } from 'vue-router'
import { SUPPORTED_LOCALES } from '@/store/locale'

const langPattern = SUPPORTED_LOCALES.join('|')

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      showFloatingActions: true
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/SearchView.vue'),
    meta: {
      showFloatingActions: true
    }
  },
  {
    path: '/brands',
    name: 'Brands',
    component: () => import('@/views/brands/Brands.vue')
  },
  {
    path: '/brands/:userId',
    name: 'MerchantDetail',
    component: () => import('@/views/brands/MerchantDetail.vue')
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallback.vue')
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/views/products/ProductDetail.vue')
  },
  {
    path: '/garmin-store',
    name: 'GarminStoreBridge',
    component: () => import('@/views/GarminStoreBridge.vue')
  },
  {
    path: '/bundle/:id',
    name: 'bundle-detail',
    component: () => import('@/views/products/BundleDetail.vue')
  },
  { 
    path: '/code', 
    name: 'CodeInput', 
    component: () => import('@/views/shop/CodeInput.vue') 
  },
  {
    path: '/premium',
    name: 'Premium',
    component: () => import('@/views/shop/PurchaseOptions.vue'),
  },
  {
    path: '/purchase-options',
    name: 'PurchaseOptions',
    component: () => import('@/views/shop/PurchaseOptions.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/shop/Checkout.vue')
  },
  {
    path: '/checkout-subscription',
    name: 'CheckoutSubscription',
    component: () => import('@/views/shop/CheckoutSubscription.vue')
  },
  {
    path: '/payment/success',
    name: 'Success',
    component: () => import('@/views/shop/Success.vue')
  },
  {
    path: '/auto-unlock',
    name: 'AutoUnlock',
    component: () => import('@/views/shop/AutoUnlock.vue')
  },
  {
    path: '/subscription-management',
    name: 'SubscriptionManagement',
    component: () => import('@/views/SubscriptionManagement.vue')
  },
  {
    path: '/subscription-cancel',
    name: 'SubscriptionCancel',
    component: () => import('@/views/SubscriptionCancel.vue')
  },
  {
    path: '/faq',
    name: 'FAQGuides',
    component: () => import('@/views/blogs/BlogPost.vue'),
  },
  {
    path: `/:lang(${langPattern})/faq`,
    name: 'FAQGuidesLang',
    component: () => import('@/views/blogs/BlogPost.vue'),
  },
  {
    path: '/faq/checkout',
    name: 'CheckoutHelp',
    component: () => import('@/views/faq/CheckoutHelp.vue')
  },
  {
    path: `/:lang(${langPattern})/faq/:slug`,
    name: 'FAQGuideLang',
    component: () => import('@/views/blogs/BlogPost.vue'),
  },
  {
    path: '/faq/:slug',
    name: 'FAQGuide',
    component: () => import('@/views/blogs/BlogPost.vue'),
  },
 
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue')
  },
  {
    path: '/already-purchased',
    name: 'AlreadyPurchased',
    component: () => import('@/views/shop/AlreadyPurchased.vue')
  },
   {
    path: '/unlock',
    redirect: '/already-purchased',
  },
  {
    path: '/purchases-history',
    name: 'PurchasesHistory',
    component: () => import('@/views/PurchasesHistory.vue')
  },
  {
    path: '/terms-and-conditions',
    name: 'TermsAndConditions',
    component: () => import('@/views/TermsAndConditions.vue')
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicy.vue')
  },
  {
    path: '/categories/:slug',
    name: 'CategoryDetail',
    component: () => import('@/views/products/Categories.vue'),
    meta: {
      showFloatingActions: true
    }
  },
  {
    path: '/newsletter',
    name: 'Newsletter',
    component: () => import('@/components/Newsletter.vue')
  },
  {
    path: '/top',
    name: 'TopApps',
    component: () => import('@/views/shop/TopApps.vue'),
    meta: {
      contentSizedMain: true
    }
  },
  {
    path: '/creators',
    name: 'Creators',
    component: () => import('@/views/Creators.vue')
  },
  {
    path: '/studio/membership',
    name: 'StudioMembership',
    component: () => import('@/views/StudioMembership.vue'),
    meta: {
      requiresAuth: true,
      title: 'Studio Membership | Wristo',
      description: 'Choose a Wristo Studio membership plan and pay securely on wristo.io.'
    }
  },
  {
    path: '/bundle-products',
    name: 'BundleProducts',
    component: () => import('@/views/products/BundledProducts.vue'),
    meta: {
      showFloatingActions: true
    }
  },
  {
    path: '/template-editor',
    name: 'TemplateEditorPage',
    component: () => import('@/views/products/TemplateEditorPage.vue')
  },
  {
    path: '/tpl',
    redirect: '/template-editor',
  },
  // {
  //   path: '/subscription',
  //   name: 'Subscription',
  //   component: () => import('@/views/SubscriptionView.vue'),
  //   meta: {
  //     title: 'Premium Subscription - Unlock All Watch Faces',
  //     description: 'Get unlimited access to all premium watch faces with a single purchase. One-time payment, lifetime access.'
  //   }
  // },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user-center/UserProfile.vue')
  },
  {
    path: '/user/purchase-records',
    name: 'PurchaseRecords',
    component: () => import('@/views/user-center/PurchaseRecords.vue')
  },
  {
    path: '/user/cart',
    name: 'CartListPage',
    component: () => import('@/views/user-center/CartListPage.vue')
  },
  /**
   * Email Settings
   */
  {
    path: '/email/preferences',
    name: 'EmailPreferences',
    component: () => import('@/views/email/EmailPreferences.vue')
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('@/views/email/EmailPreferences.vue')
  },
  {
    path: '/unsubscribe',
    name: 'Unsubscribe',
    component: () => import('@/views/email/Unsubscribe.vue')
  },
  {
    path: '/preferences/success',
    name: 'PreferencesSuccess',
    component: () => import('@/views/email/PreferencesSuccess.vue')
  },
  /**
   * Legacy Blog redirects
   */
  {
    path: '/:lang/blog/:slug',
    name: 'BlogPostLang',
    redirect: (to) => {
      const lang = Array.isArray(to.params.lang) ? to.params.lang[0] : to.params.lang
      const slug = Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug
      return `/${encodeURIComponent(String(lang))}/faq/${encodeURIComponent(String(slug))}`
    }
  },
  {
    path: '/:lang/blog',
    name: 'BlogTreeLang',
    redirect: (to) => {
      const lang = Array.isArray(to.params.lang) ? to.params.lang[0] : to.params.lang
      return `/${encodeURIComponent(String(lang))}/faq`
    }
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    redirect: (to) => {
      const slug = Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug
      return `/faq/${encodeURIComponent(String(slug))}`
    }
  },
  {
    path: '/blog',
    name: 'BlogTree',
    redirect: '/faq'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  },
]

function withLanguagePrefix(route: RouteRecordRaw): RouteRecordRaw | null {
  if (route.path === '/:pathMatch(.*)*') return null
  if (route.path.startsWith('/:lang')) return null
  if (route.path === '/faq' || route.path === '/faq/:slug') return null
  if (route.path === '/unlock') return null
  if (route.path.startsWith('/blog')) return null

  const childPath = route.path === '/' ? '' : route.path.replace(/^\//, '')
  const localizedPath = childPath ? `/:lang(${langPattern})/${childPath}` : `/:lang(${langPattern})`
  const name = typeof route.name === 'string' ? `${route.name}Localized` : undefined

  return {
    ...route,
    path: localizedPath,
    name,
  }
}

const localizedRoutes = baseRoutes
  .map(withLanguagePrefix)
  .filter((route): route is RouteRecordRaw => Boolean(route))

const fallbackRoute = baseRoutes.find((route) => route.path === '/:pathMatch(.*)*')
const nonFallbackBaseRoutes = baseRoutes.filter((route) => route.path !== '/:pathMatch(.*)*')

const routes: RouteRecordRaw[] = [
  ...localizedRoutes,
  ...nonFallbackBaseRoutes,
  {
    path: `/:lang(${langPattern})/:pathMatch(.*)*`,
    name: 'NotFoundLocalized',
    component: () => import('@/views/NotFound.vue')
  },
  ...(fallbackRoute ? [fallbackRoute] : []),
]

export default routes
