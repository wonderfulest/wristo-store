<template>
  <div class="profile-gradient-bg">
    <div class="profile-avatar-block">
      <img :src="editMode ? form.avatar : (userInfo?.avatar || 'https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png')"
           class="profile-avatar"
           :class="{ 'avatar-editing': editMode }"
           alt="avatar"
           @dblclick="onAvatarDblClick" />
      <input
        v-if="editMode"
        ref="avatarInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onAvatarFileChange"
      />
    </div>
    <div class="profile-nickname-row">
      <span class="profile-nickname">{{ userInfo?.username }}</span>
      <span class="profile-edit-btn" @click="startEdit">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M15.13 3.29a2.5 2.5 0 0 1 3.54 3.54l-9.6 9.6a1 1 0 0 1-.41.25l-3.5 1a1 1 0 0 1-1.24-1.24l1-3.5a1 1 0 0 1 .25-.41l9.6-9.6ZM16.54 7.12l-2.66-2.66" stroke="#a259c9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </div>
    <div class="profile-card">
      <div class="profile-title">USER PROFILE</div>
      <div class="profile-form">
        <div class="form-item">
          <span class="form-icon"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#f3e9fa"/><path d="M11 12.5c2.5 0 4.5 1 4.5 2.5v1H6.5v-1c0-1.5 2-2.5 4.5-2.5Z" stroke="#a259c9" stroke-width="1.2"/><circle cx="11" cy="9" r="2.5" stroke="#a259c9" stroke-width="1.2"/></svg></span>
          <div class="form-content">
            <label>User Name</label>
            <el-input v-model="form.username" placeholder="Enter User Name" class="form-input" v-if="editMode" />
            <span v-else>{{ userInfo?.username }}</span>
          </div>
        </div>
        <div class="form-item">
          <span class="form-icon"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#f3e9fa"/><path d="M8 10h6M8 13h4" stroke="#a259c9" stroke-width="1.2"/><rect x="7" y="7" width="8" height="8" rx="4" stroke="#a259c9" stroke-width="1.2"/></svg></span>
          <div class="form-content">
            <label>Nickname</label>
            <el-input v-model="form.nickname" placeholder="Enter your nickname" class="form-input" v-if="editMode" />
            <span v-else>{{ userInfo?.nickname }}</span>
          </div>
        </div>
        <div class="form-item">
          <span class="form-icon"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#f3e9fa"/><path d="M6.5 9.5l4.5 3 4.5-3" stroke="#a259c9" stroke-width="1.2"/></svg></span>
          <div class="form-content">
            <label>Email</label>
            <el-input v-model="form.email" placeholder="Enter Email" class="form-input" v-if="editMode" />
            <span v-else>{{ userInfo?.email }}</span>
          </div>
        </div>
        
      </div>
      <el-button v-if="editMode" class="save-btn" type="primary" @click="handleSave">SAVE</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { uploadUserAvatar } from '@/api/files'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const userInfo = userStore.userInfo
const editMode = ref(false)
const form = ref({
  username: userInfo?.username || '',
  nickname: userInfo?.nickname || '',
  avatar: userInfo?.avatar || '',
  email: userInfo?.email || '',
  phone: userInfo?.phone || '',
})
const avatarInputRef = ref<HTMLInputElement | null>(null)
const onAvatarDblClick = () => {
  if (editMode.value && avatarInputRef.value) {
    avatarInputRef.value.value = '' // 清空之前的选择
    avatarInputRef.value.click()
  }
}
const onAvatarFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  if (!beforeAvatarUpload(file)) return
  // 复用原有上传逻辑
  await handleAvatarUpload({ file })
}
const startEdit = () => {
  form.value = {
    username: userInfo?.username || '',
    nickname: userInfo?.nickname || '',
    avatar: userInfo?.avatar || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
  }
  editMode.value = true
}
const handleSave = async () => {
  await userStore.updateUserInfo({
    username: form.value.username,
    nickname: form.value.nickname,
    avatar: form.value.avatar,
  })
  editMode.value = false
}
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Please upload an image file!')
  }
  return isImage
}
const handleAvatarUpload = async (option: any) => {
  try {
    const res = await uploadUserAvatar(option.file)
    if (res.code === 0 && res.data) {
      form.value.avatar = res.data as string
      ElMessage.success('Avatar uploaded!')
    } else {
      ElMessage.error(res.msg || 'Upload failed')
    }
  } catch (e) {
    ElMessage.error('Upload failed')
  }
}
watch(() => userInfo, (val) => {
  if (!editMode.value) {
    form.value = {
      username: val?.username || '',
      nickname: val?.nickname || '',
      avatar: val?.avatar || '',
      email: val?.email || '',
      phone: val?.phone || '',
    }
  }
})
</script>

<style scoped>
.profile-gradient-bg {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
}
.profile-avatar-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 4px 18px 0 rgba(52,124,255,0.13);
  background: #e9e9e9;
}
.avatar-editing {
  animation: avatar-blink 1s steps(1, start) infinite;
  cursor: pointer;
}
@keyframes avatar-blink {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}
.avatar-edit-tip {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%) translateY(12px);
  background: #fffbe6;
  color: #a259c9;
  font-size: 1.18rem;
  font-weight: 900;
  padding: 8px 22px;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(162,89,201,0.13);
  border: 2px solid #a259c9;
  z-index: 2;
  text-align: center;
  animation: tip-fade 1.5s infinite alternate;
  letter-spacing: 0.04em;
}
@keyframes tip-fade {
  from { opacity: 1; }
  to { opacity: 0.5; }
}
.profile-nickname-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
}
.profile-nickname {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.profile-edit-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #f3e9fa;
  transition: background 0.18s, box-shadow 0.18s;
}
.profile-edit-btn:hover {
  background: #f3e9fa;
  box-shadow: 0 2px 8px 0 rgba(162,89,201,0.10);
}
.profile-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(52,124,255,0.08), 0 1.5px 6px 0 rgba(0,0,0,0.04);
  margin-top: 0;
  padding: 32px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
  text-align: center;
}
.profile-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8f8fa;
  border-radius: 24px;
  padding: 10px 16px;
}
.form-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3e9fa;
  border-radius: 50%;
}
.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.form-content label {
  font-size: 0.98rem;
  color: #a259c9;
  font-weight: 600;
  margin-bottom: 2px;
}
.form-input {
  border-radius: 18px;
  border: 1.5px solid #eee;
  font-size: 1.08rem;
  padding: 8px 14px;
}
.sex-item .form-content {
  flex-direction: row;
  align-items: center;
  gap: 18px;
}
.sex-radio-group {
  margin-left: 8px;
}
.save-btn {
  width: 100%;
  margin-top: 28px;
  border-radius: 24px;
  font-size: 1.13rem;
  font-weight: 700;
  padding: 14px 0;
  background: linear-gradient(90deg, #a259c9 0%, #6a82fb 100%);
  border: none;
  letter-spacing: 0.04em;
}
.save-btn:focus,
.save-btn:hover {
  background: linear-gradient(90deg, #6a82fb 0%, #a259c9 100%);
}
@media (max-width: 600px) {
  .profile-card {
    max-width: 98vw;
    padding: 18px 4vw 18px 4vw;
  }
  .profile-avatar {
    width: 90px;
    height: 90px;
  }
}
</style> 