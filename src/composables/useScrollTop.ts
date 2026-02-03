import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useScrollTop(threshold = 200) {
  const showScrollTop = ref(false)

  const handleScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0
    showScrollTop.value = y >= threshold
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    showScrollTop,
    scrollToTop,
  }
}
