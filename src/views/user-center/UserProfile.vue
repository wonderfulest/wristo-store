<template>
  <div class="profile-gradient-bg">

    <!-- Avatar -->
    <div class="profile-avatar-block">
      <img
        :src="editMode ? form.avatar : (userInfo?.avatar || defaultAvatar)"
        class="profile-avatar"
        :class="{ 'avatar-editing': editMode }"
        @dblclick="onAvatarDblClick"
      />

      <input
        v-if="editMode"
        ref="avatarInputRef"
        type="file"
        accept="image/*"
        hidden
        @change="onAvatarFileChange"
      />
    </div>

    <!-- Nickname -->
    <div class="profile-nickname-row">
      <span class="profile-nickname">
        {{ userInfo?.username }}
      </span>

      <span class="profile-edit-btn" @click="startEdit">
        <Icon icon="mdi:pencil-circle" width="22" />
      </span>
    </div>

    <!-- Card -->
    <div class="profile-card">

      <div class="profile-form">

        <!-- Email -->
        <div class="form-item">
          <span class="form-icon">
            <Icon icon="mdi:email-outline" width="24" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <div class="form-label-with-help">
                <label>Email</label>
              </div>

              <span class="value-text">
                {{ userInfo?.email }}
              </span>
            </div>

            <div class="form-action">
              <a class="action-link" @click="goChangeEmail">
                <Icon icon="mdi:email-edit-outline" width="16" />
              </a>
            </div>
          </div>
        </div>

        <!-- Username -->
        <div class="form-item">
          <span class="form-icon">
            <Icon icon="mdi:account-circle" width="24" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <label>Username</label>

              <span v-if="!editMode" class="value-text">
                {{ userInfo?.username }}
              </span>

              <el-input
                v-else
                v-model="form.username"
                class="form-input"
              />
            </div>

            <div class="form-action"></div>
          </div>
        </div>

        <!-- Nickname -->
        <div class="form-item">
          <span class="form-icon">
            <Icon icon="mdi:badge-account-outline" width="24" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <label>Nickname</label>

              <span v-if="!editMode" class="value-text">
                {{ userInfo?.nickname }}
              </span>

              <el-input
                v-else
                v-model="form.nickname"
                class="form-input"
              />
            </div>

            <div class="form-action"></div>
          </div>
        </div>

        <!-- Password -->
        <div class="form-item">
          <span class="form-icon">
            <Icon icon="mdi:lock-outline" width="24" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <label>Password</label>

              <span
                class="status-tag"
                :class="userInfo?.hasPassword ? 'ok' : 'muted'"
              >
                {{ userInfo?.hasPassword ? 'Set' : 'Not set' }}
              </span>
            </div>

            <div class="form-action">
              <a class="action-link" @click="goSetPassword">
                <Icon
                  :icon="userInfo?.hasPassword ? 'mdi:key-change' : 'mdi:key-plus'"
                  width="16"
                />
              </a>
            </div>
          </div>
        </div>

        <!-- Google -->
        <div class="form-item">
          <span class="form-icon google">
            <Icon icon="logos:google-icon" width="20" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <label>Google</label>

              <span
                class="status-tag"
                :class="userInfo?.googleBound ? 'ok' : 'muted'"
              >
                {{ userInfo?.googleBound ? 'Connected' : 'Not connected' }}
              </span>
            </div>

            <div class="form-action">
              <a
                class="action-link"
                :class="userInfo?.googleBound ? 'danger' : 'primary'"
                @click="userInfo?.googleBound
                  ? handleUnbindGoogle()
                  : handleBindGoogle()"
              >
                <Icon
                  :icon="userInfo?.googleBound
                    ? 'mdi:link-variant-off'
                    : 'mdi:link-variant-plus'"
                  width="16"
                />
              </a>
            </div>
          </div>
        </div>

        <!-- Device -->
        <div class="form-item device-row">
          <span class="form-icon">
            <Icon icon="mdi:watch-variant" width="24" />
          </span>

          <div class="form-content">
            <div class="form-main">
              <label>Device</label>
              <DeviceDisplay
                :selected-device="userInfo?.device || null"
                :name-max-width="200"
              />
            </div>
            <div class="form-action"></div>
          </div>
        </div>
      </div>

      <!-- Save -->
      <el-button
        v-if="editMode"
        class="save-btn"
        type="primary"
        @click="handleSave"
      >
        Save Changes
      </el-button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { uploadUserAvatar } from '@/api/files'
