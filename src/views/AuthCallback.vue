<template>
  <div class="auth-callback">
    <p v-if="loading">正在登录，请稍候...</p>
    <p v-else-if="error">登录失败：{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSsoToken } from '@/api/sso'
import type { SsoTokenResponseData } from '@/api/sso'
import { useUserStore } from '@/store/user'

const loading = ref(true)
const error = ref('')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const clientId = 'dashboard'
const clientSecret = 'xxx'
const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI

onMounted(async () => {
  console.log('onMounted', userStore.userInfo)
  const code = route.query.code as string
  if (!code) {
    error.value = '未获取到 code 参数'
    loading.value = false
    return
  }
  try {
    const res: SsoTokenResponseData = await fetchSsoToken({
      code,
      clientId,
      clientSecret,
      redirectUri
    })
    console.log('111 res', res)
    userStore.token = res.accessToken
    console.log('222 userStore.token', userStore.token)
  
    // 获取用户信息并保存
    await userStore.getUserInfo()
    router.replace('/')
  } catch (e: any) {
    error.value = e?.response?.data?.msg || e.message || '请求失败'
    const ssoBaseUrl = import.meta.env.VITE_SSO_LOGIN_URL
    const redirectUri = import.meta.env.VITE_SSO_REDIRECT_URI
    window.location.href = `${ssoBaseUrl}?client=store&redirect_uri=${encodeURIComponent(redirectUri)}`
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-callback {
  padding: 40px;
  text-align: center;
}
</style> 