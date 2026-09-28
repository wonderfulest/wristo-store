<template>
  <main class="activations-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('nav.account') }}</p>
        <h1>{{ t('activations.title') }}</h1>
        <p class="subtitle">{{ t('activations.subtitle') }}</p>
        <p class="account-email">{{ userStore.userInfo?.email }}</p>
      </div>
      <RouterLink :to="path('/activate')" class="primary-action">
        <Icon icon="solar:watch-round-linear" width="20" aria-hidden="true" />
        {{ t('activations.activate') }}
      </RouterLink>
    </header>

    <section class="policy" :aria-label="t('activations.policyTitle')">
      <div><strong>1</strong><span>{{ t('activations.singlePolicy') }}</span></div>
      <div><strong>2</strong><span>{{ t('activations.bundlePolicy') }}</span></div>
      <p>{{ t('activations.releasePolicy') }}</p>
    </section>

    <div v-if="notice" class="notice" role="status">{{ notice }}</div>
    <div v-if="error" class="error-panel" role="alert">
      <span>{{ error }}</span>
      <button v-if="loadFailed" type="button" @click="loadRecords">{{ t('activations.retry') }}</button>
    </div>
    <div v-if="loading" class="state-panel" aria-live="polite">{{ t('activations.loading') }}</div>
    <section v-else-if="records.length" class="record-list" :aria-label="t('activations.title')">
      <div class="list-heading"><h2>{{ t('activations.current') }}</h2><span>{{ records.length }}</span></div>
      <article v-for="record in records" :key="record.id" class="activation-row">
        <div class="watch-image">
          <img v-if="record.imageUrl" :src="record.imageUrl" alt="" loading="lazy" @error="record.imageUrl = null" />
          <Icon v-else icon="solar:watch-round-linear" width="30" aria-hidden="true" />
        </div>
        <div class="record-main">
          <h3>{{ record.productName || t('activations.appFallback', { id: record.appId }) }}</h3>
          <p class="device"><Icon icon="solar:watch-round-linear" width="16" aria-hidden="true" />{{ record.deviceName }}</p>
          <div class="record-meta">
            <span class="entitlement">{{ entitlementLabel(record) }}</span>
            <span>{{ t('activations.recordId', { id: record.id }) }}</span>
            <time v-if="record.activatedAt" :datetime="record.activatedAt">{{ formatDate(record.activatedAt) }}</time>
          </div>
        </div>
        <button class="remove-action" type="button" :disabled="removingId !== null"
          :aria-label="t('activations.removeLabel', { name: record.productName || record.appId, device: record.deviceName })"
          :aria-busy="removingId === record.id" @click="confirmRemoval(record)">
          <Icon icon="solar:trash-bin-minimalistic-linear" width="18" aria-hidden="true" />
          {{ t(removingId === record.id ? 'activations.removing' : 'activations.remove') }}
        </button>
      </article>
    </section>
    <section v-else-if="!loadFailed" class="state-panel empty-state">
      <Icon icon="solar:watch-round-linear" width="40" aria-hidden="true" />
      <h2>{{ t('activations.empty') }}</h2>
      <p>{{ t('activations.emptyHint') }}</p>
      <RouterLink :to="path('/activate')">{{ t('activations.activate') }}</RouterLink>
    </section>
    <footer class="page-footer">
      <p>{{ t('activations.cacheNote') }}</p>
      <RouterLink :to="path('/user/purchase-records')">{{ t('nav.purchases') }} →</RouterLink>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { ElMessageBox } from 'element-plus'
import { getActivations, removeActivation, type ActivationRecord } from '@/api/activations'
import { useUserStore } from '@/store/user'
import { addLocaleToPath } from '@/store/locale'
import { useI18n } from '@/i18n'

const { t, locale } = useI18n()
const userStore = useUserStore()
const records = ref<ActivationRecord[]>([])
const loading = ref(true)
const loadFailed = ref(false)
const error = ref('')
const notice = ref('')
const removingId = ref<number | null>(null)
const path = (value: string) => addLocaleToPath(value, locale.value)
const entitlementLabel = (record: ActivationRecord) => t(record.entitlementType === 'SINGLE'
  ? 'activations.single' : record.entitlementType === 'BUNDLE' ? 'activations.bundle' : 'activations.subscription')
function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
async function loadRecords() {
  loading.value = true
  loadFailed.value = false
  error.value = ''
  try { records.value = await getActivations() }
  catch { loadFailed.value = true; error.value = t('activations.loadFailed') }
  finally { loading.value = false }
}
async function confirmRemoval(record: ActivationRecord) {
  if (removingId.value !== null) return
  try {
    await ElMessageBox.confirm(
      t('activations.confirmMessage', { name: record.productName || record.appId, device: record.deviceName }),
      t('activations.confirmTitle'),
      { confirmButtonText: t('activations.remove'), cancelButtonText: t('activations.cancel'), type: 'warning' },
    )
  } catch { return }
  removingId.value = record.id
  error.value = ''
  notice.value = ''
  try {
    await removeActivation(record.id)
    records.value = records.value.filter(item => item.id !== record.id)
    notice.value = t('activations.removed')
  } catch { error.value = t('activations.removeFailed') }
  finally { removingId.value = null }
}
onMounted(loadRecords)
</script>

