// Keep a completed drag blocked until the next press, including synthetic clicks
// emitted after touch scrolling. Keyboard activation remains available.
export function createNavigationGesture() {
  let origin: { x: number; y: number } | null = null
  let dragged = false
  return {
    start(event: Pick<PointerEvent, 'clientX' | 'clientY'>) {
      origin = { x: event.clientX, y: event.clientY }
      dragged = false
    },
    move(event: Pick<PointerEvent, 'clientX' | 'clientY'>) {
      if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) {
        dragged = true
      }
    },
    cancel() {
      dragged = true
      origin = null
    },
    shouldBlock(event: Pick<MouseEvent, 'detail'>) {
      return event.detail !== 0 && dragged
    },
  }
}
