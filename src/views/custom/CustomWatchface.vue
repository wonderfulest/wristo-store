<template>
  <main class="custom-page">
    <div class="page-shell">
      <router-link class="back" :to="addLocaleToPath('/', localeStore.currentLocale)">← {{ t('custom.back') }}</router-link>
      <header class="intro"><span class="eyebrow">{{ t('custom.eyebrow') }}</span><h1>{{ t('custom.title') }}</h1><p>{{ t('custom.intro') }}</p></header>
      <p v-if="loading" role="status">{{ t('custom.loading') }}</p>
      <div v-else-if="loadError" class="notice" role="alert">{{ t('custom.loadError') }} <button @click="load">{{ t('custom.refresh') }}</button></div>
      <form v-else class="order-layout" @submit.prevent="submit">
        <div class="form-sections">
          <div v-if="!user.token" class="login-first"><p>{{ t('custom.signinFirst') }}</p><button type="button" class="primary" @click="signIn">{{ t('custom.signin') }}</button></div>
          <fieldset class="section"><legend>{{ t('custom.choose') }}</legend>
            <div class="plan-grid"><label v-for="plan in plans" :key="plan.code" class="plan" :class="{ selected: planCode === plan.code }">
              <span class="plan-top"><input v-model="planCode" type="radio" name="delivery" :value="plan.code" :disabled="busy" /><span>{{ t(`custom.${plan.code}`) }}</span></span>
              <strong>{{ money(plan.priceCents) }}<small>USD</small></strong>
              <p>{{ t(plan.code === 'PACKAGE' ? 'custom.packageDesc' : 'custom.storeDesc') }}</p>
            </label></div><p class="hint">{{ t('custom.tax') }}</p>
          </fieldset>
          <fieldset class="section" :disabled="busy || !user.token"><legend>{{ t('custom.brief') }}</legend>
            <div class="field-grid"><label>{{ t('custom.model') }} <span aria-hidden="true">*</span><input v-model="deviceModel" required maxlength="160" :placeholder="t('custom.modelHint')" /></label>
            <label>{{ t('custom.email') }} <span aria-hidden="true">*</span><input v-model="email" required type="email" autocomplete="email" maxlength="254" /></label></div>
            <label class="requirements">{{ t('custom.requirements') }} <span aria-hidden="true">*</span><textarea v-model="requirements" required maxlength="10000" rows="7" :placeholder="t('custom.requirementsHint')"></textarea></label>
          </fieldset>
          <fieldset class="section" :disabled="busy || !user.token"><legend>{{ t('custom.files') }}</legend>
            <label class="upload">{{ t('custom.assets') }}<span class="hint">{{ t('custom.assetsHint') }}</span><input ref="assetInput" required type="file" accept=".zip,application/zip" @change="selectFile($event, false)" /></label>
            <label class="upload optional">{{ t('custom.preview') }}<span class="hint">{{ t('custom.previewHint') }}</span><input ref="previewInput" type="file" accept=".png,.jpg,.jpeg,.webp" @change="selectFile($event, true)" /><img v-if="previewUrl" :src="previewUrl" :alt="t('custom.preview')" /></label>
            <p class="hint">{{ t('custom.rights') }}</p>
          </fieldset>
        </div>
        <aside class="summary"><span class="eyebrow">{{ t('custom.summary') }}</span><h2>{{ t(`custom.${planCode}`) }}</h2><p>{{ t(planCode === 'PACKAGE' ? 'custom.packageDesc' : 'custom.storeDesc') }}</p>
          <div class="price"><span>{{ t('custom.total') }}</span><strong>{{ money(selectedPlan?.priceCents || (planCode === 'PACKAGE' ? 990 : 1990)) }}</strong></div>
          <p class="hint">{{ t('custom.tax') }}</p><p class="summary-note">{{ t('custom.summaryHint') }}</p>
          <p v-if="!selectedPlan?.available" class="notice">{{ t('custom.unavailable') }}</p>
          <button v-if="!user.token" type="button" class="primary" @click="signIn">{{ t('custom.signin') }}</button>
          <button v-else class="primary" type="submit" :disabled="busy || !selectedPlan?.available">{{ t(busy ? 'custom.submitting' : 'custom.submit') }}</button>
          <p v-if="message" role="status" class="notice">{{ message }}</p>
        </aside>
      </form>
      <section v-if="user.token" class="my-orders" aria-labelledby="orders-title"><div class="orders-heading"><h2 id="orders-title">{{ t('custom.orders') }}</h2><button :disabled="refreshing" @click="loadOrders">{{ t('custom.refresh') }}</button></div>
        <p v-if="ordersError" role="alert">{{ t('custom.loadError') }}</p><p v-else-if="!orders.length" class="hint">{{ t('custom.empty') }}</p>
        <article v-for="order in orders" :key="order.id" class="saved-order"><div class="order-heading"><div><h3>{{ t(`custom.${order.planCode}`) }} <span>{{ money(order.priceCents) }}</span></h3><p>{{ order.deviceModel }} · {{ order.createdAt }}</p><code>{{ order.id }}</code></div><div class="badges"><span>{{ paymentLabel(order.paymentStatus) }}</span><span v-if="order.paymentStatus === 'PAID'">{{ t(`custom.${order.workStatus}`) }}</span></div></div>
          <details><summary>{{ t('custom.viewBrief') }}</summary><p class="brief-text">{{ order.requirements }}</p><p>{{ order.email }}</p><p>{{ order.assetName }}<template v-if="order.previewName"> · {{ order.previewName }}</template></p></details>
          <div class="order-actions"><button v-if="['UNPAID','CREATE_FAILED','PENDING'].includes(order.paymentStatus)" :disabled="!!payingId || !plans.find(p => p.code === order.planCode)?.available" @click="pay(order)">{{ t('custom.pay') }}</button><button :disabled="!!payingId || refreshing" @click="refreshOrder(order)">{{ t('custom.refresh') }}</button></div>
        </article>
      </section>
    </div>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from '@/i18n'
