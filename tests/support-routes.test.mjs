import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('support is canonical and legacy FAQ paths redirect permanently', async () => {
  const [routes, guides, vercel] = await Promise.all([
    readSource('src/router/routes.ts'),
    readSource('src/content/faq-guides.ts'),
    readSource('vercel.json'),
  ])

  assert.match(routes, /path: '\/support'/)
  assert.match(routes, /path: `\/:lang\(\$\{langPattern\}\)\/support`/)
  assert.match(guides, /new Set<string>\(\['\/support'\]\)/)
  assert.match(guides, /\?support\(\?:\/\(\[\^\/\?#\]\+\)\)\?/)

  const config = JSON.parse(vercel)
  assert.deepEqual(config.redirects, [
    { source: '/faq', destination: '/support', permanent: true },
    { source: '/faq/:path*', destination: '/support/:path*', permanent: true },
    { source: '/:lang/faq', destination: '/:lang/support', permanent: true },
    { source: '/:lang/faq/:path*', destination: '/:lang/support/:path*', permanent: true },
  ])
})
