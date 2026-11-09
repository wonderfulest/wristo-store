<template>
  <div class="confirmation" v-if="started">
    <p aria-live="polite">{{ message }}</p>
    <label>{{ t('receipt.code') }}
      <input ref="input" v-model="code" :disabled="busy" inputmode="numeric" autocomplete="one-time-code" maxlength="6" />
    </label>
    <button type="button" :disabled="busy || remaining > 0" @click="send">
      {{ t('receipt.resend') }} {{ remaining ? '(' + remaining + 's)' : '' }}
    </button>
    <button v-if="canSkip" type="button" :disabled="busy" @click="skipAndContinue">
      {{ t('receipt.skip', { email }) }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import instance from '@/config/axios'
import { useI18n } from '@/i18n'

const props = defineProps<{ email: string }>()
const emit = defineEmits<{ continue: [] }>()
const { t } = useI18n()
const session = crypto.randomUUID()
const code = ref('')
const started = ref(false)
const busy = ref(false)
const remaining = ref(0)
const canSkip = ref(false)
const input = ref<HTMLInputElement>()
const message = ref('')
let confirmedUntil = 0
let status: 'skipped' | 'verified' | undefined
let timer: ReturnType<typeof setInterval> | undefined
let active = true

async function send() {
  if (busy.value || remaining.value) return
  started.value = busy.value = true
  try {
    const result = await instance.post<unknown, { delivered: boolean; canSkip: boolean }>(
      '/public/purchase/checkout/email/send', { email: props.email, session })
    if (!active) return
    status = undefined
    code.value = ''
    canSkip.value = result.canSkip
    message.value = t(result.delivered ? 'receipt.sent' : 'receipt.failed', { email: props.email })
    remaining.value = 60
    timer = setInterval(() => {
      if (--remaining.value <= 0) clearInterval(timer)
    }, 1000)
    busy.value = false
    await nextTick()
    input.value?.focus()
  } catch {
    message.value = t('receipt.retry')
  } finally {
    busy.value = false
  }
}

async function confirm(skip = false) {
  if (busy.value) return
  if (!started.value) { await send(); return }
  if (Date.now() >= confirmedUntil) status = undefined
  if (!status) {
    if (!skip && !/^\d{6}$/.test(code.value)) { input.value?.focus(); return }
    busy.value = true
    try {
      const result = await instance.post<unknown, string>('/public/purchase/checkout/email/confirm',
        { email: props.email, session, code: code.value, skip })
      if (!active || (result !== 'verified' && result !== 'skipped')) return
      status = result
      confirmedUntil = Date.now() + 29 * 60_000
    } catch {
      message.value = t('receipt.invalid')
      return
    } finally {
      busy.value = false
    }
  }
  return { session, status }
}

async function skipAndContinue() {
  if (await confirm(true)) emit('continue')
}

defineExpose({ confirm })
onBeforeUnmount(() => { active = false; clearInterval(timer) })
</script>
<style scoped>
.confirmation { display: grid; gap: .6rem; margin-block: .75rem; }
.confirmation p { margin: 0; overflow-wrap: anywhere; }
.confirmation label { display: grid; gap: .35rem; }
.confirmation input { padding: .6rem; font: inherit; }
.confirmation button { justify-self: start; text-align: start; }
</style>
