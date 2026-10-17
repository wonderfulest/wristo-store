<script setup lang="ts">
import { useLocaleStore } from '@/store/locale'
const locale = useLocaleStore()
const copy = (en:string,zh:string) => locale.currentLocale.startsWith('zh') ? zh : en
defineProps<{ appKey:string; compact?:boolean }>()
</script>
<template>
<figure :class="{ compact }">
 <img v-if="appKey==='qr-pocket'||appKey==='quick-counter'" :src="`/images/utilities/${appKey}-venu3.png`" :alt="`${appKey==='qr-pocket'?'QR Pocket':'Quick Counter'} · ${copy('Venu 3 simulator','Venu 3 模拟器')}`" width="1272" height="1876">
 <div v-else class="watch" role="img" :aria-label="`${appKey} · ${copy('Illustrative watch preview','手表界面示意')}`"><template v-if="appKey==='last-time'"><small>LAST TIME</small><strong>Water plants</strong><span>2 hours ago</span><small>Record now</small></template><template v-else-if="appKey==='next-shot'"><small>NEXT SHOT</small><strong>60 yd</strong><span>Short · On · Long</span><small>WEDGE PRACTICE</small></template><template v-else><small>READY TO GO</small><strong>Leave Home</strong><span>✓ Keys</span><span>○ Wallet</span></template></div>
 <figcaption>{{ appKey==='qr-pocket'||appKey==='quick-counter' ? copy('Venu 3 · Simulator preview','Venu 3 · 模拟器预览') : copy('Illustrative preview','界面示意') }}</figcaption>
</figure>
</template>
<style scoped>
figure{margin:24px 0;display:flex;flex-direction:column;align-items:center;background:#f5f7f4;border-radius:8px;padding:24px}img{width:auto;height:340px;max-width:100%;object-fit:contain}.watch{box-sizing:border-box;width:260px;height:260px;border:14px solid #313735;box-shadow:0 0 0 3px #a6b0a9;border-radius:50%;background:#101713;color:#eff8ec;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}.watch small{font-size:12px;color:#9ccba4}.watch strong{font-size:22px}.watch span{font-size:20px}figcaption{font-size:12px;color:#637774;margin-top:18px}.compact img{height:190px}.compact .watch{width:190px;height:190px;border-width:10px;gap:9px}.compact .watch strong{font-size:17px}.compact .watch span{font-size:15px}.compact{margin:0 0 20px;padding:12px}.compact figcaption{font-size:10px}@media(max-width:600px){img{height:290px}}
</style>
