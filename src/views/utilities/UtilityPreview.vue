<script setup lang="ts">
import { isLifeKey } from '@/api/lifeTools'
const lifePreview: Record<string, string[]> = { 'days-since': ['Less scrolling', '128 days', 'Resisted +1'], 'quick-log': ['QUICK LOG', '750 / 2000 ml', '+250 ml'], 'next-up': ['NEXT UP', 'Team meeting', 'In 23 minutes'], 'battery-diary': ['BATTERY DIARY', '82%', 'Samples & markers'], 'quiet-beat': ['QUIET BEAT', '60 BPM', '5 minutes'], 'park-pin': ['PARK PIN', 'B2 · C18', 'Saved parking spot'] }
import { useLocaleStore } from '@/store/locale'
const locale = useLocaleStore()
const copy = (en:string,zh:string) => locale.currentLocale.startsWith('zh') ? zh : en
defineProps<{ appKey:string; compact?:boolean }>()
</script>
<template>
<figure :class="{ compact }">
 <img v-if="appKey==='qr-pocket'||appKey==='quick-counter'" :src="`/images/utilities/${appKey}-venu3.png`" :alt="`${appKey==='qr-pocket'?'QR Pocket':'Quick Counter'} · ${copy('Venu 3 simulator','Venu 3 模拟器')}`" width="1272" height="1876">
 <div v-else class="watch" role="img" :aria-label="`${appKey} · ${copy('Illustrative watch preview','手表界面示意')}`"><template v-if="appKey==='last-time'"><small>LAST TIME</small><strong>Water plants</strong><span>2 hours ago</span><small>Record now</small></template><template v-else-if="appKey==='next-shot'"><small>NEXT SHOT</small><strong>60 yd</strong><span>Short · On · Long</span><small>WEDGE PRACTICE</small></template><template v-else-if="appKey==='days-since'"><small>Less scrolling</small><div class="preview-plant" aria-hidden="true"><i></i><b></b></div><strong>128 days</strong><small>Resisted +1</small></template><template v-else-if="isLifeKey(appKey)"><small>{{ lifePreview[appKey][0] }}</small><strong>{{ lifePreview[appKey][1] }}</strong><span>{{ lifePreview[appKey][2] }}</span></template><template v-else><small>READY TO GO</small><strong>Leave Home</strong><span>✓ Keys</span><span>○ Wallet</span></template></div>
 <figcaption>{{ appKey==='qr-pocket'||appKey==='quick-counter' ? copy('Venu 3 · Simulator preview','Venu 3 · 模拟器预览') : copy('Illustrative preview','界面示意') }}</figcaption>
</figure>
</template>
<style scoped>
.preview-plant{height:40px;width:3px;background:#94d9b0;position:relative}.preview-plant:before,.preview-plant:after{content:"";position:absolute;width:19px;height:10px;background:#94d9b0;border-radius:0 90% 0 90%;left:-17px;top:20px}.preview-plant:after{left:2px;top:12px;transform:scaleX(-1)}.preview-plant i{position:absolute;left:-8px;top:-9px;width:19px;height:20px;border-radius:65% 65% 40% 40%;background:#f1abca}.compact .preview-plant{height:24px}.compact .preview-plant:before{top:13px}.compact .preview-plant:after{top:7px}figure{margin:24px 0;display:flex;flex-direction:column;align-items:center;background:#f5f7f4;border-radius:8px;padding:24px}img{width:auto;height:340px;max-width:100%;object-fit:contain}.watch{box-sizing:border-box;width:260px;height:260px;border:14px solid #313735;box-shadow:0 0 0 3px #a6b0a9;border-radius:50%;background:#101713;color:#eff8ec;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}.watch small{font-size:12px;color:#9ccba4}.watch strong{font-size:22px}.watch span{font-size:20px}figcaption{font-size:12px;color:#637774;margin-top:18px}.compact img{height:190px}.compact .watch{width:190px;height:190px;border-width:10px;gap:9px}.compact .watch strong{font-size:17px}.compact .watch span{font-size:15px}.compact{margin:0 0 20px;padding:12px}.compact figcaption{font-size:10px}@media(max-width:600px){img{height:290px}}
</style>
