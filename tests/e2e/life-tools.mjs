// API fixtures only: no live accounts, Garmin simulator or production writes.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const out = new URL('../../../generated/wristo-utilities/life-tools-verification/', import.meta.url).pathname
await mkdir(out, { recursive: true })
console.log('Launching browser')
const browser = await chromium.launch({ channel: 'chrome', headless: true, timeout: 20000 })
console.log('Browser ready')
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const now = Math.floor(Date.now()/1000), id = 'a'.repeat(32), user = { id: 1, nickname: 'Tester', role: 'USER', roles: [] }
const definitions = {
 'days-since': ['Habit Tracker – Wristo', {label:'Practice',startAt:now-86400*128,milestoneDays:200}, {label:'Practice',kind:'resisted'}],
 'quick-log': ['Quick Log', {label:'Water',unit:'ml',portion:250,goal:2000}, {label:'Water',unit:'ml',amount:250,day:'2026-10-20',undoOf:''}],
 'next-up': ['Next Up', {events:[{id:'meeting',title:'Team meeting',startAt:now+3600,endAt:now+7200}]}, {eventId:'meeting',title:'Team meeting'}],
 'battery-diary': ['Battery Diary', {label:'My watch',note:'Changed settings'}, {percent:82,note:'Changed settings'}],
 'quiet-beat': ['Quiet Beat', {bpm:60,minutes:5,presets:[60,90,120]}, {bpm:60,seconds:300}],
 'park-pin': ['Park Pin', {label:'My car',section:'B2 C18',unit:'m'}, {latitude:34.1,longitude:108.9,section:'B2 C18'}]
}
const configs = Object.fromEntries(Object.entries(definitions).map(([k,v])=>[k,{revision:0,values:v[1]}]))
const catalog = Object.entries(definitions).map(([appKey,[name]])=>({appKey,name,nameZh:name,summary:name,summaryZh:name,description:'',descriptionZh:'',instructions:'Link, configure, sync.',instructionsZh:'',logoUrl:'',coverUrl:'',heroUrl:'',shareUrls:[],downloadUrl:''}))
let reject=false, boundCode='', boundId=id, saves=0, habitEfforts=14, fullHistory=false
const state=key=>({installationId:id,appKey:key,bound:true,config:configs[key],progress:key==='days-since'?{completedDays:1,lastDay:Math.floor(now/86400),resistedCount:habitEfforts,knownEventIds:[]}:null,history:fullHistory&&key==='days-since'?Array.from({length:30},(_,i)=>({cursor:32-i,event:{id:String(32-i).padStart(32,'0'),at:now-i*86400,payload:{label:'Practice'}}})):[{cursor:1,event:{id:'b'.repeat(32),at:now,payload:definitions[key][2]}}]})
await context.addInitScript(user=>{localStorage.setItem('wristo-user',JSON.stringify({token:'test-only-token',userInfo:user}))},user)
await context.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url());let data=[]
 if(!url.pathname.startsWith('/api/')){await route.continue();return}
 if(url.pathname.endsWith('/users/info'))data=user
 if(url.pathname.endsWith('/utilities/v1/catalog'))data=catalog
 if(url.pathname.endsWith('/utilities/v1/binding')){boundCode=req.postDataJSON().code;data={bound:true,installationId:boundId}}
 const key=url.pathname.match(/life-tools\/v1\/([^/]+)/)?.[1]
 if(key){
  if(url.pathname.endsWith('/installations'))data=key==='days-since'?[state(key),{...state(key),installationId:'c'.repeat(32)}]:[state(key)]
  if(url.pathname.endsWith('/config')){
   if(reject){await route.fulfill({json:{code:409,msg:'Configuration changed'}});return}
   const c=req.postDataJSON();assert.equal(c.revision,configs[key].revision)
   configs[key]={...c,revision:c.revision+1};saves++;data={...state(key),installationId:url.pathname.split('/').at(-2)}
  }
  if(url.pathname.endsWith('/history')){if(fullHistory&&key==='days-since'){assert.equal(url.searchParams.get('before'),'3');data=[2,1].map(n=>({cursor:n,event:{id:String(n).padStart(32,'0'),at:now-86400*(33-n),payload:{label:'Practice'}}}))}else data=[]}
 }
 await route.fulfill({json:{code:0,data}})
})
context.setDefaultTimeout(15000)
const page=await context.newPage(),errors=[]
page.on('pageerror',e=>errors.push(e.message))
const open=key=>page.goto((process.env.LIFE_TOOLS_URL||'http://127.0.0.1:5199')+'/utilities/'+key)
try{
 for(const key of Object.keys(definitions)){
  console.log('Checking', key)
  await open(key)
  if(key==='days-since')await page.getByText('Habit settings',{exact:true}).click()
  await page.getByRole('button',{name:'Save settings',exact:true}).click()
  await page.getByText('Saved. Choose Sync now on your watch.',{exact:true}).waitFor()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,key+' mobile overflow')
  assert.equal(await page.locator('.history li').count(),1)
  if(key==='days-since')await page.getByText('Habit settings',{exact:true}).click()
  await page.screenshot({path:out+key+'-web-mobile.png',fullPage:true})
 }
 assert.equal(saves,6)
 await open('quick-log')
 await page.getByLabel('Amount per press',{exact:true}).fill('300');reject=true
 await page.getByRole('button',{name:'Save settings',exact:true}).click()
 await page.getByText('Changed elsewhere.',{exact:false}).waitFor()
 assert.equal(await page.getByLabel('Amount per press',{exact:true}).inputValue(),'300')
 assert.equal(await page.getByRole('button',{name:'Save settings',exact:true}).isDisabled(),true)
 reject=false;await page.getByRole('button',{name:'Reload saved settings',exact:true}).click()
 await page.waitForFunction(()=>[...document.querySelectorAll('input')].some(i=>i.value==='250'))
 await page.getByLabel('Binding code',{exact:true}).fill('0012')
 await page.getByRole('button',{name:'Link watch',exact:true}).click()
 await page.waitForFunction(()=>document.querySelector('.binding input').value==='')
 assert.equal(boundCode,'0012')
 await open('next-up');await page.getByRole('button',{name:'Add appointment',exact:true}).click()
 assert.equal(await page.locator('.appointment').count(),2)
 await page.locator('.appointment').last().getByRole('button',{name:'Remove',exact:true}).click()
 assert.equal(await page.locator('.appointment').count(),1)
 await open('days-since')
 assert.equal(await page.getByText('Restore settings from another watch',{exact:true}).count(),0)
 for(const [efforts,stage] of [[0,0],[1,1],[7,2],[14,3],[30,4]]){
  habitEfforts=efforts;await page.getByRole('button',{name:'Reload saved settings',exact:true}).click()
  await page.waitForFunction(stage=>document.querySelector('.garden')?.dataset.stage===String(stage),stage)
  assert.ok((await page.locator('.growth h3').innerText()).startsWith('128 '),'elapsed days independent of resistance')
  assert.ok((await page.locator('.growth p').innerText()).startsWith(String(efforts)+' '))
 }
 assert.equal(await page.locator('.toolbar select').count(),0,'shared habit needs no watch selector')
 await page.getByText('Link a watch',{exact:true}).click();boundId='c'.repeat(32)
 await page.getByLabel('Binding code',{exact:true}).fill('0012')
 await page.getByRole('button',{name:'Link watch',exact:true}).click()
 await page.getByText('Watch linked.',{exact:true}).waitFor()
 assert.equal(boundCode,'0012')
 assert.ok((await page.locator('.growth p').innerText()).startsWith('30 '))
 await page.getByText('Link a watch',{exact:true}).click()
 await page.getByText('Habit settings',{exact:true}).click()
 assert.equal(await page.getByLabel('Personal goal (completed days)',{exact:true}).count(),0)
 await page.getByLabel('Started at',{exact:true}).fill('2020-01-01T12:00')
 await page.getByRole('button',{name:'Save settings',exact:true}).click()
 await page.getByText('Saved. Choose Sync now on your watch.',{exact:true}).waitFor()
 assert.ok(configs['days-since'].values.startAt<now-86400*1000)
 await page.getByText('Habit settings',{exact:true}).click()
 fullHistory=true;await page.getByRole('button',{name:'Reload saved settings',exact:true}).click()
 await page.getByRole('button',{name:'Load older records',exact:true}).click()
 await page.waitForFunction(()=>document.querySelectorAll('.history li').length===32)
 assert.equal(await page.locator('.history li').count(),32)
 assert.equal(await page.getByRole('button',{name:'Load older records',exact:true}).count(),0)
 await page.screenshot({path:out+'habit-tracker-growth-mobile.png',fullPage:true})
 assert.deepEqual(errors,[])
 console.log('PASS: six mobile configuration/history pages, six saves, conflict recovery, leading-zero binding, agenda add/remove, all five resistance-driven growth stages, elapsed days independent of efforts, past start date, replacement-watch progress, 32-record pagination; no browser errors')
}catch(e){ console.error(e); console.log('Page URL', page.url(), 'Errors', errors, await page.locator('body').innerText()); await page.screenshot({path:out+'failure.png',fullPage:true}); throw e }finally{await browser.close()}
