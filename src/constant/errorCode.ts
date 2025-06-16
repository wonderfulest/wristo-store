export const BizErrorCode = {
  SUCCESS: 0,
  SYSTEM_ERROR: -1,
  PARAM_ERROR: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  // 支付相关
  INVALID_PAYMENT_CODE: 1001,
  ALREADY_PAID: 1002,
  PRODUCT_NOT_FOUND: 1003,
} as const

export const BizErrorMessage: Record<number, string> = {
  [BizErrorCode.SUCCESS]: 'success',
  [BizErrorCode.SYSTEM_ERROR]: 'System error',
  [BizErrorCode.PARAM_ERROR]: 'Parameter error',
  [BizErrorCode.NOT_FOUND]: 'Resource not found',
  [BizErrorCode.FORBIDDEN]: 'No access permission',
  [BizErrorCode.INVALID_PAYMENT_CODE]: 'Invalid payment code',
  [BizErrorCode.ALREADY_PAID]: 'Already paid, no need to repeat',
  [BizErrorCode.PRODUCT_NOT_FOUND]: 'Product not found',
}
