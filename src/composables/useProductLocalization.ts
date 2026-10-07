import { useLocaleStore } from '@/store/locale'
import { localizeProduct } from '@/utils/productLocalization'

export function useProductLocalization() {
  const localeStore = useLocaleStore()
  return <T extends Parameters<typeof localizeProduct>[0]>(product: T) =>
    localizeProduct(product, localeStore.currentLocale)
}
