import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const productGalleryUrl = new URL('../src/utils/productGallery.ts', import.meta.url)
const productImageGalleryUrl = new URL('../src/components/ProductImageGallery.vue', import.meta.url)
const productGallerySource = await readFile(productGalleryUrl, 'utf8')
const { code: productGalleryModuleCode } = await transformWithEsbuild(
  productGallerySource,
  productGalleryUrl.pathname,
  {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  },
)
const productGalleryModuleUrl =
  `data:text/javascript;base64,${Buffer.from(productGalleryModuleCode).toString('base64')}`
const {
  createProductGalleryItems,
  resolveProductShareImageUrl,
} = await import(productGalleryModuleUrl)

test('resolveProductShareImageUrl prefers trimmed imageUrl over nested image URL', () => {
  assert.equal(
    resolveProductShareImageUrl({
      imageUrl: '  https://cdn.example.com/direct.png  ',
      image: { url: 'https://cdn.example.com/nested.png' },
    }),
    'https://cdn.example.com/direct.png',
  )
})

test('resolveProductShareImageUrl falls back to the trimmed nested image URL', () => {
  assert.equal(
    resolveProductShareImageUrl({
      imageUrl: '   ',
      image: { url: '  https://cdn.example.com/nested.png  ' },
    }),
    'https://cdn.example.com/nested.png',
  )
})

test('createProductGalleryItems filters empty URLs, preserves input order, and keeps the first duplicate', () => {
  const items = createProductGalleryItems(
    [
      { id: 3, imageUrl: '  https://cdn.example.com/third.png  ', altText: ' Third ' },
      { id: 1, imageUrl: '   ', image: { url: '   ' }, altText: 'Empty' },
      { id: 2, image: { url: ' https://cdn.example.com/second.png ' } },
      { id: 4, imageUrl: 'https://cdn.example.com/third.png', altText: 'Duplicate' },
    ],
    'https://cdn.example.com/fallback.png',
    'Product name',
  )

  assert.deepEqual(items, [
    {
      key: 'share-3',
      url: 'https://cdn.example.com/third.png',
      alt: 'Third',
    },
    {
      key: 'share-2',
      url: 'https://cdn.example.com/second.png',
      alt: 'Product name',
    },
  ])
})

test('createProductGalleryItems uses trimmed alt text before the product name', () => {
  assert.deepEqual(
    createProductGalleryItems(
      [{ id: 'hero', imageUrl: 'https://cdn.example.com/hero.png', altText: '  Hero view  ' }],
      'https://cdn.example.com/fallback.png',
      'Product name',
    ),
    [
      {
        key: 'share-hero',
        url: 'https://cdn.example.com/hero.png',
        alt: 'Hero view',
      },
    ],
  )
})

test('createProductGalleryItems uses the trimmed fallback only when no share image is valid', () => {
  assert.deepEqual(
    createProductGalleryItems(
      [{ id: 1, imageUrl: '  ', image: { url: '' } }],
      '  https://cdn.example.com/fallback.png  ',
      'Product name',
    ),
    [
      {
        key: 'fallback',
        url: 'https://cdn.example.com/fallback.png',
        alt: 'Product name',
      },
    ],
  )
})

test('createProductGalleryItems returns an empty list when share images and fallback are empty', () => {
  assert.deepEqual(createProductGalleryItems([], '   ', 'Product name'), [])
})

test('ProductImageGallery exposes accessible preview, selection, failure, and responsive contracts', async () => {
  const source = await readFile(productImageGalleryUrl, 'utf8')

  assert.match(source, /:preview-src-list="previewSrcList"/)
  assert.match(source, /:initial-index="selectedIndex"/)
  assert.match(source, /preview-teleported/)
  assert.match(source, /<button/)
  assert.match(source, /:aria-current="[^\"]+"/)
  assert.match(source, /@click="selectImage\([^\"]+\)"/)
  assert.match(source, /@error="handleImageError\([^\"]+\)"/)
  assert.match(source, /v-if="availableItems\.length > 1"/)
  assert.match(source, /overflow-x:\s*auto/)
  assert.match(source, /@media\s*\([^)]*max-width:/)
})
