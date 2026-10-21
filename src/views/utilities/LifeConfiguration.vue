<script setup lang="ts">
import HabitPlant from './HabitPlant.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { bindUtility } from '@/api/utilities'
import { getLifeInstallations, getLifeHistory, saveLifeConfig, type LifeKey, type LifeState, type LifeConfig, type LifeHistory } from '@/api/lifeTools'
const props = defineProps<{ appKey: LifeKey }>()
const user = useUserStore(), locale = useLocaleStore()
const copy = (en: string, zh: string) => locale.currentLocale.startsWith('zh') ? zh : en
const items = ref<LifeState[]>([]), selected = ref(''), code = ref(''), busy = ref(false), error = ref(''), message = ref('')
const draft = ref<LifeConfig>({ revision: 0, values: {} }), rows = ref<LifeHistory[]>([]), more = ref(false), conflict = ref(false)
const copyFrom = ref('')
function copySettings() {
 const source = items.value.find(i => i.installationId === copyFrom.value)
 if (source && current.value) { draft.value.values = JSON.parse(JSON.stringify(source.config.values)); message.value = copy('Settings copied into this draft. Save to restore them on this watch.', '设置已复制到草稿，保存后可在此手表恢复。') }
}
const current = computed(() => items.value.find(i => i.installationId === selected.value))
const clock = ref(Date.now())
const elapsedDays = computed(() => { const start = current.value?.config.values.startAt; return start ? Math.max(0, Math.floor((clock.value / 1000 - start) / 86400)) : 0 })
let clockTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => { clockTimer = setInterval(() => { clock.value = Date.now() }, 30000) })
let generation = 0
function fill() {
 const item = current.value
 if (!item) return
 draft.value = JSON.parse(JSON.stringify(item.config)); rows.value = item.history; more.value = rows.value.length === 30; conflict.value = false
}
function localDate(at: number | undefined) {
 if (!at) return ''
 const d = new Date(at * 1000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
function epoch(event: Event) { return Math.floor(new Date((event.target as HTMLInputElement).value).getTime() / 1000) }
function date(at: number) { return new Date(at * 1000).toLocaleString(locale.currentLocale.startsWith('zh') ? 'zh-CN' : 'en-US') }
async function load() {
 const g = generation; busy.value = true; error.value = ''
 try {
  const result = await getLifeInstallations(props.appKey)
  if (g !== generation) return
  items.value = result
  if (!result.some(i => i.installationId === selected.value)) selected.value = result[0]?.installationId || ''
  fill()
 } catch { if (g === generation) error.value = copy('Unable to load. Please retry.', '加载失败，请重试。') }
 finally { if (g === generation) busy.value = false }
}
async function bind() {
 if (busy.value || !/^\d{4}$/.test(code.value)) return
 const g = generation; busy.value = true; error.value = ''; message.value = ''
 try {
  const linked = await bindUtility(code.value)
  if (g !== generation) return
  code.value = ''; selected.value = linked.installationId
  await load()
  if (g === generation) message.value = items.value.some(i => i.installationId === linked.installationId) ? copy('Watch linked.', '已绑定手表。') : copy('Code linked another app. Use a code from this app.', '该码绑定了其他应用，请使用本应用中的绑定码。')
 } catch { if (g === generation) error.value = copy('Link failed. Request a new code on the watch or reload if already linked.', '绑定失败，请在表上获取新码；若已绑定，请重新加载。') }
 finally { if (g === generation) busy.value = false }
}
async function save() {
 if (!current.value || busy.value || conflict.value) return
 const g = generation, id = selected.value; busy.value = true; error.value = ''; message.value = ''
 try {
  const result = await saveLifeConfig(props.appKey, id, draft.value)
  if (g !== generation) return
  items.value = items.value.map(i => i.installationId === id ? result : props.appKey === 'days-since' ? { ...i, config: result.config, history: result.history, progress: result.progress } : i); fill()
  message.value = copy('Saved. Choose Sync now on your watch.', '已保存，请在手表选择 Sync now。')
 } catch (e) {
  if (g !== generation) return
  conflict.value = (e as { code?: number }).code === 409
  error.value = conflict.value ? copy('Changed elsewhere. Your edits are kept; reload before saving again.', '配置已在其他页面修改。当前编辑已保留，请重新加载后再编辑。') : copy('Save failed. Check your values and retry; edits are kept.', '保存失败，请检查填写内容后重试，编辑已保留。')
 } finally { if (g === generation) busy.value = false }
}
async function history() {
 if (busy.value || !selected.value) return
 const g = generation; busy.value = true; error.value = ''
 try {
  const result = await getLifeHistory(props.appKey, selected.value, rows.value.at(-1)?.cursor || 0)
  if (g !== generation) return
  rows.value.push(...result); more.value = result.length === 30
 } catch { if (g === generation) error.value = copy('History failed to load. Retry.', '历史加载失败，请重试。') }
 finally { if (g === generation) busy.value = false }
}
function addEvent() {
 const start = Math.ceil(Date.now() / 3600000) * 3600
 draft.value.values.events?.push({ id: crypto.randomUUID(), title: '', startAt: start, endAt: start + 3600 })
}
function describe(row: LifeHistory) {
 const p = row.event.payload
 switch (props.appKey) {
  case 'days-since': return `${p.label} · ${p.kind === 'resisted' ? copy('Resisted temptation', '抵住一次诱惑') : copy('Earlier check-in', '早期打卡记录')}`
  case 'quick-log': return `${p.label}: ${Number(p.amount) > 0 ? '+' : ''}${p.amount} ${p.unit} · ${p.day}${p.undoOf ? ' · ' + copy('Undo', '撤销') : ''}`
  case 'next-up': return `${p.title} · ${copy('Acknowledged', '已确认')}`
  case 'battery-diary': return `${p.percent}%${p.note ? ' · ' + p.note : ''}`
  case 'quiet-beat': return `${p.bpm} BPM · ${p.seconds} ${copy('seconds', '秒')}`
  case 'park-pin': return `${p.section || copy('Parking spot', '停车点')} · ${Number(p.latitude).toFixed(5)}, ${Number(p.longitude).toFixed(5)}`
 }
}
const batteryPoints = computed(() => rows.value.filter(r => typeof r.event.payload.percent === 'number').sort((a,b) => a.event.at - b.event.at))
const batteryLine = computed(() => {
 const r = batteryPoints.value, first = r[0]?.event.at || 0, span = (r.at(-1)?.event.at || first) - first || 1
 return r.map(v => `${10 + (v.event.at - first) / span * 580},${110 - Number(v.event.payload.percent)}`).join(' ')
})
watch(selected, () => { error.value = ''; message.value = ''; fill() })
watch(() => [user.userInfo, props.appKey], () => {
 generation++; busy.value = false; items.value = []; selected.value = ''; rows.value = []; code.value = ''; error.value = ''; message.value = ''; conflict.value = false
 if (user.userInfo) void load()
}, { immediate: true })
onBeforeUnmount(() => { generation++; clearInterval(clockTimer) })
</script>
<template>
<div class="life-config">
 <p v-if="appKey !== 'days-since'">{{ copy('Choose Link account on your watch and enter its four-digit code within five minutes. Each watch installation has its own settings and history.', '在手表选择 Link account，五分钟内输入四位码。每个手表安装分别保存设置和历史。') }}</p>
 <p v-else>{{ copy('Your days keep counting. Each temptation resisted helps your plant grow.', '天数持续累计，每抵住一次诱惑，让植物成长一点。') }}</p>
 <button v-if="!user.userInfo" @click="redirectToSsoLogin('store')">{{ copy('Sign in to configure', '登录并设置') }}</button>
 <template v-else>
  <component :is="appKey === 'days-since' ? 'details' : 'div'" :open="appKey === 'days-since' && !items.length">
   <summary v-if="appKey === 'days-since'">{{ copy('Link a watch', '绑定手表') }}</summary>
   <p v-if="appKey === 'days-since'">{{ copy('On the watch choose Link account, then enter its four-digit code. To restore progress, use the same account and sync the new watch. Upload from your old watch first.', '在手表选择 Link account，再输入四位码。换表使用同一账号绑定并同步即可恢复，请先上传旧表记录。') }}</p>
  <form class="binding" @submit.prevent="bind"><label>{{ copy('Binding code', '绑定码') }}<input v-model="code" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" placeholder="0000" :disabled="busy" required></label><button :disabled="busy || !/^\d{4}$/.test(code)">{{ copy('Link watch', '绑定手表') }}</button></form>
  </component>
  <p v-if="error" role="alert" class="error">{{ error }}</p><p v-if="message" role="status">{{ message }}</p>
  <div class="toolbar"><label v-if="items.length && appKey !== 'days-since'">{{ copy('Watch', '手表') }}<select v-model="selected" :disabled="busy"><option v-for="(item, i) in items" :key="item.installationId" :value="item.installationId">{{ i + 1 }} · {{ item.installationId.slice(-6) }}</option></select></label><button :disabled="busy" @click="load">{{ copy('Reload saved settings', '重新加载已保存设置') }}</button></div>
  <p v-if="!items.length">{{ busy ? copy('Loading…','加载中…') : copy('No linked watch yet. Link this app to begin.', '尚未绑定手表，请先绑定本应用。') }}</p>
  <template v-if="current">
   <div v-if="items.length > 1 && appKey !== 'days-since'" class="toolbar"><label>{{ copy('Restore settings from another watch', '从其他手表恢复设置') }}<select v-model="copyFrom" :disabled="busy"><option value="">{{ copy('Choose watch', '选择手表') }}</option><option v-for="item in items.filter(i => i.installationId !== selected)" :key="item.installationId" :value="item.installationId">{{ item.installationId.slice(-6) }}</option></select></label><button :disabled="busy || !copyFrom || copyFrom === selected" @click="copySettings">{{ copy('Copy into draft', '复制到草稿') }}</button></div>
   <template v-if="appKey === 'days-since'">
    <h3>{{ current.config.values.label }}</h3>
    <HabitPlant :days="elapsedDays" :efforts="current.progress?.resistedCount || 0" :chinese="locale.currentLocale.startsWith('zh')" />
   </template>
   <component :is="appKey === 'days-since' ? 'details' : 'div'" :open="appKey === 'days-since' && !current.config.values.startAt">
    <summary v-if="appKey === 'days-since'">{{ copy('Habit settings', '习惯设置') }}</summary>
   <form @submit.prevent="save"><fieldset :disabled="busy">
    <label v-if="appKey !== 'next-up' && appKey !== 'quiet-beat'">{{ appKey === 'days-since' ? copy('Your habit', '你的习惯') : copy('Name', '名称') }}<input v-model="draft.values.label" maxlength="40" required></label>
    <template v-if="appKey === 'days-since'"><label>{{ copy('Started at', '开始日期') }}<input type="datetime-local" :value="localDate(draft.values.startAt)" :max="localDate(Date.now()/1000)" required @input="draft.values.startAt = epoch($event)"></label><p>{{ copy('A past date is welcome. No need to change your watch clock. Days count full 24-hour periods from this time; changing it recalculates progress and keeps your history.', '可直接填写过去的日期，无需修改手表时间。天数从该时间按完整 24 小时累计；修改后重新计算进度，历史仍保留。') }}</p></template>
    <template v-if="appKey === 'quick-log'"><label>{{ copy('Unit', '单位') }}<input v-model="draft.values.unit" maxlength="12" required></label><label>{{ copy('Amount per press', '每次记录份量') }}<input v-model.number="draft.values.portion" type="number" min="1" max="10000" required></label><label>{{ copy('Daily goal', '每日目标') }}<input v-model.number="draft.values.goal" type="number" min="1" max="100000" required></label><p>{{ copy('Changing name or unit starts a separate daily total. Earlier records keep their original labels and units.', '修改名称或单位后单独计算当日总量；历史记录保留原名称与单位。') }}</p></template>
    <template v-if="appKey === 'next-up'"><p>{{ copy('Manage up to 20 appointments here. Times use this browser’s timezone. Synced appointments stay available offline; Google and Outlook are not connected.', '在此维护最多 20 条日程，时间使用当前浏览器时区。同步后可离线查看；未连接 Google 或 Outlook。') }}</p><div v-for="(event, index) in draft.values.events" :key="event.id" class="appointment"><label>{{ copy('Title', '标题') }}<input v-model="event.title" maxlength="60" required></label><label>{{ copy('Starts', '开始') }}<input type="datetime-local" :value="localDate(event.startAt)" required @input="event.startAt = epoch($event)"></label><label>{{ copy('Ends', '结束') }}<input type="datetime-local" :value="localDate(event.endAt)" :min="localDate(event.startAt + 60)" required @input="event.endAt = epoch($event)"></label><button type="button" @click="draft.values.events?.splice(index, 1)">{{ copy('Remove', '移除') }}</button></div><button type="button" :disabled="(draft.values.events?.length || 0) >= 20" @click="addEvent">{{ copy('Add appointment', '添加日程') }}</button></template>
    <template v-if="appKey === 'battery-diary'"><label>{{ copy('Next change marker', '下次变更标记') }}<input v-model="draft.values.note" maxlength="60" required></label><p>{{ copy('The watch samples while this app is open. Use Mark change to attach this note. Samples do not identify which app caused battery drain.', '应用打开时采样电量，选择 Mark change 附加此备注。电量样本不能诊断具体耗电应用。') }}</p></template>
    <template v-if="appKey === 'quiet-beat'"><label>BPM<input v-model.number="draft.values.bpm" type="number" min="30" max="240" required></label><label>{{ copy('Session minutes', '练习时长（分钟）') }}<input v-model.number="draft.values.minutes" type="number" min="1" max="60" required></label><label v-for="(_, i) in draft.values.presets" :key="i">{{ copy('Favorite tempo', '常用节奏') }} {{ i + 1 }}<input v-model.number="draft.values.presets![i]" type="number" min="30" max="240" required></label><p>{{ copy('Vibration runs while the app is open and stops when you leave.', '震动在应用打开时运行，离开应用即停止。') }}</p></template>
    <template v-if="appKey === 'park-pin'"><label>{{ copy('Floor / section for next parking spot', '下次停车的楼层／区域') }}<input v-model="draft.values.section" maxlength="30" placeholder="B2 · C18"></label><label>{{ copy('Distance unit', '距离单位') }}<select v-model="draft.values.unit"><option value="m">Meters</option><option value="ft">Feet</option></select></label><p>{{ copy('GPS works outdoors. The saved floor/section is a note, not indoor positioning. Direction is a north-referenced bearing, not turn-by-turn navigation.', 'GPS 用于室外。楼层／区域仅为备注，不是室内定位。方向为相对正北的方位角，不提供逐向导航。') }}</p></template>
    <button class="save" :disabled="conflict">{{ copy('Save settings', '保存设置') }}</button>
   </fieldset></form>
   </component>
   <h3>{{ appKey === 'days-since' ? copy('Your record', '坚持记录') : copy('Uploaded history', '已上传历史') }}</h3><p>{{ copy('On your watch choose Sync now, then reload this page. Unsynced records remain on the watch.', '在手表选择 Sync now 后重新加载本页。未同步的记录仍在手表本地。') }}</p>
   <svg v-if="appKey === 'battery-diary' && batteryPoints.length > 1" viewBox="0 0 600 125" role="img" :aria-label="copy('Battery percentage over loaded samples', '已加载样本的电量百分比曲线')"><path d="M10 10V110H590" fill="none" stroke="#bdc9c1"/><polyline :points="batteryLine" fill="none" stroke="#286550" stroke-width="3"/><text x="12" y="22">100%</text><text x="12" y="105">0%</text></svg>
   <p v-if="!rows.length">{{ copy('No uploaded records yet.', '暂无已上传记录。') }}</p><ol class="history"><li v-for="row in rows" :key="row.cursor"><time>{{ date(row.event.at) }}</time><span>{{ describe(row) }}</span><a v-if="appKey === 'park-pin'" :href="`https://www.openstreetmap.org/?mlat=${row.event.payload.latitude}&mlon=${row.event.payload.longitude}#map=18/${row.event.payload.latitude}/${row.event.payload.longitude}`" target="_blank" rel="noopener noreferrer">{{ copy('Open map', '打开地图') }}</a></li></ol><button v-if="more" :disabled="busy" @click="history">{{ copy('Load older records', '加载更早记录') }}</button>
  </template>
 </template>
</div>
</template>
<style scoped>
.life-config{max-width:760px}details{border-bottom:1px solid #dce5df;padding:16px 0}summary{cursor:pointer;color:#294735;font-weight:600}form{margin:24px 0}fieldset{border:0;padding:0;display:grid;gap:18px}label{display:grid;gap:8px;font-size:14px;color:#314a40}input,select{box-sizing:border-box;min-width:0;width:100%;padding:12px;border:1px solid #bac9bf;border-radius:6px;background:white;font:inherit;color:#142d22}button{padding:12px 18px;border:1px solid #286550;border-radius:6px;background:#fff;color:#22573e;cursor:pointer;font:inherit}button:disabled{opacity:.5;cursor:default}.save{background:#183c2b;color:#fff}.binding,.toolbar{display:flex;gap:14px;align-items:end;flex-wrap:wrap}.binding input{width:160px}.error{color:#a33131}.appointment{padding:18px;background:#f2f6f1;display:grid;gap:14px;border-radius:8px}.history{padding:0;list-style:none}.history li{display:grid;gap:8px;padding:16px 0;border-bottom:1px solid #dce5df}.history time{font-size:12px;color:#64746a}.history span{overflow-wrap:anywhere}svg{width:100%;background:#f5f8f4}svg text{font-size:10px;fill:#64746a}p{line-height:1.7}
</style>
