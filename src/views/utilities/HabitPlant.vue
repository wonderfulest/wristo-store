<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ days: number; efforts: number; chinese?: boolean }>()
const stages = [0, 1, 7, 14, 30]
const stage = computed(() => stages.filter(n => props.efforts >= n).length - 1)
const names = computed(() => props.chinese ? ['种子', '萌芽', '长叶', '花苞', '开花'] : ['Seed', 'Sprout', 'Leaves', 'Bud', 'Bloom'])
</script>
<template>
<section class="garden" :data-stage="stage" :aria-label="chinese ? '习惯成长' : 'Habit growth'">
 <div class="plant" aria-hidden="true">
  <div class="soil"></div><div v-if="stage === 0" class="seed"></div>
  <template v-else><div class="stem"></div><div class="leaf left"></div><div class="leaf right"></div><div v-if="stage >= 2" class="leaf lower"></div><div v-if="stage === 3" class="bud"></div><div v-if="stage === 4" class="flower"><i></i><i></i><i></i><i></i><b></b></div></template>
 </div>
 <div class="growth"><h3>{{ days }} <small>{{ chinese ? '天' : 'days' }}</small></h3><p>{{ efforts }} {{ chinese ? '次抵住诱惑' : 'temptations resisted' }}</p><span class="sr-only">{{ names[stage] }}</span></div>
</section>
</template>
<style scoped>
.garden{display:grid;grid-template-columns:150px 1fr;gap:12px 30px;padding:30px;background:#f3f5e9;border:1px solid #dce3cd;border-radius:14px;margin:24px 0;color:#294735}.plant{height:170px;position:relative}.soil{position:absolute;bottom:12px;left:20px;right:20px;height:10px;background:#94a782;border-radius:50%}.seed{position:absolute;width:22px;height:30px;background:#c29b66;bottom:23px;left:65px;border-radius:70% 30% 65% 35%;transform:rotate(30deg)}.stem{position:absolute;bottom:20px;height:110px;width:5px;background:#477957;left:73px;border-radius:8px}.leaf{position:absolute;width:43px;height:22px;background:#799b5f;border-radius:0 90% 0 90%;bottom:70px;left:33px;transform:rotate(20deg)}.right{left:76px;bottom:95px;transform:rotate(-35deg);border-radius:90% 0 90% 0}.lower{left:76px;bottom:45px;transform:rotate(-25deg);border-radius:90% 0 90% 0}.bud{position:absolute;top:16px;left:61px;width:28px;height:34px;background:#ce7b95;border-radius:65% 65% 35% 35%}.flower{position:absolute;left:75px;top:37px}.flower i{position:absolute;width:29px;height:32px;border-radius:60%;background:#d88ea8;left:-26px;top:-28px;transform:rotate(-25deg)}.flower i:nth-child(2){left:-3px;transform:rotate(25deg)}.flower i:nth-child(3){top:-4px;transform:rotate(25deg)}.flower i:nth-child(4){left:-3px;top:-4px;transform:rotate(-25deg)}.flower b{position:absolute;width:19px;height:19px;left:-10px;top:-10px;border-radius:50%;background:#eacc76}.growth{align-self:center;min-width:0}.growth h3{font-family:Georgia,serif;font-size:48px;line-height:1.2;margin:12px 0}.growth h3 small{font:14px sans-serif}.growth p{line-height:1.6}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}@media(max-width:520px){.garden{grid-template-columns:1fr;padding:22px}.plant{width:150px;justify-self:center}.growth{text-align:center}.growth h3{font-size:42px}}
</style>
