<template>
  <div class="share-section" v-if="appId">
    <div class="share-title">Share</div>
    <div class="share-actions">
      <button class="share-btn" data-testid="share-open" @click="openOgSharePage" title="Open share page">Open Share Page</button>
      <button class="share-btn" data-testid="share-system" @click="shareSystem" title="System share">System Share</button>
      <button class="share-pill twitter" data-testid="share-twitter" @click="shareTo('twitter')" aria-label="Share to X/Twitter" title="Share to X/Twitter">Twitter</button>
      <button class="share-pill facebook" data-testid="share-facebook" @click="shareTo('facebook')" aria-label="Share to Facebook" title="Share to Facebook">Facebook</button>
      <button class="share-pill linkedin" data-testid="share-linkedin" @click="shareTo('linkedin')" aria-label="Share to LinkedIn" title="Share to LinkedIn">LinkedIn</button>
      <button class="share-pill pinterest" data-testid="share-pinterest" @click="shareTo('pinterest')" aria-label="Share to Pinterest" title="Share to Pinterest">Pinterest</button>
      <button class="share-btn" data-testid="share-copy" @click="copyOgLink" aria-label="Copy link" title="Copy share link">Copy Link</button>
    </div>
  </div>
  <div v-else class="share-placeholder" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProductVO } from '@/types'

const props = defineProps<{
  product: ProductVO | null
  template?: string
}>()

const appId = computed(() => props.product?.appId)

// Build absolute share URL with a selected template id
const buildAbsoluteShareUrl = (templateId?: string) => {
  const id = appId.value
  if (!id) return ''
  try {
    const path = `/share/${id}`
    const params = new URLSearchParams()
    const tpl = (templateId || props.template || 'cover/minimal').trim()
    if (tpl) params.set('template', tpl)
    const qs = params.toString()
    const rel = qs ? `${path}?${qs}` : path
    const shareBase = import.meta.env.VITE_SHARE_BASE_URL || window.location.origin
    const url = new URL(rel, shareBase)
    if (import.meta.env.DEV) url.searchParams.set('t', String(Date.now()))
    return url.toString()
  } catch {
    return ''
  }
}

const logShareUrl = (action: string, url: string) => {
  console.info(`[ShareBar] ${action} OG share URL:`, url)
}

const absoluteImageUrl = computed(() => {
  const src = props.product?.heroFile?.url || props.product?.garminImageUrl || ''
  if (!src) return ''
  try { return new URL(src, window.location.origin).toString() } catch { return '' }
})

const formatPrice = (p?: number) => (typeof p === 'number' ? `$${p.toFixed(2)}` : '')
const truncate = (s: string, n = 240) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const shareTemplates = computed(() => {
  const name = props.product?.name || 'Wristo App'
  const priceTxt = formatPrice(props.product?.price)
  const tagline = priceTxt ? `${name} · ${priceTxt}` : name
  const baseDesc = `Install on your Garmin device.`
  const hashtags = `#Garmin #ConnectIQ #Wristo`
  return {
    system: { title: name, text: `${name} — ${baseDesc}` },
    twitter: { text: truncate(`${tagline} — ${baseDesc} ${hashtags}`) },
    facebook: { quote: `${tagline} — ${baseDesc}` },
    linkedin: {},
    pinterest: { description: `${tagline} — ${baseDesc}` },
  }
})

type Platform = 'twitter' | 'facebook' | 'linkedin' | 'pinterest'
const templateFor = (platform?: Platform | 'default') => {
  switch (platform) {
    case 'twitter':
      return 'x/post'
    case 'facebook':
      return 'facebook/post'
    case 'linkedin':
      return 'linkedin/post'
    case 'pinterest':
      return 'pinterest/pin'
    default:
      return props.template || 'cover/minimal'
  }
}

const openOgSharePage = () => {
  const url = buildAbsoluteShareUrl(templateFor('default'))
  if (!url) return ElMessage.error('Share link not available')
  logShareUrl('open', url)
  const w = window.open(url, '_blank')
  if (!w) ElMessage.error('Please allow pop-ups to open the share page')
}

const copyOgLink = async () => {
  try {
    const url = buildAbsoluteShareUrl(templateFor('default'))
    if (!url) throw new Error('no url')
    logShareUrl('copy', url)
    await navigator.clipboard.writeText(url)
    ElMessage.success('Share link copied')
  } catch {
    ElMessage.error('Copy failed')
  }
}

const shareSystem = async () => {
  try {
    const url = buildAbsoluteShareUrl(templateFor('default'))
    if (!url) throw new Error('no url')
    logShareUrl('system', url)
    if (navigator.share) {
      await navigator.share({
        title: shareTemplates.value.system.title,
        text: shareTemplates.value.system.text,
        url,
      })
      ElMessage.success('Shared')
    } else {
      await copyOgLink()
    }
  } catch {
    ElMessage.error('Share failed')
  }
}

const shareTo = (platform: Platform) => {
  const platformUrl = buildAbsoluteShareUrl(templateFor(platform))
  if (!platformUrl) {
    ElMessage.error('Share link not available')
    return
  }
  logShareUrl(platform, platformUrl)
  const u = encodeURIComponent(platformUrl)
  let url = ''
  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(shareTemplates.value.twitter.text)}`
      break
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent(shareTemplates.value.facebook.quote)}`
      break
    case 'linkedin':
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
      break
    case 'pinterest': {
      const media = absoluteImageUrl.value ? `&media=${encodeURIComponent(absoluteImageUrl.value)}` : ''
      url = `https://www.pinterest.com/pin/create/button/?url=${u}${media}&description=${encodeURIComponent(shareTemplates.value.pinterest.description)}`
      break
    }
  }
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  if (!w) ElMessage.error('Please allow pop-ups to share')
}
</script>

<style scoped>
.share-section {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.share-title { font-size: 0.98rem; color: #6b7280; }
.share-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.share-btn { padding: 8px 12px; border-radius: 999px; border: 1px solid #e5e7eb; background: #fff; color: #111; font-weight: 600; cursor: pointer; }
.share-btn:hover { background: #f8fafc; }
.share-pill { padding: 8px 12px; border-radius: 999px; border: none; color: #fff; font-weight: 700; cursor: pointer; transition: filter 0.15s ease, transform 0.05s ease; }
.share-pill:active { transform: translateY(1px); }
.share-pill.twitter { background: #111; }
.share-pill.twitter:hover { filter: brightness(1.1); }
.share-pill.facebook { background: #1877F2; }
.share-pill.facebook:hover { filter: brightness(1.1); }
.share-pill.linkedin { background: #0A66C2; }
.share-pill.linkedin:hover { filter: brightness(1.1); }
.share-pill.pinterest { background: #E60023; }
.share-pill.pinterest:hover { filter: brightness(1.1); }
.share-placeholder { height: 1px; }
@media (max-width: 480px) { .share-section { max-width: 240px; } }
@media (max-width: 360px) { .share-section { max-width: 200px; } }
</style>