import { bindGoogle as bindGoogleApi, unbindGoogle as unbindGoogleApi } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import DeviceDisplay from '@/components/DeviceDisplay.vue'

const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL?.replace(/\/login\/?$/, '').replace(/\/auth\/?$/, '') || ''

// Default avatar image shown when userInfo.avatar is empty
const defaultAvatar = '/logo.svg'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const editMode = ref(false)
const form = ref({
  username: userInfo.value?.username || '',
  nickname: userInfo.value?.nickname || '',
  avatar: userInfo.value?.avatar || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
})
onMounted(() => {
  // 页面刷新时，通过 /users/info 接口重新获取用户信息
  userStore.getUserInfo()
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
    username: userInfo.value?.username || '',
    nickname: userInfo.value?.nickname || '',
    avatar: userInfo.value?.avatar || '',
    email: userInfo.value?.email || '',
    phone: userInfo.value?.phone || '',
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
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
let googleScriptLoaded = false

const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded || (window as any).google?.accounts) {
      googleScriptLoaded = true
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      googleScriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })
}

const handleBindGoogle = async () => {
  try {
    await loadGoogleScript()
    const google = (window as any).google
    if (!google?.accounts?.id) {
      ElMessage.error('Google Sign-In is not available')
      return
    }
    console.log('googleClientId', googleClientId)
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: any) => {
        if (response.credential) {
          try {
            await bindGoogleApi(response.credential)
            ElMessage.success('Google account connected!')
            await userStore.getUserInfo()
          } catch (e: any) {
            ElMessage.error(e.msg || 'Failed to connect Google account')
          }
        }
      }
    })
    google.accounts.id.prompt()
  } catch (e) {
    ElMessage.error('Failed to initialize Google Sign-In')
  }
}

const handleUnbindGoogle = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to disconnect your Google account?',
      'Disconnect Google',
      { confirmButtonText: 'Disconnect', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await unbindGoogleApi()
    ElMessage.success('Google account disconnected!')
    await userStore.getUserInfo()
  } catch (e: any) {
    if (e === 'cancel' || e?.toString?.().includes('cancel')) return
    ElMessage.error(e.msg || 'Failed to disconnect Google account')
  }
}

const goSetPassword = () => {
  const token = userStore.token
  const email = userInfo.value?.email || ''
  const redirectUri = window.location.href
  const mode = userInfo.value?.hasPassword ? 'change' : 'set'
  const url = `${ssoBaseUrl}/set-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&redirect_uri=${encodeURIComponent(redirectUri)}&mode=${mode}`
  window.location.href = url
}

const goChangeEmail = () => {
  const token = userStore.token
  const email = userInfo.value?.email || ''
  const redirectUri = window.location.href
  const url = `${ssoBaseUrl}/change-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&redirect_uri=${encodeURIComponent(redirectUri)}`
  window.location.href = url
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
    form.value.avatar = res as string
  } catch (e) {
    ElMessage.error('Upload failed')
  }
}
watch(() => userStore.userInfo, (val) => {
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
  background: #fafafa;
}

.profile-avatar-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f3f4f6;
  box-shadow: none;
  background: #f9fafb;
}

.avatar-editing {
  cursor: pointer;
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  animation: none;
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
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #111827;
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
  max-width: 420px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #f0f2f5;
  box-shadow:
    0 1px 2px rgba(0,0,0,0.03),
    0 4px 12px rgba(0,0,0,0.04);
  margin-top: 0;
  padding: 20px 20px 24px;
  display: flex;
  flex-direction: column;
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
}
/* ========== Form Layout ========== */

