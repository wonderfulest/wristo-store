<template>
  <el-dialog
    v-model="visible"
    title="Select Your Device"
    width="min(880px, 95vw)"
    :before-close="handleClose"
    class="device-selector-dialog"
  >
    <div class="device-selector-content">
      <!-- Search Bar -->
      <div v-if="!loading" class="search-row">
        <el-input
          v-model="query"
          placeholder="Search device name"
          size="large"
          clearable
          :prefix-icon="Search"
          class="search-input xl"
        />
      </div>
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>Loading devices...</span>
      </div>
      
      <!-- Device List -->
      <div v-else-if="filteredDevices.length > 0" class="device-list">
        <div
          v-for="device in filteredDevices"
          :key="device.id"
          class="device-item"
          :class="{ selected: selectedDeviceId === device.id }"
          @click="selectDevice(device)"
        >
          <div class="device-avatar">
            <img v-if="device.imageUrl" :src="device.imageUrl" :alt="device.displayName" />
            <div v-else class="device-fallback">⌚️</div>
          </div>
          <div class="device-info">
            <div class="device-name">{{ device.displayName }}</div>
            <div v-if="device.deviceFamily" class="device-family">{{ device.deviceFamily }}</div>
          </div>
          <div class="device-check">
            <el-icon v-if="selectedDeviceId === device.id" class="check-icon"><Check /></el-icon>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <el-icon class="empty-icon"><Warning /></el-icon>
        <p>No devices available</p>
      </div>

      <!-- Auto Confirm Banner -->
      <div v-if="countdown !== null" class="auto-confirm-banner">
        <span>Auto-selecting in {{ countdown }}s…</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Check, Warning, Search } from '@element-plus/icons-vue'
import { getDeviceList, getDeviceDetail } from '@/api/device'
import type { GarminDeviceBaseVO, GarminDeviceVO } from '@/api/device'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'device-selected', device: GarminDeviceVO): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const loading = ref(false)
const confirmLoading = ref(false)
const deviceList = ref<GarminDeviceBaseVO[]>([])
const selectedDeviceId = ref<number | null>(null)
const query = ref('')
const countdown = ref<number | null>(null)
let countdownTimer: number | null = null

// Filtered list by fuzzy query
const filteredDevices = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return deviceList.value
  return deviceList.value.filter(d => {
    const name = (d.displayName || '').toLowerCase()
    const family = (d.deviceFamily || '').toLowerCase()
    // simple fuzzy: all query chars appear in order in name, or substring match on name/family
    const inOrder = (() => {
      let i = 0
      for (const ch of name) {
        if (ch === q[i]) i++
        if (i === q.length) return true
      }
      return false
    })()
    return name.includes(q) || family.includes(q) || inOrder
  })
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue) {
    loadDeviceList()
  }
})

// Watch for visible changes
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    // Reset state when dialog closes
    selectedDeviceId.value = null
    stopCountdown()
    countdown.value = null
  }
})

// Load device list
const loadDeviceList = async () => {
  loading.value = true
  try {
    const devices = await getDeviceList()
    deviceList.value = devices
  } catch (error) {
    console.error('Failed to load device list:', error)
    ElMessage.error('Failed to load devices')
  } finally {
    loading.value = false
  }
}

// Select device
const selectDevice = (device: GarminDeviceBaseVO) => {
  selectedDeviceId.value = device.id
  startCountdown()
}

// Confirm selection
const confirmSelection = async () => {
  if (!selectedDeviceId.value) return
  
  confirmLoading.value = true
  try {
    // Get device details
    const deviceDetail = await getDeviceDetail(selectedDeviceId.value)
    
    // Save to localStorage
    localStorage.setItem('selectedDevice', JSON.stringify(deviceDetail))
    
    // Emit selection event
    emit('device-selected', deviceDetail)
    
    // Close dialog
    handleClose()
    
    ElMessage.success('Device selected successfully')
    // Refresh current page to apply device-dependent changes
    setTimeout(() => {
      window.location.reload()
    }, 200)
  } catch (error) {
    console.error('Failed to get device details:', error)
    ElMessage.error('Failed to get device details')
  } finally {
    confirmLoading.value = false
  }
}

// Handle dialog close
const handleClose = () => {
  stopCountdown()
  countdown.value = null
  visible.value = false
}

function startCountdown() {
  stopCountdown()
  countdown.value = 3
  countdownTimer = window.setInterval(async () => {
    if (countdown.value === null) return
    if (countdown.value <= 1) {
      stopCountdown()
      await confirmSelection()
      return
    }
    countdown.value = (countdown.value || 0) - 1
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<style scoped>
.device-selector-dialog :deep(.el-dialog) {
  width: min(1000px, 95vw) !important;
  max-width: 100vw !important;
  box-sizing: border-box;
  margin: 4vh auto;
  overflow: hidden;
}

.device-selector-dialog :deep(.el-dialog__body) {
  padding: 0;
  overflow-x: hidden;
}

.device-selector-dialog :deep(.el-dialog__header) {
  padding: 12px 16px;
  margin-right: 0;
  border-bottom: 1px solid #f1f5f9;
}

.device-selector-dialog :deep(.el-dialog__headerbtn) {
  top: 12px;
  right: 12px;
}

.device-selector-content {
  min-height: 300px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}

.search-row {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* XL visual size for search input */
.search-input.xl :deep(.el-input__wrapper) {
  height: 48px;
  padding: 0 14px;
  border: 2px solid #e5e7eb;
}
.search-input.xl :deep(.el-input__inner) {
  font-size: 16px;
  line-height: 48px;
}
.search-input.xl :deep(.el-input__prefix-inner .el-icon) {
  border-radius: 12px;
  font-size: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #6b7280;
}

.loading-container .el-icon {
  font-size: 32px;
}

.device-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 16px 16px;
  overflow-y: auto;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
  min-width: 0;
}

.device-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.device-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.device-avatar {
  width: 44px;
  height: 44px;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
}

.device-avatar img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  padding: 4px;
  display: block;
  background: #fff;
}

.device-fallback {
  font-size: 20px;
  line-height: 1;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.device-name {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-family {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .device-selector-dialog :deep(.el-dialog) {
    margin: 8px;
    width: calc(100vw - 16px) !important;
    max-height: calc(100vh - 60px - env(safe-area-inset-bottom, 0px));
    border-radius: 12px;
  }

  .device-selector-content {
    max-height: calc(60vh - env(safe-area-inset-bottom, 0px));
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .device-list {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .device-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
