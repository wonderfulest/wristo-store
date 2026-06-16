import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createCartCheckout, purchaseCallback } from '@/api/purchase'
import type { CartCheckoutItemRequest } from '@/api/purchase'
import { useUserStore } from '@/store/user'
import { initializePaddle } from '@/utils/paddle'

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

interface CartCheckoutOptions {
  displayMode?: 'overlay' | 'inline'
  frameTarget?: string
  frameInitialHeight?: number
  frameStyle?: string
}

const buildCheckoutSettings = (options: CartCheckoutOptions) => {
  if (options.displayMode !== 'inline') {
    return { displayMode: 'overlay' }
  }

  if (!options.frameTarget || !document.getElementsByClassName(options.frameTarget)[0]) {
    console.warn('Paddle inline checkout frame target was not found; falling back to overlay checkout.')
    return { displayMode: 'overlay' }
  }

  return {
    displayMode: 'inline',
    frameTarget: options.frameTarget,
    ...(options.frameInitialHeight ? { frameInitialHeight: options.frameInitialHeight } : {}),
    ...(options.frameStyle ? { frameStyle: options.frameStyle } : {}),
  }
}

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
        initializePaddle(
          window.Paddle,
          async (data: any) => {
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
          }
        )
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

  const closeCheckout = () => {
    if (typeof window !== 'undefined' && window.Paddle?.Checkout?.close) {
      window.Paddle.Checkout.close()
    }
    activeCheckout = null
    loading.value = false
  }

  const checkout = async (
    items: CartCheckoutItemRequest[],
    onSuccess?: () => void,
    options: CartCheckoutOptions = {}
  ) => {
    if (loading.value) return
    if (!items.length) {
      ElMessage.warning('Your cart is empty.')
      return
    }
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
      const checkoutOptions: Record<string, any> = {
        transactionId: checkoutData.transactionId,
        settings: buildCheckoutSettings(options),
      }
      if (userStore.userInfo?.email) {
        checkoutOptions.customer = {
          email: userStore.userInfo?.email,
        }
      }
      window.Paddle.Checkout.open(checkoutOptions)
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
    closeCheckout,
  }
}
