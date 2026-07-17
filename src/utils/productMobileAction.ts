export type MobileProductPrimaryAction = 'download' | 'buy' | null
export type MobileProductSecondaryAction = 'add-to-cart' | 'go-to-cart' | null

export interface MobileProductActionInput {
  appId?: number | string | null
  hasEntitlement: boolean
  garminStoreUrl?: string | null
  cartEnabled: boolean
  isInCart: boolean
}

export interface MobileProductActionState {
  visible: boolean
  primaryAction: MobileProductPrimaryAction
  secondaryAction: MobileProductSecondaryAction
}

export function resolveMobileProductActionState(
  input: MobileProductActionInput,
): MobileProductActionState {
  if (!input.appId) {
    return { visible: false, primaryAction: null, secondaryAction: null }
  }

  if (input.hasEntitlement) {
    const canDownload = Boolean(input.garminStoreUrl?.trim())
    return {
      visible: canDownload,
      primaryAction: canDownload ? 'download' : null,
      secondaryAction: null,
    }
  }

  return {
    visible: true,
    primaryAction: 'buy',
    secondaryAction: input.cartEnabled
      ? (input.isInCart ? 'go-to-cart' : 'add-to-cart')
      : null,
  }
}
