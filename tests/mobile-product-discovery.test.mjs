import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const importTypeScript = async (path) => {
  const source = await read(path)
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
}

test('recently viewed IDs stay unique and bounded', async () => {
  const { appendRecentlyViewed } = await importTypeScript('../src/utils/productRecommendations.ts')

  assert.deepEqual(appendRecentlyViewed([1, 2, 3], 2, 3), [1, 3, 2])
  assert.deepEqual(appendRecentlyViewed([1, 2, 3], 4, 3), [2, 3, 4])
})
