import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCompanionApps, type CompanionApps } from '@/api/companionApps'

export const useCompanionAppsStore = defineStore('companionApps', () => {
  const apps = ref<CompanionApps>({ ios: '', android: '' })
  const hasLinks = computed(() => Boolean(apps.value.ios || apps.value.android))
  let request: Promise<void> | undefined

  function load(): Promise<void> {
    // The homepage and footer share one request per page load.
    if (!request) {
      request = getCompanionApps()
        .then(value => { apps.value = value })
        .catch(() => { console.warn('Wristo app download links are unavailable.') })
    }
    return request
  }

  return { apps, hasLinks, load }
})
