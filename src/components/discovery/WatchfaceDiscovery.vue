<template>
  <section class="discovery-entry storefront-container">
    <div><h2>Find Your Next Watch Face</h2><p>A few quick picks. See what catches your eye.</p></div>
    <button type="button" class="primary" @click="open">Find My Style <span aria-hidden="true">→</span></button>
  </section>
  <el-dialog v-model="visible" title="Find Your Style" width="min(480px, calc(100vw - 24px))" align-center :close-on-click-modal="false" class="discovery-dialog">
    <p class="storage-note">Sign in to save likes and dislikes to your account.</p>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <div v-if="!accountId" class="state">
      <p>Sign in to find your style. No choices are recorded while signed out.</p>
      <button type="button" class="primary" @click="redirectToSsoLogin('store')">Sign In</button>
    </div>
    <p v-else-if="saving" role="status">Saving your choice…</p>
    <div v-if="accountId && loading" class="state" role="status">Finding watch faces…</div>
    <div v-else-if="accountId && loadFailed" class="state"><p>Watch faces couldn’t load.</p><button type="button" @click="load">Try Again</button></div>
    <template v-else-if="accountId && current && !showLikes">
      <p class="progress" aria-live="polite">{{ index + 1 }} of {{ round.length }}</p>
      <div class="face-image"><img v-if="imageUrl && !imageFailed" :key="current.appId" :src="imageUrl" :alt="current.name" @error="imageFailed = true" /><span v-else>Preview unavailable</span></div>
      <h3>{{ current.name }}</h3>
      <div class="choices">
        <button type="button" :disabled="saving" @click="choose('dislike')">✕ Dislike</button>
        <button type="button" class="primary" :disabled="saving" @click="choose('like')">♡ Like</button>
      </div>
      <div class="secondary"><button type="button" :disabled="index === 0 || saving" @click="undo">Undo</button><button type="button" :disabled="saving" @click="choose(null)">Skip</button><button type="button" @click="showLikes = true">View Likes ({{ liked.length }})</button></div>
    </template>
    <div v-else-if="accountId && !loading && !loadFailed" class="results">
      <h3>{{ showLikes ? 'Your Likes' : round.length ? 'All Done!' : 'You’re All Caught Up' }}</h3>
      <p v-if="!liked.length">No likes yet. Try another round or browse the collection.</p>
      <p v-else>{{ liked.length }} watch {{ liked.length === 1 ? 'face' : 'faces' }} you liked. Open one to explore.</p>
      <div class="liked-grid">
        <RouterLink v-for="product in liked" :key="product.appId" :to="addLocaleToPath(`/app/${product.appId}`, localeStore.currentLocale)" @click="visible = false">
          <img :src="getProductImageUrl(product)" :alt="product.name" loading="lazy" /><span>{{ product.name }}</span>
        </RouterLink>
      </div>
      <div class="secondary">
        <button v-if="current" type="button" @click="showLikes = false">Back to Cards</button>
        <button v-if="!current && index > 0" type="button" :disabled="saving" @click="undo">Undo Last Choice</button>
        <button v-if="!current && remaining" type="button" class="primary" :disabled="saving" @click="startRound">Next Round</button>
        <button type="button" @click="visible = false">Continue Browsing</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElDialog } from 'element-plus'
import { getNewProducts, getHotProducts } from '@/api/product'
import type { ProductBaseVO } from '@/types'
import { getProductImageUrl } from '@/utils/productImage'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { selectRound, type Preferences, type Preference } from './preferences'
import { getProductPreferences, setProductPreference } from '@/api/product-preferences'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

const localeStore = useLocaleStore()
const userStore = useUserStore()
const accountId = computed(() => userStore.userInfo?.id ?? null)
const saving = ref(false)
let generation = 0
const visible = ref(false)
const loading = ref(false)
const loadFailed = ref(false)
const error = ref('')
const products = ref<ProductBaseVO[]>([])
const preferences = ref<Preferences>({})
const round = ref<ProductBaseVO[]>([])
const index = ref(0)
const history = ref<Array<{ appId: number; previous: Preference | undefined; changed: boolean }>>([])
const showLikes = ref(false)
const imageFailed = ref(false)
const current = computed(() => round.value[index.value])
const imageUrl = computed(() => getProductImageUrl(current.value))
const liked = computed(() => products.value.filter(product => preferences.value[product.appId] === 'like'))
const remaining = computed(() => selectRound(products.value, preferences.value).length)
watch(() => current.value?.appId, () => { imageFailed.value = false })

