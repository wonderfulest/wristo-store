// Paddle.js amounts are major currency units (unlike Paddle REST API amounts).
// See https://developer.paddle.com/paddle-js/events/checkout-completed/
const purchaseStorageKey = 'wristo.ga4.purchases.v1'
const sent = new Set<string>()
const pending = new Map<string, Promise<void>>()
const nonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

function recordedPurchases(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(purchaseStorageKey) || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** Only provider checkout events count; visiting the success route never does. */
export async function trackPaddleEvent(event: any): Promise<void> {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (typeof gtag !== 'function') return
  const isPurchase = event?.name === 'checkout.completed'
  if (!isPurchase && event?.name !== 'checkout.loaded') return
  const data = event.data
  const id = isPurchase ? data?.transaction_id : data?.id
  if (typeof id !== 'string' || !id.trim() ||
      typeof data?.currency_code !== 'string' || !/^[A-Z]{3}$/.test(data.currency_code) ||
      !Array.isArray(data.items) || !data.items.length ||
      !nonNegative(data.totals?.total) || !nonNegative(data.totals?.tax) ||
      data.totals.total < data.totals.tax) return
  const key = `${isPurchase ? 'purchase' : 'begin_checkout'}:${id}`
  if (pending.has(key)) return pending.get(key)
  if (sent.has(key) || (isPurchase && recordedPurchases().includes(id))) return

  const items = []
  for (const item of data.items) {
    if (typeof item?.price_id !== 'string' || !item.price_id ||
        !Number.isInteger(item.quantity) || item.quantity <= 0 ||
        !nonNegative(item.totals?.total) || !nonNegative(item.totals?.tax) ||
        item.totals.total < item.totals.tax) return
    items.push({
      item_id: item.price_id,
      ...(typeof item.product?.name === 'string' ? { item_name: item.product.name } : {}),
      // total - tax already includes discounts. Do not subtract discount again.
      price: (item.totals.total - item.totals.tax) / item.quantity,
      quantity: item.quantity,
    })
  }
  const params = {
    currency: data.currency_code,
    value: Number((data.totals.total - data.totals.tax).toFixed(6)),
    items,
    ...(isPurchase ? { transaction_id: id, tax: data.totals.tax } : {}),
  }
  // Allow GA to enqueue/send before existing callbacks redirect the browser.
  // The fallback keeps checkout working even with blocked analytics transport.
  let finish!: () => void
  const delivery = new Promise<void>(resolve => { finish = resolve })
  pending.set(key, delivery)
  const timer = setTimeout(finish, 800)
  try {
    gtag('event', isPurchase ? 'purchase' : 'begin_checkout', {
      ...params,
      transport_type: 'beacon',
      event_callback: finish,
      event_timeout: 800,
    })
    sent.add(key)
    if (isPurchase) {
      try {
        window.localStorage.setItem(purchaseStorageKey, JSON.stringify([...recordedPurchases(), id].slice(-200)))
      } catch { /* Storage restrictions must not interrupt payment. */ }
    }
    if (!isPurchase) finish()
    await delivery
  } catch { /* Analytics failure must not interrupt payment. */ }
  finally {
    clearTimeout(timer)
    finish()
    pending.delete(key)
  }
}
