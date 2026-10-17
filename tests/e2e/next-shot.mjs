// Browser contract test with mocked HTTP responses. Not a live API / phone sync test.
// NEXT_SHOT_URL=http://127.0.0.1:5198 node tests/e2e/next-shot.mjs
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const out = new URL('../../../generated/wristo-utilities/next-shot/', import.meta.url).pathname
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const id = 'a'.repeat(32), user = { id: 1, nickname: 'Practice Tester', role: 'USER', roles: [] }
let config = { revision: 0, unit: 'yd', distances: [40,60], mode: 'random', minutes: 20, balls: 0, tolerance: 5 }, saved = null, reject = false
const now = 1800000000
const session = (id, at, hits) => ({ id, startedAt: at, endedAt: at + 100, config: { ...config, mode: 'benchmark', minutes: 0, balls: 10 }, shots: Array.from({ length: 10 }, (_, i) => [i % 2 ? 60 : 40, i < hits ? 0 : -1]), completed: true })
const rows = [{cursor:2,session:session('b'.repeat(32),now,8)},{cursor:1,session:session('c'.repeat(32),now-86400,5)}]
await context.addInitScript(({ user }) => { localStorage.setItem('wristo-user', JSON.stringify({ token: 'test-only-token', userInfo: user })); }, { user })
await context.route('**/api/**', async route => {
 const req=route.request(), url=new URL(req.url()); let data=[]
 if (!url.pathname.startsWith('/api/')) { await route.continue(); return }
 if(url.pathname.endsWith('/users/info')) data=user
 if(url.pathname.endsWith('/next-shot/v1/installations')) data=[{installationId:id,bound:true,config}]
 if(url.pathname.endsWith('/sessions')) data=rows
 if(url.pathname.endsWith('/config') && req.method()==='PUT') {
  saved=req.postDataJSON()
  if(reject) { await route.fulfill({ json: {code:409,msg:'Configuration changed'} }); return }
  config={...saved,revision:saved.revision+1}; data={installationId:id,bound:true,config}
 }
 await route.fulfill({ json: {code:0,data} })
})
const page = await context.newPage(), errors=[]
page.on('pageerror', e=>errors.push(e.message))
try {
 await page.goto((process.env.NEXT_SHOT_URL || 'http://127.0.0.1:5198')+'/zh/utilities/next-shot')
 await page.getByText('+30 个百分点', {exact:false}).waitFor()
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false)
 await page.locator('#shot-targets').fill('40,40')
 assert.equal(await page.getByRole('button',{name:'保存训练计划',exact:true}).isDisabled(),true)
 await page.locator('#shot-targets').fill('40,60,80')
 await page.locator('#shot-mode').selectOption('benchmark')
 await page.getByRole('button',{name:'保存训练计划',exact:true}).click()
 await page.getByText('计划已保存。',{exact:false}).waitFor()
 assert.equal(saved.balls,15); assert.equal(saved.minutes,0)
 await page.screenshot({path:out+'phone-history-mobile.png',fullPage:true})
 reject=true
 await page.locator('#shot-tolerance').fill('7')
 await page.getByRole('button',{name:'保存训练计划',exact:true}).click()
 await page.getByText('计划已在其他地方修改',{exact:false}).waitFor()
 assert.equal(await page.locator('#shot-tolerance').inputValue(),'7')
 assert.equal(await page.getByRole('button',{name:'保存训练计划',exact:true}).isDisabled(),true)
 await page.getByRole('button',{name:'加载已保存计划',exact:true}).click()
 await page.waitForFunction(()=>document.querySelector('#shot-tolerance').value==='5')
 assert.equal(await page.getByRole('button',{name:'保存训练计划',exact:true}).isEnabled(),true)
 await page.getByRole('button',{name:'按此条件复测',exact:true}).first().click()
 assert.equal(await page.locator('#shot-targets').inputValue(),'40, 60')
 assert.equal(await page.locator('#shot-mode').inputValue(),'benchmark')
 assert.deepEqual(errors,[])
 console.log('PASS: mobile layout, observed history, comparable retest, validation, save, conflict recovery, reuse plan')
} finally { await browser.close() }
