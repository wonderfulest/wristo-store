<template>
  <div class="user-profile-page">
    <div class="profile-header">
      <div class="avatar-wrapper">
        <img :src="editMode ? form.avatar : (userInfo?.avatar || 'https://via.placeholder.com/96')" class="profile-avatar" alt="avatar" />
      </div>
      <div class="profile-info">
        <div class="profile-row">
          <span class="profile-label">Nickname</span>
          <span class="profile-value" v-if="!editMode">{{ userInfo?.nickname || userInfo?.username }}</span>
          <el-input v-else v-model="form.nickname" size="small" class="profile-input" />
        </div>
        <div class="profile-row">
          <span class="profile-label">Email</span>
          <span class="profile-value">{{ userInfo?.email }}</span>
        </div>
        <div class="profile-row">
          <span class="profile-label">Username</span>
          <span class="profile-value" v-if="!editMode">{{ userInfo?.username }}</span>
          <el-input v-else v-model="form.username" size="small" class="profile-input" />
        </div>
        <div class="profile-row" v-if="editMode">
          <span class="profile-label">Avatar URL</span>
          <el-input v-model="form.avatar" size="small" class="profile-input" />
        </div>
      </div>
    </div>
    <div class="profile-meta">
      <div class="meta-block">Register Time: {{ userInfo?.createdAt }}</div>
      <div class="meta-block">Last Login: {{ userInfo?.lastLoginTime }}</div>
    </div>
    <div class="profile-actions">
      <template v-if="editMode">
        <el-button size="small" type="primary" @click="handleSave">Save</el-button>
        <el-button size="small" @click="cancelEdit">Cancel</el-button>
      </template>
      <template v-else>
        <el-button class="edit-btn" @click="startEdit" type="primary" size="small">Edit</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const userInfo = userStore.userInfo
const editMode = ref(false)
const form = ref({
  username: userInfo?.username || '',
  nickname: userInfo?.nickname || '',
  avatar: userInfo?.avatar || ''
})
const startEdit = () => {
  form.value = {
    username: userInfo?.username || '',
    nickname: userInfo?.nickname || '',
    avatar: userInfo?.avatar || ''
  }
  editMode.value = true
}
const cancelEdit = () => {
  editMode.value = false
}
const handleSave = async () => {
  await userStore.updateUserInfo({
    username: form.value.username,
    nickname: form.value.nickname,
    avatar: form.value.avatar
  })
  editMode.value = false
}
watch(() => userInfo, (val) => {
  if (!editMode.value) {
    form.value = {
      username: val?.username || '',
      nickname: val?.nickname || '',
      avatar: val?.avatar || ''
    }
  }
})
</script>

<style scoped>
.user-profile-page {
  max-width: 420px;
  margin: 40px auto;
  background: linear-gradient(135deg, #f7faff 0%, #e3e6f3 100%);
  border-radius: 28px;
  box-shadow: 0 6px 32px 0 rgba(52,124,255,0.08), 0 1.5px 6px 0 rgba(0,0,0,0.04);
  padding: 36px 28px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 0;
}
.avatar-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 18px 0 rgba(52,124,255,0.13);
  border: 3px solid #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}
.profile-avatar:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 32px 0 rgba(52,124,255,0.18);
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.08rem;
}
.profile-label {
  color: #888;
  font-size: 0.98rem;
  min-width: 90px;
  font-weight: 500;
}
.profile-value {
  font-weight: 600;
  color: #222;
  font-size: 1.13rem;
}
.profile-input {
  flex: 1;
  min-width: 0;
}
.profile-meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 0;
}
.meta-block {
  background: #f3f6fa;
  color: #666;
  font-size: 0.97rem;
  border-radius: 12px;
  padding: 7px 16px;
  font-weight: 500;
  box-shadow: 0 1px 4px 0 rgba(52,124,255,0.04);
}
.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
@media (max-width: 600px) {
  .user-profile-page {
    max-width: 98vw;
    padding: 18px 4vw 18px 4vw;
  }
  .profile-header {
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
  }
  .profile-info {
    width: 100%;
  }
  .profile-meta {
    flex-direction: column;
    gap: 6px;
  }
  .meta-block {
    width: 100%;
    text-align: left;
  }
}
</style> 