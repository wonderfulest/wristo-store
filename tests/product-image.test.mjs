import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

const result = await build({ entryPoints: ['src/utils/productImage.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
const { getProductImageUrl } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)

test('prefers original artwork over device-framed and promotional images', () => {
  assert.equal(getProductImageUrl({
    rawImageUrl: 'original.png',
    fallbackImageUrl: 'framed.png',
    heroFile: { previewUrl: 'hero-preview.png', url: 'hero.png' },
    garminImageUrl: 'garmin.png',
    imageUrl: 'image.png',
  }), 'original.png')
})

test('retains image fallbacks when original artwork is unavailable', () => {
  assert.equal(getProductImageUrl({ rawImageUrl: '', fallbackImageUrl: 'fallback.png' }), 'fallback.png')
  assert.equal(getProductImageUrl({ heroFile: { previewUrl: 'preview.png', url: 'hero.png' } }), 'preview.png')
  assert.equal(getProductImageUrl({ heroFile: { url: 'hero.png' } }), 'hero.png')
  assert.equal(getProductImageUrl({ garminImageUrl: 'garmin.png' }), 'garmin.png')
  assert.equal(getProductImageUrl({ imageUrl: 'image.png' }), 'image.png')
  assert.equal(getProductImageUrl(null), '')
  assert.equal(getProductImageUrl(), '')
})
