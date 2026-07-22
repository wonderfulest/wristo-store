import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('HomeBanner exposes a Premium slide that links directly to the bundle card', async () => {
  const source = await read('../src/views/home/components/HomeBanner.vue')

  assert.match(source, /id:\s*'premium'/)
  assert.match(source, /themeClass:\s*'theme-store theme-premium'/)
  assert.match(source, /primaryAction:\s*goToBundles/)
  assert.match(source, /imageSrc:\s*'\/home-hero-premium-lifetime-access-en\.png'/)
  assert.match(source, /hash:\s*'#bundle-subscription-card'/)
})

test('Premium hero copy is defined for every supported locale', async () => {
  const i18n = await read('../src/i18n.ts')

  for (const key of ['home.premiumEyebrow', 'home.premiumTitle', 'home.premiumDesc', 'home.premiumCta', 'home.heroPremiumSlide']) {
    assert.equal(i18n.match(new RegExp(`'${key.replace('.', '\\.')}':`, 'g'))?.length, 14)
  }
  assert.match(i18n, /'home\.premiumTitle': 'Unlock Everything\. Keep It Forever\.'/)
  assert.match(i18n, /'home\.premiumDesc': 'One purchase unlocks thousands of premium apps — including future releases\.'/)
})

test('activation hero copy is defined for every supported locale', async () => {
  const i18n = await read('../src/i18n.ts')

  for (const key of ['home.activationEyebrow', 'home.activationTitle', 'home.activationDesc', 'home.activationCta', 'home.heroActivationSlide']) {
    assert.equal(i18n.match(new RegExp(`'${key.replace('.', '\\.')}':`, 'g'))?.length, 14)
  }
  assert.match(i18n, /'home\.activationTitle': 'How to activate and enjoy your benefits'/)
  assert.match(i18n, /'home\.activationDesc': 'Enter your purchase email and the 6-digit code shown on your watch to restore access\.'/)
})

test('poster stage and image share a crop-free 3:4 box', async () => {
  const source = await read('../src/views/home/components/HomeBanner.vue')

  assert.match(source, /\.banner-stage\.banner-stage--poster\s*\{[^}]*width:\s*min\(100%,\s*510px\);[^}]*min-height:\s*0;[^}]*aspect-ratio:\s*3\s*\/\s*4;/s)
  assert.match(source, /\.banner-stage img\.banner-stage__image--poster\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*aspect-ratio:\s*3\s*\/\s*4;[^}]*object-fit:\s*contain;/s)
})

test('Premium poster asset exists', async () => {
  await assert.doesNotReject(() => access(new URL('../public/home-hero-premium-lifetime-access-en.png', import.meta.url)))
})

test('activation hero asset exists', async () => {
  await assert.doesNotReject(() => access(new URL('../public/home-hero-activation.svg', import.meta.url)))
})
