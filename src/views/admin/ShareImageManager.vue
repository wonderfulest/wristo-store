<template>
  <div class="share-manager-page">
    <section class="share-manager-hero">
      <div>
        <span class="eyebrow">Store administration</span>
        <h1>Share Image Library</h1>
        <p>Select any application, then upload or remove the images used for social sharing.</p>
      </div>
      <div class="policy-card" aria-label="Share image upload limits">
        <strong>{{ MAX_SHARE_IMAGES }}</strong>
        <span>images per app</span>
        <small>PNG, JPEG or WebP · 10 MB each</small>
      </div>
    </section>

    <section class="manager-shell">
      <aside class="app-browser">
        <div class="panel-heading">
          <div>
            <span class="panel-kicker">Applications</span>
            <strong>{{ total }} total</strong>
          </div>
        </div>

        <form class="app-search" @submit.prevent="handleSearch">
          <el-input
            v-model="keyword"
            clearable
            placeholder="Search application name"
            aria-label="Search application name"
            @clear="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-linear" width="18" height="18" aria-hidden="true" />
            </template>
          </el-input>
          <el-button native-type="submit" type="primary">Search</el-button>
        </form>

        <div v-loading="productsLoading" class="app-list">
          <button
            v-for="product in products"
            :key="product.appId"
            type="button"
            class="app-row"
            :class="{ active: selectedProduct?.appId === product.appId }"
            @click="selectProduct(product)"
          >
            <span class="app-thumb">
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="product.name"
              />
              <Icon v-else icon="solar:watch-square-minimalistic-linear" width="24" height="24" aria-hidden="true" />
            </span>
            <span class="app-row-copy">
              <strong>{{ product.name }}</strong>
              <small>App #{{ product.appId }} · {{ formatDate(product.createdAt) }}</small>
            </span>
            <Icon icon="solar:alt-arrow-right-linear" width="18" height="18" aria-hidden="true" />
          </button>

          <el-empty
            v-if="!productsLoading && products.length === 0"
            description="No applications found"
            :image-size="64"
          />
        </div>

        <el-pagination
          v-if="total > pageSize"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          small
          @current-change="loadProducts"
        />
      </aside>

      <main class="asset-workspace">
        <template v-if="selectedProduct">
          <header class="workspace-header">
            <div class="selected-app">
              <span class="selected-app-thumb">
                <img
                  v-if="getProductImage(selectedProduct)"
                  :src="getProductImage(selectedProduct)"
                  :alt="selectedProduct.name"
                />
              </span>
              <div>
                <span class="panel-kicker">Selected application</span>
                <h2>{{ selectedProduct.name }}</h2>
                <p>App #{{ selectedProduct.appId }} · Design {{ selectedProduct.designId || '—' }}</p>
              </div>
            </div>
            <span class="asset-count" :class="{ full: remainingSlots === 0 }">
              {{ shareImages.length }} / {{ MAX_SHARE_IMAGES }}
            </span>
          </header>

          <section class="upload-zone" :class="{ disabled: remainingSlots === 0 }">
            <div class="upload-copy">
              <span class="upload-icon">
                <Icon icon="solar:cloud-upload-bold-duotone" width="28" height="28" aria-hidden="true" />
              </span>
              <div>
                <strong>{{ remainingSlots ? `Add up to ${remainingSlots} more` : 'Image limit reached' }}</strong>
                <p>New images are appended. Existing product images are never replaced.</p>
              </div>
            </div>

            <el-upload
              v-model:file-list="pendingFiles"
              multiple
              :auto-upload="false"
              :limit="MAX_SHARE_IMAGES"
              accept="image/png,image/jpeg,image/webp"
              :disabled="uploading || remainingSlots === 0"
              :on-exceed="handleExceed"
            >
              <el-button :disabled="uploading || remainingSlots === 0">Select images</el-button>
            </el-upload>

            <el-button
              v-if="pendingFiles.length"
              type="primary"
              :loading="uploading"
              :disabled="pendingFiles.length > remainingSlots"
              @click="handleUpload"
            >
              Upload {{ pendingFiles.length }} {{ pendingFiles.length === 1 ? 'image' : 'images' }}
            </el-button>
          </section>

          <section v-loading="imagesLoading" class="asset-section">
            <div class="asset-section-heading">
              <div>
                <span class="panel-kicker">Bound assets</span>
                <h3>Ready to share</h3>
              </div>
              <span>Delete removes one image only.</span>
            </div>

            <div v-if="shareImages.length" class="asset-grid">
              <article v-for="image in shareImages" :key="image.id" class="asset-card">
                <el-image
                  :src="getShareImageUrl(image)"
                  fit="cover"
                  class="asset-image"
                  :preview-src-list="[getShareImageUrl(image)]"
                  preview-teleported
                />
                <footer>
                  <div>
                    <strong :title="getShareImageName(image)">{{ getShareImageName(image) }}</strong>
                    <small>Asset #{{ image.id }}</small>
                  </div>
                  <el-button
                    type="danger"
                    link
                    :loading="deletingId === image.id"
                    :aria-label="`Delete ${getShareImageName(image)}`"
                    @click="handleDelete(image)"
                  >
                    Delete
                  </el-button>
                </footer>
              </article>
            </div>

            <div v-else-if="!imagesLoading" class="empty-assets">
              <Icon icon="solar:gallery-minimalistic-linear" width="42" height="42" aria-hidden="true" />
              <strong>No share images yet</strong>
              <span>Select images above to bind this application's first share assets.</span>
            </div>
          </section>
        </template>

        <div v-else class="empty-workspace">
          <Icon icon="solar:gallery-wide-linear" width="52" height="52" aria-hidden="true" />
          <h2>Select an application</h2>
          <p>Choose an app from the left to manage its share images.</p>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFiles, UploadRawFile, UploadUserFile } from 'element-plus'
