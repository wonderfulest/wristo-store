export const formatExactCount = (value?: number | null) => {
  if (value == null) return '0'
  const count = Math.floor(Number(value))
  if (!Number.isFinite(count) || count <= 0) return '0'
  return new Intl.NumberFormat('en-US').format(count)
}

export const formatApproxDownloadCount = (value?: number | null) => {
  if (value == null) return '0'

  const count = Math.floor(Number(value))
  if (!Number.isFinite(count) || count <= 0) return '0'
  if (count < 10) return '1+'
  if (count < 100) return '10+'
  if (count < 1_000) return `${Math.floor(count / 100) * 100}+`
  if (count < 10_000) return `${Math.floor(count / 1_000)}K+`
  if (count < 100_000) return `${Math.floor(count / 10_000) * 10}K+`

  return `${Math.floor(count / 100_000) * 100}K+`
}

export const formatApproxAppCount = (value?: number | null) => {
  if (value == null) return null

  const count = Math.floor(Number(value))
  if (!Number.isFinite(count) || count <= 0) return '0'
  if (count < 10) return '<10'
  if (count < 100) return `${Math.floor(count / 10) * 10}+`
  if (count < 1_000) return `${Math.floor(count / 100) * 100}+`

  return `${Math.floor(count / 1_000)}K+`
}

export const formatRoleAwareAppCount = (
  value: number | null | undefined,
  isAdmin: boolean,
) => isAdmin ? formatExactCount(value) : (formatApproxAppCount(value) ?? '0')

export const formatRoleAwareDownloadCount = (
  value: number | null | undefined,
  isAdmin: boolean,
) => isAdmin ? formatExactCount(value) : formatApproxDownloadCount(value)
