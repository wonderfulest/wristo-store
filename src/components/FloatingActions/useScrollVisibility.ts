import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollVisibility(
  threshold = 200,
  options?: {
    alwaysVisible?: boolean
  }
) {
  const visible = ref(false)
  let scrollTarget: Window | HTMLElement | null = window

  const detectScrollTarget = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Default to window / documentElement scroll
    scrollTarget = window

    // Try to find the primary scrollable container near the viewport center
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const centerEl = document.elementFromPoint(centerX, centerY) as HTMLElement | null

    let el: HTMLElement | null = centerEl
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el)
      const canScrollY = /(auto|scroll)/.test(style.overflowY)
      if (canScrollY && el.scrollHeight > el.clientHeight + 10) {
        scrollTarget = el
        break
      }
      el = el.parentElement
    }
  }

  const getCurrentScrollY = () => {
    if (!scrollTarget) return 0
    if (scrollTarget instanceof Window) {
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      )
    }
    return scrollTarget.scrollTop
  }

  const onScroll = () => {
    visible.value = getCurrentScrollY() > threshold
  }

  onMounted(() => {
    console.log('[FloatingActions] useScrollVisibility mounted, options:', options)
    detectScrollTarget()
    if (options?.alwaysVisible) {
      console.log('[FloatingActions] alwaysVisible mode enabled')
      visible.value = true
      return
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    if (options?.alwaysVisible) return
    window.removeEventListener('scroll', onScroll)
  })

  const scrollToTop = () => {
    console.log('[FloatingActions] scrollToTop called')
    console.log('[FloatingActions] Current scrollY (computed):', getCurrentScrollY())

    // 1) Primary target based on detected scroll container
    if (scrollTarget && scrollTarget instanceof HTMLElement) {
      console.log('[FloatingActions] Primary target: element', scrollTarget)
      scrollTarget.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      console.log('[FloatingActions] Primary target: window')
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    // 2) Extra safety: also try common scroll hosts
    if (typeof document !== 'undefined') {
      const extraTargets: (HTMLElement | Window)[] = [
        window,
        document.documentElement,
        document.body
      ].filter(Boolean) as (HTMLElement | Window)[]

      const layoutMain = document.querySelector('.layout-main') as HTMLElement | null
      const layoutRoot = document.querySelector('.layout-root') as HTMLElement | null

      if (layoutMain) extraTargets.push(layoutMain)
      if (layoutRoot) extraTargets.push(layoutRoot)

      extraTargets.forEach((t) => {
        if (t instanceof Window) {
          t.scrollTo?.({ top: 0, behavior: 'smooth' })
        } else {
          t.scrollTo?.({ top: 0, behavior: 'smooth' })
        }
      })

      console.log('[FloatingActions] Extra scroll applied to common containers')
    }
  }

  return {
    visible,
    scrollToTop
  }
}
