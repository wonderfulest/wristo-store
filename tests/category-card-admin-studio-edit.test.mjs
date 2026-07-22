import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('all category product cards opt into the admin Studio edit entry', async () => {
  const source = await read('../src/views/products/Categories.vue')

  assert.match(source, /<product-card[\s\S]*v-for="product in filteredProducts"[\s\S]*show-admin-edit/)
})

test('ProductCard guards and isolates the admin Studio edit button', async () => {
  const source = await read('../src/components/ProductCard.vue')

  assert.match(source, /showAdminEdit\?: boolean/)
  assert.match(source, /const canEditInStudio = computed\(\(\) =>[\s\S]*props\.showAdminEdit[\s\S]*isAdmin\.value[\s\S]*designId/)
  assert.match(source, /v-if="canEditInStudio"[\s\S]*class="studio-edit-button"/)
  assert.match(source, /title="Edit in Studio"/)
  assert.match(source, /aria-label="Edit in Studio"/)
  assert.match(source, /@click\.stop="editInStudio"/)
  assert.match(source, /import\s*\{\s*openStudioDesign\s*\}\s*from\s*['"]@\/utils\/studio['"]/)
  assert.match(source, /openStudioDesign\(designId\)/)
})
