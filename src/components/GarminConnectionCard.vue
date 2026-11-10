<template>
  <section class="garmin-card" aria-labelledby="garmin-title">
    <div class="heading">
      <h2 id="garmin-title">Garmin 连接</h2>
      <span role="status">{{ loading ? '正在读取…' : status === null ? '状态暂不可用' : status.revocationPending ? '解绑处理中' : status.connected ? '已连接 Garmin' : '尚未连接' }}</span>
    </div>
    <p>授权同步运动记录与日常健康摘要，在同一个 Wristo 账号中查看。</p>
    <template v-if="status?.connected">
      <div class="identity">
        <span>Garmin 用户 UUID（userId）</span>
        <code>{{ status.garminUserId || '暂不可用' }}</code>
        <button v-if="status.garminUserId" type="button" @click="copyId">复制 UUID</button>
      </div>
      <p>已接收运动记录：{{ status.activities }} · 健康摘要：{{ status.health }}</p>
      <p>授权范围：{{ status.permissions.join('、') || '无' }}</p>
      <p v-if="status.connectedAt">连接时间：{{ new Date(status.connectedAt).toLocaleString() }}</p>
    </template>
    <p v-if="status?.revocationPending">本地数据已清除，正在撤销 Garmin 授权。请稍后刷新，完成后可以重新连接。</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="notice" role="status">{{ notice }}</p>
    <div class="actions">
      <a v-if="status && !status.revocationPending" href="https://api.wristo.io/api/public/garmin/connect">{{ status.connected ? '管理连接与查看授权' : '连接 Garmin' }} →</a>
      <RouterLink v-if="!hideDataLink" :to="addLocaleToPath('/user/garmin', locale.currentLocale)">查看 Garmin 数据 →</RouterLink>
      <button type="button" :disabled="loading || disconnecting" @click="refresh">刷新状态</button>
      <button v-if="status?.connected" class="danger" type="button" :disabled="loading || disconnecting" @click="disconnect">{{ disconnecting ? '正在解绑…' : '解绑 Garmin' }}</button>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { disconnectGarmin, getGarminStatus, type GarminStatus } from '@/api/garmin'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'

defineProps<{ hideDataLink?: boolean }>()
const emit = defineEmits<{ status: [value: GarminStatus | null] }>()
const locale = useLocaleStore()
const status = ref<GarminStatus | null>(null)
const loading = ref(false)
const disconnecting = ref(false)
const error = ref('')
const notice = ref('')
async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try { status.value = await getGarminStatus() }
  catch { status.value = null; error.value = '暂时无法读取 Garmin 状态，请稍后刷新。' }
  finally { loading.value = false; emit('status', status.value) }
}
async function copyId() {
  if (!status.value?.garminUserId) return
  try { await navigator.clipboard.writeText(status.value.garminUserId); notice.value = 'UUID 已复制。' }
  catch { notice.value = '复制失败，请手动选择并复制 UUID。' }
}
async function disconnect() {
  if (disconnecting.value || loading.value) return
  disconnecting.value = true
  try {
    try {
      await ElMessageBox.confirm('解绑将删除 Wristo 中已同步的 Garmin 运动与健康数据，并撤销 Garmin 授权。确认解绑？', '解绑 Garmin', {
        confirmButtonText: '确认解绑', cancelButtonText: '取消', type: 'warning',
      })
    } catch { return }
    error.value = ''
    notice.value = ''
    try {
      await disconnectGarmin()
      status.value = null
      emit('status', null)
      notice.value = '已解绑，已清除本地同步数据。'
      await refresh()
    } catch { error.value = '解绑失败，请刷新状态后重试。' }
  } finally { disconnecting.value = false }
}
onMounted(refresh)
</script>
<style scoped>
.garmin-card { margin-bottom: 32px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; color: #182621; }
.heading, .actions, .identity { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.heading { justify-content: space-between; }
h2 { font-size: 18px; margin: 0; }
.heading span, p, .identity { font-size: 14px; line-height: 1.7; color: #596760; }
code { overflow-wrap: anywhere; user-select: all; color: #182621; }
a { color: #087b5d; font-weight: 600; text-decoration: none; }
button { border: 1px solid #dce4df; border-radius: 8px; background: #f5f8f6; padding: 8px 14px; color: #254a3e; cursor: pointer; }
button.danger { color: #b42318; background: #fff5f4; border-color: #f5c9c5; }
button:disabled { opacity: .5; cursor: default; }
</style>
