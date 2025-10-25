<template>
  <el-dialog
    v-model="visible"
    title="Select Your Device"
    width="600px"
    :before-close="handleClose"
    class="device-selector-dialog"
  >
    <div class="device-selector-content">
      <!-- Search Bar -->
      <div v-if="!loading" class="search-row">
        <el-input
          v-model="query"
          placeholder="Search device name"
          size="small"
          clearable
          :prefix-icon="Search"
          class="search-input"
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
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="confirmSelection"
          :disabled="!selectedDeviceId || confirmLoading"
          :loading="confirmLoading"
        >
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
  visible.value = false
}
</script>

<style scoped>
.device-selector-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.device-selector-content {
  min-height: 300px;
}

.search-row {
  margin-bottom: 10px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-height: 420px;
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
}

.device-name {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.2;
}

.device-family {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.device-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #3b82f6;
  font-size: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  .device-selector-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin: 5vh auto;
  }
  
  .device-list {
    grid-template-columns: 1fr;
  }
  
  .device-item {
    padding: 10px;
  }
  
  .device-avatar {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
  }
  
  .device-name {
    font-size: 0.9rem;
  }
  
  .device-family {
    font-size: 0.8rem;
  }
}

@media (max-width: 1024px) and (min-width: 641px) {
  .device-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
