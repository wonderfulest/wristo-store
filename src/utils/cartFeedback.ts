import { h } from 'vue'
import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addLocaleToPath, type SupportedLocale } from '@/store/locale'

export function showAddedToCartMessage(router: Router, locale: SupportedLocale, labels: {
  added: string
  viewCart: string
}) {
  let closeMessage: (() => void) | undefined

  const handler = ElMessage({
    type: 'success',
    duration: 5200,
    showClose: true,
    message: h('span', { class: 'cart-message' }, [
      h('span', labels.added),
      h(
        'button',
        {
          class: 'cart-message-action',
          type: 'button',
          onClick: () => {
            closeMessage?.()
            router.push(addLocaleToPath('/user/cart', locale))
          },
        },
        labels.viewCart
      ),
    ]),
  })

  closeMessage = () => handler.close()
}
