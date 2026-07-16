import instance from '@/config/axios'

export interface ProductShareImageVO {
  id: number
  productId: number
  imageId: number
  type: 'share'
  sortOrder: number
  altText?: string | null
  imageUrl?: string | null
  fileName?: string | null
  image?: {
    id: number
    name?: string | null
    url?: string | null
  } | null
}

export const fetchProductShareImages = (appId: number): Promise<ProductShareImageVO[]> => {
  return instance.get(`/admin/products/${appId}/share-images`)
}

export const uploadProductShareImages = (
  appId: number,
  files: File[],
): Promise<ProductShareImageVO[]> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return instance.post(`/admin/products/${appId}/share-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteProductShareImage = (
  appId: number,
  productImageId: number,
): Promise<void> => {
  return instance.delete(`/admin/products/${appId}/share-images/${productImageId}`)
}
