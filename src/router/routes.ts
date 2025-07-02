import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallback.vue')
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetail.vue')
  },
  { 
    path: '/code', 
    name: 'CodeInput', 
    component: () => import('@/views/shop/CodeInput.vue') 
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
    path: '/payment/success',
    name: 'Success',
    component: () => import('@/views/shop/Success.vue')
  },
  {
    path: '/contact/:productId',
    name: 'Contact',
    component: () => import('@/views/Contact.vue')
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/FAQ.vue')
  },
  {
    path: '/unlock',
    redirect: '/already-purchased'
  },
  {
    path: '/already-purchased',
    name: 'AlreadyPurchased',
    component: () => import('@/views/shop/AlreadyPurchased.vue')
  },
  {
    path: '/lookup',
    name: 'Lookup',
    component: () => import('@/views/Lookup.vue')
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
    component: () => import('@/views/Categories.vue')
  },
  {
    path: '/newsletter',
    name: 'Newsletter',
    component: () => import('@/components/Newsletter.vue')
  },
  {
    path: '/bundle-products',
    name: 'BundleProducts',
    component: () => import('@/views/BundledProducts.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user-center/UserProfile.vue')
  },
]

export default routes 