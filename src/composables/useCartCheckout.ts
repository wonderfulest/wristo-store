import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createCartCheckout, purchaseCallback } from '@/api/purchase'
import type { CartCheckoutItemRequest } from '@/api/purchase'
import { initializePaddle } from '@/utils/paddle'
import { useLocaleStore } from '@/store/locale'
import { translate } from '@/i18n'

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
  const localeStore = useLocaleStore()
  const t = (key: string) => translate(key, localeStore.currentLocale)

  const closeCheckout = () => {
    if (typeof window !== 'undefined' && window.Paddle?.Checkout?.close) {
      window.Paddle.Checkout.close()
    }
    activeCheckout = null
    loading.value = false
  }

  const checkout = async (
    items: CartCheckoutItemRequest[],
    email: string,
    onSuccess?: () => void,
    options: CartCheckoutOptions = {}
  ) => {
    if (loading.value) return
    if (!items.length) {
      ElMessage.warning(t('cart.error.empty'))
      return
    }
    loading.value = true
    try {
      await loadPaddle()
      const checkoutEmail = email.trim().toLowerCase()
      const checkoutData = await createCartCheckout({ items, email: checkoutEmail })
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
      if (checkoutEmail) {
        checkoutOptions.customer = {
          email: checkoutEmail,
        }
      }
      window.Paddle.Checkout.open(checkoutOptions)
    } catch (error: any) {
      console.error('Cart checkout failed:', error)
      if (!error?.code && !error?.msg) {
        ElMessage.error(t('cart.error.checkoutFailed'))
      }
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
