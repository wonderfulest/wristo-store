const disabledValues = new Set(['0', 'false', 'off', 'no'])

const readBooleanFlag = (value: unknown, defaultValue: boolean) => {
  if (typeof value !== 'string') return defaultValue
  const normalized = value.trim().toLowerCase()
  if (!normalized) return defaultValue
  return !disabledValues.has(normalized)
}

export const isCartEnabled = readBooleanFlag(import.meta.env.VITE_STORE_CART_ENABLED, true)
