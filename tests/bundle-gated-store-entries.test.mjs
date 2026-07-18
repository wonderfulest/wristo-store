import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Header hides desktop and mobile Studio and FAQ entries without bundle access', async () => {
  const source = await readSource('../src/components/Header.vue')

  assert.match(
    source,
    /const canShowBundleEntries = computed\(\(\) => hasBundleStoreEntryAccess\(userStore\.userInfo\)\)/,
  )

  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"[^>]*class="nav-link nav-button"[^>]*>\s*\{\{ t\('nav\.studio'\) \}\}\s*<\/button>/,
  )
  assert.match(
    source,
    /<router-link\s+v-if="canShowBundleEntries"[^>]*:to="faqPath"[^>]*class="nav-link"[^>]*>\{\{ t\('nav\.faq'\) \}\}<\/router-link>/,
  )
  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"[^>]*class="mobile-nav-link mobile-nav-button"[^>]*>[\s\S]*?\{\{ t\('nav\.studio'\) \}\}[\s\S]*?<\/button>/,
  )
  assert.match(
    source,
    /<router-link\s+v-if="canShowBundleEntries"[^>]*:to="faqPath"[^>]*class="mobile-nav-link"[^>]*>[\s\S]*?\{\{ t\('nav\.faq'\) \}\}[\s\S]*?<\/router-link>/,
  )
})

test('Header hides the complete creator section and each mobile creator action without bundle access', async () => {
  const source = await readSource('../src/components/Header.vue')

  assert.match(
    source,
    /<div\s+v-if="canShowBundleEntries"\s+class="user-dropdown-section">\s*<span class="user-dropdown-section-title">\{\{ t\('nav\.creatorSection'\) \}\}<\/span>[\s\S]*?command="membership"[\s\S]*?command="studio"/,
  )

  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"\s+class="mobile-action-btn"[^>]*handleUserMenuCommand\('studio'\)/,
  )
  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"\s+class="mobile-action-btn"[^>]*handleUserMenuCommand\('membership'\)/,
  )
})

test('HomeBanner filters bundle-only slides and cycles through the visible slides', async () => {
  const source = await readSource('../src/views/home/components/HomeBanner.vue')

  assert.match(source, /hasBundleStoreEntryAccess/)
  assert.match(source, /requiresBundle\?: boolean/)
  assert.match(source, /const allSlides: HeroSlide\[\] = \[/)
  const storeSlideSource = source.slice(source.indexOf("id: 'store'"), source.indexOf("id: 'studio'"))
  assert.ok(storeSlideSource.startsWith("id: 'store'"))
  assert.doesNotMatch(storeSlideSource, /requiresBundle/)
  assert.match(source, /id: 'studio',[\s\S]*?requiresBundle: true/)
  assert.match(
    source,
    /const canShowBundleEntries = computed\(\(\) => hasBundleStoreEntryAccess\(userStore\.userInfo\)\)/,
  )
  assert.match(
    source,
    /const visibleSlides = computed\(\(\) => allSlides\.filter\(\(slide\) => !slide\.requiresBundle \|\| canShowBundleEntries\.value\)\)/,
  )
  assert.match(source, /v-for="\(slide, index\) in visibleSlides"/)
  assert.match(source, /visibleSlides\.value\[activeSlideIndex\.value\][\s\S]*?visibleSlides\.value\[0\]/)
  assert.match(
    source,
    /watch\(visibleSlides, \(slides\) => \{\s*if \(activeSlideIndex\.value >= slides\.length\) \{\s*activeSlideIndex\.value = 0/,
  )
  assert.match(source, /% visibleSlides\.value\.length/)
})
