import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/components/discovery/navigationGesture.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { createNavigationGesture } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const point = (clientX, clientY) => ({ clientX, clientY })

test('horizontal, vertical and returning drags suppress detail navigation', () => {
  for (const end of [point(40, 0), point(0, 40), point(10, 10)]) {
    const gesture = createNavigationGesture()
    gesture.start(point(0, 0))
    gesture.move(end)
    gesture.move(point(0, 0))
    assert.equal(gesture.shouldBlock({ detail: 1 }), true)
  }
})

test('scroll cancellation blocks the following click but permits a fresh tap and keyboard activation', () => {
  const gesture = createNavigationGesture()
  gesture.start(point(0, 0))
  gesture.cancel()
  assert.equal(gesture.shouldBlock({ detail: 1 }), true)
  assert.equal(gesture.shouldBlock({ detail: 0 }), false)
  gesture.start(point(10, 10))
  gesture.move(point(12, 13))
  assert.equal(gesture.shouldBlock({ detail: 1 }), false)
})
