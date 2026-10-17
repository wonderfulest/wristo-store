<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { bindUtility, getUtilityInstallations, getUtilityInstallation, saveUtilityLabels, type UtilityState, type UtilityItem } from '@/api/utilities'
const props = defineProps<{ appKey?: string; embedded?: boolean }>()
const user = useUserStore(), locale = useLocaleStore()
const copy = (en: string, zh: string) => locale.currentLocale.startsWith('zh') ? zh : en
const apps = [
  { key: 'qr-pocket', name: 'QR Pocket', en: 'Keep three personal QR codes on your wrist.', zh: '随身携带三个个人二维码。' },
  { key: 'last-time', name: 'Last Time', en: 'Remember when you last did the little things.', zh: '记住上次完成日常小事的时间。' },
  { key: 'quick-counter', name: 'Quick Counter', en: 'Count water, practice, and everyday progress.', zh: '记录喝水、练习和每天的小进步。' },
  { key: 'ready-to-go', name: 'Ready to Go', en: 'Check the essentials before home, gym, or travel.', zh: '出门、健身、旅行前，检查必备物品。' },
]
const installations = ref<UtilityState[]>([]), selected = ref(''), drafts = ref<Record<string, Record<string, string>>>({})
const loading = ref(false), busy = ref(false), error = ref(''), message = ref(''), code = ref(''), bindError = ref('')
const conflicts = ref<Record<string, boolean>>({})
let generation = 0
const current = computed(() => installations.value.find(s => s.installationId === selected.value))
const labels = computed(() => drafts.value[selected.value] || {})
const dirty = computed(() => current.value?.items.some(i => labels.value[i.itemId] !== i.label) || false)
const valid = computed(() => current.value?.items.every(i => { const s = (labels.value[i.itemId] || '').trim(); return s.length >= 1 && s.length <= 40 && !/[\u0000-\u001f\u007f-\u009f]/.test(s) }) || false)
const groups = computed(() => {
  const result: { id: string; items: UtilityItem[] }[] = []
  for (const item of current.value?.items || []) { const id = item.listId || ''; let group = result.find(g => g.id === id); if (!group) { group = { id, items: [] }; result.push(group) } group.items.push(item) }
  return result
})
const appName = (s: UtilityState) => apps.find(a => a.key === s.appKey)?.name || s.appKey
const listName = (id: string) => ({ home: copy('Leave Home', '出门'), gym: copy('Gym', '健身'), travel: copy('Travel', '旅行') }[id] || '')
function value(item: UtilityItem) {
  if (current.value?.appKey === 'quick-counter') return String(item.count ?? 0)
  if (current.value?.appKey === 'ready-to-go') return item.checked ? copy('Checked', '已勾选') : copy('Not checked', '未勾选')
  return item.lastAt ? new Date(item.lastAt * 1000).toLocaleString(locale.currentLocale === 'zh' ? 'zh-CN' : locale.currentLocale) : copy('Never recorded', '尚未记录')
}
function put(state: UtilityState, resetDraft = false) {
  const index = installations.value.findIndex(s => s.installationId === state.installationId)
  const previous = index < 0 ? undefined : installations.value[index]
  const draft = drafts.value[state.installationId]
  drafts.value[state.installationId] = Object.fromEntries(state.items.map(item => {
    const oldItem = previous?.items.find(old => old.itemId === item.itemId)
    const locallyEdited = !resetDraft && draft && oldItem && draft[item.itemId] !== oldItem.label
    return [item.itemId, locallyEdited ? draft[item.itemId] : item.label]
  }))
  if (index < 0) installations.value.push(state); else installations.value[index] = state
}
function status(e: unknown): number | undefined {
  const err = e as { code?: number; response?: { status?: number; data?: { code?: number } } }
  return err?.response?.data?.code || err?.response?.status || err?.code
}
async function load() {
  if (loading.value || busy.value) return
  const request = generation
  loading.value = true; error.value = ''
  try {
    const result = (await getUtilityInstallations()).filter(s => s.appKey !== 'qr-pocket' && s.appKey !== 'next-shot' && (!props.appKey || s.appKey === props.appKey))
    if (request !== generation) return
    result.forEach(s => put(s))
    installations.value = result
    if (!result.some(s => s.installationId === selected.value)) selected.value = result[0]?.installationId || ''
  } catch { if (request === generation) error.value = copy('Could not load your apps. Please try again.', '无法加载应用，请重试。') }
  finally { if (request === generation) loading.value = false }
}
async function bind() {
  if (busy.value || loading.value || !/^[0-9]{4}$/.test(code.value)) return
  const request = generation
  busy.value = true; bindError.value = ''; message.value = ''
  try {
    const result = await bindUtility(code.value)
    if (request !== generation) return
    code.value = ''; message.value = copy('App linked. Your other apps keep their own settings.', '绑定成功，其他应用仍保留各自设置。')
    const state = await getUtilityInstallation(result.installationId)
    if (request === generation && state.appKey === 'next-shot') message.value = copy('Next Shot linked. Open its training page to configure practice.', 'Next Shot 已绑定，请打开训练页面配置练习。')
    if (request === generation && state.appKey !== 'qr-pocket' && state.appKey !== 'next-shot' && (!props.appKey || state.appKey === props.appKey)) { put(state); selected.value = state.installationId }
  } catch { if (request === generation) bindError.value = copy('Could not finish linking. Check your code or request a new one on your watch. If already linked, reload your apps below.', '未能完成绑定，请检查绑定码或在手表重新获取。如已绑定，请重新加载下方应用。') }
  finally { if (request === generation) busy.value = false }
}
async function refresh() {
  if (!current.value || busy.value || loading.value) return
  const id = selected.value, request = generation
  busy.value = true; error.value = ''; message.value = ''
  try {
    const state = await getUtilityInstallation(id)
    if (request !== generation) return
    put(state); conflicts.value[id] = false
    message.value = copy('Latest values loaded. Your edits are kept. Review the saved names below before saving again.', '已加载最新数据并保留你的编辑。请核对下方已保存名称，再次保存。')
  } catch { if (request === generation) error.value = copy('Could not reload this app. Your edits are kept.', '无法重新加载，编辑内容已保留。') }
  finally { if (request === generation) busy.value = false }
}
async function save() {
  if (!current.value || busy.value || loading.value || !valid.value || conflicts.value[selected.value]) return
  const state = current.value, request = generation
  busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await saveUtilityLabels(state.installationId, state.revision, state.items.map(i => ({ itemId: i.itemId, label: labels.value[i.itemId].trim() })))
    if (request !== generation) return
    put(result, true); message.value = copy('Names saved. Choose Sync now on your watch to get them.', '名称已保存，请在手表选择「立即同步」获取。')
  } catch (e) {
    if (request !== generation) return
    if (status(e) === 409) conflicts.value[state.installationId] = true
    else error.value = copy('Could not save. Your edits are kept; please try again.', '保存失败，编辑内容已保留，请重试。')
  } finally { if (request === generation) busy.value = false }
}
watch(() => user.userInfo, info => {
  generation++; loading.value = false; busy.value = false; code.value = ''
  installations.value = []; drafts.value = {}; selected.value = ''; conflicts.value = {}; error.value = ''; message.value = ''; bindError.value = ''
  if (info) void load()
}, { immediate: true })
watch(selected, () => { error.value = ''; message.value = '' })
onBeforeUnmount(() => { generation++ })
</script>
<template>
  <div class="utilities" :class="{ embedded }">
    <header v-if="!embedded"><p class="eyebrow">WRISTO / {{ copy('DAILY UTILITIES', '日常工具') }}</p><h1>{{ copy('Small things, remembered.', '日常小事，随手记住。') }}</h1><p>{{ copy('Four simple Garmin watch apps. Make their names your own from your phone.', '四款简单的 Garmin 手表应用，在手机上设置适合自己的条目名称。') }}</p></header>
    <section v-if="!embedded" class="apps" :aria-label="copy('Four daily apps', '四款日常应用')"><article v-for="app in apps" :key="app.key"><h2>{{ app.name }}</h2><p>{{ copy(app.en, app.zh) }}</p></article></section>
    <p><RouterLink :to="`${locale.currentLocale.startsWith('zh') ? '/zh' : ''}/utilities/next-shot`">Next Shot · {{ copy('Wedge practice & history', '挖起杆练习与历史') }}</RouterLink></p>
    <section id="link" class="binding"><h2>{{ copy('Link your watch app', '绑定手表应用') }}</h2><p>{{ copy('Open Link account in the app on your watch. Enter its four-digit code here within 5 minutes.', '在手表应用中打开「绑定账号」，在 5 分钟内输入显示的四位绑定码。') }}</p>
      <button v-if="!user.userInfo" class="primary" @click="redirectToSsoLogin('store')">{{ copy('Sign in to Wristo', '登录 Wristo') }}</button>
      <form v-else @submit.prevent="bind"><label for="utility-code">{{ copy('Four-digit binding code', '四位数字绑定码') }}</label><div class="bind-row"><input id="utility-code" v-model="code" inputmode="numeric" autocomplete="off" pattern="[0-9]{4}" maxlength="4" placeholder="0000" required :disabled="busy || loading" aria-describedby="binding-help"><button class="primary" :disabled="busy || loading || !/^[0-9]{4}$/.test(code)">{{ copy('Link app', '绑定应用') }}</button></div><p id="binding-help" class="hint">{{ copy('Each code works once. Keep it private.', '绑定码仅可使用一次，请勿分享。') }}</p><p v-if="bindError" class="error" role="alert">{{ bindError }}</p></form><p v-if="message && appKey === 'qr-pocket'" class="success" role="status">{{ message }}</p>
    </section>
    <section v-if="user.userInfo && appKey !== 'qr-pocket'" class="settings" :aria-busy="loading || busy"><div class="section-heading"><h2>{{ copy('Your linked apps', '已绑定应用') }}</h2><button :disabled="busy || loading" @click="load">{{ copy('Reload apps', '重新加载应用') }}</button></div>
      <p>{{ copy('Every installation keeps separate names and values, even on the same watch. This first version has fixed item slots; you can rename them, but cannot add or remove items.', '每次安装独立保存名称和数据，同一手表也不合并。第一版条目数量固定，可以改名，不能增删。') }}</p>
      <p v-if="loading" role="status">{{ copy('Loading your apps…', '正在加载应用…') }}</p><p v-else-if="!installations.length && !error">{{ copy('No linked apps yet. Enter a code from your watch above to get started.', '暂无绑定应用，请先输入上方手表绑定码。') }}</p>
      <template v-if="installations.length"><label for="installation">{{ copy('Choose an installation', '选择安装') }}</label><select id="installation" v-model="selected" :disabled="busy || loading"><option v-for="(s, index) in installations" :key="s.installationId" :value="s.installationId">{{ appName(s) }} · {{ copy('Installation', '安装') }} {{ index + 1 }} · {{ s.installationId.slice(-6) }}</option></select>
        <p class="hint">{{ copy('Values below are the last received from your watch, not live data. Choose Sync now on your watch to send updates and fetch new names.', '下方是最近从手表接收的数据，并非实时数据。请在手表选择「立即同步」上传数据并获取新名称。') }}</p>
        <div v-if="conflicts[selected]" class="conflict" role="alert"><p>{{ copy('Names changed elsewhere. Your edits are kept. Reload the latest saved names, review them, then save again.', '名称已在其他地方更新，编辑内容已保留。请重新加载并核对最新名称，再次保存。') }}</p><button :disabled="busy || loading" @click="refresh">{{ copy('Reload latest, keep my edits', '重新加载并保留编辑') }}</button></div>
        <form v-if="current" @submit.prevent="save"><fieldset v-for="group in groups" :key="group.id" :disabled="busy || loading"><legend>{{ listName(group.id) || appName(current) }}</legend><div v-for="item in group.items" :key="item.itemId" class="item"><div><label :for="`label-${item.itemId}`">{{ copy('Item name', '条目名称') }} · {{ current.items.indexOf(item) + 1 }}</label><input :id="`label-${item.itemId}`" v-model="labels[item.itemId]" required maxlength="40" :aria-describedby="`value-${item.itemId}`"><p v-if="labels[item.itemId] !== item.label" class="hint">{{ copy('Saved name:', '已保存名称：') }} {{ item.label }}</p></div><p :id="`value-${item.itemId}`" class="value"><span>{{ copy('Last synced value', '最近同步的数据') }}</span>{{ value(item) }}</p></div></fieldset><p class="hint">{{ copy('Names must be 1–40 characters, with no control characters.', '名称须为 1–40 个字符，不能包含控制字符。') }}</p><div class="actions"><button class="primary" :disabled="busy || loading || !dirty || !valid || conflicts[selected]">{{ busy ? copy('Working…', '处理中…') : copy('Save names', '保存名称') }}</button><button type="button" :disabled="busy || loading" @click="refresh">{{ copy('Refresh values, keep edits', '刷新数据并保留编辑') }}</button></div></form>
      </template><p v-if="error" class="error" role="alert">{{ error }}</p><p v-if="message" class="success" role="status">{{ message }}</p>
    </section>
  </div>
