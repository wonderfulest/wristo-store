<template>
  <section class="garmin-card" aria-labelledby="garmin-title">
    <div class="heading"><h2 id="garmin-title">Garmin 连接</h2><span role="status">{{ loading ? '正在读取…' : status === null ? '状态暂不可用' : status.connected ? '已连接 Garmin' : '尚未连接' }}</span></div>
    <p>授权同步运动记录与日常健康摘要，在同一个 Wristo 账号中查看。</p>
    <p v-if="status?.connected">已接收运动记录：{{ status.activities }} · 健康摘要：{{ status.health }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="actions"><a href="https://api.wristo.io/api/public/garmin/connect">{{ status?.connected ? '管理连接与查看授权' : '连接 Garmin' }} →</a><button type="button" :disabled="loading" @click="refresh">刷新状态</button></div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import request from '@/config/axios'
interface Status { connected: boolean; activities: number; health: number }
const status = ref<Status | null>(null)
const loading = ref(false)
const error = ref('')
async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  status.value = null
  try { status.value = await request.get<never, Status>('/garmin/connection') }
  catch { error.value = '暂时无法读取 Garmin 状态，请稍后刷新。' }
  finally { loading.value = false }
}
onMounted(refresh)
</script>
<style scoped>
.garmin-card { margin-bottom: 32px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; color: #182621; }
.heading, .actions { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
h2 { font-size: 18px; margin: 0; }
.heading span, p { font-size: 14px; line-height: 1.7; color: #596760; }
a { color: #087b5d; font-weight: 600; text-decoration: none; }
button { border: 1px solid #dce4df; border-radius: 8px; background: #f5f8f6; padding: 8px 14px; color: #254a3e; cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
</style>