import { addLocaleToPath, useLocaleStore } from '@/store/locale'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { initializePaddle, getPaddleClientToken } from '@/utils/paddle'
import { getCustomPlans, getCustomOrders, createCustomOrder, checkoutCustomOrder, syncCustomOrder, type CustomPlan, type CustomOrder } from '@/api/custom-orders'
const { t } = useI18n()
const localeStore = useLocaleStore()
const user = useUserStore()
const plans = ref<CustomPlan[]>([]), orders = ref<CustomOrder[]>([])
const planCode = ref<'PACKAGE' | 'STORE'>('PACKAGE')
const selectedPlan = computed(() => plans.value.find(p => p.code === planCode.value))
const deviceModel = ref(''), email = ref(user.userInfo?.email || ''), requirements = ref('')
const assets = ref<File | null>(null), preview = ref<File | null>(null), previewUrl = ref('')
const assetInput = ref<HTMLInputElement>(), previewInput = ref<HTMLInputElement>()
const loading = ref(true), loadError = ref(false), ordersError = ref(false), busy = ref(false), refreshing = ref(false), payingId = ref(''), message = ref('')
let requestId = crypto.randomUUID()
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`
const paymentLabel = (status: string) => t(status === 'PENDING' ? 'custom.paymentPending' : `custom.${status}`)
const signIn = () => redirectToSsoLogin('store')
async function loadOrders() {
  if (!user.token) return
  refreshing.value = true; ordersError.value = false
  try { orders.value = await getCustomOrders() } catch { ordersError.value = true } finally { refreshing.value = false }
}
async function load() {
  loading.value = true; loadError.value = false
  try { plans.value = await getCustomPlans() } catch { loadError.value = true } finally { loading.value = false }
  await loadOrders()
}
function selectFile(event: Event, isPreview: boolean) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (isPreview && previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
  const valid = !file || (isPreview ? /\.(png|jpe?g|webp)$/i.test(file.name) && file.size <= 10 * 1024 * 1024 : /\.zip$/i.test(file.name) && file.size <= 100 * 1024 * 1024)
  if (!valid) { message.value = t(isPreview ? 'custom.badPreview' : 'custom.badAssets'); input.value = ''; if (isPreview) preview.value = null; else assets.value = null; return }
  message.value = ''
  if (isPreview) { preview.value = file; if (file) previewUrl.value = URL.createObjectURL(file) } else assets.value = file
}
async function submit() {
  if (busy.value) return
  if (!user.token) { signIn(); return }
  if (!assets.value || !deviceModel.value.trim() || !email.value.trim() || !requirements.value.trim()) { message.value = t('custom.missing'); return }
  busy.value = true; message.value = ''
  try {
    const form = new FormData()
    Object.entries({ requestId, planCode: planCode.value, email: email.value, deviceModel: deviceModel.value, requirements: requirements.value }).forEach(([key, value]) => form.append(key, value))
    form.append('assets', assets.value); if (preview.value) form.append('preview', preview.value)
    const order = await createCustomOrder(form)
    orders.value = [order, ...orders.value.filter(o => o.id !== order.id)]
    requestId = crypto.randomUUID(); requirements.value = ''; assets.value = null; preview.value = null
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''; if (assetInput.value) assetInput.value.value = ''; if (previewInput.value) previewInput.value.value = ''
    message.value = t('custom.saved'); await pay(order)
  } catch { message.value = t('custom.failed') } finally { busy.value = false }
}
let sdkPromise: Promise<void> | null = null
async function paddleReady() {
  if (!getPaddleClientToken()) throw new Error('Payment unavailable')
  if (!(window as any).Paddle) {
    if (!sdkPromise) sdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'; script.async = true
      script.onload = () => resolve(); script.onerror = () => { sdkPromise = null; script.remove(); reject(new Error('Payment unavailable')) }; document.head.appendChild(script)
    })
    await sdkPromise
  }
  initializePaddle((window as any).Paddle, async (event: any) => {
    if (event.name === 'checkout.completed') {
      message.value = t('custom.paymentNotice')
      const id = payingId.value
      if (id) { try { const synced = await syncCustomOrder(id); replaceOrder(synced) } catch { /* Keep the saved order available for manual refresh. */ } }
      payingId.value = ''
    }
    if (event.name === 'checkout.closed' || event.name === 'checkout.error') payingId.value = ''
  })
}
function replaceOrder(order: CustomOrder) { orders.value = orders.value.map(o => o.id === order.id ? order : o) }
async function pay(order: CustomOrder) {
  if (payingId.value) return
  payingId.value = order.id
  try {
    await paddleReady()
    const saved = await checkoutCustomOrder(order.id); replaceOrder(saved)
    if (!saved.transactionId) throw new Error('Payment preparing')
    ;(window as any).Paddle.Checkout.open({ transactionId: saved.transactionId, customer: { email: saved.email }, settings: { displayMode: 'overlay', showAddDiscounts: false } })
  } catch { payingId.value = ''; message.value = t('custom.failed') }
}
async function refreshOrder(order: CustomOrder) {
  refreshing.value = true
  try { replaceOrder(await syncCustomOrder(order.id)) } catch { message.value = t('custom.failed') } finally { refreshing.value = false }
}
onMounted(load)
onBeforeUnmount(() => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value) })
</script>
<style scoped>
.custom-page { background: #f7f8f5; color: #273c30; min-height: 100vh; padding: 36px 24px 80px; }
.page-shell { max-width: 1140px; margin: auto; }
.back { color: #667163; text-decoration: none; font-size: 13px; }
.intro { padding: 54px 0 44px; max-width: 780px; }.eyebrow { font-size: 11px; letter-spacing: .16em; font-weight: 700; }
h1 { font-size: clamp(34px, 5.2vw, 60px); line-height: 1.08; letter-spacing: -.045em; margin: 18px 0 20px; font-weight: 600; }
.intro p { font-size: 18px; line-height: 1.7; color: #697366; max-width: 620px; }
.login-first { padding: 20px; margin-bottom: 28px; border: 1px solid #dbe0d4; border-radius: 10px; background: #fff; font-size: 14px; }.login-first .primary { width: auto; padding-inline: 24px; }
.order-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 36px; align-items: start; }
.section { border: none; border-top: 1px solid #dbe0d4; padding: 24px 0 32px; margin: 0; min-width: 0; }
legend { padding-right: 16px; font-size: 13px; font-weight: 700; letter-spacing: .03em; }
.plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }.plan { padding: 22px; background: #fff; border: 1px solid #d8ded3; border-radius: 12px; cursor: pointer; }.plan.selected { background: #eeeedf; border-color: #58704e; box-shadow: inset 0 0 0 1px #58704e; }.plan-top { display: flex; gap: 9px; align-items: center; font-size: 14px; font-weight: 600; }.plan input { accent-color: #294735; }.plan strong { display: block; font-size: 36px; letter-spacing: -.05em; margin-top: 25px; font-weight: 600; }.plan small { font-size: 10px; letter-spacing: .04em; margin-left: 8px; color: #68745f; }.plan p { line-height: 1.65; font-size: 13px; color: #66715d; margin-bottom: 0; }
.hint { color: #727b6d; font-size: 12px; line-height: 1.7; font-weight: 400; }.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.field-grid label, .requirements { font-size: 13px; font-weight: 600; }.field-grid label span, .requirements>span { color: #7e6440; }
input:not([type=radio]):not([type=file]),textarea { width: 100%; box-sizing: border-box; padding: 13px 14px; margin-top: 10px; border: 1px solid #d5dccf; border-radius: 8px; background: #fff; color: #273c30; font: inherit; font-weight: 400; }textarea { resize: vertical; min-height: 140px; line-height: 1.7; }.requirements { display: block; margin-top: 22px; }
.upload { display: flex; flex-direction: column; gap: 12px; padding: 22px; border: 1px dashed #bac5b0; background: #fff; border-radius: 10px; font-size: 14px; font-weight: 600; }.optional { margin-top: 16px; background: transparent; }.upload input { max-width: 100%; font-size: 12px; color: #56624f; }.upload input::file-selector-button { padding: 9px 14px; margin-right: 12px; border: 1px solid #cad2c1; border-radius: 5px; background: #f1f3ed; color: #31442a; cursor: pointer; }.upload img { max-width: 200px; max-height: 180px; object-fit: contain; align-self: start; }
.summary { background: #eeeedf; border: 1px solid #dce0cf; border-radius: 14px; padding: 28px; position: sticky; top: 100px; }.summary h2 { margin: 20px 0 14px; font-size: 23px; letter-spacing: -.035em; }.summary>p { line-height: 1.7; font-size: 13px; }.price { border-top: 1px solid #d3d7c5; margin-top: 24px; padding-top: 22px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; }.price strong { font-size: 30px; letter-spacing: -.05em; }.summary-note { margin: 24px 0; color: #68725d; }
button { cursor: pointer; font: inherit; }button:disabled { opacity: .5; cursor: not-allowed; }.primary { width: 100%; padding: 15px 12px; color: white; background: #294735; border: 0; border-radius: 7px; font-size: 13px; font-weight: 600; }.primary:hover:not(:disabled) { background: #1c3526; }.notice { color: #775a2d; font-size: 13px; line-height: 1.7; }input:focus-visible,textarea:focus-visible,button:focus-visible,a:focus-visible,summary:focus-visible { outline: 2px solid #58704e; outline-offset: 3px; }
.my-orders { margin-top: 42px; padding-top: 28px; border-top: 1px solid #dbe0d4; }.orders-heading,.order-heading { display: flex; justify-content: space-between; gap: 20px; align-items: center; }.orders-heading h2 { font-size: 26px; font-weight: 600; letter-spacing: -.025em; }.saved-order { border: 1px solid #dbe0d4; border-radius: 12px; padding: 24px; margin-top: 16px; background: #fff; }.saved-order h3 { font-size: 17px; margin: 0; }.saved-order h3 span { margin-left: 12px; }.saved-order p { font-size: 13px; color: #6c7666; }.saved-order code { font-size: 10px; color: #8b9385; word-break: break-all; }.badges { display: flex; gap: 8px; flex-wrap: wrap; }.badges span { font-size: 11px; padding: 7px 10px; border-radius: 30px; background: #eef2e9; }.saved-order details { margin-top: 20px; font-size: 13px; }.saved-order summary { cursor: pointer; }.brief-text { white-space: pre-wrap; overflow-wrap: anywhere; }.order-actions { margin-top: 20px; display: flex; gap: 10px; }.order-actions button,.orders-heading button { border: 1px solid #d2dacb; border-radius: 6px; background: #fff; color: #294735; padding: 8px 14px; font-size: 12px; }
@media(max-width: 850px) { .order-layout { grid-template-columns: 1fr; gap: 8px; }.summary { position: static; }.intro { padding: 36px 0; } }
@media(max-width: 520px) { .custom-page { padding: 24px 18px 50px; }.plan-grid,.field-grid { grid-template-columns: 1fr; }.plan { padding: 20px; }.plan strong { margin-top: 14px; }.order-heading { align-items: start; flex-direction: column; }.intro p { font-size: 16px; } }
</style>
