import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const collections = JSON.parse(await readFile(new URL('../src/content/collections.json', import.meta.url)))
test('three complete editorial collections contain ten distinct published product links', () => {
  assert.equal(collections.length, 3)
  const products = collections.flatMap(c => c.products)
  assert.equal(products.length, 10)
  assert.equal(new Set(products.map(p => p.appId)).size, 10)
  for (const c of collections) {
    assert.ok(c.guide.length > 100)
    for (const p of c.products) {
      assert.match(p.garminStoreUrl, /^https:\/\/apps\.garmin\.com\/apps\/[a-f0-9-]+$/)
      assert.match(p.image, /^https:\/\/cdn\.wristo\.io\//)
    }
  }
})
for (const c of collections) test(`built ${c.slug} has visible products, canonical and structured data`, async () => {
  const html = await readFile(new URL(`../dist/collections/${c.slug}/index.html`, import.meta.url), 'utf8')
  assert.ok(html.includes(`<title>${c.title} | Wristo</title>`))
  assert.ok(html.includes(`https://www.wristo.io/collections/${c.slug}`))
  assert.match(html, /name="robots" content="index, follow"/)
  assert.ok(html.includes('CollectionPage'))
  for (const p of c.products) assert.ok(html.includes(`href="/app/${p.appId}"`), `missing product ${p.appId}`)
  assert.ok(!html.includes('utm_source='), 'internal links must not replace acquisition attribution')
  const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
  assert.ok(sitemap.includes(`<loc>https://www.wristo.io/collections/${c.slug}</loc>`))
  assert.ok(!sitemap.includes('localhost'))
  assert.ok(!sitemap.includes(`/en/collections/${c.slug}`))
})
