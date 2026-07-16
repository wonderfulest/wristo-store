import instance from '@/config/axios'
import type { ProductShareImageVO } from '@/types'

export type { ProductShareImageVO }

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

export const reorderProductShareImages = (
  appId: number,
  productImageIds: number[],
): Promise<ProductShareImageVO[]> => {
  return instance.put(`/admin/products/${appId}/share-images/order`, { productImageIds })
}
