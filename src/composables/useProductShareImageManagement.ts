import { computed, ref, watch, type Ref } from 'vue'

import {
  reorderProductShareImageSources,
  type ProductShareImageSource,
} from '@/utils/productGallery'
import {
  MAX_SHARE_IMAGES,
  MAX_SHARE_IMAGE_FILE_SIZE_BYTES,
  SUPPORTED_SHARE_IMAGE_TYPES,
} from '@/utils/productShareImagePolicy'

interface ProductShareImageManagementState {
  appId: Readonly<Ref<number | null | undefined>>
  isAdmin: Readonly<Ref<boolean>>
}

interface ProductShareImageManagementDependencies {
  fetchPublicImages: (appId: number) => Promise<ProductShareImageSource[]>
  fetchAdminImages: (appId: number) => Promise<ProductShareImageSource[]>
  uploadImages: (appId: number, files: File[]) => Promise<ProductShareImageSource[]>
  deleteImage: (appId: number, imageId: number) => Promise<void>
  reorderImages: (appId: number, imageIds: number[]) => Promise<ProductShareImageSource[]>
  confirmDelete: (imageId: number) => Promise<unknown>
  message: {
    warning: (message: string) => unknown
    error: (message: string) => unknown
    success: (message: string) => unknown
  }
  logWarning: (message: string, error: unknown) => void
}

const isMessageBoxDismissal = (error: unknown) => error === 'cancel' || error === 'close'

export const useProductShareImageManagement = (
  state: ProductShareImageManagementState,
  dependencies: ProductShareImageManagementDependencies,
) => {
  const shareImages = ref<ProductShareImageSource[]>([])
  const shareImagesUploading = ref(false)
  const shareImageDeletingId = ref<number | null>(null)
  const shareImagesReordering = ref(false)
  const shareImagesBusy = computed(
    () =>
      shareImagesUploading.value ||
      shareImageDeletingId.value !== null ||
      shareImagesReordering.value,
  )
  let requestVersion = 0

  const matchesIdentity = (appId: number, admin: boolean) =>
    Number(state.appId.value) === appId && state.isAdmin.value === admin

  const matchesRequest = (version: number, appId: number, admin: boolean) =>
    requestVersion === version && matchesIdentity(appId, admin)

  const loadProductShareImages = async () => {
    const appId = Number(state.appId.value)
    const admin = state.isAdmin.value
    const version = ++requestVersion

    if (!appId) {
      if (matchesRequest(version, appId, admin)) shareImages.value = []
      return
    }

    try {
      const images = admin
        ? await dependencies.fetchAdminImages(appId)
        : await dependencies.fetchPublicImages(appId)
      if (matchesRequest(version, appId, admin)) {
        shareImages.value = Array.isArray(images) ? images : []
      }
    } catch (error) {
      if (!matchesRequest(version, appId, admin)) return
      dependencies.logWarning('Failed to load product share images:', error)
      shareImages.value = []
    }
  }

  watch(
    () => [state.appId.value, state.isAdmin.value] as const,
    () => {
      void loadProductShareImages()
    },
    { immediate: true },
  )

  const canStartMutation = () =>
    state.isAdmin.value && Boolean(state.appId.value) && !shareImagesBusy.value

  const addShareImages = async (files: File[]) => {
    if (!canStartMutation() || files.length === 0) return

    const remainingSlots = Math.max(0, MAX_SHARE_IMAGES - shareImages.value.length)
    if (files.length > remainingSlots) {
      dependencies.message.warning(`You can add up to ${remainingSlots} more images`)
      return
    }

    if (files.some((file) => !SUPPORTED_SHARE_IMAGE_TYPES.has(file.type))) {
      dependencies.message.warning('Unsupported image format. Use PNG, JPEG, or WebP')
      return
    }

    if (files.some((file) => file.size > MAX_SHARE_IMAGE_FILE_SIZE_BYTES)) {
      dependencies.message.warning('Each image must be 10 MB or smaller')
      return
    }

    const appId = Number(state.appId.value)
    const version = ++requestVersion
    shareImagesUploading.value = true
    try {
      const images = await dependencies.uploadImages(appId, files)
      if (matchesRequest(version, appId, true)) {
        shareImages.value = Array.isArray(images) ? images : []
        dependencies.message.success('Images added')
      }
    } catch (error) {
      dependencies.logWarning('Failed to add product share images:', error)
    } finally {
      shareImagesUploading.value = false
    }
  }

  const deleteShareImage = async (imageId: number) => {
    if (!canStartMutation()) return

    const appId = Number(state.appId.value)
    shareImageDeletingId.value = imageId
    try {
      try {
        await dependencies.confirmDelete(imageId)
      } catch (error) {
        if (!isMessageBoxDismissal(error)) {
          dependencies.logWarning('Failed to confirm product share image deletion:', error)
        }
        return
      }

      if (!matchesIdentity(appId, true)) return
      const version = ++requestVersion
      try {
        await dependencies.deleteImage(appId, imageId)
        if (matchesRequest(version, appId, true)) {
          shareImages.value = shareImages.value.filter((item) => item.id !== imageId)
          dependencies.message.success('Image deleted')
        }
      } catch (error) {
        dependencies.logWarning('Failed to delete product share image:', error)
      }
    } finally {
      shareImageDeletingId.value = null
    }
  }

  const reorderShareImages = async (imageIds: number[]) => {
    if (!canStartMutation()) return

    const optimisticImages = reorderProductShareImageSources(shareImages.value, imageIds)
    if (!optimisticImages) {
      dependencies.message.error('Unable to reorder images')
      return
    }

    const appId = Number(state.appId.value)
    const snapshot = [...shareImages.value]
    const version = ++requestVersion
    shareImagesReordering.value = true
    shareImages.value = optimisticImages
    try {
      const images = await dependencies.reorderImages(appId, imageIds)
      if (matchesRequest(version, appId, true)) {
        shareImages.value = Array.isArray(images) ? images : []
        dependencies.message.success('Images reordered')
      }
    } catch (error) {
      if (matchesRequest(version, appId, true)) shareImages.value = snapshot
      dependencies.logWarning('Failed to reorder product share images:', error)
      if (matchesIdentity(appId, true)) await loadProductShareImages()
    } finally {
      shareImagesReordering.value = false
    }
  }

  return {
    shareImages,
    shareImagesUploading,
    shareImageDeletingId,
    shareImagesReordering,
    shareImagesBusy,
    loadProductShareImages,
    addShareImages,
    deleteShareImage,
    reorderShareImages,
  }
}
