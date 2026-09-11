import JSZip from 'jszip'
import type { ProductShareImageSource } from './productGallery'

interface ImageArchiveProduct {
  rawImageUrl?: string | null
  garminImageUrl?: string | null
  productImages?: ProductShareImageSource[] | null
}

export function collectOriginalImages(product: ImageArchiveProduct) {
  const images: { url: string; name: string }[] = []
  const seen = new Set<string>()
  const add = (url: string | null | undefined, name = '') => {
    const original = url?.trim()
    if (!original || seen.has(original)) return
    seen.add(original)
    images.push({ url: original, name })
  }
  add(product.rawImageUrl)
  add(product.garminImageUrl)
  for (const image of product.productImages || []) {
    const original = image.downloadUrl?.trim() || image.imageUrl?.trim() || image.image?.url?.trim()
    if (!original) throw new Error('部分图片缺少原图地址，无法下载全部原图')
    add(original, image.fileName || '')
  }
  return images
}

export async function createProductImageArchive(
  product: ImageArchiveProduct,
  onProgress: (completed: number, total: number) => void = () => {},
) {
  const images = collectOriginalImages(product)
  if (!images.length) throw new Error('暂无可下载的原图')
  const zip = new JSZip()
  onProgress(0, images.length)
  for (const [index, image] of images.entries()) {
    let response: Response
    try {
      response = await fetch(image.url, { signal: AbortSignal.timeout(60000) })
      if (!response.ok) throw new Error(String(response.status))
    } catch {
      throw new Error(`第 ${index + 1} 张原图下载失败，请稍后重试`)
    }
    const type = response.headers.get('content-type')?.split(';')[0] || ''
    if (type.includes('text/') || type.includes('json')) {
      throw new Error(`第 ${index + 1} 张原图返回了无效内容`)
    }
    const bytes = await response.arrayBuffer()
    if (!bytes.byteLength) throw new Error(`第 ${index + 1} 张原图为空`)
    let name = image.name || new URL(image.url, window.location.href).pathname.split('/').pop() || 'image'
    try { name = decodeURIComponent(name) } catch { /* Keep malformed filenames readable. */ }
    name = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/^\.+/, '').slice(0, 160) || 'image'
    if (!/\.(png|jpe?g|webp|gif|avif|svg|bmp|tiff?|heic)$/i.test(name)) {
      const extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' } as Record<string, string>)[type]
      if (extension) name += `.${extension}`
    }
    zip.file(`${String(index + 1).padStart(2, '0')}-${name}`, bytes)
    onProgress(index + 1, images.length)
  }
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}
