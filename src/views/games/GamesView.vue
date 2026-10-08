<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocaleStore } from '@/store/locale'
import { getGames, getGame, getGameBoard, type Game, type GameBoard } from '@/api/games'
import GameDial from './GameDial.vue'
const route = useRoute()
const locale = useLocaleStore()
const zh = computed(() => locale.currentLocale.startsWith('zh'))
const copy = (en: string, cn: string) => zh.value ? cn : en
const path = (p: string) => route.params.lang ? `/${route.params.lang}${p}` : p
const games = ref<Game[]>([]), game = ref<Game | null>(null), board = ref<GameBoard | null>(null)
const mode = ref(''), loading = ref(false), boardLoading = ref(false), error = ref(''), boardError = ref('')
let generation = 0, boardGeneration = 0
const title = (g: Game) => zh.value ? g.nameZh : g.name
const summary = (g: Game) => zh.value ? (g.summaryZh ?? g.descriptionZh.slice(0, 300)) : (g.summary ?? g.description.slice(0, 300))
const description = (g: Game) => zh.value ? g.descriptionZh : g.description
const modeLabel = (m: string) => m === 'touch' ? copy('Touch', '触屏') : m === 'buttons' ? copy('Buttons', '按键') : m.startsWith('daily') ? `${m.slice(5,9)}-${m.slice(9,11)}-${m.slice(11,13)}` : copy('Classic', '经典')
function score(value: number) {
  const metric = board.value?.metric
  if (metric === 'lengthMm') return `${(value / 10).toFixed(1)} cm`
  const units: Record<string, string> = { errorMs: 'ms', steps: copy('steps', '轮'), hits: copy('hits', '次'), nights: copy('nights', '晚'), dodges: copy('dodges', '次'), gold: copy('gold', '金币'), stars: copy('stars', '星'), floors: copy('floors', '层'), altitude: copy('steps', '步') }
  return `${value.toLocaleString()} ${units[metric || ''] || copy('pts', '分')}`
}
async function loadBoard(refresh = false) {
  if (!game.value || !mode.value) return
  const id = ++boardGeneration, key = game.value.key, selected = mode.value
  boardLoading.value = true; boardError.value = ''
  try { const data = await getGameBoard(key, selected, refresh); if (id === boardGeneration) board.value = data }
  catch { if (id === boardGeneration) boardError.value = copy('Could not load rankings. Please retry.', '排行榜加载失败，请重试。') }
  finally { if (id === boardGeneration) boardLoading.value = false }
}
async function loadPage() {
  const raw = route.params.gameKey
  const id = ++generation; ++boardGeneration; loading.value = true; error.value = ''; board.value = null; game.value = null; mode.value = ''
  try {
    if (typeof raw === 'string') { const data = await getGame(raw); if (id !== generation) return; game.value = data; mode.value = data.modes[0] || 'classic'; await loadBoard() }
    else { const data = await getGames(); if (id === generation) games.value = data.filter(g => Boolean(g.downloadUrl?.trim())) }
  } catch { if (id === generation) error.value = copy('This game is unavailable, or we could not connect. Please try again.', '游戏暂不可用或连接失败，请重试。') }
  finally { if (id === generation) loading.value = false }
}
watch(() => route.params.gameKey, loadPage, { immediate: true })
function changeMode() { board.value = null; void loadBoard() }
</script>
<template>
  <main class="arcade">
    <div v-if="loading" class="notice" role="status">{{ copy('Loading the arcade…', '正在加载游戏…') }}</div>
    <div v-else-if="error" class="notice" role="alert"><p>{{ error }}</p><button @click="loadPage">{{ copy('Retry', '重试') }}</button> <router-link :to="path('/games')">{{ copy('All games', '全部游戏') }}</router-link></div>
    <template v-else-if="!game">
      <header class="intro"><span class="eyebrow">WRISTO / POCKET ARCADE</span><h1>{{ copy('Small screen.', '方寸屏幕，') }}<br><em>{{ copy('Big challenge.', '尽情挑战。') }}</em></h1><p>{{ copy('A moment to play. A score to beat. Discover games made for your Garmin watch.', '为佳明手表打造的小游戏。随时玩一局，留下你的最好成绩。') }}</p></header>
      <div v-if="!games.length" class="notice">{{ copy('New games are on their way.', '新游戏正在准备中。') }}</div>
      <div v-if="games.length" class="collection-heading"><h2>{{ copy('Pick your next challenge', '挑一款，开始挑战') }}</h2><span>{{ games.length }} {{ copy('games to discover', '款腕上小游戏') }}</span></div>
      <section class="games-grid" :aria-label="copy('Games', '游戏')">
        <router-link v-for="(g, i) in games" :key="g.key" class="game-card" :to="path(`/games/${g.key}`)">
          <div class="card-art" :class="{ 'has-banner': g.coverUrl?.trim() }"><span class="number">{{ String(i + 1).padStart(2, '0') }}</span><img v-if="g.coverUrl?.trim()" :src="g.coverUrl" :alt="title(g)" loading="lazy"><GameDial v-else :game-key="g.key" /></div>
          <div class="card-copy"><span class="eyebrow">GARMIN CONNECT IQ</span><h2>{{ title(g) }}</h2><p>{{ summary(g) }}</p><span class="explore">{{ copy('Explore & view rankings', '查看详情与排行榜') }} <span class="card-arrow" aria-hidden="true">↗</span></span></div>
        </router-link>
      </section>
    </template>
    <template v-else>
      <router-link class="back" :to="path('/games')">← {{ copy('All games', '全部游戏') }}</router-link>
      <section class="detail-hero"><div><span class="eyebrow">WRISTO / GARMIN GAMES</span><h1>{{ title(game) }}</h1><p class="instructions">{{ description(game) }}</p><a v-if="game.downloadUrl" class="primary" :href="game.downloadUrl" target="_blank" rel="noopener noreferrer">{{ copy('Get it on Connect IQ', '前往安装') }} ↗</a><span v-else class="coming">{{ copy('Store release coming soon', '商店版本即将推出') }}</span></div><div class="hero-dial" :class="{ 'has-banner': game.coverUrl?.trim() }"><img v-if="game.coverUrl?.trim()" :src="game.coverUrl" :alt="title(game)"><GameDial v-else :game-key="game.key" /></div></section>
      <div class="detail-grid"><section class="how"><span class="eyebrow">01 / {{ copy('HOW TO PLAY', '玩法') }}</span><h2>{{ copy('Make your next best.', '挑战下一次最好。') }}</h2><p class="instructions">{{ zh ? game.instructionsZh : game.instructions }}</p><p class="fine">{{ copy('Venu 3 · Forerunner 965', '适配 Venu 3 · Forerunner 965') }}</p></section>
        <section class="rankings"><div class="board-head"><div><span class="eyebrow">02 / {{ copy('LEADERBOARD', '排行榜') }}</span><h2>{{ copy('The scores to beat', '等待你来超越') }}</h2></div><button :disabled="boardLoading" @click="loadBoard(true)">{{ boardLoading ? copy('Loading…', '加载中…') : copy('Refresh ↻', '刷新 ↻') }}</button></div>
          <label v-if="game.key === 'daily-lights'" class="mode">{{ copy('Puzzle date', '谜题日期') }} <input type="date" :value="`${mode.slice(5,9)}-${mode.slice(9,11)}-${mode.slice(11,13)}`" min="2026-01-01" :max="new Date(Date.now() + 86400000).toISOString().slice(0,10)" @change="mode = 'daily' + ($event.target as HTMLInputElement).value.replace(/-/g, ''); changeMode()"></label>
          <label v-else-if="game.modes.length > 1" class="mode">{{ copy('Control mode', '操作模式') }} <select v-model="mode" @change="changeMode"><option v-for="m in game.modes" :key="m" :value="m">{{ modeLabel(m) }}</option></select></label>
          <p class="fine">{{ game.metric === 'errorMs' ? copy('Lowest timing error wins. Equal scores share a rank.', '时间误差越小排名越高，同分并列。') : copy('Highest personal best wins. Equal scores share a rank.', '按个人最好成绩排名，同分并列。') }}</p>
          <p v-if="boardError" role="alert">{{ boardError }}</p><p v-else-if="boardLoading && !board" role="status">{{ copy('Loading rankings…', '正在加载排行榜…') }}</p>
          <template v-if="board"><p class="fine">{{ board.participants.toLocaleString() }} {{ copy('players · Top 50', '位玩家 · 前 50 名') }}</p><div v-if="!board.entries.length" class="empty">{{ copy('The first place is yours to claim. Play a round on your watch to join.', '还没有成绩。在手表上完成一局，争取第一个上榜。') }}</div><table v-else><thead><tr><th>{{ copy('Rank', '排名') }}</th><th>{{ copy('Player', '玩家') }}</th><th>{{ copy('Best', '最好成绩') }}</th></tr></thead><tbody><tr v-for="row in board.entries" :key="row.player"><td class="rank">{{ String(row.rank).padStart(2, '0') }}</td><td>{{ row.player }}</td><td class="score">{{ score(row.score) }}</td></tr></tbody></table></template>
          <p class="fine footnote">{{ copy('Refreshes on entry with a 45-second cache. Scores are reported by players’ watches.', '进入时读取，缓存 45 秒，可手动刷新。成绩由玩家手表上报。') }}</p>
        </section></div>
    </template>
  </main>
