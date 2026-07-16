import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const productGalleryUrl = new URL('../src/utils/productGallery.ts', import.meta.url)
const productImageGalleryUrl = new URL('../src/components/ProductImageGallery.vue', import.meta.url)
const productDetailUrl = new URL('../src/views/products/ProductDetail.vue', import.meta.url)
const productApiUrl = new URL('../src/api/product.ts', import.meta.url)
const productTypesUrl = new URL('../src/types/product.ts', import.meta.url)
const productShareImagesAdminApiUrl = new URL('../src/api/product-share-images.ts', import.meta.url)
const productShareImagePolicyUrl = new URL('../src/utils/productShareImagePolicy.ts', import.meta.url)
const shareImageManagerUrl = new URL('../src/views/admin/ShareImageManager.vue', import.meta.url)
const productGallerySource = await readFile(productGalleryUrl, 'utf8')

const extractInterfaceBody = (source, interfaceName) => {
  const match = source.match(
    new RegExp(`export interface ${interfaceName}\\s*\\{([\\s\\S]*?)^\\}`, 'm'),
  )
  assert.ok(match, `Expected exported interface ${interfaceName}`)
  return match[1]
}

const extractExportedConstBlock = (source, functionName) => {
  const startMarker = `export const ${functionName}`
  const start = source.indexOf(startMarker)
  assert.notEqual(start, -1, `Expected exported function ${functionName}`)
  const nextExport = source.indexOf('\nexport const ', start + startMarker.length)
  return source.slice(start, nextExport === -1 ? source.length : nextExport)
}
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
  moveShareImageIds,
  resolveAvailableGalleryItems,
  resolveCircularGalleryUrl,
  resolveGallerySelectedIndex,
  resolveProductShareImageUrl,
  resolveSelectionAfterItemsChange,
} = await import(productGalleryModuleUrl)

