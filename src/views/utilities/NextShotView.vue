<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { bindUtility } from '@/api/utilities'
import { getShotInstallations, getShotHistory, saveShotConfig, type ShotConfig, type ShotHistory, type ShotInstallation, type ShotSession } from '@/api/nextShot'
import { benchmarkComparison, distanceStats, hits, parseDistances } from '@/utils/nextShot'
const user = useUserStore(), locale = useLocaleStore()
const copy = (en: string, zh: string) => locale.currentLocale.startsWith('zh') ? zh : en
const installations = ref<ShotInstallation[]>([]), selected = ref(''), records = ref<ShotHistory[]>([])
const busy = ref(false), loading = ref(false), error = ref(''), message = ref(''), code = ref(''), hasMore = ref(false), conflict = ref(false)
const defaults: ShotConfig = { revision: 0, unit: 'yd', distances: [40,60,80,100], mode: 'random', minutes: 20, balls: 0, tolerance: 5 }
const draft = ref<ShotConfig>({ ...defaults }), targets = ref('40, 60, 80, 100'), endBy = ref('minutes'), limit = ref(20)
let generation = 0, historyGeneration = 0
const current = computed(() => installations.value.find(i => i.installationId === selected.value))
const sessions = computed(() => records.value.map(r => r.session).sort((a,b) => b.startedAt-a.startedAt))
const stats = computed(() => distanceStats(sessions.value, current.value?.config || defaults))
const planned = computed<ShotConfig | null>(() => {
  const distances = parseDistances(targets.value)
  if (!distances || !Number.isInteger(draft.value.tolerance) || draft.value.tolerance < 1 || draft.value.tolerance > 20) return null
  if (draft.value.mode !== 'benchmark' && (!Number.isInteger(limit.value) || limit.value < 1 || limit.value > 60)) return null
  return { ...draft.value, distances, minutes: draft.value.mode === 'benchmark' ? 0 : endBy.value === 'minutes' ? limit.value : 0, balls: draft.value.mode === 'benchmark' ? distances.length * 5 : endBy.value === 'balls' ? limit.value : 0 }
})
function fill(c: ShotConfig) { draft.value = { ...c, distances: [...c.distances] }; targets.value = c.distances.join(', '); endBy.value = c.minutes ? 'minutes' : 'balls'; limit.value = c.minutes || c.balls; conflict.value = false }
function date(value: number) { return new Date(value * 1000).toLocaleString(locale.currentLocale.startsWith('zh') ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function modeName(mode: string) { return ({ fixed: copy('Fixed distance', '固定距离'), random: copy('Balanced random', '均衡随机'), weak: copy('Weakness practice', '弱项加练'), benchmark: copy('Standard retest', '标准复测') })[mode] || mode }
async function history(more = false) {
  if (!selected.value) return
  const id = selected.value, request = ++historyGeneration, account = generation
  loading.value = true; error.value = ''
  try {
    const rows = await getShotHistory(id, more ? records.value.at(-1)?.cursor || 0 : 0)
    if (request !== historyGeneration || account !== generation || id !== selected.value) return
    records.value = more ? [...records.value, ...rows.filter(r => !records.value.some(old => old.cursor === r.cursor))] : rows
    hasMore.value = rows.length === 30
  } catch { if (request === historyGeneration && account === generation) error.value = copy('Could not load sessions. Please retry.', '训练记录加载失败，请重试。') }
  finally { if (request === historyGeneration && account === generation) loading.value = false }
}
async function load() {
  if (busy.value) return
  const account = generation; busy.value = true; error.value = ''
  try {
    const items = await getShotInstallations()
    if (account !== generation) return
    installations.value = items
    if (!items.some(i => i.installationId === selected.value)) selected.value = items[0]?.installationId || ''
    else if (current.value) { fill(current.value.config); await history() }
  } catch { if (account === generation) error.value = copy('Could not load your watch. Try again.', '手表信息加载失败，请重试。') }
  finally { if (account === generation) busy.value = false }
}
async function bind() {
  if (busy.value || !/^\d{4}$/.test(code.value)) return
  const account = generation; busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await bindUtility(code.value)
    if (account !== generation) return
    code.value = ''
    const items = await getShotInstallations()
    if (account !== generation) return
    installations.value = items
    if (items.some(i => i.installationId === result.installationId)) { selected.value = result.installationId; message.value = copy('Watch linked.', '手表已绑定。') }
    else message.value = copy('App linked. Enter a code from Next Shot to configure training here.', '应用已绑定；要配置训练，请输入 Next Shot 中的绑定码。')
  } catch { if (account === generation) error.value = copy('Linking failed. Get a fresh code on your watch, or reload if already linked.', '绑定失败，请在手表获取新码；若已绑定，请重新加载。') }
  finally { if (account === generation) busy.value = false }
}
async function save(config = planned.value) {
  if (!config || !current.value || busy.value || conflict.value) return
  const account = generation, id = selected.value; busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await saveShotConfig(id, config)
    if (account !== generation || id !== selected.value) return
    installations.value = installations.value.map(i => i.installationId === id ? result : i); fill(result.config)
    message.value = copy('Plan saved. Choose Sync now, then Use phone plan on your watch. Your active session keeps its original rules.', '计划已保存。请在手表选择 Sync now，再选择 Use phone plan；正在进行的训练继续使用原规则。')
  } catch (e) {
    if (account !== generation) return
    const err = e as { code?: number; response?: { status?: number; data?: { code?: number } } }
    conflict.value = (err.code || err.response?.data?.code || err.response?.status) === 409
    error.value = conflict.value ? copy('This plan changed elsewhere. Your edits are kept. Reload the saved plan before saving again.', '计划已在其他地方修改，当前编辑已保留。请加载已保存计划后重新编辑。') : copy('Save failed. Your edits are kept.', '保存失败，编辑已保留。')
  } finally { if (account === generation) busy.value = false }
}
function retest(s: ShotSession) {
  if (!current.value) return
  const c = { ...s.config, revision: current.value.config.revision, mode: 'benchmark' as const, minutes: 0, balls: s.config.distances.length * 5 }
  fill(c); message.value = copy('Retest rules copied below. Save the plan to send it to your watch.', '已复制复测规则，请保存计划后同步到手表。'); document.getElementById('training-plan')?.scrollIntoView({ behavior: 'smooth' })
}
watch(selected, () => { historyGeneration++; records.value = []; hasMore.value = false; if (current.value) { fill(current.value.config); void history() } })
watch(() => user.userInfo, info => {
  generation++; historyGeneration++; busy.value = false; loading.value = false; installations.value = []; selected.value = ''; records.value = []; code.value = ''; error.value = ''; message.value = ''; hasMore.value = false; conflict.value = false
  if (info) void load()
}, { immediate: true })
onBeforeUnmount(() => { generation++; historyGeneration++ })
</script>
<template>
<main class="next-shot">
  <header class="hero">
    <div><p class="eyebrow">WRISTO / WEDGE PRACTICE</p><h1>Next Shot<span>.</span></h1><p class="availability">{{ copy('Development preview · Not yet on Connect IQ', '开发预览 · 尚未在 Connect IQ 上架') }}</p><p class="lead">{{ copy('A little more intention. One ball at a time.', '每一球，都有一个明确目标。') }}</p><p>{{ copy('Set your distances, practice from your wrist, and return to the shots that need work.', '设置距离，在腕上完成练习，记住下次值得再练的一球。') }}</p><a href="#training-plan" class="hero-link">{{ copy('Build your practice', '安排我的练习') }} ↗</a></div>
    <div class="target-art" aria-hidden="true"><div class="target-ring ring-outer"></div><div class="target-ring ring-inner"></div><span class="flag">⚑</span><div class="distance-mark">60 <small>YD</small></div><span class="art-caption">YOUR NEXT SHOT</span></div>
  </header>
  <div class="principle"><span>01 / {{ copy('Choose a target', '设定目标') }}</span><span>02 / {{ copy('Record what you see', '记录观察') }}</span><span>03 / {{ copy('Practice, then retest', '练习与复测') }}</span></div>
  <section class="link-section"><div><p class="eyebrow">{{ copy('YOUR WATCH', '你的手表') }}</p><h2>{{ copy('Bring your practice together.', '把练习记录连起来。') }}</h2><p>{{ copy('Open Link account in Next Shot on your watch. Enter its code within five minutes.', '在手表 Next Shot 中选择 Link account，五分钟内输入绑定码。') }}</p></div>
    <button v-if="!user.userInfo" class="primary" @click="redirectToSsoLogin('store')">{{ copy('Sign in to link your watch', '登录并绑定手表') }}</button>
    <form v-else @submit.prevent="bind" class="bind-form"><label for="shot-code">{{ copy('Four-digit code', '四位绑定码') }}</label><div><input id="shot-code" v-model="code" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" autocomplete="off" placeholder="0000" required :disabled="busy"><button :disabled="busy || !/^\d{4}$/.test(code)">{{ copy('Link', '绑定') }}</button></div></form>
  </section>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="message" class="notice success" role="status">{{ message }}</p>
  <div v-if="user.userInfo" class="installation-bar"><label v-if="installations.length" for="shot-installation">{{ copy('Watch installation', '手表安装') }}</label><select v-if="installations.length" id="shot-installation" v-model="selected" :disabled="busy || loading"><option v-for="(item,i) in installations" :key="item.installationId" :value="item.installationId">Next Shot {{ i + 1 }} · {{ item.installationId.slice(-6) }}</option></select><button :disabled="busy || loading" @click="load">{{ copy('Reload saved plan', '加载已保存计划') }}</button><p v-if="!installations.length">{{ busy ? copy('Loading…', '正在加载…') : copy('No linked Next Shot watch yet.', '尚未绑定 Next Shot 手表。') }}</p></div>
  <div class="workspace">
    <section id="training-plan" class="plan-section"><p class="eyebrow">{{ copy('THE PRACTICE PLAN', '训练计划') }}</p><h2>{{ copy('Make these minutes count.', '练好眼前这二十分钟。') }}</h2>
      <p v-if="!current" class="hint">{{ copy('Explore a sample plan. Link your watch to save it.', '可以先试配计划，绑定手表后才能保存。') }}</p>
      <form @submit.prevent="save()"><fieldset :disabled="busy"><label for="shot-unit">{{ copy('Distance unit', '距离单位') }}</label><select id="shot-unit" v-model="draft.unit"><option value="yd">{{ copy('Yards', '码') }}</option><option value="m">{{ copy('Meters', '米') }}</option></select><p class="hint">{{ copy('Changing units keeps the numbers you enter. Check your targets before saving.', '切换单位保留输入数字，请重新核对距离。') }}</p>
      <label for="shot-targets">{{ copy('Target distances', '目标距离') }}</label><input id="shot-targets" v-model="targets" placeholder="40, 60, 80, 100" required aria-describedby="target-help"><p id="target-help" class="hint">{{ copy('1–6 unique targets, 10–150 each. Separate with commas. Fixed practice uses the first target.', '1–6 个不同距离，每个 10–150，用逗号分隔。固定练习使用第一个距离。') }}</p>
      <label for="shot-tolerance">{{ copy('Observed target band: ±', '观察目标区：正负') }} {{ draft.unit }}</label><input id="shot-tolerance" v-model.number="draft.tolerance" type="number" min="1" max="20" step="1" required><p class="hint">{{ copy('Short / on / long describes landing distance. Use visible range markers; this is your estimate, not measured dispersion.', '短／目标区／长描述落地距离，请参考可见标志判断；这是观察估计，不是精确散布测量。') }}</p>
      <label for="shot-mode">{{ copy('Practice mode', '练习模式') }}</label><select id="shot-mode" v-model="draft.mode"><option value="random">{{ modeName('random') }}</option><option value="fixed">{{ modeName('fixed') }}</option><option value="weak">{{ modeName('weak') }}</option><option value="benchmark">{{ modeName('benchmark') }}</option></select>
      <p v-if="draft.mode === 'weak'" class="hint">{{ copy('The watch uses its three most recent retained sessions. After 10 records at a distance, a target-band rate below 50% earns extra practice. Units and band must match.', '手表参考本地保留的最近三次训练。同单位、同目标区下，一个距离累计至少 10 球且目标区比例低于 50%，就增加练习。') }}</p>
      <p v-if="draft.mode === 'benchmark'" class="hint">{{ copy('Five balls per distance in a fixed order. Complete all balls for a comparable retest.', '每个距离 5 球，固定顺序；完成全部球数后才计入复测比较。') }}</p>
      <div v-else class="limit-fields"><div><label for="shot-end">{{ copy('Finish by', '结束条件') }}</label><select id="shot-end" v-model="endBy"><option value="minutes">{{ copy('Minutes', '分钟') }}</option><option value="balls">{{ copy('Balls', '球数') }}</option></select></div><div><label for="shot-limit">{{ copy('Amount', '数量') }}</label><input id="shot-limit" v-model.number="limit" type="number" min="1" max="60" required></div></div>
      </fieldset><button class="primary save" :disabled="!current || !planned || busy || conflict">{{ busy ? copy('Working…', '处理中…') : copy('Save practice plan', '保存训练计划') }}</button><p class="hint">{{ copy('Sync on your watch, then choose Use phone plan. Each session allows up to 60 balls.', '在手表同步后选择 Use phone plan。每次训练最多记录 60 球。') }}</p></form>
    </section>
    <section class="progress-section"><p class="eyebrow">{{ copy('DISTANCE NOTEBOOK', '距离练习簿') }}</p><h2>{{ copy('Know what to come back to.', '知道下一次重点练什么。') }}</h2><p>{{ copy('Observed results for the saved unit and target band, across loaded sessions.', '按已保存的单位与目标区，汇总已加载训练中的观察记录。') }}</p>
      <p v-if="loading" role="status">{{ copy('Loading sessions…', '正在加载训练…') }}</p><div v-if="!sessions.length" class="empty"><span>—</span><h3>{{ copy('Your first session starts on your wrist.', '第一场训练，从腕上开始。') }}</h3><p>{{ copy('Finish a practice and choose Sync now on your watch. Your distance notes will appear here.', '完成训练后在手表选择 Sync now，各距离的记录就会出现在这里。') }}</p></div>
      <div v-else class="distance-list"><article v-for="stat in stats" :key="stat.distance"><div class="distance-heading"><h3>{{ stat.distance }} <small>{{ current?.config.unit }}</small></h3><strong>{{ stat.total ? stat.percent + '%' : '—' }}</strong></div><div class="bar" :aria-label="`${stat.on} / ${stat.total}`"><span :style="{ width: stat.percent + '%' }"></span></div><p>{{ copy('Short / on / long', '短／目标区／长') }} <b>{{ stat.short }} / {{ stat.on }} / {{ stat.long }}</b></p><p class="hint">{{ stat.enough ? (stat.short > stat.long ? copy('More misses finish short.', '偏短次数较多。') : stat.long > stat.short ? copy('More misses finish long.', '偏长次数较多。') : copy('No dominant miss direction.', '没有明显的偏差方向。')) : copy('At least 10 balls before assessing a weakness.', '至少记录 10 球后再判断弱项。') }}</p></article></div>
    </section>
  </div>
  <section v-if="current" class="history-section"><div class="section-heading"><div><p class="eyebrow">{{ copy('PRACTICE HISTORY', '训练历史') }}</p><h2>{{ copy('Return. Retest. Notice the change.', '再练一次，看见变化。') }}</h2></div><button :disabled="loading || busy" @click="history()">{{ copy('Refresh history', '刷新历史') }}</button></div><p>{{ copy('Only completed standard retests with matching targets, units and bands are compared. Offline sessions appear after syncing.', '只比较距离、单位和目标区一致且完整完成的标准复测。离线训练会在同步后显示。') }}</p>
    <article v-for="s in sessions" :key="s.id" class="session"><div><time>{{ date(s.startedAt) }}</time><h3>{{ modeName(s.config.mode) }}</h3><p>{{ s.config.distances.join(' / ') }} {{ s.config.unit }} · ±{{ s.config.tolerance }} · {{ s.completed ? copy('Complete', '已完成') : copy('Ended early', '提前结束') }}</p></div><div class="session-score"><strong>{{ hits(s) }}<small> / {{ s.shots.length }}</small></strong><span>{{ copy('in observed band', '观察目标区内') }}</span><p v-if="benchmarkComparison(s, sessions)">{{ copy('vs. previous retest', '比上次同条件复测') }} {{ benchmarkComparison(s, sessions)!.change > 0 ? '+' : '' }}{{ benchmarkComparison(s, sessions)!.change }} {{ copy('percentage points', '个百分点') }}</p></div><button :disabled="busy || conflict" @click="retest(s)">{{ copy('Plan a retest', '按此条件复测') }}</button></article>
    <button v-if="hasMore" :disabled="loading || busy" @click="history(true)">{{ copy('Load older sessions', '加载更早记录') }}</button><p v-if="!sessions.length && !loading">{{ copy('No synced sessions yet.', '暂无已同步训练。') }}</p>
  </section>
  <footer class="note">{{ copy('Made for practice, not shot measurement. Next Shot does not detect shots or locate your ball. Records reflect what you observe.', '为练习而做，不是击球测量设备。Next Shot 不自动识别击球或定位落点，记录来自你的观察。') }}</footer>
