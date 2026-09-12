import { computed, reactive, ref, watch, type Ref } from 'vue'
import { getDiscoveryRecommendations } from '@/api/discovery'
import { getProductPreferences, setProductPreference } from '@/api/product-preferences'
import { getProductDetail } from '@/api/product'
import { useUserStore } from '@/store/user'
import type { ProductBaseVO } from '@/types'
import type { Preference, Preferences } from './preferences'

type Choice = { product: ProductBaseVO; previous: Preference | undefined; changed: boolean }

export function useDiscovery(deviceId: Ref<number | null>) {
  const userStore = useUserStore()
  const accountId = computed(() => userStore.userInfo?.id ?? null)
  const loading = ref(false)
  const saving = ref(false)
  const loaded = ref(false)
  const loadFailed = ref(false)
  const error = ref('')
  const preferences = ref<Preferences>({})
  const round = ref<ProductBaseVO[]>([])
  const index = ref(0)
  const history = ref<Choice[]>([])
  const showLikes = ref(false)
  const likesLoading = ref(false)
  const cache = ref<Record<number, ProductBaseVO>>({})
  const skipped = new Set<number>()
  const attemptedLikes = reactive(new Set<number>())
  let generation = 0
  let request = 0
  const current = computed(() => round.value[index.value])
  const likedIds = computed(() => Object.keys(preferences.value).filter(id => preferences.value[id] === 'like').map(Number))
  const likeCount = computed(() => likedIds.value.length)
  const liked = computed(() => likedIds.value.map(id => cache.value[id]).filter(Boolean))
  const hasMoreLikes = computed(() => likedIds.value.some(id => !cache.value[id] && !attemptedLikes.has(id)))
  const valid = () => !!accountId.value && Number.isInteger(deviceId.value) && Number(deviceId.value) > 0

  watch([accountId, deviceId], () => {
    generation++
    request++
    preferences.value = {}
    round.value = []
    index.value = 0
    history.value = []
    cache.value = {}
    skipped.clear()
    attemptedLikes.clear()
    loading.value = saving.value = loaded.value = loadFailed.value = likesLoading.value = false
    showLikes.value = false
    error.value = ''
  }, { flush: 'sync' })

  async function recommendations() {
    if (!valid()) return
    const token = ++request
    const session = generation
    loading.value = true
    loadFailed.value = false
    const blocked = new Set([...Object.keys(preferences.value).map(Number), ...skipped])
    let recent: number[] = []
    try {
      // Retry only filtered nonempty batches, bounded even for accounts with over 1,000 choices.
      for (let attempt = 0; attempt < 3; attempt++) {
        const products = await getDiscoveryRecommendations({
          deviceId: deviceId.value!, likedAppIds: likedIds.value.slice(-200),
          excludedAppIds: [...new Set([...recent, ...[...blocked].reverse()])].slice(0, 1000), limit: 10,
        })
        if (session !== generation || token !== request) return
        const available = [...new Map(products.map(product => [product.appId, product])).values()]
          .filter(product => !blocked.has(product.appId))
        if (available.length || !products.length || attempt === 2) {
          round.value = available
          index.value = 0
          for (const product of available) cache.value[product.appId] = product
          break
        }
        recent = [...products.map(product => product.appId), ...recent]
      }
      loaded.value = true
    } catch {
      if (session === generation && token === request) {
        loadFailed.value = true
        error.value = 'Watch faces couldn’t load. Please try again.'
      }
    } finally {
      if (session === generation && token === request) loading.value = false
    }
  }

  async function load() {
    if (!valid() || loading.value || saving.value) return
    const session = generation
    const token = ++request
    loading.value = true
    error.value = ''
    loadFailed.value = false
    try {
      const choices = await getProductPreferences()
      if (session !== generation || token !== request) return
      preferences.value = Object.fromEntries(choices.filter(choice => choice.preference !== null)
        .map(choice => [choice.appId, choice.preference])) as Preferences
      await recommendations()
    } catch {
      if (session === generation) {
        loadFailed.value = true
        error.value = 'Your preferences couldn’t load. Please try again.'
      }
    } finally {
      if (session === generation) loading.value = false
    }
  }

  async function save(appId: number, choice: Preference | null) {
    const session = generation
    saving.value = true
    error.value = ''
    try {
      await setProductPreference(appId, choice)
      if (session !== generation) return false
      if (choice === null) delete preferences.value[appId]
      else preferences.value[appId] = choice
      return true
    } catch {
      if (session === generation) error.value = 'Your choice couldn’t be saved. Please try again.'
      return false
    } finally {
      if (session === generation) saving.value = false
    }
  }

  async function choose(choice: Preference | null) {
    if (!valid() || loading.value || saving.value || !current.value) return
    const product = current.value
    const previous = preferences.value[product.appId]
    if (choice && !await save(product.appId, choice)) return
    history.value.push({ product, previous, changed: choice !== null })
    if (choice === null) skipped.add(product.appId)
    index.value++
    if (choice === 'like' || !current.value) await recommendations()
  }

  async function undo() {
    if (!valid() || saving.value) return
    const last = history.value[history.value.length - 1]
    if (!last) return
    request++
    loading.value = false
    if (last.changed && !await save(last.product.appId, last.previous ?? null)) return
    history.value.pop()
    skipped.delete(last.product.appId)
    round.value = [last.product]
    index.value = 0
    showLikes.value = false
    loadFailed.value = false
    error.value = ''
  }

  async function loadLikes() {
    if (!accountId.value || likesLoading.value) return
    const session = generation
    const ids = likedIds.value.filter(id => !cache.value[id] && !attemptedLikes.has(id)).slice(0, 12)
    if (!ids.length) return
    likesLoading.value = true
    error.value = ''
    ids.forEach(id => attemptedLikes.add(id))
    const results = await Promise.allSettled(ids.map(id => getProductDetail(String(id))))
    if (session !== generation) return
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') cache.value[result.value.appId] = result.value
      else attemptedLikes.delete(ids[index])
    })
    if (results.some(result => result.status === 'rejected')) error.value = 'Some saved watch faces are unavailable.'
    likesLoading.value = false
  }
  watch(showLikes, value => { if (value) void loadLikes() })

  return { accountId, loading, saving, loaded, loadFailed, error, current, liked, likeCount, history,
    showLikes, round, index, likesLoading, hasMoreLikes, load, choose, undo, loadLikes }
}
