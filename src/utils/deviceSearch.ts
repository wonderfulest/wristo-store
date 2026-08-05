function normalizeDeviceSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function matchesDeviceSearch(
  displayName: string,
  deviceFamily: string,
  query: string,
): boolean {
  const q = normalizeDeviceSearchText(query.trim())
  if (!q) return true

  const name = normalizeDeviceSearchText(displayName || '')
  const family = normalizeDeviceSearchText(deviceFamily || '')
  let queryIndex = 0

  for (const character of name) {
    if (character === q[queryIndex]) queryIndex++
    if (queryIndex === q.length) return true
  }

  return name.includes(q) || family.includes(q)
}
