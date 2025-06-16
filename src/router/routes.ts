import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/code' },
  { 
    path: '/code', 
    name: 'CodeInput', 
    component: () => import('@/views/CodeInput.vue') 
  },
  {
    path: '/shop/options',
    name: 'ShopOptions',
    component: () => import('@/views/ShopOptions.vue'),
  },
  {
    path: '/shop/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue')
  },
  {
    path: '/shop/success',
    name: 'Success',
    component: () => import('@/views/Success.vue')
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
    component: () => import('@/views/AlreadyPurchased.vue')
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
]

export default routes 