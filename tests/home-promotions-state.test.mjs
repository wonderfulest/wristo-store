import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { transform } from 'esbuild'
import { computed, ref, watch, nextTick, effectScope } from 'vue'

const source = readFileSync(new URL('../src/views/home/components/HomePromotions.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
const { code } = await transform(script + '\nreturn { active, slides, user, downloads }', { loader: 'ts' })
function setup(premium, links) {
  const scope = effectScope()
  const state = scope.run(() => new Function('computed', 'ref', 'watch', 'onMounted', 'onBeforeUnmount', 'useI18n', 'useLocaleStore', 'useCompanionAppsStore', 'useUserStore', 'hasPremiumEntitlement', 'addLocaleToPath', code)(
    computed, ref, watch, () => {}, () => {}, () => ({ t: x => x }), () => ({ currentLocale: 'zh' }),
    () => ({ hasLinks: links }), () => ({ userInfo: { premium: { active: premium } } }),
    u => u.premium.active, x => x,
  ))
  return { ...state, stop: () => scope.stop() }
}
for (const premium of [false, true]) {
  test(`initial visible promotion with cached downloads, premium=${premium}`, async () => {
    const state = setup(premium, true)
    await nextTick()
    assert.ok(state.slides.value.includes(state.active.value), 'initial active slide must be visible')
    state.stop()
  })
}
