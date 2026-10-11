/** Textareas expose LF-only values; retain original newline bytes outside edited ranges. */
export const normalizeTextareaText = (text: string): string => text.replace(/\r\n?/g, '\n')

export function rawTextOffset(text: string, normalizedOffset: number): number {
  let raw = 0, normalized = 0
  while (raw < text.length && normalized < normalizedOffset) {
    raw += text[raw] === '\r' && text[raw + 1] === '\n' ? 2 : 1
    normalized++
  }
  return raw
}

export function applyTextareaEdit(previous: string, next: string): string {
  const normalized = normalizeTextareaText(previous)
  let prefix = 0, suffix = 0
  while (prefix < normalized.length && prefix < next.length && normalized[prefix] === next[prefix]) prefix++
  while (suffix < normalized.length - prefix && suffix < next.length - prefix &&
    normalized[normalized.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++
  return previous.slice(0, rawTextOffset(previous, prefix)) + next.slice(prefix, next.length - suffix) +
    previous.slice(rawTextOffset(previous, normalized.length - suffix))
}

export function pasteTextareaText(previous: string, start: number, end: number, clipboard: string): string {
  return previous.slice(0, rawTextOffset(previous, start)) + clipboard + previous.slice(rawTextOffset(previous, end))
}

/** Anchor repeated newline edits to the selection captured before the browser mutates it. */
export function applySelectedTextareaEdit(previous: string, next: string, start: number, end: number, inputType: string): string {
  const normalized = normalizeTextareaText(previous)
  if (start === end && inputType.startsWith('delete')) {
    const removed = Math.max(0, normalized.length - next.length)
    if (inputType.endsWith('Backward')) start = Math.max(0, start - removed)
    else if (inputType.endsWith('Forward')) end = Math.min(normalized.length, end + removed)
  }
  const prefix = normalized.slice(0, start), suffix = normalized.slice(end)
  if (next.length >= prefix.length + suffix.length && next.startsWith(prefix) && next.endsWith(suffix)) {
    return pasteTextareaText(previous, start, end, next.slice(prefix.length, next.length - suffix.length))
  }
  return applyTextareaEdit(previous, next)
}
