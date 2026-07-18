import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('localized purchase options pages are prioritized before capped dynamic prerenders', async () => {
  const source = await readFile(new URL('../scripts/prerender-seo.mjs', import.meta.url), 'utf8')
  const prerenderList = source.match(
    /const prerenderRouteList = orderedUniqueRoutes\(\[([\s\S]*?)\]\)\.slice\(0, maxPrerenderRoutes\)/,
  )?.[1]

  assert.ok(prerenderList, 'expected the capped prerender route list')
  assert.match(prerenderList, /\.\.\.localizedPurchaseOptionRoutes/)
  assert.ok(
    prerenderList.indexOf('...localizedPurchaseOptionRoutes') <
      prerenderList.indexOf("...discoveredRoutes.filter((route) => !route.startsWith('/product/'))"),
    'localized purchase option routes must be emitted before dynamic routes consume the prerender limit',
  )
})
