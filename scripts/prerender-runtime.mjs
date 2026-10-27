/** Drain active jobs before rejecting so callers can safely close shared resources. */
export async function mapConcurrent(items, concurrency, run) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
    throw new Error('PRERENDER_CONCURRENCY must be an integer between 1 and 8')
  }
  const results = new Array(items.length)
  let next = 0
  let failure
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (!failure && next < items.length) {
      const index = next++
      try {
        results[index] = await run(items[index], index)
      } catch (error) {
        failure ||= error
      }
    }
  }))
  if (failure) throw failure
  return results
}

/** Build-scoped public API cache; callers include URL, method and language in the key. */
export function createResponseCache() {
  const responses = new Map()
  return async (key, fetchResponse) => {
    if (responses.has(key)) return responses.get(key)
    const pending = Promise.resolve().then(fetchResponse)
    responses.set(key, pending)
    try {
      const response = await pending
      let payload
      try { payload = JSON.parse(response.body) } catch {}
      if (response.status !== 200 || !payload || (payload.code !== undefined && payload.code !== 0)) {
        responses.delete(key)
      }
      return response
    } catch (error) {
      responses.delete(key)
      throw error
    }
  }
}
