<template>
  <section class="discovery-entry storefront-container">
    <div class="entry-panel">
      <div class="entry-art" aria-hidden="true">
        <div class="mini-face face-back"><span>10<span class="mini-colon">:</span>08</span><small>MAKE IT YOURS</small></div>
        <div class="mini-face face-front"><span class="dial-mark mark-top" /><span class="dial-mark mark-right" /><span class="dial-mark mark-bottom" /><span class="dial-mark mark-left" /><span class="hand hour-hand" /><span class="hand minute-hand" /><span class="dial-center" /><small>WRISTO</small></div>
        <span class="art-heart"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg></span>
      </div>
      <div class="entry-copy"><span class="eyebrow">A little more you</span><h2>Your wrist. Your style.</h2><p>Discover watch faces you’ll love.<br class="entry-break" /> A few picks, made personal.</p></div>
      <div class="entry-action"><button type="button" class="primary" @click="open">Find My Style <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M7 7h10v10" /></svg></button><span>Pick. Like. Make it yours.</span></div>
    </div>
  </section>
  <el-dialog v-model="visible" title="Find Your Style" width="min(480px, calc(100vw - 24px))" align-center :close-on-click-modal="false" class="discovery-dialog">
    <template #header><div class="dialog-heading"><span class="eyebrow">Your personal edit</span><h2>Find Your Style</h2></div></template>
    <div class="discovery-content">
      <p class="storage-note">{{ accountId ? 'Your likes and dislikes are saved to your account.' : 'Sign in to discover and save your favorites.' }}</p>
      <button v-if="accountId" class="device-pill" type="button" @click="showDevices = true" :disabled="saving"><Icon icon="lucide:watch" width="18" /><span>{{ selectedDevice?.displayName || 'Choose your Garmin' }}</span><Icon icon="lucide:chevron-down" width="16" /></button>
      <div v-if="!accountId" class="state"><Icon icon="lucide:heart" width="36" /><h3>A watch face for you.</h3><p>Sign in to start your personal selection.</p><button type="button" class="primary" @click="redirectToSsoLogin('store')">Sign In</button></div>
      <div v-else-if="!deviceId" class="state"><Icon icon="lucide:watch" width="36" /><h3>Made for your wrist.</h3><p>Choose your model to find compatible watch faces.</p><button type="button" class="primary" @click="showDevices = true">Choose Device</button></div>
      <template v-else>
        <p v-if="error" role="alert" class="error">{{ error }}</p>
        <div v-if="loading && !showLikes" class="state" role="status"><span class="loading-ring" /><p>Finding your next favorite…</p></div>
        <div v-else-if="loadFailed && !showLikes" class="state"><p>We couldn’t load your recommendations.</p><button type="button" class="primary" @click="load">Try Again</button><button v-if="history.length" type="button" @click="undo">Undo Last Choice</button></div>
        <template v-else-if="current && !showLikes">
          <article class="discovery-card" :aria-busy="saving">
            <div class="card-topline"><span><i /> Selected for you</span></div>
            <RouterLink class="face-image" :to="productPath(current.appId)" @click="visible = false" :aria-label="`See ${current.name} details`"><img v-if="imageUrl && !imageFailed" :key="current.appId" :src="imageUrl" :alt="current.name" @error="imageFailed = true" /><span v-else>Preview unavailable</span></RouterLink>
            <div class="card-caption"><h3>{{ current.name }}</h3><RouterLink :to="productPath(current.appId)" @click="visible = false">Explore watch face <span aria-hidden="true">↗</span></RouterLink></div>
          </article>
          <div class="choices"><button type="button" :disabled="saving" @click="choose('dislike')"><Icon icon="lucide:x" width="21" />Dislike</button><button type="button" class="primary" :disabled="saving" @click="choose('like')"><Icon icon="lucide:heart" width="21" />Like</button></div>
          <p v-if="saving" class="saving-note" role="status">Saving your choice…</p>
        </template>
        <div v-else class="results">
          <h3>{{ showLikes ? 'Your favorites, together.' : 'A good place to pause.' }}</h3>
          <p>{{ showLikes ? 'Revisit the faces that caught your eye.' : 'Try a fresh selection or revisit your likes.' }}</p>
          <div v-if="showLikes" class="liked-grid"><RouterLink v-for="product in liked" :key="product.appId" :to="productPath(product.appId)" @click="visible = false"><img :src="getProductImageUrl(product)" :alt="product.name" loading="lazy" /><span>{{ product.name }}</span></RouterLink></div>
          <p v-if="showLikes && !likeCount">Your next favorite is waiting. Keep exploring.</p>
          <p v-if="likesLoading" role="status">Loading your likes…</p>
          <button v-if="showLikes && hasMoreLikes" :disabled="likesLoading" type="button" @click="loadLikes">Show More</button>
          <button v-if="!showLikes" type="button" class="primary" @click="load">Fresh Selection</button>
        </div>
        <nav class="secondary" aria-label="Selection actions"><button type="button" :disabled="!history.length || saving" @click="undo"><Icon icon="lucide:undo-2" width="17" />Undo</button><button v-if="current && !showLikes && !loading" type="button" :disabled="saving" @click="choose(null)">Skip <span aria-hidden="true">→</span></button><button v-if="showLikes" type="button" @click="showLikes = false">Back to Cards</button><button v-else type="button" :disabled="saving" @click="showLikes = true"><Icon icon="lucide:heart" width="17" />Likes <span class="count">{{ likeCount }}</span></button></nav>
      </template>
    </div>
  </el-dialog>
  <DeviceSelector v-model="showDevices" @device-selected="selectDevice" />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElDialog } from 'element-plus'
