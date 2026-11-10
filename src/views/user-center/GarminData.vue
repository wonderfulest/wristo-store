<template>
  <main class="garmin-data">
    <RouterLink :to="addLocaleToPath('/user/profile', locale.currentLocale)">← 返回个人资料</RouterLink>
    <h1>Garmin 数据</h1>
    <p class="description">查看当前账号已接收的 Garmin 数据。此页读取 Wristo 已保存的推送摘要，刷新不会主动向 Garmin 拉取历史数据。</p>
    <GarminConnectionCard hide-data-link @status="onStatus" />
    <section class="data-panel" aria-labelledby="data-title">
      <h2 id="data-title">数据记录</h2>
      <div class="filters">
        <label>数据类型
          <select v-model="selectedType">
            <option v-for="[type, label] in garminDataTypes" :key="type" :value="type">{{ label }} · {{ type }}</option>
          </select>
        </label>
        <label>显示条数
          <select v-model.number="limit"><option :value="20">20</option><option :value="50">50</option><option :value="100">100</option></select>
        </label>
        <button :disabled="loading || !connection?.connected" @click="loadRecords">{{ loading ? '读取中…' : '刷新数据' }}</button>
      </div>
      <p v-if="!connection">请先读取连接状态，状态不可用时可在上方刷新。</p>
      <p v-else-if="!connection.connected">连接 Garmin 后可查看数据。</p>
      <p v-else-if="loading" role="status">正在读取 {{ selectedType }}…</p>
      <p v-else-if="error" role="alert">{{ error }}</p>
      <template v-else>
        <p class="description">当前显示 {{ records.length }} 条，按记录开始时间倒序，最多 {{ limit }} 条。{{ loadedAt ? `读取时间：${loadedAt}` : '' }}</p>
        <p v-if="!records.length" class="empty">尚未收到此类数据。请确认授权范围、设备同步及 Garmin 推送配置；可复制上方 UUID 匹配推送中的 userId。</p>
        <article v-for="(record, index) in records" :key="`${selectedType}-${index}`" class="record">
          <h3>{{ record.activityName || record.calendarDate || record.summaryId || `记录 ${index + 1}` }}</h3>
          <dl>
            <template v-for="[key, value] in basicFields(record)" :key="key">
              <dt>{{ fieldLabels[key] || key }}<small v-if="fieldLabels[key]">{{ key }}</small></dt>
              <dd>{{ value === null ? '—' : value }}</dd>
            </template>
          </dl>
          <details><summary>查看原始 JSON</summary><pre>{{ JSON.stringify(record, null, 2) }}</pre></details>
        </article>
      </template>
    </section>
  </main>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import GarminConnectionCard from '@/components/GarminConnectionCard.vue'
import { garminDataTypes, getGarminSummaries, type GarminStatus, type GarminSummary } from '@/api/garmin'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

const locale = useLocaleStore()
const connection = ref<GarminStatus | null>(null)
const selectedType = ref<string>('activities')
const limit = ref(20)
const records = ref<GarminSummary[]>([])
const loading = ref(false)
const error = ref('')
const loadedAt = ref('')
let requestVersion = 0
const fieldLabels: Record<string, string> = {
  summaryId: '记录 ID', userId: 'Garmin 用户 UUID', calendarDate: '日期',
  activityName: '运动名称', activityType: '运动类型', steps: '步数',
  distanceInMeters: '距离（米）', durationInSeconds: '时长（秒）',
  startTimeInSeconds: '开始时间（Unix 秒）', startTimeOffsetInSeconds: '时区偏移（秒）',
  activeKilocalories: '活动热量（千卡）', bmrKilocalories: '基础代谢（千卡）',
  averageHeartRateInBeatsPerMinute: '平均心率（次/分）',
  restingHeartRateInBeatsPerMinute: '静息心率（次/分）',
  maxHeartRateInBeatsPerMinute: '最高心率（次/分）',
  averageStressLevel: '平均压力', bodyBatteryChargedValue: '身体电量充电值',
  bodyBatteryDrainedValue: '身体电量消耗值', deepSleepDurationInSeconds: '深睡（秒）',
  lightSleepDurationInSeconds: '浅睡（秒）', remSleepInSeconds: 'REM 睡眠（秒）',
  awakeDurationInSeconds: '清醒（秒）',
}
function basicFields(record: GarminSummary) {
  return Object.entries(record).filter(([, value]) => value === null || typeof value !== 'object')
}
function onStatus(value: GarminStatus | null) {
  connection.value = value
  void loadRecords()
}
async function loadRecords() {
  const version = ++requestVersion
  records.value = []
  error.value = ''
  loadedAt.value = ''
  loading.value = false
  if (!connection.value?.connected) return
  loading.value = true
  try {
    const result = await getGarminSummaries(selectedType.value, limit.value)
    if (version !== requestVersion) return
    records.value = result
    loadedAt.value = new Date().toLocaleString()
  } catch {
    if (version === requestVersion) error.value = '数据读取失败，请点击刷新数据重试。'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}
watch([selectedType, limit], loadRecords)
onBeforeUnmount(() => { requestVersion++ })
</script>
<style scoped>
.garmin-data { max-width: 1000px; margin: 0 auto; padding: 40px 20px 80px; color: #182621; }
h1 { font-size: 28px; margin: 24px 0 12px; }
h2 { font-size: 20px; margin-top: 0; }
h3 { font-size: 16px; overflow-wrap: anywhere; }
a { color: #087b5d; }
p { line-height: 1.7; }
.description, small { color: #65726c; }
.data-panel { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; }
.filters { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; }
label { display: grid; gap: 8px; max-width: 100%; font-size: 14px; }
select, button { padding: 9px 12px; border: 1px solid #cdd8d2; border-radius: 8px; background: #f5f8f6; color: #254a3e; max-width: 100%; }
button { cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
.empty { background: #f5f8f6; padding: 20px; border-radius: 8px; }
.record { border-top: 1px solid #e5e7eb; padding: 16px 0; }
dl { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); font-size: 14px; }
dt, dd { margin: 0; padding: 8px; border-bottom: 1px solid #f0f2f1; overflow-wrap: anywhere; }
small { display: block; font-size: 12px; }
summary { cursor: pointer; color: #087b5d; padding: 12px 0; }
pre { background: #f5f8f6; padding: 16px; border-radius: 8px; overflow: auto; max-height: 500px; font-size: 12px; }
@media (max-width: 600px) { .garmin-data { padding: 24px 12px; } .data-panel { padding: 16px; } }
</style>