</main>
</template>
<style scoped>
.next-shot{--ink:#17382d;--muted:#64756b;--line:#d8dfd4;--lime:#d9ef87;max-width:1120px;margin:auto;padding:48px 32px 80px;color:var(--ink);font-family:'Avenir Next','PingFang SC',sans-serif}.hero{display:grid;grid-template-columns:1.3fr 1fr;gap:40px;align-items:center;padding:30px 0 50px}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:700;margin:0 0 18px}.hero h1{font-family:Georgia,serif;font-size:clamp(64px,7vw,98px);font-weight:400;line-height:1;margin:0 0 26px;letter-spacing:-4px}.hero h1 span{color:#7f993e}.lead{font-size:24px;max-width:450px;line-height:1.5}.hero p:not(.eyebrow){max-width:500px}.hero-link{display:inline-block;margin-top:18px;color:var(--ink);font-weight:700;text-decoration:underline;text-underline-offset:7px}.target-art{position:relative;min-height:320px;background:#eef1e6;overflow:hidden;border-radius:50% 50% 8px 8px}.target-ring{position:absolute;border:1px solid #9eaf8c;border-radius:50%;transform:rotate(-18deg)}.ring-outer{width:280px;height:170px;top:85px;left:calc(50% - 140px)}.ring-inner{width:180px;height:110px;top:115px;left:calc(50% - 90px)}.flag{position:absolute;top:36px;left:48%;font-size:70px;color:#335637}.distance-mark{position:absolute;top:160px;left:0;right:0;text-align:center;font-size:64px;font-family:Georgia,serif}.distance-mark small{font-size:16px;font-family:inherit}.art-caption{position:absolute;bottom:30px;width:100%;text-align:center;font-size:10px;letter-spacing:3px}.principle{display:flex;justify-content:space-between;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:22px 0;font-size:13px;gap:20px}.link-section{display:flex;justify-content:space-between;gap:40px;align-items:center;padding:42px 0}h2{font-family:Georgia,'Songti SC',serif;font-size:30px;font-weight:400;line-height:1.3;margin:0 0 16px}p{color:var(--muted);line-height:1.65;font-size:15px}button,.hero-link{min-height:44px}button{background:white;border:1px solid #9cac9e;border-radius:4px;padding:11px 18px;color:var(--ink);font:inherit;font-size:14px;cursor:pointer}button.primary{background:var(--ink);color:white;border-color:var(--ink)}button:disabled{opacity:.45;cursor:not-allowed}.bind-form{min-width:270px}.bind-form>div{display:flex;gap:10px}.bind-form input{max-width:180px;font-size:24px;letter-spacing:5px}label{display:block;font-size:13px;font-weight:600;margin:18px 0 9px}input,select{width:100%;box-sizing:border-box;min-height:46px;border:1px solid #aebcad;border-radius:4px;background:#fff;color:var(--ink);padding:10px 12px;font:inherit;font-size:16px}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #829b40;outline-offset:3px}.installation-bar{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:0 0 24px}.installation-bar select{max-width:280px}.installation-bar label{margin:0}.workspace{display:grid;grid-template-columns:1fr 1fr;gap:60px;border-top:1px solid var(--line);padding-top:40px}.plan-section{background:#f6f7f1;padding:30px;border-radius:6px}.progress-section{padding-top:30px}.hint{font-size:12px;line-height:1.6;margin-top:8px}fieldset{border:0;padding:0;margin:0;min-width:0}.limit-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}.save{width:100%;margin-top:24px}.empty{padding:50px 0}.empty>span{font-size:70px;font-family:Georgia,serif;color:#a6b29e}.empty h3{font-size:20px;font-weight:500;line-height:1.6}.distance-list article{padding:20px 0;border-bottom:1px solid var(--line)}.distance-heading{display:flex;align-items:baseline;justify-content:space-between}.distance-heading h3{font-size:36px;font-weight:400;margin:0}.distance-heading small{font-size:15px;color:var(--muted)}.distance-heading strong{font-size:24px;font-weight:400}.bar{height:7px;background:#edf0e8;margin:16px 0}.bar span{display:block;height:100%;background:#7d973b}.distance-list p{margin:8px 0 0;display:flex;justify-content:space-between;gap:12px;font-size:13px}.history-section{margin-top:60px;border-top:1px solid var(--line);padding-top:36px}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:20px}.session{display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:24px;padding:28px 0;border-bottom:1px solid var(--line)}.session h3{margin:10px 0;font-weight:500;font-size:19px}.session time{font-size:12px;color:var(--muted)}.session p{font-size:13px;margin:8px 0}.session-score strong{display:block;font-size:32px;font-weight:400}.session-score strong small{font-size:18px;color:var(--muted)}.session-score span{font-size:12px;color:var(--muted)}.notice{padding:16px 20px;border-left:3px solid}.error{color:#963d2e;background:#fff5ee}.success{color:#355d38;background:#eef4e8}.note{margin-top:50px;padding-top:24px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);line-height:1.8}@media(max-width:700px){.next-shot{padding:24px 20px 60px}.hero{grid-template-columns:1fr;gap:20px;padding:18px 0 28px}.hero h1{font-size:64px}.hero .lead{font-size:22px}.target-art{min-height:240px}.ring-outer{top:50px}.ring-inner{top:80px}.flag{top:5px}.distance-mark{top:115px}.art-caption{bottom:20px}.principle{font-size:11px;gap:12px;line-height:1.6}.link-section{flex-direction:column;align-items:stretch;gap:14px}.bind-form{min-width:0}.workspace{grid-template-columns:1fr;gap:20px}.plan-section{padding:24px 20px}.progress-section{padding-top:20px}.session{grid-template-columns:1fr 1fr;gap:16px}.session button{grid-column:1/-1}.section-heading{align-items:flex-start;flex-direction:column}h2{font-size:27px}.history-section{margin-top:36px}}
</style>
