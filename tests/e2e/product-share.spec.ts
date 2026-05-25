import { expect, test } from '@playwright/test'

const product = {
  appId: 123456,
  designId: 'test-design',
  userId: 1,
  name: 'Aurora Test Face',
  description: 'A test Garmin watch face for social sharing.',
  price: 4.99,
  garminImageUrl: 'https://cdn.wristo.io/test/aurora.png',
  garminStoreUrl: 'https://apps.garmin.com/apps/aurora-test',
  garminAppUuid: 'test-uuid',
  trialLasts: 7,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  isActive: 1,
  isDeleted: 0,
  download: 100,
  purchase: 10,
  heroFile: {
    id: 1,
    name: 'aurora.png',
    url: 'https://cdn.wristo.io/test/aurora-hero.png',
    previewUrl: null,
    provider: 's3',
  },
  backgroundFile: null,
  categories: [],
  packageStatus: 1,
  payment: {
    paddleProductId: 'pro_test',
    paddlePriceId: 'pri_test',
  },
  devices: [
    {
      id: 1,
      deviceId: 'fenix7',
      displayName: 'fēnix 7',
      imageUrl: null,
    },
  ],
}

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:3000',
  })

  await page.addInitScript(() => {
    Object.defineProperty(window, '__openedUrls', {
      value: [],
      writable: true,
    })

    window.open = ((url?: string | URL, target?: string, features?: string) => {
      ;(window as unknown as { __openedUrls: Array<Record<string, string>> }).__openedUrls.push({
        url: String(url ?? ''),
        target: String(target ?? ''),
        features: String(features ?? ''),
      })
      return window
    }) as typeof window.open
  })

  await page.route('**/api/public/categories/all**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: [],
      }),
    })
  })

  await page.route('**/api/public/products/app/123456**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: product,
      }),
    })
  })
})

test('product detail share buttons open platform share URLs with OG share links', async ({ page }) => {
  await page.goto('/product/123456')

  await expect(page.getByText('Aurora Test Face')).toBeVisible()
  await expect(page.getByTestId('share-twitter')).toBeVisible()

  const cases = [
    {
      testId: 'share-twitter',
      host: 'twitter.com',
      template: 'x/post',
      urlParam: 'url',
    },
    {
      testId: 'share-facebook',
      host: 'www.facebook.com',
      template: 'facebook/post',
      urlParam: 'u',
    },
    {
      testId: 'share-linkedin',
      host: 'www.linkedin.com',
      template: 'linkedin/post',
      urlParam: 'url',
    },
    {
      testId: 'share-pinterest',
      host: 'www.pinterest.com',
      template: 'pinterest/pin',
      urlParam: 'url',
    },
  ]

  for (const item of cases) {
    await page.getByTestId(item.testId).click()
    const opened = await page.evaluate(() => {
      const urls = (window as unknown as { __openedUrls: Array<Record<string, string>> }).__openedUrls
      return urls[urls.length - 1]
    })

    const openedUrl = new URL(opened.url)
    expect(openedUrl.host).toBe(item.host)

    const shareUrl = new URL(openedUrl.searchParams.get(item.urlParam) ?? '')
    expect(shareUrl.origin).toBe('http://localhost:8088')
    expect(shareUrl.pathname).toBe('/share/123456')
    expect(shareUrl.searchParams.get('template')).toBe(item.template)
    expect(shareUrl.searchParams.get('t')).toBeTruthy()
  }

  const pinterest = await page.evaluate(() => {
    const urls = (window as unknown as { __openedUrls: Array<Record<string, string>> }).__openedUrls
    return urls[urls.length - 1]
  })
  const pinterestUrl = new URL(pinterest.url)
  expect(pinterestUrl.searchParams.get('media')).toBe('https://cdn.wristo.io/test/aurora-hero.png')
  expect(pinterestUrl.searchParams.get('description')).toContain('Aurora Test Face')
})

test('copy and system share fallback use the default OG share URL', async ({ page }) => {
  await page.goto('/product/123456')

  await page.getByTestId('share-copy').click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  const copiedUrl = new URL(copied)
  expect(copiedUrl.origin).toBe('http://localhost:8088')
  expect(copiedUrl.pathname).toBe('/share/123456')
  expect(copiedUrl.searchParams.get('template')).toBe('cover/minimal')

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    })
  })
  await page.getByTestId('share-system').click()
  const fallbackCopied = await page.evaluate(() => navigator.clipboard.readText())
  expect(new URL(fallbackCopied).pathname).toBe('/share/123456')
})
