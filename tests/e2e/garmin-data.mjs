// Local fixture verification only; never calls Garmin or changes a live account.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const out = new URL('../../../generated/garmin-data-verification/', import.meta.url).pathname
console.log('Preparing artifacts', out)
await mkdir(out, { recursive: true })
console.log('Launching browser')
const browser = await chromium.launch({ channel: 'chrome', headless: true, timeout: 20000 })
console.log('Browser ready')
const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, permissions: ['clipboard-read', 'clipboard-write'] })
const user = { id: 1, nickname: 'Tester', username: 'Tester', email: 'test@example.com', roles: [] }
const uuid = '11111111-2222-3333-4444-555555555555'
let connected = true, pending = false, deletes = 0, failData = false, failStatus = false, failDelete = false
let releaseSlow
const requests = []
await context.addInitScript(user => localStorage.setItem('wristo-user', JSON.stringify({ token: 'test-only', userInfo: user })), user)
await context.route('**/api/**', async route => {
  const request = route.request(), url = new URL(request.url())
  if (!url.pathname.startsWith('/api/')) return route.continue()
  let data = []
  if (url.pathname.endsWith('/users/info')) data = user
  if (url.pathname.endsWith('/garmin/connection')) {
    if (request.method() === 'DELETE') {
      deletes++
      if (failDelete) return route.fulfill({ json: { code: 500, msg: 'fixture delete failure' } })
      connected = false; pending = true; data = true
    } else {
      if (failStatus) return route.fulfill({ json: { code: 500, msg: 'fixture status failure' } })
      data = { connected, revocationPending: pending, garminUserId: connected ? uuid : null, permissions: ['ACTIVITY_EXPORT', 'HEALTH_EXPORT'], connectedAt: '2026-11-10T01:00:00Z', activities: connected ? 1 : 0, health: connected ? 1 : 0 }
    }
  }
  if (url.pathname.endsWith('/garmin/summaries')) {
    const type = url.searchParams.get('type'); requests.push([type, url.searchParams.get('limit')])
    if (failData) return route.fulfill({ json: { code: 500, msg: 'fixture data failure' } })
    if (type === 'activities') data = [{ userId: uuid, summaryId: 'run-1', activityName: 'Morning run', distanceInMeters: 5000, durationInSeconds: 1800, details: { test: true } }]
    if (type === 'dailies') data = [{ summaryId: 'day-1', steps: 1234, calendarDate: '2026-11-10' }]
    if (type === 'sleeps') { await new Promise(resolve => { releaseSlow = resolve }); data = [{ summaryId: 'stale-sleep' }] }
  }
  await route.fulfill({ json: { code: 0, data } })
})
const page = await context.newPage(), errors = []
page.on('pageerror', e => { errors.push(e.message); console.error('Browser error', e.message) })
page.setDefaultTimeout(10000)
try {
  console.log('Opening profile')
  await page.goto('http://127.0.0.1:5197/en/user/profile', { waitUntil: 'domcontentloaded' })
  console.log('Profile loaded')
  await page.getByText(uuid, { exact: true }).waitFor()
  await page.getByRole('button', { name: '复制 UUID' }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), uuid)
  await page.getByRole('link', { name: '查看 Garmin 数据' }).click()
  await page.getByRole('heading', { name: 'Morning run' }).waitFor()
  assert.ok(page.url().endsWith('/en/user/garmin'))
  await page.getByText('查看原始 JSON', { exact: true }).click()
  assert.ok((await page.locator('pre').innerText()).includes('"test": true'))
  await page.screenshot({ path: out + 'desktop.png', fullPage: true })
  await page.getByLabel('数据类型').selectOption('dailies')
  await page.getByText('1234', { exact: true }).waitFor()
  await page.getByLabel('显示条数').selectOption('50')
  await page.getByText('1234', { exact: true }).waitFor()
  assert.ok(requests.some(([type, limit]) => type === 'dailies' && limit === '50'))
  await page.getByLabel('数据类型').selectOption('sleeps')
  await page.waitForFunction(() => document.body.innerText.includes('正在读取 sleeps'))
  // Wait for the held network request to be observed before switching away.
  while (!releaseSlow) await new Promise(resolve => setTimeout(resolve, 10))
  await page.getByLabel('数据类型').selectOption('dailies')
  await page.getByText('1234', { exact: true }).waitFor()
  const slowResponse = page.waitForResponse(r => r.url().includes('type=sleeps'))
  releaseSlow(); await slowResponse
  await page.getByText('1234', { exact: true }).waitFor()
  assert.equal(await page.getByText('stale-sleep', { exact: true }).count(), 0)
  await page.getByLabel('数据类型').selectOption('hrv')
  await page.getByText('尚未收到此类数据。', { exact: false }).waitFor()
  failData = true
  await page.getByRole('button', { name: '刷新数据', exact: true }).click()
  await page.getByText('数据读取失败，请点击刷新数据重试。').waitFor()
  failData = false
  await page.getByLabel('数据类型').selectOption('dailies')
  await page.getByText('1234', { exact: true }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await page.screenshot({ path: out + 'mobile.png', fullPage: true })
  await page.getByRole('button', { name: '解绑 Garmin', exact: true }).click()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  assert.equal(deletes, 0)
  failDelete = true
  await page.getByRole('button', { name: '解绑 Garmin', exact: true }).click()
  await page.getByRole('button', { name: '确认解绑', exact: true }).click()
  await page.getByText('解绑失败，请刷新状态后重试。').waitFor()
  assert.equal(connected, true)
  failDelete = false
  await page.getByRole('button', { name: '解绑 Garmin', exact: true }).click()
  await page.getByRole('button', { name: '确认解绑', exact: true }).click()
  await page.getByText('解绑处理中', { exact: true }).waitFor()
  assert.equal(deletes, 2)
  assert.equal(await page.locator('.record').count(), 0)
  assert.equal(await page.getByText(uuid, { exact: true }).count(), 0)
  assert.equal(await page.getByRole('link', { name: '连接 Garmin', exact: false }).count(), 0)
  pending = false
  await page.getByRole('button', { name: '刷新状态' }).click()
  await page.getByRole('link', { name: '连接 Garmin', exact: false }).waitFor()
  failStatus = true
  await page.getByRole('button', { name: '刷新状态' }).click()
  await page.getByText('状态暂不可用', { exact: true }).waitFor()
  assert.deepEqual(errors, [])
  console.log('PASS: UUID copy, localized navigation, records/JSON, limit, stale response, empty/error states, mobile layout, cancel/failure/success disconnect and revocation state')
} catch (error) { console.error('Page errors:', errors); console.error('URL:', page.url()); console.error((await page.locator('body').innerText()).slice(0, 2500)); throw error } finally { await browser.close() }
