<template>
  <el-dialog
    v-model="visible"
    class="studio-promo-dialog"
    title="WRISTO STUDIO"
    width="min(1040px, calc(100vw - 64px))"
    align-center
    append-to-body
    destroy-on-close
  >
    <StudioPromo />
    <template #footer>
      <el-checkbox v-model="neverShowAgain" @change="savePreference">
        {{ t('studioPromo.neverShowAgain') }}
      </el-checkbox>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import { isMobileStudioClient } from '@/utils/studio'
import StudioPromo from './StudioPromo.vue'

const { t } = useI18n()
const visible = ref(false)
const neverShowAgain = ref(false)
const sessionKey = 'wristo:studio-promo:shown'
const preferenceKey = 'wristo:studio-promo:disabled'
let desktopQuery: MediaQueryList | undefined

const savePreference = () => {
  try {
    if (neverShowAgain.value) localStorage.setItem(preferenceKey, '1')
    else localStorage.removeItem(preferenceKey)
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

const updateVisibility = () => {
  if (!desktopQuery?.matches || isMobileStudioClient()) {
    visible.value = false
    return
  }
  try {
    if (localStorage.getItem(preferenceKey) === '1' || sessionStorage.getItem(sessionKey) === '1') return
    sessionStorage.setItem(sessionKey, '1')
  } catch {
    // Skip automatic promotion if the browser cannot remember dismissal.
    return
  }
  visible.value = true
}

onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
  updateVisibility()
  desktopQuery.addEventListener('change', updateVisibility)
})
onBeforeUnmount(() => desktopQuery?.removeEventListener('change', updateVisibility))
</script>

<style>
.el-dialog.studio-promo-dialog { padding: 24px; border-radius: 24px; max-height: calc(100dvh - 48px); overflow-y: auto; background: #f5f6ef; }
.studio-promo-dialog .el-dialog__header { padding-bottom: 12px; }
.studio-promo-dialog .studio-promo { width: 100%; margin: 0; }
.studio-promo-dialog .el-dialog__footer { padding-top: 12px; text-align: left; }
</style>
