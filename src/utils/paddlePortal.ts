const DEFAULT_PADDLE_CUSTOMER_PORTAL_URL = 'https://customer-portal.paddle.com/cpl_01jwyvfajtd3sxb64ahxbz2dv1'

const normalizeEnvValue = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const getPaddleCustomerPortalUrl = () => {
  return normalizeEnvValue(import.meta.env.VITE_WRISTO_PADDLE_CUSTOMER_PORTAL_URL) || DEFAULT_PADDLE_CUSTOMER_PORTAL_URL
}

export const openPaddleCustomerPortal = () => {
  window.open(getPaddleCustomerPortalUrl(), '_blank', 'noopener,noreferrer')
}
