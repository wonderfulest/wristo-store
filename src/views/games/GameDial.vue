<script setup lang="ts">
const props = defineProps<{ gameKey: string }>()
const labels: Record<string, [string, string]> = {
  'five-second-challenge': ['5.000', 'TRUST YOUR TIMING'], 'orbit-lock': ['ORBIT', 'LOCK'], 'echo-orbit': ['ECHO', 'REMEMBER THE LIGHT'],
  '2048': ['2048', 'MERGE & GROW'], 'pocket-fishing': ['FISHING', 'ONE MORE CAST'], 'box-trail': ['BOX TRAIL', 'FIND YOUR WAY'],
  'camp-days': ['CAMP', 'TEN NIGHTS'], 'daily-lights': ['LIGHTS', 'A DAILY SPARK'], 'mini-golf': ['GOLF', 'NINE SMALL GREENS'],
  'orbit-dodge': ['DODGE', 'STAY IN ORBIT'], 'pocket-dungeon': ['DUNGEON', 'GOLD & GLORY'], 'pocket-pet': ['POCKET PET', 'GROW TOGETHER'],
  'safe-cracker': ['SAFE', 'CRACK THE CODE'], 'stack-tower': ['STACK', 'ONE FLOOR HIGHER'], 'summit-steps': ['SUMMIT', 'TAKE THE NEXT STEP'],
}

</script>
<template>
  <div class="game-dial" aria-hidden="true">
    <svg viewBox="0 0 300 300">
      <circle cx="150" cy="150" r="139" fill="#091421" stroke="#334454" stroke-width="2" />
      <circle cx="150" cy="150" r="120" fill="none" stroke="#23394a" stroke-width="2" stroke-dasharray="2 10" />
      <g v-if="gameKey === 'echo-orbit'" fill="none" stroke-width="18">
        <path d="M95 61 A105 105 0 0 1 205 61" stroke="#61f9bc" /><path d="M239 95 A105 105 0 0 1 239 205" stroke="#70cfff" />
        <path d="M205 239 A105 105 0 0 1 95 239" stroke="#bc97ff" /><path d="M61 205 A105 105 0 0 1 61 95" stroke="#ffc773" />
      </g>
      <g v-else-if="gameKey === 'orbit-lock'">
        <circle cx="150" cy="150" r="102" fill="none" stroke="#244958" stroke-width="2" />
        <path d="M110 244 A102 102 0 0 0 205 236" fill="none" stroke="#61f9bc" stroke-width="11" stroke-linecap="round" />
        <circle cx="61" cy="100" r="9" fill="#edf5ff" /><circle cx="54" cy="120" r="5" fill="#77bdcb" /><circle cx="49" cy="136" r="3" fill="#446675" />
      </g>
      <g v-else-if="gameKey === '2048' || gameKey === 'daily-lights' || gameKey === 'box-trail'" fill="#61f9bc">
        <rect v-for="n in 9" :key="n" :x="96 + ((n-1)%3)*38" :y="49 + Math.floor((n-1)/3)*22" width="30" height="16" rx="4" :opacity="n%3 === 0 ? .25 : .7"/>
      </g>
      <g v-else-if="gameKey === 'stack-tower' || gameKey === 'summit-steps' || gameKey === 'camp-days'" fill="none" stroke="#61f9bc" stroke-width="5">
        <path d="M93 105 L150 48 L207 105 M119 80 L136 95 L150 81 L163 95 L181 80"/>
      </g>
      <g v-else-if="gameKey === 'pocket-fishing'" fill="#70cfff"><ellipse cx="146" cy="77" rx="34" ry="17"/><path d="M174 77 L200 57 L200 97 Z"/><circle cx="128" cy="73" r="3" fill="#091421"/></g>
      <g v-else-if="gameKey === 'pocket-pet'" fill="#bc97ff"><circle cx="150" cy="79" r="26"/><circle cx="128" cy="60" r="12"/><circle cx="172" cy="60" r="12"/><circle cx="141" cy="78" r="3" fill="#091421"/><circle cx="159" cy="78" r="3" fill="#091421"/></g>
      <g v-else-if="gameKey !== 'five-second-challenge'" fill="none" stroke="#ffc773" stroke-width="4"><circle cx="150" cy="78" r="25"/><path d="M150 42 V56 M150 100 V114 M114 78 H128 M172 78 H186"/></g>
      <text x="150" y="149" fill="#eff9f6" text-anchor="middle" font-family="monospace" :font-size="gameKey === 'five-second-challenge' ? 51 : 25">{{ labels[props.gameKey]?.[0] || 'PLAY' }}</text>
      <text x="150" y="180" fill="#61f9bc" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3">{{ labels[props.gameKey]?.[1] || 'WRISTO GAMES' }}</text>
    </svg>
  </div>
</template>
<style scoped>.game-dial{width:100%;max-width:350px;aspect-ratio:1;filter:drop-shadow(0 18px 25px #0003)}svg{width:100%;height:100%}</style>