function startRound() {
  round.value = selectRound(products.value, preferences.value)
  index.value = 0
  history.value = []
  showLikes.value = false
}
watch(accountId, () => {
  generation++
  preferences.value = {}
  round.value = []
  history.value = []
  index.value = 0
  loading.value = false
  saving.value = false
  loadFailed.value = false
  error.value = ''
  visible.value = false
})

async function load() {
  if (!accountId.value || loading.value || saving.value) return
  const requestGeneration = ++generation
  loading.value = true
  loadFailed.value = false
  error.value = ''
  try {
    const [choices, results] = await Promise.all([
      getProductPreferences(),
      Promise.allSettled([getNewProducts(100), getHotProducts(100)]),
    ])
    if (requestGeneration !== generation) return
    const available = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])
    if (results.every(result => result.status === 'rejected')) throw new Error('load failed')
    products.value = [...new Map(available.map(product => [product.appId, product])).values()]
    preferences.value = Object.fromEntries(choices.filter(choice => choice.preference !== null)
      .map(choice => [choice.appId, choice.preference])) as Preferences
    startRound()
  } catch {
    if (requestGeneration === generation) loadFailed.value = true
  } finally {
    if (requestGeneration === generation) loading.value = false
  }
}
function open() {
  visible.value = true
  if (accountId.value) void load()
}
async function save(appId: number, choice: Preference | null) {
  if (!accountId.value || saving.value) return false
  const requestGeneration = generation
  saving.value = true
  error.value = ''
  try {
    await setProductPreference(appId, choice)
    if (requestGeneration !== generation) return false
    if (choice === null) delete preferences.value[appId]
    else preferences.value[appId] = choice
    return true
  } catch {
    if (requestGeneration === generation) {
      error.value = 'Your choice couldn’t be saved. Please try the same action again.'
    }
    return false
  } finally {
    if (requestGeneration === generation) saving.value = false
  }
}
async function choose(choice: Preference | null) {
  if (!accountId.value || saving.value || !current.value) return
  const appId = current.value.appId
  const previous = preferences.value[appId]
  if (choice && !await save(appId, choice)) return
  history.value.push({ appId, previous, changed: choice !== null })
  index.value++
}
async function undo() {
  if (!accountId.value || saving.value) return
  const last = history.value[history.value.length - 1]
  if (!last) return
  if (last.changed && !await save(last.appId, last.previous ?? null)) return
  history.value.pop()
  index.value--
  showLikes.value = false
}
</script>

<style scoped>
.discovery-entry { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-top: 24px; padding-bottom: 4px; }
.discovery-entry h2 { margin: 0 0 6px; font-size: clamp(20px, 3vw, 26px); color: #202b25; }
.discovery-entry p, .storage-note { margin: 0; color: #647068; font-size: 14px; }
button { min-height: 44px; padding: 10px 18px; border: 1px solid #cad2ca; border-radius: 999px; background: white; color: #263b2e; font: inherit; font-weight: 600; cursor: pointer; }
button.primary { background: #263b2e; border-color: #263b2e; color: white; }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible, a:focus-visible { outline: 3px solid #769b7b; outline-offset: 3px; }
.state, .results { text-align: center; padding: 20px 0; }
.progress { text-align: center; margin: 12px 0; color: #647068; }
.face-image { width: min(100%, 300px); aspect-ratio: 1; margin: auto; border-radius: 24px; background: #f2f4ef; display: grid; place-items: center; overflow: hidden; }
.face-image img { width: 100%; height: 100%; object-fit: contain; }
h3 { text-align: center; font-size: 21px; margin: 16px 0; color: #263b2e; }
.choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.secondary { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
.secondary button:not(.primary) { border-color: transparent; background: transparent; }
.error { color: #a12c30; }
.liked-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 45vh; overflow-y: auto; }
.liked-grid a { display: grid; gap: 8px; text-decoration: none; color: #263b2e; padding: 8px; }
.liked-grid img { width: 100%; aspect-ratio: 1; object-fit: contain; border-radius: 12px; background: #f2f4ef; }
@media (max-width: 600px) { .discovery-entry { align-items: flex-start; flex-direction: column; gap: 12px; } .face-image { width: min(100%, 30dvh); } }
</style>
