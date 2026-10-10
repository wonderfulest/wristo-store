<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { linkGame } from '@/api/games'
const route = useRoute(), user = useUserStore(), locale = useLocaleStore()
const zh = computed(() => locale.currentLocale.startsWith('zh'))
const copy = (en: string, cn: string) => zh.value ? cn : en
const path = (p: string) => route.params.lang ? `/${route.params.lang}${p}` : p
const code = ref(''), busy = ref(false), error = ref(''), linkedName = ref('')
const nickname = computed(() => user.userInfo?.nickname?.trim() || '')
async function submit() {
  if (!user.userInfo) { redirectToSsoLogin('store'); return }
  if (busy.value || !/^[0-9]{4}$/.test(code.value)) return
  busy.value = true; error.value = ''
  try { const result = await linkGame(code.value); linkedName.value = result.nickname; code.value = '' }
  catch (e: unknown) { error.value = e instanceof Error ? e.message : (e && typeof e === 'object' && 'msg' in e && typeof e.msg === 'string') ? e.msg : copy('Could not link. Check your code or request a new one on your watch.', '绑定失败，请检查绑定码或在手表上重新获取。') }
  finally { busy.value = false }
}
</script>
<template>
  <main class="link-game">
    <router-link class="back" :to="path('/games/pocket-dive')">← {{ copy('Pocket Dive', '口袋潜游') }}</router-link>
    <div class="link-layout">
      <header><span class="eyebrow">WRISTO / PLAYER PROFILE</span><h1>{{ copy('Put your name', '让你的名字') }}<br><em>{{ copy('on the board.', '登上排行榜。') }}</em></h1><p>{{ copy('Link your watch to your Wristo account. Keep your best scores and show your nickname to other players.', '将手表游戏绑定到 Wristo 账号，保留最好成绩，并向其他玩家展示你的昵称。') }}</p><ol><li>{{ copy('On your watch, open Rankings → Show my name.', '在手表上打开「排行榜 → 展示个人名字」。') }}</li><li>{{ copy('Enter the four-digit code below within 5 minutes.', '在 5 分钟内输入手表显示的四位绑定码。') }}</li><li>{{ copy('Return to Rankings and refresh to see your nickname.', '回到手表排行榜刷新，即可看到你的昵称。') }}</li></ol><p class="hint">{{ copy('Already linked? On your watch, open Show my name and choose Relink name. Your scores are kept. To relink, sign in to the Wristo account you want before entering the new code.', '已绑定？在手表「展示个人名字」中选择「重新绑定」，已有成绩会保留。重新绑定时，请先在网页登录目标 Wristo 账号，再输入新绑定码。') }}</p></header>
      <section class="link-panel">
        <template v-if="linkedName"><span class="eyebrow">{{ copy('CONNECTED', '绑定成功') }}</span><h2>{{ linkedName }}</h2><p role="status">{{ copy('Your scores now carry your nickname. Refresh Rankings on your watch.', '排行榜将展示你的昵称，请在手表上刷新排行榜。') }}</p><router-link class="primary" :to="path('/games/pocket-dive')">{{ copy('View rankings', '查看排行榜') }} ↗</router-link></template>
        <template v-else-if="!user.userInfo"><h2>{{ copy('Start with your account', '先登录你的账号') }}</h2><p>{{ copy('Sign in to your Wristo account before linking your watch. Your game will be linked to this account.', '必须先登录 Wristo 账号，才能将手表游戏关联到该账号。') }}</p><button class="primary" @click="redirectToSsoLogin('store')">{{ copy('Sign in to Wristo', '登录 Wristo') }}</button></template>
        <form v-else @submit.prevent="submit"><span class="eyebrow">{{ copy('YOUR PUBLIC NICKNAME', '公开展示的昵称') }}</span><h2>{{ nickname || copy('Set a nickname first', '请先设置昵称') }}</h2><router-link class="profile" :to="path('/user/profile')">{{ copy('Edit profile', '编辑个人资料') }} ↗</router-link><label for="game-code">{{ copy('Four-digit binding code', '四位数字绑定码') }}</label><input id="game-code" v-model="code" name="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="0000" required :disabled="busy" aria-describedby="code-help"><p id="code-help" class="hint">{{ copy('Codes expire after 5 minutes and work once. Never share your code.', '绑定码 5 分钟后过期，仅可使用一次，请勿向他人分享。') }}</p><p v-if="error" class="error" role="alert">{{ error }}</p><button class="primary" :disabled="busy || !nickname || !/^[0-9]{4}$/.test(code)">{{ busy ? copy('Linking…', '绑定中…') : copy('Link to my Wristo account', '绑定到我的 Wristo 账号') }}</button></form>
      </section>
    </div>
  </main>
</template>
<style scoped>
.link-game{max-width:1100px;margin:0 auto;padding:55px 28px 100px;color:#122a2b}.back,.profile{color:#386956;text-underline-offset:5px}.link-layout{display:grid;grid-template-columns:1.25fr 1fr;gap:72px;align-items:center;margin-top:65px}.eyebrow{font-size:11px;font-weight:700;letter-spacing:2px}h1{font-size:clamp(38px,5vw,64px);letter-spacing:-2px;line-height:1.1;margin:22px 0}h1 em{font-family:Georgia,serif;color:#38806d;font-weight:400}p,li{color:#637774;line-height:1.8}ol{padding-left:20px;margin-top:30px}li{padding:5px 0}h2{font-size:28px;margin:16px 0;overflow-wrap:anywhere}.link-panel{padding:38px;background:#eef3ee;border:1px solid #d5dfd9;border-radius:20px}.profile{font-size:13px}label{display:block;font-size:14px;margin:30px 0 12px}input{box-sizing:border-box;width:100%;font-size:40px;letter-spacing:16px;padding:16px 20px;border:1px solid #a6bbb0;border-radius:8px;color:#122a2b;background:white;font-variant-numeric:tabular-nums}.hint{font-size:12px}.primary{display:inline-block;border:0;border-radius:6px;padding:15px 23px;background:#122a2b;color:white;text-decoration:none;font:inherit;cursor:pointer;margin-top:16px}.primary:disabled{opacity:.5;cursor:not-allowed}.error{color:#a32828;font-size:14px}input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #38806d;outline-offset:4px}@media(max-width:750px){.link-layout{grid-template-columns:1fr;gap:28px;margin-top:35px}.link-game{padding:30px 20px 60px}.link-panel{padding:26px}}
</style>
