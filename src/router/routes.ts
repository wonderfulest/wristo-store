import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/uninstall-guide',
    name: 'UninstallGuide',
    component: () => import('@/views/UninstallGuide.vue')
  },
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
    path: '/bundle/:id',
    name: 'bundle-detail',
    component: () => import('@/views/BundleDetail.vue')
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
    name: 'FAQ',
    component: () => import('@/views/faq/FAQ.vue'),
  },
  {
    path: '/faq/checkout',
    name: 'CheckoutHelp',
    component: () => import('@/views/faq/CheckoutHelp.vue')
  },
  {
    path: '/unlock',
    name: 'Unlock',
    component: () => import('@/views/Unlock.vue')
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
  /**
   * Email Settings
   */
  {
    path: '/email/preferences',
    name: 'EmailPreferences',
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
   * Blog Post
   */
  {
    path: '/:lang/blog/:slug',
    name: 'BlogPostLang',
    component: () => import('@/views/BlogPost.vue')
  },
  {
    path: '/:lang/blog',
    name: 'BlogListLang',
    component: () => import('@/views/BlogTree.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: () => import('@/views/BlogPost.vue')
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: () => import('@/views/BlogTree.vue')
  },
]

export default routes