import { Icon } from '@iconify/vue'
import DeviceSelector from '@/components/DeviceSelector.vue'
import { useUserStore } from '@/store/user'
import { useDiscovery } from './useDiscovery'
import { getProductImageUrl } from '@/utils/productImage'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

type SelectedDevice = { id: number; displayName: string }
const visible = ref(false)
const showDevices = ref(false)
const selectedDevice = ref<SelectedDevice | null>(null)
const userStore = useUserStore()
const localeStore = useLocaleStore()
const deviceId = computed(() => selectedDevice.value?.id ?? null)
const { accountId, loading, saving, loadFailed, error, current, liked, likeCount, history, showLikes, likesLoading, hasMoreLikes, load, choose, undo, loadLikes } = useDiscovery(deviceId)
const imageFailed = ref(false)
const imageUrl = computed(() => getProductImageUrl(current.value))
watch(() => current.value?.appId, () => { imageFailed.value = false })
watch(accountId, () => { visible.value = false })
const productPath = (id: number) => addLocaleToPath(`/app/${id}`, localeStore.currentLocale)
function open() {
  let device = userStore.userInfo?.device
  try { device = JSON.parse(localStorage.getItem('selectedDevice') || 'null') || device } catch { /* Use account model if storage is unavailable. */ }
  selectedDevice.value = device && Number.isSafeInteger(device.id) && device.id > 0 ? device : null
  visible.value = true
  // Allow device/account watchers to reset the previous session first.
  void nextTick().then(() => { if (visible.value) return load() })
}
async function selectDevice(device: SelectedDevice) {
  selectedDevice.value = device
  showDevices.value = false
  await nextTick()
  if (visible.value) await load()
}
</script>