const sourceGalleryItems = [
  {
    key: 'share-a',
    url: 'https://cdn.example.com/a.png',
    alt: 'A',
    kind: 'share',
    sourceId: 'a',
  },
  {
    key: 'share-b',
    url: 'https://cdn.example.com/b.png',
    alt: 'B',
    kind: 'share',
    sourceId: 'b',
  },
  {
    key: 'share-c',
    url: 'https://cdn.example.com/c.png',
    alt: 'C',
    kind: 'share',
    sourceId: 'c',
  },
]
const fallbackGalleryItem = {
  key: 'fixed',
  url: 'https://cdn.example.com/fallback.png',
  alt: 'Fallback',
  kind: 'fixed',
  sourceId: null,
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

test('createProductGalleryItems keeps the fixed app image first and preserves valid share image order', () => {
  const items = createProductGalleryItems(
    [
      { id: 3, imageUrl: '  https://cdn.example.com/third.png  ', altText: ' Third ' },
      { id: 1, imageUrl: '   ', image: { url: '   ' }, altText: 'Empty' },
      { id: 2, image: { url: ' https://cdn.example.com/second.png ' } },
      { id: 4, imageUrl: 'https://cdn.example.com/third.png', altText: 'Duplicate' },
      { id: 5, imageUrl: 'https://cdn.example.com/fallback.png', altText: 'Fixed duplicate' },
    ],
    '  https://cdn.example.com/fallback.png  ',
    'Product name',
  )

  assert.deepEqual(items, [
    {
      key: 'fixed',
      url: 'https://cdn.example.com/fallback.png',
      alt: 'Product name',
      kind: 'fixed',
      sourceId: null,
    },
    {
      key: 'share-3',
      url: 'https://cdn.example.com/third.png',
      alt: 'Third',
      kind: 'share',
      sourceId: 3,
    },
    {
      key: 'share-2',
      url: 'https://cdn.example.com/second.png',
      alt: 'Product name',
      kind: 'share',
      sourceId: 2,
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
        key: 'fixed',
        url: 'https://cdn.example.com/fallback.png',
        alt: 'Product name',
        kind: 'fixed',
        sourceId: null,
      },
      {
        key: 'share-hero',
        url: 'https://cdn.example.com/hero.png',
        alt: 'Hero view',
        kind: 'share',
        sourceId: 'hero',
      },
    ],
  )
})

test('createProductGalleryItems returns valid share images when the fixed image is empty', () => {
  assert.deepEqual(
    createProductGalleryItems(
      [{ id: 1, imageUrl: '  https://cdn.example.com/share.png  ' }],
      '   ',
      'Product name',
    ),
    [
      {
        key: 'share-1',
        url: 'https://cdn.example.com/share.png',
        alt: 'Product name',
        kind: 'share',
        sourceId: 1,
      },
    ],
  )
})

test('createProductGalleryItems returns an empty list when share images and fallback are empty', () => {
  assert.deepEqual(createProductGalleryItems([], '   ', 'Product name'), [])
})

test('resolveAvailableGalleryItems filters failed URLs from the complete item list', () => {
  const items = [fallbackGalleryItem, ...sourceGalleryItems]
  assert.deepEqual(
    resolveAvailableGalleryItems(
      items,
      new Set([fallbackGalleryItem.url, sourceGalleryItems[1].url]),
    ),
    [sourceGalleryItems[0], sourceGalleryItems[2]],
  )
})

test('resolveAvailableGalleryItems returns an empty list when every URL failed', () => {
  assert.deepEqual(
    resolveAvailableGalleryItems(
      sourceGalleryItems,
      new Set(sourceGalleryItems.map((item) => item.url)),
    ),
    [],
  )
})

test('resolveCircularGalleryUrl wraps in both directions', () => {
  assert.equal(
    resolveCircularGalleryUrl(sourceGalleryItems, sourceGalleryItems[2].url, 1),
    sourceGalleryItems[0].url,
  )
  assert.equal(
    resolveCircularGalleryUrl(sourceGalleryItems, sourceGalleryItems[0].url, -1),
    sourceGalleryItems[2].url,
  )
  assert.equal(
    resolveCircularGalleryUrl(sourceGalleryItems, sourceGalleryItems[1].url, 1),
    sourceGalleryItems[2].url,
  )
})

test('resolveCircularGalleryUrl handles empty items and missing selections', () => {
  assert.equal(resolveCircularGalleryUrl([], null, 1), null)
  assert.equal(resolveCircularGalleryUrl(sourceGalleryItems, 'missing', 1), sourceGalleryItems[0].url)
  assert.equal(resolveCircularGalleryUrl(sourceGalleryItems, 'missing', -1), sourceGalleryItems[2].url)
})

test('resolveSelectionAfterItemsChange preserves an existing selection', () => {
  assert.equal(
    resolveSelectionAfterItemsChange(
      sourceGalleryItems,
      sourceGalleryItems.slice().reverse(),
      sourceGalleryItems[1].url,
    ),
    sourceGalleryItems[1].url,
  )
})

test('resolveSelectionAfterItemsChange selects the item at the deleted selection index', () => {
  assert.equal(
    resolveSelectionAfterItemsChange(
      sourceGalleryItems,
      [sourceGalleryItems[0], sourceGalleryItems[2]],
      sourceGalleryItems[1].url,
    ),
    sourceGalleryItems[2].url,
  )
})

test('resolveSelectionAfterItemsChange selects the previous item after deleting the final selection', () => {
  assert.equal(
    resolveSelectionAfterItemsChange(
      sourceGalleryItems,
      sourceGalleryItems.slice(0, 2),
      sourceGalleryItems[2].url,
    ),
    sourceGalleryItems[1].url,
  )
})

test('resolveSelectionAfterItemsChange handles empty lists and selections absent before the change', () => {
  assert.equal(
    resolveSelectionAfterItemsChange(sourceGalleryItems, [], sourceGalleryItems[1].url),
    null,
  )
  assert.equal(
    resolveSelectionAfterItemsChange(sourceGalleryItems, sourceGalleryItems, 'missing'),
    sourceGalleryItems[0].url,
  )
  assert.equal(
    resolveSelectionAfterItemsChange([], sourceGalleryItems, null),
    sourceGalleryItems[0].url,
  )
})

test('moveShareImageIds swaps a known image with its adjacent item', () => {
  const ids = [10, 20, 30]

  assert.deepEqual(moveShareImageIds(ids, 20, -1), [20, 10, 30])
  assert.deepEqual(moveShareImageIds(ids, 20, 1), [10, 30, 20])
  assert.deepEqual(ids, [10, 20, 30])
  assert.match(
    extractExportedConstBlock(productGallerySource, 'moveShareImageIds'),
    /ids:\s*readonly number\[\]/,
  )
})

test('moveShareImageIds returns a copy at boundaries and for unknown IDs', () => {
  const ids = [10, 20, 30]
  for (const result of [
    moveShareImageIds(ids, 10, -1),
    moveShareImageIds(ids, 30, 1),
    moveShareImageIds(ids, 99, 1),
  ]) {
    assert.deepEqual(result, ids)
    assert.notEqual(result, ids)
  }
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
  assert.match(source, /resolveSelectionAfterItemsChange/)
  assert.doesNotMatch(source, /\bsourceItems\b/)
  assert.doesNotMatch(source, /\bfallbackItem\b/)
})

test('public product share image DTO exposes only the public response fields', async () => {
  const productTypesSource = await readFile(productTypesUrl, 'utf8')
  const publicDtoBody = extractInterfaceBody(productTypesSource, 'ProductShareImagePublicVO')
  const publicFields = [...publicDtoBody.matchAll(/^\s*(\w+)(\?)?:\s*([^\n]+)$/gm)].map(
    ([, name, optional, type]) => ({ name, optional: Boolean(optional), type: type.trim() }),
  )

  assert.deepEqual(publicFields, [
    { name: 'id', optional: false, type: 'number' },
    { name: 'sortOrder', optional: false, type: 'number | null' },
    { name: 'altText', optional: false, type: 'string | null' },
    { name: 'imageUrl', optional: false, type: 'string' },
  ])
})

test('admin product share image DTO and API retain the full admin contract', async () => {
  const [productTypesSource, adminApiSource] = await Promise.all([
    readFile(productTypesUrl, 'utf8'),
    readFile(productShareImagesAdminApiUrl, 'utf8'),
  ])
  const adminDtoBody = extractInterfaceBody(productTypesSource, 'ProductShareImageVO')

  for (const field of [
    'id',
    'productId',
    'imageId',
    'type',
    'sortOrder',
    'altText',
    'imageUrl',
    'fileName',
    'isActive',
    'image',
  ]) {
    assert.match(adminDtoBody, new RegExp(`^\\s*${field}\\??:`, 'm'))
  }
  assert.match(adminApiSource, /import type \{ ProductShareImageVO \} from ['"]@\/types['"]/)
  assert.match(
    extractExportedConstBlock(adminApiSource, 'fetchProductShareImages'),
    /Promise<ProductShareImageVO\[\]>/,
  )
  assert.match(
    extractExportedConstBlock(adminApiSource, 'uploadProductShareImages'),
    /Promise<ProductShareImageVO\[\]>/,
  )
})

test('admin share image reorder API uses the atomic order endpoint and payload contract', async () => {
  const adminApiSource = await readFile(productShareImagesAdminApiUrl, 'utf8')
  const reorderApiBlock = extractExportedConstBlock(
    adminApiSource,
    'reorderProductShareImages',
  )

  assert.match(reorderApiBlock, /productImageIds:\s*number\[\]/)
  assert.match(reorderApiBlock, /Promise<ProductShareImageVO\[\]>/)
  assert.match(
    reorderApiBlock,
    /instance\.put\(`\/admin\/products\/\$\{appId\}\/share-images\/order`,\s*\{\s*productImageIds\s*\}\)/,
  )
})

test('share image upload policy exports the exact shared limits', async () => {
  const policySource = await readFile(productShareImagePolicyUrl, 'utf8')
  const { code } = await transformWithEsbuild(
    policySource,
    productShareImagePolicyUrl.pathname,
    {
      loader: 'ts',
      format: 'esm',
      target: 'es2020',
    },
  )
  const policyModuleUrl =
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  const policy = await import(policyModuleUrl)

  assert.equal(policy.MAX_SHARE_IMAGES, 8)
  assert.equal(policy.MAX_SHARE_IMAGE_FILE_SIZE_BYTES, 10 * 1024 * 1024)
  assert.deepEqual(
    [...policy.SUPPORTED_SHARE_IMAGE_TYPES],
    ['image/png', 'image/jpeg', 'image/webp'],
  )
})

test('ShareImageManager consumes upload limits only from the shared policy', async () => {
  const source = await readFile(shareImageManagerUrl, 'utf8')
  const policyImport = source.match(
    /^import\s*\{([^}]*)\}\s*from\s*['"]@\/utils\/productShareImagePolicy['"]$/m,
  )

  assert.ok(policyImport, 'Expected ShareImageManager to import the shared policy')
  const importedNames = policyImport[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .sort()
  assert.deepEqual(importedNames, [
    'MAX_SHARE_IMAGES',
    'MAX_SHARE_IMAGE_FILE_SIZE_BYTES',
    'SUPPORTED_SHARE_IMAGE_TYPES',
  ].sort())

  for (const name of importedNames) {
    assert.doesNotMatch(source, new RegExp(`^const\\s+${name}\\s*=`, 'm'))
  }
  assert.doesNotMatch(source, /^const\s+MAX_FILE_SIZE_BYTES\s*=/m)
  assert.doesNotMatch(source, /^const\s+SUPPORTED_TYPES\s*=/m)
  assert.match(source, /SUPPORTED_SHARE_IMAGE_TYPES\.has\(file\.type\)/)
  assert.match(source, /file\.size > MAX_SHARE_IMAGE_FILE_SIZE_BYTES/)
})

test('public API uses the public DTO while the gallery depends only on its source contract', async () => {
  const [productApiSource, productImageGallerySource, productDetailSource] = await Promise.all([
    readFile(productApiUrl, 'utf8'),
    readFile(productImageGalleryUrl, 'utf8'),
    readFile(productDetailUrl, 'utf8'),
  ])
  const publicApiBlock = extractExportedConstBlock(productApiSource, 'getProductShareImages')
  const galleryPropsBlock = productImageGallerySource.match(
    /defineProps<\{([\s\S]*?)\}>\(\)/,
  )?.[1]
  const productDetailTypeImport = productDetailSource.match(
    /import type \{([\s\S]*?)\} from ['"]@\/types['"]/,
  )?.[1]

  assert.match(productApiSource, /import type \{[^}]*\bProductShareImagePublicVO\b[^}]*\} from ['"]@\/types['"]/)
  assert.match(publicApiBlock, /Promise<ProductShareImagePublicVO\[\]>/)
  assert.ok(galleryPropsBlock, 'Expected ProductImageGallery defineProps block')
  assert.match(galleryPropsBlock, /^\s*images:\s*ProductShareImageSource\[\]/m)
  assert.doesNotMatch(galleryPropsBlock, /\bProductShareImageVO\b/)
  assert.doesNotMatch(productImageGallerySource, /\bProductShareImagePublicVO\b/)
  assert.match(
    productImageGallerySource,
    /type ProductShareImageSource[\s\S]*?from ['"]@\/utils\/productGallery['"]/,
  )
  assert.ok(productDetailTypeImport, 'Expected ProductDetail type import block')
  assert.match(productDetailTypeImport, /\bProductShareImagePublicVO\b/)
  assert.match(
    productDetailSource,
    /const shareImages = ref<ProductShareImagePublicVO\[\]>\(\[\]\)/,
  )
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