<style scoped>
.activations-page { max-width: 1040px; margin: 0 auto; padding: 48px 24px 64px; color: #17212b; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 28px; margin-bottom: 32px; }
.eyebrow { color: #66727e; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 12px; }
h1 { font-size: clamp(28px, 4vw, 38px); font-weight: 650; letter-spacing: -.035em; margin: 0 0 12px; }
.subtitle { color: #66727e; line-height: 1.6; margin: 0; max-width: 600px; }
.account-email { color: #475569; font-size: 13px; margin: 12px 0 0; overflow-wrap: anywhere; }
.primary-action { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 18px; border-radius: 10px; background: #142b3d; color: white; text-decoration: none; font-weight: 600; font-size: 14px; min-height: 44px; box-sizing: border-box; }
.primary-action:hover { background: #234861; }
.policy { display: grid; grid-template-columns: 1fr 1fr; background: #f4f7f8; border: 1px solid #e4eaed; border-radius: 14px; padding: 24px; gap: 18px 28px; margin-bottom: 28px; }
.policy > div { display: flex; align-items: center; gap: 14px; }
.policy strong { font-size: 32px; font-weight: 600; color: #274b60; }
.policy span { font-size: 14px; line-height: 1.5; max-width: 260px; }
.policy p { grid-column: 1 / -1; font-size: 13px; line-height: 1.6; color: #66727e; margin: 0; border-top: 1px solid #e0e7eb; padding-top: 16px; }
.record-list { border: 1px solid #e4e9ed; border-radius: 14px; overflow: hidden; background: white; }
.list-heading { display: flex; gap: 10px; align-items: center; padding: 18px 24px; border-bottom: 1px solid #e4e9ed; }
.list-heading h2 { margin: 0; font-size: 14px; font-weight: 650; }
.list-heading > span { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: #edf2f5; }
.activation-row { display: flex; gap: 18px; align-items: center; padding: 24px; border-bottom: 1px solid #edf0f2; }
.activation-row:last-child { border-bottom: 0; }
.watch-image { width: 64px; height: 64px; border-radius: 12px; background: #f3f5f7; display: grid; place-items: center; flex-shrink: 0; overflow: hidden; color: #66727e; }
.watch-image img { width: 100%; height: 100%; object-fit: contain; }
.record-main { min-width: 0; flex: 1; }
h3 { font-size: 16px; font-weight: 650; margin: 0 0 7px; overflow-wrap: anywhere; }
.device { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #475569; margin: 0 0 9px; }
.record-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 12px; font-size: 12px; color: #66727e; }
.entitlement { color: #375b65; background: #edf5f4; padding: 3px 7px; border-radius: 5px; }
.remove-action { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; border: 1px solid #e5d5d5; background: white; border-radius: 8px; padding: 10px 13px; color: #a43c3c; cursor: pointer; font: inherit; font-size: 13px; }
.remove-action:hover:not(:disabled) { background: #fff6f5; border-color: #cd9696; }
.remove-action:disabled { opacity: .5; cursor: wait; }
.state-panel { padding: 48px 24px; text-align: center; color: #66727e; background: #fafbfc; border: 1px solid #e4e9ed; border-radius: 14px; }
.empty-state { display: grid; justify-items: center; gap: 14px; }
.empty-state h2 { color: #273746; font-size: 20px; margin: 0; }
.empty-state p { margin: 0; max-width: 520px; line-height: 1.7; font-size: 14px; }
.empty-state a, .page-footer a { color: #276280; }
.notice, .error-panel { border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
.notice { background: #edf6f1; color: #276147; }
.error-panel { display: flex; align-items: center; justify-content: space-between; gap: 15px; color: #a43c3c; background: #fff3f1; }
.error-panel button { background: white; border: 1px solid #e5d5d5; border-radius: 8px; padding: 10px 14px; cursor: pointer; flex-shrink: 0; }
.page-footer { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-top: 22px; font-size: 12px; color: #71808b; line-height: 1.7; }
.page-footer p { margin: 0; max-width: 680px; }
.page-footer a { flex-shrink: 0; text-decoration: none; }
button:focus-visible, a:focus-visible { outline: 3px solid #5fabc5; outline-offset: 3px; }
@media(max-width: 640px) {
  .activations-page { padding: 28px 16px 40px; }
  .page-header { align-items: stretch; flex-direction: column; gap: 20px; margin-bottom: 24px; }
  .policy { padding: 18px; gap: 16px; }
  .policy > div { align-items: flex-start; gap: 9px; }
  .policy strong { font-size: 26px; line-height: 1; }
  .policy span { font-size: 12px; }
  .activation-row { padding: 18px; gap: 14px; flex-wrap: wrap; }
  .watch-image { width: 52px; height: 52px; }
  .record-main { flex-basis: calc(100% - 66px); }
  .remove-action { margin-left: 66px; }
  .page-footer { flex-direction: column; gap: 12px; }
}
</style>
