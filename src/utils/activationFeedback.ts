type Failure = { reason?: string; code?: number; message?: string; msg?: string } | null | undefined
export function activationFeedback(failure: Failure): { key?: string; message?: string; manage: boolean } {
  if (failure?.reason === 'SINGLE_DEVICE_LIMIT' || failure?.code === 40940) {
    return { key: 'activation.singleDeviceLimit', manage: true }
  }
  if (failure?.reason === 'BUNDLE_DEVICE_LIMIT' || failure?.code === 40950) {
    return { key: 'activation.bundleDeviceLimit', manage: true }
  }
  if (failure?.reason === 'PURCHASE_NOT_FOUND') return { key: 'activation.errorNotFound', manage: false }
  const message = failure?.message || failure?.msg
  return message ? { message, manage: false } : { key: 'activation.errorNetwork', manage: false }
}