/* 主体内容区域：图标 + 内容 + 操作 */
.form-item {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 6px 4px;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.form-item:hover {
  background: #fafafa;
}

.form-item:hover .form-icon {
  color: #6366f1;
}

.form-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.form-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.device-row .form-main {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.form-main label {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  line-height: 1;
}

.value-text {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 40px;
  min-width: 40px;
}


/* ========== Status ========== */

.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-tag.ok {
  background: #ecfdf5;
  color: #059669;
}

.status-tag.muted {
  background: #f9fafb;
  color: #6b7280;
}


/* ========== Action ========== */

.action-link {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;

  cursor: pointer;
  transition: all .18s;
}

.action-link:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
}

.action-link.primary {
  color: #4285f4;
}

.action-link.primary:hover {
  background: #eff6ff;
}

.action-link.danger {
  color: #ea4335;
}

.action-link.danger:hover {
  background: #fef2f2;
}


/* ========== Icon ========== */

.form-icon {
  width: 44px;
  min-width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  background: #f9fafb;

  color: #6b7280;
}

.form-icon.google {
  background: linear-gradient(135deg,#f3e9fa,#e8f0fe);
  border-radius: 8px;
}

.email-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  grid-column: 1 / span 2;
}

.email-content {
  flex: 1;
  display: flex;
  justify-content: center;
}

.email-content span {
  display: block;
  width: 100%;
  text-align: center;
}

.change-email-link {
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #a259c9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.change-email-link:hover {
  color: #6a82fb;
  border-color: #c4d0ff;
  box-shadow: 0 2px 8px rgba(106,130,251,0.18);
}

.form-input {
  border: none !important;
  background: #f9fafb;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.9rem;
}

.form-input:focus-within {
  box-shadow: inset 0 0 0 1px #6366f1;
}

.form-input :deep(.el-input__inner) {
  font-size: 0.9rem;
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
  margin-top: 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 0;
  background: #111827;
  border: none;
  letter-spacing: 0.02em;
}

.save-btn:focus,
.save-btn:hover {
  background: #1f2937;
}

/* Device Display Styles */
.device-item {
  position: relative;
}

.device-icon {
  background: linear-gradient(135deg, #f3e9fa, #e8f4fd);
}

.device-display {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
}

.device-avatar {
  width: 48px;
  height: 48px;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
}

.device-avatar img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  padding: 3px;
  display: block;
  background: #fff;
}

.device-fallback {
  font-size: 16px;
  line-height: 1;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.device-name {
  font-size: 0.95rem;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.1;
}

.device-family {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.1;
}

.no-device {
  opacity: 0.7;
}

.no-device-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-device-text span {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

/* Password Styles */
.password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.password-status-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.password-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.password-status.set,
.password-status.not-set {
  width: 100%;
  text-align: center;
}

.password-status.set {
  background: #ecfdf5;
  color: #059669;
}

.password-status.not-set {
  background: #f9fafb;
  color: #6b7280;
}

.password-action-link {
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #a259c9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.password-action-link:hover {
  color: #6a82fb;
  border-color: #c4d0ff;
  box-shadow: 0 2px 8px rgba(106,130,251,0.18);
}

/* Google Account Styles */
.google-icon {
  background: linear-gradient(135deg, #f3e9fa, #e8f0fe);
}
.google-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}
.google-status-container {
  flex: 1;
  display: flex;
  justify-content: center;
}
.google-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.google-status.bound {
  background: #ecfdf5;
  color: #059669;
}
.google-status.unbound {
  background: #f9fafb;
  color: #6b7280;
}
.google-action-link {
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.google-action-link.bind {
  color: #4285F4;
}
.google-action-link.bind:hover {
  color: #1a73e8;
  border-color: #b5d0ff;
  box-shadow: 0 2px 8px rgba(66,133,244,0.18);
}
.google-action-link.unbind {
  color: #EA4335;
}
.google-action-link.unbind:hover {
  color: #c5221f;
  border-color: #f5b2aa;
  box-shadow: 0 2px 8px rgba(234,67,53,0.18);
}

.no-device-text small {
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.3;
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
  .profile-nickname {
    font-size: 2.2rem;
    color: #111827;
  }
  .form-main label {
    font-size: 14px;
  }
  .value-text {
    font-size: 16px;
  }
  
  .device-display {
    gap: 6px;
  }
  
  .device-avatar {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
  }
  
  .device-name {
    font-size: 0.9rem;
  }
  
  .device-family {
    font-size: 0.75rem;
  }
}
</style> 