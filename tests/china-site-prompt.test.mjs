import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const loadPolicy = async () => {
  const url = new URL('../src/utils/chinaSitePrompt.ts', import.meta.url)
  const source = await readFile(url, 'utf8')
  const { code } = await transformWithEsbuild(source, url.pathname, {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const createStorage = (entries = {}) => {
  const values = new Map(Object.entries(entries))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('CN visitors see the prompt unless a current dismissal exists', async () => {
  const policy = await loadPolicy()
  const now = Date.parse('2026-07-26T00:00:00Z')
  const fetcher = async () =>
    new Response(JSON.stringify({ countryCode: 'CN', mainlandChina: true }), {
      headers: { 'content-type': 'application/json' },
    })

  assert.equal(
    await policy.shouldShowChinaSitePrompt({
      fetcher,
      storage: createStorage(),
      now: () => now,
      timeoutMs: 50,
    }),
    true,
  )

  const storage = createStorage()
  policy.dismissChinaSitePrompt(storage, now)
  assert.equal(
    await policy.shouldShowChinaSitePrompt({
      fetcher,
      storage,
      now: () => now + 29 * 24 * 60 * 60 * 1000,
      timeoutMs: 50,
    }),
    false,
  )
  assert.equal(
    await policy.shouldShowChinaSitePrompt({
      fetcher,
      storage,
      now: () => now + 31 * 24 * 60 * 60 * 1000,
      timeoutMs: 50,
    }),
    true,
  )
})

test('unknown, non-CN, failed, and malformed region responses stay silent', async () => {
  const policy = await loadPolicy()
  const cases = [
    async () =>
      new Response(
        JSON.stringify({ countryCode: 'US', mainlandChina: false }),
        { headers: { 'content-type': 'application/json' } },
      ),
    async () =>
      new Response(
        JSON.stringify({ countryCode: null, mainlandChina: false }),
        { headers: { 'content-type': 'application/json' } },
      ),
    async () => new Response('<html>local vite fallback</html>'),
    async () => {
      throw new Error('offline')
    },
  ]

  for (const fetcher of cases) {
    assert.equal(
      await policy.shouldShowChinaSitePrompt({
        fetcher,
        storage: createStorage(),
        timeoutMs: 50,
      }),
      false,
    )
  }
})

test('invalid dismissal data fails open and storage failures do not break detection', async () => {
  const policy = await loadPolicy()
  const fetcher = async () =>
    new Response(
      JSON.stringify({ countryCode: 'CN', mainlandChina: true }),
      { headers: { 'content-type': 'application/json' } },
    )
  const brokenStorage = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('blocked')
    },
  }

  assert.equal(
    await policy.shouldShowChinaSitePrompt({
      fetcher,
      storage: createStorage({ [policy.CHINA_SITE_PROMPT_STORAGE_KEY]: 'not-a-date' }),
      timeoutMs: 50,
    }),
    true,
  )
  assert.equal(
    await policy.shouldShowChinaSitePrompt({
      fetcher,
      storage: brokenStorage,
      timeoutMs: 50,
    }),
    true,
  )
  assert.doesNotThrow(() => policy.dismissChinaSitePrompt(brokenStorage, Date.now()))
})

test('only exact product routes carry an app ID to wristo.cn', async () => {
  const policy = await loadPolicy()

  assert.equal(
    policy.getChinaSiteDestination('/product/163808'),
    'https://www.wristo.cn/apps/163808',
  )
  assert.equal(
    policy.getChinaSiteDestination('/en/product/163808'),
    'https://www.wristo.cn/apps/163808',
  )
  assert.equal(
    policy.getChinaSiteDestination('/product/not-a-number?email=user@example.com'),
    'https://www.wristo.cn/apps',
  )
  assert.equal(
    policy.getChinaSiteDestination('/checkout?email=user@example.com&token=secret'),
    'https://www.wristo.cn/apps',
  )
})

test('Vercel middleware exposes only a private region result', async () => {
  const source = await readFile(new URL('../middleware.ts', import.meta.url), 'utf8')

  assert.match(source, /geolocation\(request\)/)
  assert.match(source, /countryCode/)
  assert.match(source, /mainlandChina:\s*countryCode\s*===\s*'CN'/)
  assert.match(source, /'Cache-Control':\s*'private, no-store'/)
  assert.match(source, /matcher:\s*['"]\/_wristo\/visitor-region['"]/)
  assert.doesNotMatch(source, /ipAddress|x-forwarded-for|longitude|latitude|city/)
})
