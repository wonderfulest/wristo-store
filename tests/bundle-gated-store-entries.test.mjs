import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Header keeps Studio bundle-gated while FAQ is public on desktop and mobile', async () => {
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
    /<router-link\s+:to="faqPath"\s+class="nav-link">\{\{ t\('nav\.faq'\) \}\}<\/router-link>/,
  )
  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"[^>]*class="mobile-nav-link mobile-nav-button"[^>]*>[\s\S]*?\{\{ t\('nav\.studio'\) \}\}[\s\S]*?<\/button>/,
  )
  assert.match(
    source,
    /<router-link\s+:to="faqPath"\s+class="mobile-nav-link"[^>]*>[\s\S]*?\{\{ t\('nav\.faq'\) \}\}[\s\S]*?<\/router-link>/,
  )
  assert.doesNotMatch(source, /<router-link\s+v-if="canShowBundleEntries"[^>]*:to="faqPath"/)
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

  assert.match(
    source,
    /const goToActivation = \(\) => \{\s*router\.push\(addLocaleToPath\('\/already-purchased', localeStore\.currentLocale\)\)\s*\}/,
  )
  assert.match(source, /id: 'activation',[\s\S]*?primaryAction: goToActivation/)
  const activationSlideSource = source.slice(source.indexOf("id: 'activation'"), source.indexOf("id: 'studio'"))
  assert.ok(activationSlideSource.startsWith("id: 'activation'"))
  assert.doesNotMatch(activationSlideSource, /requiresBundle/)
  assert.match(activationSlideSource, /compactActions: true/)
  assert.match(activationSlideSource, /hideMetrics: true/)
  assert.match(activationSlideSource, /imageSrc: '\/home-hero-activation\.svg'/)
  assert.match(
    source,
    /import \{[^}]*hasBundleStoreEntryAccess[^}]*\} from '@\/utils\/entitlements'/,
  )
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

test('SearchView hides only the empty-state Studio action without bundle access', async () => {
  const source = await readSource('../src/views/search/SearchView.vue')

  assert.match(
    source,
    /import \{[^}]*hasBundleStoreEntryAccess[^}]*\} from '@\/utils\/entitlements'/,
  )
  assert.match(
    source,
    /const canShowBundleEntries = computed\(\(\) => hasBundleStoreEntryAccess\(userStore\.userInfo\)\)/,
  )
  assert.match(
    source,
    /<button\s+v-if="canShowBundleEntries"\s+class="state-studio-btn"[^>]*@click="openStudio">[\s\S]*?search\.createInStudio[\s\S]*?<\/button>/,
  )
  assert.match(
    source,
    /<button class="state-studio-btn" type="button" @click="retrySearch">\{\{ t\('search\.retry'\) \}\}<\/button>/,
  )
})

test('ProductDetail hides Customize in Studio without bundle access', async () => {
  const source = await readSource('../src/views/products/ProductDetail.vue')

  assert.match(
    source,
    /import \{[^}]*hasBundleStoreEntryAccess[^}]*\} from '@\/utils\/entitlements'/,
  )
  assert.match(
    source,
    /const canShowBundleEntries = computed\(\(\) => hasBundleStoreEntryAccess\(userStore\.userInfo\)\)/,
  )
  assert.match(
    source,
    /<button\s+v-if="product\?\.designId && canShowBundleEntries"[\s\S]*?@click="handleCustomizeInStudio"[\s\S]*?product\.customizeInStudio[\s\S]*?<\/button>/,
  )
})

test('UserProfile hides the Studio section without bundle access', async () => {
  const source = await readSource('../src/views/user-center/UserProfile.vue')

  assert.match(
    source,
    /import \{[^}]*hasBundleStoreEntryAccess[^}]*\} from '@\/utils\/entitlements'/,
  )
  assert.match(
    source,
    /const canShowBundleEntries = computed\(\(\) => hasBundleStoreEntryAccess\(userInfo\.value\)\)/,
  )
  assert.match(
    source,
    /<!-- Section: Studio -->\s*<div v-if="canShowBundleEntries" class="section">/,
  )
})

test('ProductAdminPanel keeps the Studio tool available to administrators', async () => {
  const source = await readSource('../src/components/ProductAdminPanel.vue')

  assert.match(source, /@click="openProductInStudio"/)
  assert.doesNotMatch(source, /hasBundleStoreEntryAccess/)
})
