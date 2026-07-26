# CN Visitor China-Site Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a non-blocking, manually dismissible China-site prompt to `wristo.io` visitors whose Vercel country code is `CN`.

**Architecture:** Vercel Routing Middleware serves a private, same-origin region result at `/_wristo/visitor-region`. A tested Store policy module handles region loading, 30-day dismissal, and safe destination mapping; a global Vue component renders the prompt without touching checkout or Paddle behavior.

**Tech Stack:** Vue 3, TypeScript, Vite, Vercel Routing Middleware, `@vercel/functions`, Node test runner

---

## File Structure

- Create `middleware.ts`: return the Vercel geolocation result only for the dedicated region endpoint.
- Create `src/utils/chinaSitePrompt.ts`: own region loading, dismissal policy, and destination mapping as framework-independent functions.
- Create `src/components/ChinaSitePrompt.vue`: render the global non-modal prompt and connect it to the policy module.
- Modify `src/App.vue`: mount the prompt once above the existing site layout.
- Modify `src/i18n.ts`: add English and Simplified Chinese prompt copy; other locales use the existing English fallback.
- Modify `package.json` and `package-lock.json`: add the supported Vercel helper package.
- Create `tests/china-site-prompt.test.mjs`: cover policy behavior, edge endpoint contract, component wiring, and scope exclusions.

### Task 1: Prompt Policy and Destination Mapping

**Files:**
- Create: `src/utils/chinaSitePrompt.ts`
- Create: `tests/china-site-prompt.test.mjs`

- [ ] **Step 1: Write the failing policy tests**

Create `tests/china-site-prompt.test.mjs`:

```js
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
    async () => new Response(
      JSON.stringify({ countryCode: 'US', mainlandChina: false }),
      { headers: { 'content-type': 'application/json' } },
    ),
    async () => new Response(
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
```

- [ ] **Step 2: Run the policy tests to verify they fail**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
```

Expected: FAIL because `src/utils/chinaSitePrompt.ts` does not exist.

- [ ] **Step 3: Implement the minimal policy module**

Create `src/utils/chinaSitePrompt.ts`:

```ts
export const CHINA_SITE_PROMPT_STORAGE_KEY = 'wristo:cn-site-prompt:dismissed-at:v1'

const CHINA_SITE_PROMPT_TTL_MS = 30 * 24 * 60 * 60 * 1000
const REGION_ENDPOINT = '/_wristo/visitor-region'
const CHINA_SITE_APPS_URL = 'https://www.wristo.cn/apps'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface RegionPayload {
  countryCode: string | null
  mainlandChina: boolean
}

interface PromptPolicyOptions {
  fetcher?: typeof fetch
  storage?: StorageLike | null
  now?: () => number
  timeoutMs?: number
}

const isDismissed = (storage: StorageLike | null | undefined, now: number) => {
  if (!storage) return false
  try {
    const dismissedAt = Number(storage.getItem(CHINA_SITE_PROMPT_STORAGE_KEY))
    return Number.isFinite(dismissedAt)
      && dismissedAt > 0
      && now - dismissedAt < CHINA_SITE_PROMPT_TTL_MS
  } catch {
    return false
  }
}

