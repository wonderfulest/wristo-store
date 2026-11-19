/** One event per gesture; all transport retries reuse its identity. */
export async function recordDownloadClick(appId: number, action: 'store' | 'install' = 'store'): Promise<void> {
  if (!Number.isSafeInteger(appId) || appId <= 0) return
  const body = JSON.stringify({ eventId: crypto.randomUUID(), channel: 'web', action })
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`${'/api'}/public/products/${appId}/download-clicks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true,
      })
      if (response.ok || response.status < 500) return
    } catch { /* The server may have accepted a request whose response was lost. */ }
  }
}