<style scoped>
.discovery-entry { padding-top:24px; padding-bottom:16px; }
.entry-panel { position:relative; display:flex; align-items:center; gap:34px; padding:30px 40px; overflow:hidden; border:1px solid #e0e7da; border-radius:26px; background:linear-gradient(115deg,#edf2e7 0%,#f6f7ef 60%,#f3f2e9 100%); }
.entry-art { position:relative; width:174px; height:136px; flex-shrink:0; }
.mini-face { position:absolute; width:105px; height:116px; border-radius:23px; box-shadow:0 9px 20px #32412b18; border:4px solid #fff; }
.face-back { top:5px; left:0; transform:rotate(-13deg); background:#d5dfa9; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; color:#34442e; }
.face-back > span { font-size:29px; font-weight:700; letter-spacing:-2px; }
.face-back small { font-size:6px; letter-spacing:1px; }
.mini-colon { opacity:.5; }
.face-front { right:0; top:14px; transform:rotate(10deg); background:#2f473b; }
.face-front small { position:absolute; bottom:21px; left:0; right:0; text-align:center; color:#a7bca3; font-size:7px; letter-spacing:2px; }
.dial-mark { position:absolute; background:#bcc9a5; border-radius:2px; }
.mark-top,.mark-bottom { width:2px; height:6px; left:47px; }.mark-top { top:10px; }.mark-bottom { bottom:10px; }
.mark-left,.mark-right { height:2px; width:6px; top:53px; }.mark-left { left:10px; }.mark-right { right:10px; }
.hand { position:absolute; left:47px; bottom:53px; width:3px; border-radius:4px; transform-origin:bottom; background:#f0edcd; }
.hour-hand { height:23px; transform:rotate(-55deg); }.minute-hand { height:33px; transform:rotate(45deg); }.dial-center { position:absolute; left:45px; top:52px; width:7px; height:7px; border-radius:50%; background:#e4d990; }
.art-heart { position:absolute; bottom:0; left:55px; display:grid; place-items:center; width:35px; height:35px; border-radius:50%; background:#fffdf7; color:#6c8457; border:1px solid #e4e7da; box-shadow:0 4px 10px #34442e0a; }
.entry-copy { flex:1; }.entry-copy .eyebrow { color:#7b886b; }
.entry-action { display:flex; flex-direction:column; align-items:center; gap:12px; flex-shrink:0; }.entry-action > span { font-size:10px; color:#87917e; letter-spacing:.025em; }
.entry-action button { padding:15px 24px; min-height:52px; gap:18px; box-shadow:0 5px 12px #2a403310; }
.entry-break { display:none; }
@media(max-width:850px) { .entry-panel { gap:22px; padding:26px; }.entry-art { transform:scale(.85); width:153px; margin-left:-10px; }.entry-action button { padding:13px 18px; } }
@media(max-width:600px) { .entry-panel { display:grid; grid-template-columns:1fr 104px; gap:18px 6px; padding:24px; border-radius:22px; }.entry-copy { grid-area:1/1; position:relative; z-index:1; }.entry-art { grid-area:1/2; transform:scale(.7); transform-origin:center right; width:160px; margin-left:-56px; }.entry-copy h2 { max-width:180px; font-size:27px; line-height:1.1; }.entry-copy p { max-width:200px; font-size:12px; line-height:1.6; }.entry-copy .eyebrow { font-size:8px; }.entry-action { grid-column:1/-1; align-items:stretch; gap:10px; }.entry-action > span { text-align:center; }.entry-break { display:block; } }
.eyebrow { display:block; color:#7b826f; text-transform:uppercase; letter-spacing:.16em; font-size:10px; font-weight:700; margin-bottom:8px; }
.discovery-entry h2 { margin:0 0 8px; font-size:clamp(22px,3vw,28px); letter-spacing:-.035em; color:#273d30; }
.discovery-entry p { margin:0; color:#727a72; font-size:14px; }
button { display:inline-flex; align-items:center; justify-content:center; gap:9px; min-height:44px; padding:11px 20px; border:1px solid #dce1d8; border-radius:999px; background:white; color:#304435; font:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:background .18s,transform .18s; }
button:hover:not(:disabled) { background:#f0f3ed; }
button.primary { background:#2a4033; border-color:#2a4033; color:#fff; }
button.primary:hover:not(:disabled) { background:#3c5846; transform:translateY(-1px); }
button:disabled { opacity:.4; cursor:default; }
button:focus-visible,a:focus-visible { outline:3px solid #86a68b; outline-offset:3px; }
.dialog-heading h2 { font-size:27px; font-weight:600; letter-spacing:-.04em; line-height:1.15; margin:0; color:#293e31; }
.discovery-content { display:flex; flex-direction:column; min-height:100%; }
.discovery-content > * { flex-shrink:0; }
.storage-note { margin:0 0 16px; color:#7b8279; font-size:12px; line-height:1.6; }
.device-pill { align-self:flex-start; font-size:12px; min-height:36px; padding:7px 12px; margin-bottom:18px; background:#f6f7f3; border-color:#e7e9e0; max-width:100%; }
.device-pill span { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.discovery-card { border:1px solid #e9eade; border-radius:24px; background:#f5f5ef; padding:16px 18px 23px; }
.card-topline { display:flex; justify-content:space-between; gap:12px; color:#798371; font-size:10px; letter-spacing:.04em; }
.card-topline span:first-child { display:flex; align-items:center; gap:6px; }
.card-topline i { width:5px; height:5px; border-radius:50%; background:#81956e; }
.face-image { width:min(100%,270px); aspect-ratio:1; margin:18px auto 16px; display:grid; place-items:center; text-decoration:none; color:#7b8279; }
.face-image img { width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 12px 10px #23342618); }
h3 { margin:0; color:#293f31; font-size:24px; font-weight:600; letter-spacing:-.025em; line-height:1.25; overflow-wrap:anywhere; }
.card-caption { text-align:center; }
.card-caption a { display:inline-flex; gap:7px; align-items:center; color:#7a8375; font-size:11px; margin-top:9px; text-decoration:none; }
.card-caption a:hover { color:#29442f; }
.choices { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:18px; }
.choices button { min-height:50px; font-size:15px; }
.secondary { display:flex; align-items:center; justify-content:space-between; gap:4px; border-top:1px solid #eff0e9; margin-top:18px; padding-top:10px; }
.secondary button { border:0; background:transparent; padding:8px 10px; font-size:12px; color:#6b786b; }
.count { padding:2px 7px; border-radius:999px; background:#eaf0e5; color:#304d35; font-size:10px; }
.state { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.state .loading-ring { margin:0 auto; }
.results { flex:1; }
.state,.results { text-align:center; padding:30px 5px; color:#788273; }
.state h3 { margin-top:15px; }
.state p,.results p { font-size:13px; line-height:1.6; margin:12px 0 20px; }
.error { padding:10px 12px; background:#fff1ed; border-radius:12px; color:#a14b38; font-size:12px; }
.saving-note { text-align:center; font-size:11px; color:#788273; margin:8px 0 0; }
.liked-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
.liked-grid a { display:grid; gap:10px; padding:14px; border-radius:16px; background:#f5f5ef; color:#304435; font-size:12px; text-decoration:none; }
.liked-grid img { width:100%; aspect-ratio:1; object-fit:contain; }
.loading-ring { display:block; margin:auto; width:32px; height:32px; border:2px solid #e0e6d8; border-top-color:#3b5940; border-radius:50%; animation:discovery-spin .8s linear infinite; }
@keyframes discovery-spin { to { transform:rotate(360deg); } }
@media(prefers-reduced-motion:reduce) { button { transition:none; }.loading-ring { animation:none; } }
@media(max-width:600px) { .face-image { width:min(100%,240px); }.discovery-card { padding:14px 14px 19px; }.card-caption h3 { font-size:22px; }.storage-note { margin-bottom:12px; }.device-pill { margin-bottom:14px; } }
</style>
<style>
.el-dialog.discovery-dialog { padding:26px; border-radius:28px; height:min(820px, calc(100svh - 24px)); display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 90px #1c312b26; }
.discovery-dialog .el-dialog__body { flex:1; min-height:0; overflow-y:auto; }
.discovery-dialog .el-dialog__header { flex-shrink:0; padding:0 30px 12px 0; margin:0; }
.discovery-dialog .el-dialog__headerbtn { top:17px; right:16px; }
@media(max-width:600px) { .el-dialog.discovery-dialog { padding:22px 18px 16px; }.discovery-dialog .el-dialog__headerbtn { top:12px; right:10px; } }
</style>
