<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocaleStore } from '@/store/locale'
import LifeConfiguration from './LifeConfiguration.vue'
import { isLifeKey } from '@/api/lifeTools'
import UtilityPreview from './UtilityPreview.vue'
import UtilitiesView from './UtilitiesView.vue'
import QrConfiguration from './QrConfiguration.vue'
import { getUtilityCatalog, type UtilityProduct } from '@/api/utilities'
const route = useRoute(), locale = useLocaleStore()
const copy = (en: string, zh: string) => locale.currentLocale.startsWith('zh') ? zh : en
const path = (key: string) => `${locale.currentLocale.startsWith('zh') ? '/zh' : ''}/utilities${key ? '/' + key : ''}`
const apps = ref<UtilityProduct[]>([]), loading = ref(true), error = ref(false)
async function load() {
 loading.value = true; error.value = false
 try { apps.value = await getUtilityCatalog() } catch { error.value = true; apps.value = [] }
 finally { loading.value = false }
}
onMounted(load)
const app = computed(() => apps.value.find(a => a.appKey === route.params.appKey))
watch(app, value => { document.title = value ? `${value.name} | Wristo` : 'Daily Utilities | Wristo' }, { immediate:true })
</script>
<template>
<main class="products">
 <p v-if="loading" role="status">{{ copy('Loading utilities…','正在加载工具…') }}</p><section v-else-if="error" role="alert"><p>{{ copy('Unable to load utilities. Please try again.','工具加载失败，请重试。') }}</p><button @click="load">{{ copy('Retry','重试') }}</button></section><template v-else-if="!route.params.appKey"><p class="eyebrow">WRISTO / {{ copy('DAILY UTILITIES','日常工具') }}</p><h1>{{ copy('Small tools for everyday life.','日常小事，随手完成。') }}</h1><p>{{ copy('Focused Garmin apps. Explore each app and make it your own.','专注日常的 Garmin 应用，分别了解和设置。') }}</p><p v-if="!apps.length">{{ copy('No utilities are available yet.','暂无可用工具。') }}</p><div class="catalog"><RouterLink v-for="a in apps" :key="a.appKey" :to="path(a.appKey)"><img v-if="a.coverUrl" class="cover" :src="a.coverUrl" :alt="copy(a.name,a.nameZh)"/><UtilityPreview v-else :app-key="a.appKey" compact/><div class="card-copy"><h2><img v-if="a.logoUrl" class="product-logo" :src="a.logoUrl" alt=""/>{{ copy(a.name,a.nameZh) }}</h2><p>{{ copy(a.summary,a.summaryZh) }}</p><span>{{ copy('Explore & configure →','了解与设置 →') }}</span></div></RouterLink></div></template>
 <template v-else-if="app"><RouterLink :to="path('')">← {{ copy('All utilities','全部工具') }}</RouterLink><p class="eyebrow">WRISTO / GARMIN</p><h1><img v-if="app.logoUrl" class="product-logo" :src="app.logoUrl" alt=""/>{{ copy(app.name,app.nameZh) }}</h1><p class="intro">{{ copy(app.summary,app.summaryZh) }}</p><p>{{ copy('Supported devices: Venu 3 · Forerunner 965 · fēnix 7','支持设备：Venu 3 · Forerunner 965 · fēnix 7') }}</p><a v-if="app.downloadUrl" class="configure-link" :href="app.downloadUrl" target="_blank" rel="noopener noreferrer">{{ copy('Get on Connect IQ','前往 Connect IQ 下载') }} ↗</a><p v-else class="availability">{{ copy('In development. Not yet published on Connect IQ.','开发中，尚未在 Connect IQ 发布。') }}</p><a class="configure-link" href="#configure">{{ copy('Configure this app','设置此应用') }} ↓</a><img v-if="app.heroUrl || app.coverUrl" class="hero" :src="app.heroUrl || app.coverUrl" :alt="copy(app.name,app.nameZh)"/><UtilityPreview v-else :app-key="app.appKey"/><p class="multiline">{{ copy(app.description,app.descriptionZh) }}</p><div v-if="app.shareUrls?.length" class="gallery"><img v-for="(url,index) in app.shareUrls" :key="url" :src="url" :alt="`${copy(app.name,app.nameZh)} ${index + 1}`" loading="lazy"/></div><section><h2>{{ copy('How to use','使用方法') }}</h2><p class="multiline">{{ copy(app.instructions,app.instructionsZh) }}</p></section><section id="configure"><h2>{{ copy('Your configuration','专属设置') }}</h2><LifeConfiguration v-if="isLifeKey(app.appKey)" :key="app.appKey" :app-key="app.appKey"/><QrConfiguration v-else-if="app.appKey === 'qr-pocket'" :key="app.appKey"/><UtilitiesView v-else :key="app.appKey" :app-key="app.appKey" embedded/></section></template>
 <template v-else><h1>{{ copy('Utility not found','未找到该工具') }}</h1><RouterLink :to="path('')">{{ copy('Browse all utilities','浏览全部工具') }}</RouterLink></template>
</main>
</template>
<style scoped>
.product-logo{width:44px;height:44px;object-fit:contain;vertical-align:middle;margin-right:12px}.multiline{white-space:pre-line}.cover{display:block;width:100%;height:auto;object-fit:cover;object-position:center}.hero{display:block;max-width:100%;max-height:520px;margin:32px auto;object-fit:contain}.gallery{display:flex;gap:16px;overflow:auto}.gallery img{max-width:80%;height:260px;object-fit:contain}.configure-link{margin-right:12px}.products{max-width:1000px;margin:auto;padding:48px 24px 96px;color:#122a2b}.eyebrow{font-size:12px;letter-spacing:2px;margin-top:30px}h1{font-size:44px;line-height:1.15;margin:20px 0}h2{font-size:24px}p{line-height:1.7;color:#526a65}.intro{font-size:22px}.catalog{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:36px}.catalog a{min-width:0;overflow:hidden;border:1px solid #dce5df;background:#eef3ee;border-radius:24px;text-decoration:none;color:inherit}.card-copy{padding:24px}.card-copy h2{margin-top:0}.catalog span,a{color:#286550}.availability{font-size:14px}.configure-link{display:inline-block;padding:14px 20px;background:#122a2b;color:white;border-radius:6px;text-decoration:none}section{margin-top:44px;scroll-margin-top:100px}@media(max-width:600px){.products{padding:30px 20px 70px}h1{font-size:34px}.catalog{grid-template-columns:1fr;gap:18px}.intro{font-size:20px}}
</style>
