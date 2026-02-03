import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/Home.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/SearchView.vue')
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
    name: 'FAQ',
    component: () => import('@/views/faq/FAQ.vue'),
  },
  {
    path: '/faq/checkout',
    name: 'CheckoutHelp',
    component: () => import('@/views/faq/CheckoutHelp.vue')
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
    component: () => import('@/views/products/Categories.vue')
  },
  {
    path: '/newsletter',
    name: 'Newsletter',
    component: () => import('@/components/Newsletter.vue')
  },
  {
    path: '/creators',
    name: 'Creators',
    component: () => import('@/views/Creators.vue')
  },
  {
    path: '/bundle-products',
    name: 'BundleProducts',
    component: () => import('@/views/products/BundledProducts.vue')
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
   * Blog Post
   */
  {
    path: '/:lang/blog/:slug',
    name: 'BlogPostLang',
    component: () => import('@/views/blogs/BlogPost.vue')
  },
  {
    path: '/:lang/blog',
    name: 'BlogTreeLang',
    component: () => import('@/views/blogs/BlogPost.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: () => import('@/views/blogs/BlogPost.vue')
  },
  {
    path: '/blog',
    name: 'BlogTree',
    component: () => import('@/views/blogs/BlogPost.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  },
]

export default routes