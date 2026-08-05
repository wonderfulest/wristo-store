import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const helperSource = await readFile(
  new URL('../src/utils/deviceSearch.ts', import.meta.url),
  'utf8',
).catch((error) => error?.code === 'ENOENT' ? '' : Promise.reject(error))

test('device search matches ASCII input against accented Garmin family names', async () => {
  assert.match(helperSource, /export function matchesDeviceSearch/)

  const compiled = ts.transpileModule(helperSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const { matchesDeviceSearch } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )

  assert.equal(matchesDeviceSearch('fēnix® 8 43mm', '', 'fenix'), true)
})
