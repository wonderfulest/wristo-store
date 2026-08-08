import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Tawk is disabled by default and requires an explicit production flag', async () => {
  const [html, exampleEnv] = await Promise.all([
    read('../index.html'),
    read('../.env.example')
  ])

  assert.match(html, /import\.meta\.env\.VITE_ENABLE_TAWK_TO\s*===\s*['"]true['"]/)
  assert.match(html, /window\.location\.hostname\s*===\s*['"]wristo\.io['"]/)
  assert.match(html, /window\.location\.hostname\s*===\s*['"]www\.wristo\.io['"]/)
  assert.match(exampleEnv, /^VITE_ENABLE_TAWK_TO=false$/m)
})
