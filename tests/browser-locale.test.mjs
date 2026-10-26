import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const code = ts.transpileModule(readFileSync(new URL('../src/store/locale.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
function load({ languages, language, stored = null, cookie = '', noStorage = false } = {}) {
  const context = {
    exports: {}, require: () => ({ defineStore: (_id, options) => options }),
    document: { cookie, documentElement: {} }, window: { location: { protocol: 'https:' } },
  }
  if (languages || language) context.navigator = { languages, language }
  if (!noStorage) context.localStorage = { getItem: () => stored, setItem() {} }
  vm.runInNewContext(code, context)
  return context.exports
}
test('browser languages match in preference order with regional variants', () => {
  for (const [languages, expected] of [
    [['zh-CN'], 'zh'], [['de-DE'], 'de'], [['en-US'], 'en'],
    [['pt-BR'], 'pt-br'], [['pt-PT'], 'pt-br'], [['ZH-TW'], 'zh'],
    [['ru-RU', 'fr-CA', 'de'], 'fr'], [['ru', 'ar'], 'en'],
    [['en-US', 'zh-CN'], 'en'],
  ]) assert.equal(load({ languages }).useLocaleStore.state().currentLocale, expected)
})
test('navigator.language fallback and environments without browser globals', () => {
  assert.equal(load({ language: 'ja-JP' }).getBrowserLocale(), 'ja')
  assert.equal(load({ languages: [], language: 'ko-KR' }).getBrowserLocale(), 'ko')
  assert.equal(load({ noStorage: true }).useLocaleStore.state().currentLocale, 'en')
  assert.equal(load({ noStorage: true, language: 'de-DE' }).useLocaleStore.state().currentLocale, 'de')
})
test('stored and cookie preferences override browser language', () => {
  for (const stored of ['es', '{"currentLocale":"es"}']) {
    assert.equal(load({ stored, cookie: 'wristo-locale=de', language: 'zh-CN' }).useLocaleStore.state().currentLocale, 'es')
  }
  assert.equal(load({ cookie: 'wristo-locale=de', language: 'zh-CN' }).useLocaleStore.state().currentLocale, 'de')
  assert.equal(load({ stored: 'invalid', language: 'zh-CN' }).useLocaleStore.state().currentLocale, 'zh')
})
test('explicit locale selection overrides browser default', () => {
  const module = load({ language: 'zh-CN' })
  const state = module.useLocaleStore.state()
  module.useLocaleStore.actions.setLocale.call(state, 'de')
  assert.equal(state.currentLocale, 'de')
})