import { fetchAdminProductPage } from '@/api/product'
import {
  deleteProductShareImage,
  fetchProductShareImages,
  uploadProductShareImages,
  type ProductShareImageVO,
} from '@/api/product-share-images'
import type { ProductVO } from '@/types'
import {
  MAX_SHARE_IMAGES,
  MAX_SHARE_IMAGE_FILE_SIZE_BYTES,
  SUPPORTED_SHARE_IMAGE_TYPES,
} from '@/utils/productShareImagePolicy'

const products = ref<ProductVO[]>([])
const productsLoading = ref(false)
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 12
const total = ref(0)
const selectedProduct = ref<ProductVO | null>(null)

const shareImages = ref<ProductShareImageVO[]>([])
const imagesLoading = ref(false)
const pendingFiles = ref<UploadUserFile[]>([])
const uploading = ref(false)
const deletingId = ref<number | null>(null)

const remainingSlots = computed(() => Math.max(0, MAX_SHARE_IMAGES - shareImages.value.length))

const loadProducts = async () => {
  productsLoading.value = true
  try {
    const page = await fetchAdminProductPage({
      pageNum: currentPage.value,
      pageSize,
      name: keyword.value.trim() || undefined,
      orderBy: 'created_at:desc',
      populate: '*',
    })
    products.value = page.list || []
    total.value = Number(page.total || 0)

    const retained = products.value.find(product => product.appId === selectedProduct.value?.appId)
    if (retained) {
      selectedProduct.value = retained
    } else if (products.value.length) {
      await selectProduct(products.value[0])
    } else {
      selectedProduct.value = null
      shareImages.value = []
      pendingFiles.value = []
    }
  } finally {
    productsLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  void loadProducts()
}

const selectProduct = async (product: ProductVO) => {
  if (selectedProduct.value?.appId === product.appId && !imagesLoading.value) return
  selectedProduct.value = product
  shareImages.value = []
  pendingFiles.value = []
  await loadShareImages(product.appId)
}

const loadShareImages = async (appId: number) => {
  imagesLoading.value = true
  try {
    shareImages.value = await fetchProductShareImages(appId)
  } catch {
    shareImages.value = []
  } finally {
    imagesLoading.value = false
  }
}

const handleExceed = (_files: File[], currentFiles: UploadFiles) => {
  ElMessage.warning(`This app can accept ${remainingSlots.value} more share image${remainingSlots.value === 1 ? '' : 's'}`)
  pendingFiles.value = currentFiles.slice(0, remainingSlots.value)
}

const handleUpload = async () => {
  if (!selectedProduct.value) return
  const files = pendingFiles.value
    .map(file => file.raw)
    .filter((file): file is UploadRawFile => Boolean(file))

  if (!files.length) {
    ElMessage.warning('Select at least one image')
    return
  }
  if (files.length > remainingSlots.value) {
    ElMessage.warning(`Each app can have at most ${MAX_SHARE_IMAGES} share images`)
    return
  }
  const invalidType = files.find(file => !SUPPORTED_SHARE_IMAGE_TYPES.has(file.type))
  if (invalidType) {
    ElMessage.error(`${invalidType.name} must be a PNG, JPEG, or WebP image`)
    return
  }
  const oversized = files.find(file => file.size > MAX_SHARE_IMAGE_FILE_SIZE_BYTES)
  if (oversized) {
    ElMessage.error(`${oversized.name} exceeds the 10 MB limit`)
    return
  }

  uploading.value = true
  try {
    shareImages.value = await uploadProductShareImages(selectedProduct.value.appId, files)
    pendingFiles.value = []
    ElMessage.success('Share images uploaded and bound')
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (image: ProductShareImageVO) => {
  if (!selectedProduct.value) return
  try {
    await ElMessageBox.confirm(
      'Delete this share image? Other share and product images will remain unchanged.',
      'Delete share image',
      {
        type: 'warning',
        confirmButtonText: 'Delete image',
        cancelButtonText: 'Cancel',
      },
    )
  } catch {
    return
  }

  deletingId.value = image.id
  try {
    await deleteProductShareImage(selectedProduct.value.appId, image.id)
    shareImages.value = shareImages.value.filter(item => item.id !== image.id)
    ElMessage.success('Share image deleted')
  } finally {
    deletingId.value = null
  }
}

const getProductImage = (product: ProductVO) => {
  return product.garminImageUrl || product.heroFile?.url || product.fallbackImageUrl || ''
}

const getShareImageUrl = (image: ProductShareImageVO) => {
  return image.imageUrl || image.image?.url || ''
}

const getShareImageName = (image: ProductShareImageVO) => {
  return image.fileName || image.image?.name || image.altText || `Share image ${image.id}`
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

onMounted(() => {
  void loadProducts()
})
</script>

<style scoped>
.share-manager-page {
  width: min(1440px, calc(100% - 48px));
  margin: 0 auto;
  padding: 48px 0 72px;
  color: var(--color-ink);
}

.share-manager-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 28px;
  padding: 34px 38px;
  overflow: hidden;
  border: 1px solid rgba(15, 107, 104, 0.16);
  border-radius: 28px;
  background:
    radial-gradient(circle at 88% 12%, rgba(245, 158, 11, 0.18), transparent 24rem),
    linear-gradient(135deg, #062f31 0%, #0b5f5c 58%, #0f6b68 100%);
  box-shadow: 0 24px 70px rgba(6, 78, 75, 0.2);
  color: #fff;
}

.eyebrow,
.panel-kicker {
  display: block;
  margin-bottom: 7px;
  color: #fbbf24;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.share-manager-hero h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.3rem, 5vw, 4.7rem);
  font-weight: 700;
  line-height: 0.98;
}

.share-manager-hero p {
  max-width: 680px;
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 1rem;
}

.policy-card {
  min-width: 200px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(16px);
}

.policy-card strong,
.policy-card span,
.policy-card small {
  display: block;
}

.policy-card strong {
  color: #fbbf24;
  font-family: var(--font-display);
  font-size: 2.7rem;
  line-height: 1;
}

.policy-card span {
  margin-top: 4px;
  font-weight: 700;
}

.policy-card small {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.62);
}

.manager-shell {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  min-height: 680px;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-md);
}

.app-browser {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 24px 18px;
  border-right: 1px solid var(--color-line);
  background: #f7faf9;
}

.panel-heading,
.workspace-header,
.asset-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-heading strong {
  font-size: 1.2rem;
}

.panel-kicker {
  color: var(--color-brand);
}

.app-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  margin: 18px 0;
}

.app-list {
  display: grid;
  flex: 1;
  align-content: start;
  gap: 6px;
  min-height: 240px;
}

.app-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px;
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
}

