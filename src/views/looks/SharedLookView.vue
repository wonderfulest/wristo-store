<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCompanionApps } from '@/api/companionApps'
import { useLocaleStore } from '@/store/locale'

interface Look {
  id: number
  author: { name: string; avatarUrl?: string }
  appId: number
  watchfaceName: string
  deviceName: string
  caption: string
  imageUrl: string
  mediaType: string
  videoUrl?: string
}
const route = useRoute()
const locale = useLocaleStore()
const zh = computed(() => locale.currentLocale === 'zh')
const copy = (en: string, cn: string) => zh.value ? cn : en
const look = ref<Look | null>(null)
const loading = ref(true)
const unavailable = ref(false)
const error = ref(false)
// Verified App Store listing; remote configuration may replace it.
const downloadURL = ref('https://apps.apple.com/app/id6811300302')
const shareURL = computed(() => `https://www.wristo.io/looks/${encodeURIComponent(String(route.params.id))}`)
let request: AbortController | undefined
let banner: HTMLMetaElement | undefined

function updateBanner() {
  banner?.remove()
  const id = new URL(downloadURL.value).pathname.match(/\/id(\d+)/)?.[1]
  if (!id) return
  banner = document.createElement('meta')
  banner.name = 'apple-itunes-app'
  banner.content = `app-id=${id}, app-argument=${shareURL.value}`
  document.head.appendChild(banner)
}
async function load() {
  request?.abort()
  const controller = new AbortController()
  request = controller
  look.value = null
  loading.value = true
  error.value = false
  unavailable.value = false
  const id = String(route.params.id)
  if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
    unavailable.value = true
    loading.value = false
    return
  }
  try {
    // Public sharing must not redirect a guest or an expired website session to sign-in.
    const response = await fetch(`/api/public/looks/${id}`, { signal: controller.signal })
    const body = await response.json()
    if (controller.signal.aborted) return
    if (response.status === 404 || response.status === 410 || body.code === 404 || body.code === 410) {
      unavailable.value = true
    } else if (!response.ok || body.code !== 0 || !body.data) {
      error.value = true
    } else {
      look.value = body.data
    }
  } catch {
    if (!controller.signal.aborted) error.value = true
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}
watch(() => route.params.id, () => { void load(); updateBanner() }, { immediate: true })
onMounted(async () => {
  updateBanner()
  try {
    const apps = await getCompanionApps()
    if (request?.signal.aborted) return
    if (apps.ios) downloadURL.value = apps.ios
    updateBanner()
  } catch { /* Keep the verified public download link when config is unavailable. */ }
})
onUnmounted(() => { request?.abort(); banner?.remove() })
</script>

<template>
  <main class="shared-look">
    <header class="look-heading"><span>WRISTO / LOOKS</span><h1>{{ copy('Everyday wrist style', '腕间穿搭') }}</h1></header>
    <p v-if="loading" role="status">{{ copy('Loading Look…', '正在加载穿搭…') }}</p>
    <section v-else-if="unavailable" class="look-message"><h2>{{ copy('This Look is unavailable', '这条穿搭已不可用') }}</h2><p>{{ copy('It may have been removed.', '内容可能已被删除。') }}</p></section>
    <section v-else-if="error" class="look-message" role="alert"><p>{{ copy('Could not load this Look. Please try again.', '暂时无法加载这条穿搭，请重试。') }}</p><button @click="load">{{ copy('Try again', '重试') }}</button></section>
    <article v-else-if="look" class="look-card">
      <div class="look-author"><img v-if="look.author.avatarUrl" :src="look.author.avatarUrl" alt="" /><strong>{{ look.author.name }}</strong></div>
      <video v-if="look.mediaType === 'video' && look.videoUrl" :key="look.id" :src="look.videoUrl" :poster="look.imageUrl" controls playsinline preload="metadata" :aria-label="look.watchfaceName" />
      <img v-else class="look-photo" :src="look.imageUrl" :alt="look.watchfaceName" />
      <div class="look-caption"><h2>{{ look.watchfaceName }}</h2><p class="device">{{ look.deviceName }}</p><p class="caption">{{ look.caption }}</p><RouterLink :to="`/app/${look.appId}`">{{ copy('Explore this watch face', '查看这款表盘') }} →</RouterLink></div>
    </article>
    <aside class="get-app"><div><h2>{{ copy('More style on Wristo', '在 Wristo 发现更多穿搭') }}</h2><p>{{ copy('Get the iOS app to like, comment and share your own Looks.', '下载 iOS App，点赞、评论，分享你的腕间穿搭。') }}</p></div><a class="download" :href="downloadURL">{{ copy('Download on the App Store', 'App Store 下载') }}</a><p class="open-hint">{{ copy('Already installed? Use Open in the Safari app banner. If your browser keeps you here, open this link in Safari.', '已安装？可通过 Safari 顶部 App 横幅打开。若当前浏览器未唤起 App，请在 Safari 中打开此链接。') }}</p></aside>
  </main>
</template>

<style scoped>
.shared-look { max-width: 680px; margin: 0 auto; padding: 32px 18px 64px; color: #193e37; }
.look-heading { margin-bottom: 24px; }
.look-heading span { font-size: 12px; letter-spacing: .18em; }
h1 { font-size: clamp(26px, 5vw, 38px); margin: 8px 0; font-weight: 650; }
h2 { font-size: 21px; margin: 0 0 8px; }
.look-card { overflow: hidden; border: 1px solid #e1e9e5; border-radius: 20px; background: white; }
.look-author { display: flex; align-items: center; gap: 10px; padding: 16px 20px; }
.look-author img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
video, .look-photo { width: 100%; max-height: 72vh; display: block; object-fit: contain; background: #101a17; }
.look-caption { padding: 22px; }
.device, .get-app p { color: #64786f; font-size: 14px; }
.caption { white-space: pre-wrap; overflow-wrap: anywhere; }
.look-caption a { display: inline-block; margin-top: 12px; color: #21695a; }
.get-app { margin-top: 24px; padding: 24px; border-radius: 20px; background: #edf4f0; }
.download, button { display: inline-block; background: #205b4e; color: white; padding: 14px 20px; border-radius: 12px; text-decoration: none; border: 0; cursor: pointer; font-weight: 600; }
.open-hint { line-height: 1.6; margin: 18px 0 0; }
.look-message { padding: 28px 0; }
</style>