const loadRegion = async (fetcher: typeof fetch, timeoutMs: number): Promise<RegionPayload | null> => {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(REGION_ENDPOINT, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      return null
    }
    const payload = await response.json() as Partial<RegionPayload>
    if (typeof payload.mainlandChina !== 'boolean') return null
    if (payload.countryCode !== null && typeof payload.countryCode !== 'string') return null
    return {
      countryCode: payload.countryCode?.toUpperCase() || null,
      mainlandChina: payload.mainlandChina,
    }
  } catch {
    return null
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export async function shouldShowChinaSitePrompt({
  fetcher = fetch,
  storage = null,
  now = Date.now,
  timeoutMs = 3000,
}: PromptPolicyOptions = {}) {
  if (isDismissed(storage, now())) return false
  const region = await loadRegion(fetcher, timeoutMs)
  return region?.countryCode === 'CN' && region.mainlandChina === true
}

export function dismissChinaSitePrompt(
  storage: StorageLike | null | undefined,
  dismissedAt = Date.now(),
) {
  if (!storage) return
  try {
    storage.setItem(CHINA_SITE_PROMPT_STORAGE_KEY, String(dismissedAt))
  } catch {
    // The prompt still closes for this page when browser storage is unavailable.
  }
}

export function getChinaSiteDestination(pathname: string) {
  const productMatch = pathname.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?product\/(\d+)\/?$/i)
  const appId = productMatch?.[1]
  return appId
    ? `${CHINA_SITE_APPS_URL}/${encodeURIComponent(appId)}`
    : CHINA_SITE_APPS_URL
}
```

- [ ] **Step 4: Run the policy tests to verify they pass**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the policy module**

```bash
git add src/utils/chinaSitePrompt.ts tests/china-site-prompt.test.mjs
git commit -m "add China site prompt policy"
```

### Task 2: Vercel Region Endpoint

**Files:**
- Create: `middleware.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/china-site-prompt.test.mjs`

- [ ] **Step 1: Add the failing edge-contract test**

Append to `tests/china-site-prompt.test.mjs`:

```js
test('Vercel middleware exposes only a private region result', async () => {
  const source = await readFile(new URL('../middleware.ts', import.meta.url), 'utf8')

  assert.match(source, /geolocation\(request\)/)
  assert.match(source, /countryCode/)
  assert.match(source, /mainlandChina:\s*countryCode\s*===\s*'CN'/)
  assert.match(source, /'Cache-Control':\s*'private, no-store'/)
  assert.match(source, /matcher:\s*['"]\/_wristo\/visitor-region['"]/)
  assert.doesNotMatch(source, /ipAddress|x-forwarded-for|longitude|latitude|city/)
})
```

- [ ] **Step 2: Run the edge-contract test to verify it fails**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
```

Expected: FAIL because `middleware.ts` does not exist.

- [ ] **Step 3: Install the Vercel helper dependency**

Run:

```bash
npm install @vercel/functions
```

Expected: `package.json` and `package-lock.json` contain `@vercel/functions`.

- [ ] **Step 4: Implement the dedicated Routing Middleware response**

Create `middleware.ts`:

```ts
import { geolocation } from '@vercel/functions'

export default function middleware(request: Request) {
  const detectedCountry = geolocation(request).country
  const countryCode = detectedCountry?.toUpperCase() || null

  return Response.json(
    {
      countryCode,
      mainlandChina: countryCode === 'CN',
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  )
}

export const config = {
  matcher: '/_wristo/visitor-region',
}
```

- [ ] **Step 5: Run the focused test and TypeScript build**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
npm run build:app
```

Expected: all focused tests PASS and the Vite application build succeeds.

- [ ] **Step 6: Commit the edge endpoint**

```bash
git add middleware.ts package.json package-lock.json tests/china-site-prompt.test.mjs
git commit -m "expose Vercel visitor region"
```

### Task 3: Global China-Site Prompt

**Files:**
- Create: `src/components/ChinaSitePrompt.vue`
- Modify: `src/App.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/china-site-prompt.test.mjs`

- [ ] **Step 1: Add failing component-wiring and scope tests**

Append to `tests/china-site-prompt.test.mjs`:

```js
test('the global prompt stays manual and outside payment behavior', async () => {
  const component = await readFile(
    new URL('../src/components/ChinaSitePrompt.vue', import.meta.url),
    'utf8',
  )
  const app = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')

  assert.match(component, /shouldShowChinaSitePrompt/)
  assert.match(component, /dismissChinaSitePrompt/)
  assert.match(component, /getChinaSiteDestination\(window\.location\.pathname\)/)
  assert.match(component, /window\.location\.assign\(destination\.value\)/)
  assert.match(component, /china-site-prompt__visit/)
  assert.match(component, /china-site-prompt__continue/)
  assert.match(component, /aria-live="polite"/)
  assert.doesNotMatch(component, /Paddle|checkout\\.|setInterval|navigator\.connection/)
  assert.match(app, /import ChinaSitePrompt from '.\\/components\\/ChinaSitePrompt\\.vue'/)
  assert.match(app, /<ChinaSitePrompt\\s*\\/>/)
})

test('prompt copy exists in English and Simplified Chinese', async () => {
  const source = await readFile(new URL('../src/i18n.ts', import.meta.url), 'utf8')

  assert.match(source, /'chinaSitePrompt\\.message': 'It looks like you may be visiting from mainland China\\./)
  assert.match(source, /'chinaSitePrompt\\.visit': 'Visit Wristo China'/)
  assert.match(source, /'chinaSitePrompt\\.continue': 'Continue on Wristo\\.io'/)
  assert.match(source, /'chinaSitePrompt\\.message': '检测到你可能正在中国大陆访问。/)
  assert.match(source, /'chinaSitePrompt\\.visit': '前往中国站'/)
  assert.match(source, /'chinaSitePrompt\\.continue': '继续访问 Wristo\\.io'/)
})
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
```

Expected: FAIL because the component and translation keys do not exist.

- [ ] **Step 3: Add prompt translations**

Add these keys to the English `en` object in `src/i18n.ts`:

```ts
  'chinaSitePrompt.message': 'It looks like you may be visiting from mainland China. For more stable access and Alipay, you can visit Wristo China.',
  'chinaSitePrompt.visit': 'Visit Wristo China',
  'chinaSitePrompt.continue': 'Continue on Wristo.io',
  'chinaSitePrompt.close': 'Close China site suggestion',
```

Add these keys to the `zh` message object:

```ts
    'chinaSitePrompt.message': '检测到你可能正在中国大陆访问。中国站访问更稳定，并支持支付宝付款。',
    'chinaSitePrompt.visit': '前往中国站',
    'chinaSitePrompt.continue': '继续访问 Wristo.io',
    'chinaSitePrompt.close': '关闭中国站提示',
```

Other supported locales intentionally use the existing English fallback.

- [ ] **Step 4: Implement the non-modal prompt component**

Create `src/components/ChinaSitePrompt.vue`:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import {
  dismissChinaSitePrompt,
  getChinaSiteDestination,
  shouldShowChinaSitePrompt,
} from '@/utils/chinaSitePrompt'

const { t } = useI18n()
const visible = ref(false)
const destination = computed(() => getChinaSiteDestination(window.location.pathname))

const browserStorage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const continueOnWristo = () => {
  dismissChinaSitePrompt(browserStorage())
  visible.value = false
}

const visitChinaSite = () => {
  window.location.assign(destination.value)
}

onMounted(async () => {
  visible.value = await shouldShowChinaSitePrompt({
    storage: browserStorage(),
  })
})
</script>

<template>
  <aside
    v-if="visible"
    class="china-site-prompt"
    aria-live="polite"
    :aria-label="t('chinaSitePrompt.message')"
  >
    <div class="china-site-prompt__inner">
      <p>{{ t('chinaSitePrompt.message') }}</p>
      <div class="china-site-prompt__actions">
        <button
          class="china-site-prompt__visit"
          type="button"
          @click="visitChinaSite"
        >
          {{ t('chinaSitePrompt.visit') }}
        </button>
        <button
          class="china-site-prompt__continue"
          type="button"
          @click="continueOnWristo"
        >
          {{ t('chinaSitePrompt.continue') }}
        </button>
        <button
          class="china-site-prompt__close"
          type="button"
          :aria-label="t('chinaSitePrompt.close')"
          @click="continueOnWristo"
        >
          ×
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.china-site-prompt {
  position: relative;
  z-index: calc(var(--layer-header) + 1);
  border-bottom: 1px solid rgba(216, 239, 234, 0.22);
  background: var(--color-brand-strong);
  color: #fff;
}

.china-site-prompt__inner {
  width: min(100%, var(--container-wide));
  min-height: 52px;
  margin: 0 auto;
  padding: 8px var(--page-gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.china-site-prompt p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

.china-site-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.china-site-prompt button {
  min-height: 36px;
  padding: 0 13px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.china-site-prompt__visit {
  border: 1px solid #fff;
  background: #fff;
  color: var(--color-brand-strong);
}

.china-site-prompt__continue,
.china-site-prompt__close {
  border: 1px solid rgba(255, 255, 255, 0.44);
  background: transparent;
  color: #fff;
}

.china-site-prompt__close {
  width: 36px;
  padding: 0;
  font-size: 1.2rem;
}

.china-site-prompt button:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.42);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  .china-site-prompt__inner {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    padding-block: 10px;
  }

  .china-site-prompt__actions {
    flex-wrap: wrap;
  }

  .china-site-prompt__visit,
  .china-site-prompt__continue {
    flex: 1 1 auto;
  }
}
</style>
```

- [ ] **Step 5: Mount the prompt globally**

In `src/App.vue`, add:

```ts
import ChinaSitePrompt from './components/ChinaSitePrompt.vue'
```

Render it before `Layout` so it appears above the sticky header:

```vue
<template>
  <el-config-provider :locale="elementLocale">
    <ChinaSitePrompt />
    <Layout>
      <router-view />
    </Layout>
  </el-config-provider>
</template>
```

- [ ] **Step 6: Run focused tests and the application build**

Run:

```bash
node --test tests/china-site-prompt.test.mjs
npm run build:app
```

Expected: all focused tests PASS and the application build succeeds.

- [ ] **Step 7: Commit the global prompt**

```bash
git add src/components/ChinaSitePrompt.vue src/App.vue src/i18n.ts tests/china-site-prompt.test.mjs
git commit -m "show China site prompt to CN visitors"
```

### Task 4: Full Verification

**Files:**
- Verify only; no expected source changes.

- [ ] **Step 1: Run all source and unit tests**

Run:

```bash
node --test tests/*.test.mjs
```

Expected: all Store tests PASS.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript, Vite build, and SEO prerender all complete successfully.

- [ ] **Step 3: Inspect the final diff and scope**

Run:

```bash
git status --short
git diff HEAD~3 --check
git diff HEAD~3 --stat
rg -n "Paddle|checkout\\.payment|navigator\\.connection" src/components/ChinaSitePrompt.vue src/utils/chinaSitePrompt.ts middleware.ts
```

Expected:

- No whitespace errors.
- Only the planned region endpoint, prompt policy, prompt UI, translations, dependency files, tests, and documentation commits are present.
- The final `rg` command returns no matches.

- [ ] **Step 4: Verify on a Vercel Preview deployment**

Open:

```text
https://<preview-domain>/_wristo/visitor-region
```

Expected:

- The response is JSON with `countryCode` and `mainlandChina`.
- A CN request shows the prompt.
- `Continue on Wristo.io` and close suppress it for 30 days in that browser.
- `Visit Wristo China` maps `/product/{appId}` to
  `https://www.wristo.cn/apps/{appId}`.
- Other pages open `https://www.wristo.cn/apps`.
- No page redirects automatically.

This Vercel Preview check is required before claiming the edge behavior is
runtime-verified; local Vite and static builds cannot supply Vercel
geolocation.
