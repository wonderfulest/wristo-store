import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
const source = await readFile(new URL('../src/components/discovery/preferences.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { selectRound } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
test('round excludes rated products, removes duplicates and limits to ten', () => {
  const products = Array.from({ length: 15 }, (_, appId) => ({ appId }))
  const round = selectRound([...products, ...products], { 0: 'like', 1: 'dislike' })
  assert.deepEqual(round.map(p => p.appId), [2,3,4,5,6,7,8,9,10,11])
  assert.deepEqual(selectRound([{ appId: 1 }], { 1: 'like' }), [])
})
