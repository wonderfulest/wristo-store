<template>
  <div v-if="isSubscribed" class="subscription-badge">
    <el-tooltip
      :content="tooltipText"
      placement="top"
      effect="light"
    >
      <div class="badge-content">
        <el-icon class="badge-icon"><StarFilled /></el-icon>
        <span class="badge-text">{{ badgeText }}</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { StarFilled } from '@element-plus/icons-vue';

defineProps({
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default', // 'default' | 'minimal'
    validator: (value: string) => ['default', 'minimal'].includes(value),
  },
  tooltipText: {
    type: String,
    default: '您是全站订阅用户，可畅享所有表盘',
  },
  badgeText: {
    type: String,
    default: '已订阅',
  },
});
</script>

<style scoped>
.subscription-badge {
  display: inline-block;
}

.badge-content {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border-radius: 12px;
  padding: 4px 10px 4px 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.badge-icon {
  margin-right: 4px;
  font-size: 14px;
}

.badge-text {
  display: inline-block;
  vertical-align: middle;
}

/* Minimal variant */
.subscription-badge.minimal .badge-content {
  padding: 2px 6px;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
}

/* Size variations */
.subscription-badge.small .badge-content {
  padding: 2px 8px;
  font-size: 11px;
}

.subscription-badge.large .badge-content {
  padding: 6px 12px;
  font-size: 14px;
}

/* Animation */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

.subscription-badge.pulse .badge-content {
  animation: pulse 2s infinite;
}
</style>
