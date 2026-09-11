import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import JSZip from 'jszip'

const result = await build({ entryPoints: ['src/utils/productImageArchive.ts'], bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false })
const path = new URL('../node_modules/.product-image-archive-test.mjs', import.meta.url)
const { writeFile, unlink } = await import('node:fs/promises')
await writeFile(path, result.outputFiles[0].text)
const { collectOriginalImages, createProductImageArchive } = await import(path.href)
await unlink(path)

test('collects originals including main image, deduplicates without using previews', () => {
  assert.deepEqual(collectOriginalImages({ rawImageUrl: 'https://a/raw.png', productImages: [
    { id: 1, downloadUrl: 'https://a/full.png', previewUrl: 'https://a/thumb.png' },
    { id: 2, imageUrl: 'https://a/raw.png' },
  ] }).map(i => i.url), ['https://a/raw.png', 'https://a/full.png'])
  assert.throws(() => collectOriginalImages({ productImages: [{ id: 3, previewUrl: 'thumb' }] }), /缺少原图/)
})

test('ZIP retains original bytes and unique safe filenames; failure rejects entire archive', async () => {
  const originalFetch = globalThis.fetch
  globalThis.window = { location: { href: 'https://store.example/' } }
  const bytes = new Uint8Array([137, 80, 78, 71, 0, 255])
  globalThis.fetch = async () => new Response(bytes, { headers: { 'content-type': 'image/png' } })
  try {
    const progress = []
    const product = { productImages: [
      { id: 1, imageUrl: 'https://a/one', fileName: '../same.png' },
      { id: 2, imageUrl: 'https://a/two', fileName: '../same.png' },
    ] }
    const blob = await createProductImageArchive(product, (done, total) => progress.push([done, total]))
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    assert.equal(Object.keys(zip.files).length, 2)
    for (const file of Object.values(zip.files)) {
      assert.equal(file.dir, false)
      assert.deepEqual(await file.async('uint8array'), bytes)
    }
    assert.deepEqual(progress, [[0, 2], [1, 2], [2, 2]])
    globalThis.fetch = async () => new Response('missing', { status: 404 })
    await assert.rejects(createProductImageArchive(product), /第 1 张原图下载失败/)
  } finally {
    globalThis.fetch = originalFetch
    delete globalThis.window
  }
})
