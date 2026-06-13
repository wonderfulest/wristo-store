import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createCartCheckout, purchaseCallback } from '@/api/purchase'
import type { CartCheckoutItemRequest } from '@/api/purchase'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

declare global {
  interface Window {
    Paddle?: any
  }
}

let paddleScriptPromise: Promise<void> | null = null
let activeCheckout:
  | {
      transactionId: string
      onSuccess?: () => void
      setLoading: (value: boolean) => void
    }
  | null = null

const loadPaddle = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is not available'))
  if (window.Paddle) return Promise.resolve()
  if (paddleScriptPromise) return paddleScriptPromise

  paddleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      try {
        window.Paddle.Environment.set(import.meta.env.VITE_WRISTO_PADDLE_ENVIRONMENT)
        window.Paddle.Initialize({
          token: import.meta.env.VITE_WRISTO_PADDLE_CLIENT_TOKEN,
          eventCallback: async (data: any) => {
            const currentCheckout = activeCheckout
            if (!currentCheckout) return
            if (data.name === 'checkout.completed') {
              try {
                await purchaseCallback({ transaction_id: currentCheckout.transactionId })
              } catch (error) {
                console.warn('Payment completed but purchase sync failed:', error)
              } finally {
                currentCheckout.onSuccess?.()
                window.location.href = '/payment/success'
                currentCheckout.setLoading(false)
                activeCheckout = null
              }
            }
            if (data.name === 'checkout.closed' || data.name === 'checkout.error') {
              currentCheckout.setLoading(false)
              activeCheckout = null
            }
          },
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    script.onerror = () => reject(new Error('Paddle failed to load'))
    document.body.appendChild(script)
  })

  return paddleScriptPromise
}

export function useCartCheckout() {
  const loading = ref(false)
  const userStore = useUserStore()

  const requireLogin = () => {
    if (userStore.userInfo?.email) return true
    ElMessage.info('Please sign in before checkout.')
    redirectToSsoLogin('store')
    return false
  }

  const checkout = async (items: CartCheckoutItemRequest[], onSuccess?: () => void) => {
    if (loading.value) return
    if (!items.length) {
      ElMessage.warning('Your cart is empty.')
      return
    }
    if (!requireLogin()) return

    loading.value = true
    try {
      await loadPaddle()
      const checkoutData = await createCartCheckout({ items })
      activeCheckout = {
        transactionId: checkoutData.transactionId,
        onSuccess,
        setLoading: (value: boolean) => {
          loading.value = value
        },
      }
      window.Paddle.Checkout.open({
        transactionId: checkoutData.transactionId,
        settings: {
          displayMode: 'overlay',
        },
        customer: {
          email: userStore.userInfo?.email,
        },
      })
    } catch (error) {
      console.error('Cart checkout failed:', error)
      ElMessage.error('Checkout failed. Please try again.')
      activeCheckout = null
      loading.value = false
    }
  }

  return {
    loading,
    checkout,
  }
}
