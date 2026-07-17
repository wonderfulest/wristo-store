import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/views/products/categoryBrowseState.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const {
  beginCategoryPageRequest,
  commitCategoryPageSuccess,
  commitCategoryPageFailure,
} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('a failed next page stays pending and preserves the committed page and hasMore', () => {
  const state = { currentPage: 1, failedPage: null, hasMore: true }
  const request = beginCategoryPageRequest(state, false)

  assert.equal(request.page, 2)
  const failed = commitCategoryPageFailure(state, request)
  assert.deepEqual(failed, { currentPage: 1, failedPage: 2, hasMore: true })
})

test('retry requests the failed page once and advances only after success', () => {
  const state = { currentPage: 1, failedPage: 2, hasMore: true }
  const retry = beginCategoryPageRequest(state, false)

  assert.equal(retry.page, 2)
  const committed = commitCategoryPageSuccess(state, retry, 24, 24)
  assert.deepEqual(committed, { currentPage: 2, failedPage: null, hasMore: true })
  assert.equal(beginCategoryPageRequest(committed, false).page, 3)
})

test('reset requests page one and commits backend end only after success', () => {
  const state = { currentPage: 4, failedPage: 5, hasMore: true }
  const request = beginCategoryPageRequest(state, true)

  assert.equal(request.page, 1)
  assert.deepEqual(
    commitCategoryPageSuccess(state, request, 7, 24),
    { currentPage: 1, failedPage: null, hasMore: false },
  )
})
