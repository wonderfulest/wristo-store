export const useGA = (app: any) => {
  const measurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || 'G-J92MYN3NVY'

  if (!measurementId || typeof window === 'undefined') return

  let gtag: (...args: any[]) => void
  if (!(window as any).gtag) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    ;(window as any).dataLayer = (window as any).dataLayer || []
    gtag = (...args: any[]) => {
      // Push arguments array to dataLayer to mimic GA's default snippet behavior
      ;(window as any).dataLayer.push(args)
    }
    ;(window as any).gtag = gtag
    gtag('js', new Date())
    gtag('config', measurementId)
  } else {
    gtag = (window as any).gtag
    gtag('config', measurementId)
  }

  app.config.globalProperties.$gtag = {
    event(name: string, params: Record<string, any> = {}) {
      console.log('event', name, params)
      gtag('event', name, params)
    },
    pageView(path: string) {
      console.log('pageView', path)
      gtag('event', 'page_view', { page_path: path })
    }
  }
}
