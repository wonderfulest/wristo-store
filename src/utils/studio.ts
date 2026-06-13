export const getStudioUrl = () => {
  return import.meta.env.VITE_WRISTO_STUDIO_URL || 'https://studio.wristo.io'
}

export const openStudio = () => {
  window.open(getStudioUrl(), '_blank', 'noopener,noreferrer')
}

export const openStudioDesignCopy = (designId: string) => {
  const normalizedDesignId = designId.trim()
  if (!normalizedDesignId) return

  const studioUrl = new URL('/designs/copy', getStudioUrl())
  studioUrl.searchParams.set('from', normalizedDesignId)
  window.open(studioUrl.toString(), '_blank', 'noopener,noreferrer')
}
