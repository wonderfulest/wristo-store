<template>
  <div class="auth-callback">
    <p v-if="loading">Signing you in, please wait...</p>
    <p v-else-if="error">Sign-in failed: {{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSsoToken } from '@/api/sso'
import type { SsoTokenResponseData } from '@/api/sso'
import { useUserStore } from '@/store/user'
import { getSsoRedirectUri, redirectToSsoLogin } from '@/utils/ssoRedirect'

const loading = ref(true)
const error = ref('')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const clientId = 'store'
const redirectUri = getSsoRedirectUri()

onMounted(async () => {
  const code = route.query.code as string
  if (!code) {
    error.value = 'Missing authorization code parameter'
    loading.value = false
    return
  }
  try {
    const res: SsoTokenResponseData = await fetchSsoToken({
      code,
      clientId,
      redirectUri
    })
    userStore.token = res.accessToken
    // Fetch and save user information
    await userStore.getUserInfo()
    const returnPath = sessionStorage.getItem('wristo:sso:return-path') || '/'
    sessionStorage.removeItem('wristo:sso:return-path')
    router.replace(returnPath)
  } catch (e: any) {
    error.value = e?.response?.data?.msg || e.message || 'Request failed'
    redirectToSsoLogin('store')
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