.app-row:hover,
.app-row.active {
  border-color: rgba(15, 107, 104, 0.18);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.app-row.active {
  color: var(--color-brand-strong);
  box-shadow: inset 3px 0 0 var(--color-brand), var(--shadow-sm);
}

.app-thumb,
.selected-app-thumb {
  display: grid;
  overflow: hidden;
  place-items: center;
  border: 1px solid var(--color-line);
  background: #0d1717;
}

.app-thumb {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  color: #fff;
}

.app-thumb img,
.selected-app-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-row-copy {
  min-width: 0;
}

.app-row-copy strong,
.app-row-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-row-copy strong {
  font-size: 0.88rem;
}

.app-row-copy small {
  margin-top: 3px;
  color: var(--color-muted);
  font-size: 0.7rem;
}

.app-browser :deep(.el-pagination) {
  justify-content: center;
  margin-top: 18px;
}

.asset-workspace {
  min-width: 0;
  padding: 30px;
  background:
    linear-gradient(rgba(15, 107, 104, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 107, 104, 0.025) 1px, transparent 1px),
    #fff;
  background-size: 28px 28px;
}

.workspace-header {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-line);
}

.selected-app {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;
}

.selected-app-thumb {
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 18px;
}

.selected-app h2,
.asset-section-heading h3 {
  margin: 0;
}