</template>
<style scoped>
.utilities.embedded{padding:0;max-width:none}.utilities{max-width:1000px;margin:0 auto;padding:48px 24px 100px;color:#122a2b}.eyebrow{font-size:12px;letter-spacing:2px;font-weight:700}h1{font-size:42px;line-height:1.15;margin:18px 0}h2{font-size:23px;margin:0 0 12px}p{line-height:1.7;color:#526a65}.apps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:36px 0}.apps article{border-top:3px solid #38806d;padding:20px 0}.apps h2{font-size:21px}.binding{background:#eef3ee;border-radius:8px;padding:28px}.binding form{max-width:440px}.bind-row,.actions,.section-heading{display:flex;gap:14px;align-items:center}.section-heading{justify-content:space-between}.settings{margin-top:44px}label{display:block;font-size:14px;font-weight:600;margin:12px 0 8px}input,select{box-sizing:border-box;max-width:100%;width:100%;min-height:48px;padding:10px 12px;border:1px solid #a6bbb0;border-radius:6px;background:white;color:#122a2b;font:inherit}#utility-code{max-width:220px;font-size:24px;letter-spacing:8px}button{min-height:44px;padding:10px 16px;border:1px solid #a6bbb0;border-radius:6px;background:white;color:#122a2b;font:inherit;cursor:pointer}.primary{background:#122a2b;color:white;border-color:#122a2b}button:disabled{opacity:.5;cursor:not-allowed}fieldset{border:0;padding:0;margin:28px 0}legend{font-size:20px;font-weight:700}.item{display:grid;grid-template-columns:1.4fr 1fr;gap:24px;border-bottom:1px solid #dce5df;padding:12px 0;align-items:center}.value{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.value span{display:block;font-size:12px;color:#637774}.hint{font-size:13px}.error{color:#a32828}.success{color:#226149}.conflict{padding:18px;background:#fff4de;border:1px solid #cfa846;border-radius:6px}input:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid #38806d;outline-offset:3px}@media(max-width:600px){.utilities{padding:28px 20px 70px}h1{font-size:32px}.apps{grid-template-columns:1fr;gap:4px;margin:24px 0}.apps article{padding:16px 0}.apps p{margin-bottom:0}.binding{padding:22px}.item{grid-template-columns:1fr;gap:0}.value{margin:8px 0}.actions,.section-heading{flex-wrap:wrap}.bind-row{flex-wrap:wrap}}
</style>