</template>
<style scoped>
.arcade{--ink:#122a2b;--muted:#637774;max-width:1240px;margin:0 auto;padding:60px 28px 100px;color:var(--ink)}.eyebrow{font-size:11px;font-weight:700;letter-spacing:2px}.intro{max-width:730px;margin-bottom:56px}h1{font-size:clamp(42px,6vw,76px);letter-spacing:-3px;line-height:1.06;margin:22px 0;font-weight:650}h1 em{font-family:Georgia,serif;font-weight:400;color:#38806d}.intro p,.detail-hero p{font-size:18px;line-height:1.8;max-width:570px;color:var(--muted)}.games-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}.game-card{color:inherit;text-decoration:none;border-top:1px solid #cad8d2;transition:transform .2s}.game-card:hover{transform:translateY(-5px)}.card-art{position:relative;display:flex;justify-content:center;align-items:center;background:#e7eee8;padding:28px 18px;aspect-ratio:1.1}.number{position:absolute;top:18px;left:18px;font:13px monospace;color:#71827a}.card-art img{width:100%;height:100%;object-fit:contain}.card-copy{padding:26px 0}h2{font-size:25px;line-height:1.25;letter-spacing:-.6px;margin:14px 0}.card-copy h2{display:flex;justify-content:space-between}.card-copy p{color:var(--muted);line-height:1.65;min-height:78px}.explore{font-size:13px;font-weight:650;border-bottom:1px solid #527b6e;padding-bottom:6px}.back{color:var(--muted);text-decoration:none}.detail-hero{display:grid;grid-template-columns:1.3fr 1fr;align-items:center;gap:50px;padding:50px 0 65px;border-bottom:1px solid #d5dfd9}.hero-dial{display:flex;justify-content:center;padding:30px;background:#e7eee8;border-radius:50%}.hero-dial img{max-width:100%;border-radius:50%}.detail-hero h1{font-size:clamp(40px,5vw,64px)}.primary{display:inline-block;background:var(--ink);color:white;padding:15px 23px;text-decoration:none;margin-top:20px;border-radius:6px}.coming{display:inline-block;padding:14px 0;color:var(--muted)}.detail-grid{display:grid;grid-template-columns:1fr 1.7fr;gap:70px;margin-top:50px}.instructions{white-space:pre-line;line-height:1.9;color:var(--muted)}.board-head{display:flex;justify-content:space-between;align-items:center;gap:20px}button,select,input{font:inherit;padding:9px 13px;border:1px solid #c7d4cc;background:white;color:var(--ink);border-radius:5px;cursor:pointer}button:disabled{opacity:.5;cursor:wait}.mode{display:flex;gap:15px;align-items:center;margin:20px 0}.fine{font-size:12px;line-height:1.7;color:var(--muted)}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--muted);padding:15px 8px;border-bottom:1px solid #b4c5ba}td{padding:18px 8px;border-bottom:1px solid #e1e9e3;font-size:14px}th:last-child,td:last-child{text-align:right}.rank{font:22px Georgia,serif;color:#38806d}.score{font-variant-numeric:tabular-nums;font-weight:650}.empty,.notice{padding:45px 15px;line-height:1.8}.empty{background:#eef3ee;border-radius:7px}.footnote{margin-top:22px}.notice{text-align:center}a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid #3c9377;outline-offset:4px}@media(max-width:800px){.arcade{padding:35px 20px 65px}.games-grid{grid-template-columns:1fr}.card-art{aspect-ratio:1.4}.card-art .game-dial{max-width:250px}.card-copy p{min-height:0}.detail-hero,.detail-grid{grid-template-columns:1fr;gap:30px}.hero-dial{max-width:360px;margin:auto}.detail-grid{margin-top:35px}.intro{margin-bottom:35px}}@media(prefers-reduced-motion:reduce){.game-card{transition:none}}
/* Keep each game contained in a single, equally sized card. */
.collection-heading{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin-bottom:24px}
.collection-heading h2{margin:0;font-size:22px;letter-spacing:-.4px}
.collection-heading>span{font-size:13px;color:var(--muted);white-space:nowrap}
.games-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.game-card{--art-bg:#e7eee8;display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid #dce5df;border-radius:24px;background:#fff;box-shadow:0 4px 16px #122a2b05;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
.game-card:nth-child(4n+2){--art-bg:#e8edf2}
.game-card:nth-child(4n+3){--art-bg:#f3eddf}
.game-card:nth-child(4n+4){--art-bg:#eee9ef}
.game-card:hover{transform:translateY(-6px);border-color:#acc5b7;box-shadow:0 16px 32px #122a2b12}
.card-art{isolation:isolate;aspect-ratio:1.24;padding:34px 34px 24px;background:var(--art-bg);border-bottom:1px solid #122a2b08}
.card-art::before{content:'';position:absolute;inset:16%;z-index:-1;border:1px solid #ffffffa6;border-radius:50%;box-shadow:0 0 0 24px #ffffff30}
.number{top:17px;left:18px;display:grid;place-items:center;width:30px;height:30px;border:1px solid #122a2b15;border-radius:50%;background:#ffffff80;color:#526961;font-size:11px}
.card-art :deep(.game-dial){width:100%;max-width:245px}
.card-art img{position:absolute;inset:12%;width:76%;height:76%;object-fit:contain}
.card-copy{display:flex;flex:1;flex-direction:column;align-items:flex-start;padding:25px 26px 22px}
.card-copy .eyebrow{font-size:10px;letter-spacing:1.8px;color:#527565}
.card-copy h2{margin:12px 0 10px;font-size:25px;line-height:1.35;overflow-wrap:anywhere}
.card-copy p{margin:0 0 25px;min-height:0;font-size:14px;line-height:1.85;overflow-wrap:anywhere}
.explore{display:flex;align-items:center;justify-content:space-between;gap:12px;align-self:stretch;margin-top:auto;padding:17px 0 0;border-bottom:0;border-top:1px solid #e8eeea;font-size:12px;color:#315f4e}
.card-arrow{display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border-radius:50%;background:#eef4ef;font-size:18px;transition:background .22s,color .22s}
.game-card:hover .card-arrow{background:#244e3e;color:white}
.game-card:focus-visible{outline:3px solid #3c9377;outline-offset:5px}
@media(max-width:1000px){.games-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}}
@media(max-width:600px){.games-grid{grid-template-columns:minmax(0,1fr);gap:24px}.collection-heading{align-items:flex-start;flex-direction:column;gap:8px;margin-bottom:20px}.collection-heading h2{font-size:21px}.card-art{aspect-ratio:1.35}.card-copy{padding:23px}.intro h1{letter-spacing:-2px}.intro p{font-size:16px}}
@media(prefers-reduced-motion:reduce){.game-card,.card-arrow{transition:none}.game-card:hover{transform:none}}
.card-art.has-banner{padding:0;aspect-ratio:16/9;background:#eef3ee}
.card-art.has-banner::before{display:none}
.card-art.has-banner img{position:static;display:block;width:100%;height:100%;object-fit:contain}
.card-art.has-banner .number{z-index:1;background:#ffffffed}
.hero-dial.has-banner{padding:0;border-radius:20px;overflow:hidden;width:100%;max-width:none;background:#eef3ee}
.hero-dial.has-banner img{display:block;width:100%;height:auto;border-radius:0}
</style>