.selected-app p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.asset-count {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
  font-weight: 800;
}

.asset-count.full {
  background: #fff3dc;
  color: #9a5b00;
}

.upload-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 24px 0;
  padding: 18px;
  border: 1px dashed rgba(15, 107, 104, 0.32);
  border-radius: 18px;
  background: rgba(223, 245, 241, 0.42);
}

.upload-zone.disabled {
  border-color: var(--color-line);
  background: #f8fafc;
}

.upload-copy {
  display: flex;
  align-items: center;
  gap: 13px;
}

.upload-copy p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.upload-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 14px;
  background: var(--color-brand);
  color: #fff;
}

.upload-zone :deep(.el-upload-list) {
  max-width: 280px;
}

.asset-section-heading {
  margin-bottom: 16px;
}

.asset-section-heading > span {
  color: var(--color-muted);
  font-size: 0.76rem;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.asset-card {
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.asset-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #0b1111;
}

.asset-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 12px;
}

.asset-card footer > div {
  min-width: 0;
}

.asset-card footer strong,
.asset-card footer small {
  display: block;
}

.asset-card footer strong {
  overflow: hidden;
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-card footer small {
  margin-top: 2px;
  color: var(--color-muted);
  font-size: 0.66rem;
}

.empty-assets,
.empty-workspace {
  display: grid;
  place-items: center;
  align-content: center;
  color: var(--color-muted);
  text-align: center;
}

.empty-assets {
  min-height: 300px;
  border: 1px dashed var(--color-line);
  border-radius: 18px;
}

.empty-assets strong {
  margin-top: 10px;
  color: var(--color-ink);
}

.empty-assets span {
  max-width: 360px;
  margin-top: 5px;
  font-size: 0.82rem;
}

.empty-workspace {
  min-height: 620px;
}

.empty-workspace h2 {
  margin: 16px 0 4px;
  color: var(--color-ink);
}

.empty-workspace p {
  margin: 0;
}

@media (max-width: 1100px) {
  .manager-shell {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .asset-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .upload-zone {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 760px) {
  .share-manager-page {
    width: min(100% - 24px, 1440px);
    padding-top: 24px;
  }

  .share-manager-hero {
    align-items: stretch;
    flex-direction: column;
    padding: 26px 24px;
  }

  .policy-card {
    min-width: 0;
  }

  .manager-shell {
    display: block;
    overflow: visible;
  }

  .app-browser {
    max-height: 540px;
    border-right: 0;
    border-bottom: 1px solid var(--color-line);
  }

  .asset-workspace {
    padding: 22px 16px;
  }

  .workspace-header {
    align-items: flex-start;
  }

  .asset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 440px) {
  .asset-grid {
    grid-template-columns: 1fr;
  }
}
</style>
