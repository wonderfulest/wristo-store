import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const productGalleryUrl = new URL('../src/utils/productGallery.ts', import.meta.url)
const productImageGalleryUrl = new URL('../src/components/ProductImageGallery.vue', import.meta.url)
const productDetailUrl = new URL('../src/views/products/ProductDetail.vue', import.meta.url)
const productApiUrl = new URL('../src/api/product.ts', import.meta.url)
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
  resolveAvailableGalleryItems,
  resolveGallerySelectedIndex,
  resolveProductShareImageUrl,
  selectGalleryUrlAfterFailure,
} = await import(productGalleryModuleUrl)

const sourceGalleryItems = [
  { key: 'share-a', url: 'https://cdn.example.com/a.png', alt: 'A' },
  { key: 'share-b', url: 'https://cdn.example.com/b.png', alt: 'B' },
  { key: 'share-c', url: 'https://cdn.example.com/c.png', alt: 'C' },
]
const fallbackGalleryItem = {
  key: 'fallback',
  url: 'https://cdn.example.com/fallback.png',
  alt: 'Fallback',
}

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

test('resolveAvailableGalleryItems filters failed share URLs without mixing in fallback', () => {
  assert.deepEqual(
    resolveAvailableGalleryItems(
      sourceGalleryItems,
      fallbackGalleryItem,
      new Set([sourceGalleryItems[0].url]),
    ),
    sourceGalleryItems.slice(1),
  )
})

test('resolveAvailableGalleryItems returns fallback only after every share image fails', () => {
  assert.deepEqual(
    resolveAvailableGalleryItems(
      sourceGalleryItems,
      fallbackGalleryItem,
      new Set(sourceGalleryItems.map((item) => item.url)),
    ),
    [fallbackGalleryItem],
  )
})

test('selectGalleryUrlAfterFailure selects the next image when selected B fails', () => {
  assert.equal(
    selectGalleryUrlAfterFailure(
      sourceGalleryItems,
      [sourceGalleryItems[0], sourceGalleryItems[2]],
      sourceGalleryItems[1].url,
      sourceGalleryItems[1].url,
    ),
    sourceGalleryItems[2].url,
  )
})

test('selectGalleryUrlAfterFailure selects the previous image when the final image fails', () => {
  assert.equal(
    selectGalleryUrlAfterFailure(
      sourceGalleryItems,
      sourceGalleryItems.slice(0, 2),
      sourceGalleryItems[2].url,
      sourceGalleryItems[2].url,
    ),
    sourceGalleryItems[1].url,
  )
})

test('resolveGallerySelectedIndex returns the selected preview index', () => {
  assert.equal(
    resolveGallerySelectedIndex(sourceGalleryItems, sourceGalleryItems[1].url),
    1,
  )
  assert.equal(resolveGallerySelectedIndex(sourceGalleryItems, 'missing'), 0)
})

test('ProductImageGallery exposes accessible preview, selection, failure, and responsive contracts', async () => {
  const source = await readFile(productImageGalleryUrl, 'utf8')

  assert.match(source, /:preview-src-list="previewSrcList"/)
  assert.match(source, /:initial-index="selectedIndex"/)
  assert.match(source, /preview-teleported/)
  assert.match(source, /showPreview/)
  assert.match(source, /@keydown\.(?:enter|space)/)
  assert.match(source, /tabindex="0"/)
  assert.match(source, /role="button"/)
  assert.match(source, /<button/)
  assert.match(source, /:aria-current="[^\"]+"/)
  assert.match(source, /@click="selectImage\([^\"]+\)"/)
  assert.match(source, /@error="handleImageError\([^\"]+\)"/)
  assert.match(source, /v-if="availableItems\.length > 1"/)
  assert.match(source, /role="group"/)
  assert.match(source, /overflow-x:\s*auto/)
  assert.match(source, /@media\s*\([^)]*max-width:/)
})

test('ProductDetail loads public share images and renders ProductImageGallery', async () => {
  const [productDetailSource, productApiSource] = await Promise.all([
    readFile(productDetailUrl, 'utf8'),
    readFile(productApiUrl, 'utf8'),
  ])

  assert.match(
    productApiSource,
    /export const getProductShareImages[\s\S]*?instance\.get\(`\/public\/products\/app\/\$\{appId\}\/share-images`\)/,
  )
  assert.match(
    productDetailSource,
    /import ProductImageGallery from ['"]@\/components\/ProductImageGallery\.vue['"]/,
  )
  assert.match(productDetailSource, /<ProductImageGallery[\s\S]*?:images="shareImages"/)
  assert.match(productDetailSource, /:fallback-image-url="productPreviewFallback"/)
  assert.match(productDetailSource, /:product-name="product\?\.name \|\| t\('product\.previewAlt'\)"/)
  assert.match(productDetailSource, /ProductShareImageVO/)
  assert.match(productDetailSource, /const shareImages = ref<ProductShareImageVO\[\]>\(\[\]\)/)
  assert.match(productDetailSource, /const loadProductShareImages = async \(\) =>/)
  assert.match(productDetailSource, /await getProductShareImages\(product\.value\.appId\)/)
  assert.match(productDetailSource, /Array\.isArray\([^)]+\)\s*\?[^:]+:\s*\[\]/)
  assert.match(
    productDetailSource,
    /const loadProductShareImages[\s\S]*?catch \(error\)[\s\S]*?console\.warn\([\s\S]*?shareImages\.value = \[\]/,
  )
  assert.match(
    productDetailSource,
    /product\.value = productDetail[\s\S]*?Promise\.all\(\[[\s\S]*?loadRatingState\(\)[\s\S]*?loadProductReviews\(\)[\s\S]*?loadAdminMetrics\(\)[\s\S]*?loadProductShareImages\(\)[\s\S]*?\]\)/,
  )
  assert.doesNotMatch(productDetailSource, /class="product-image-wrap"/)
  assert.doesNotMatch(productDetailSource, /\.product-image-wrap\s*\{/)
  assert.doesNotMatch(productDetailSource, /\.product-image\s*\{/)
  assert.doesNotMatch(productDetailSource, /\.product-image-fallback\s*\{/)
})
