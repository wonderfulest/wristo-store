# Home Hero Premium Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a black-and-gold Premium Bundle poster with matching left-side copy to the Store homepage carousel and remove visible black margins around every 3:4 poster.

**Architecture:** Keep `HomeBanner.vue` as the single local source for carousel ordering, entitlement filtering, actions, and poster paths. Add one public static poster generated with `imagegen`, add localized copy through `src/i18n.ts`, and make the shared poster stage itself 3:4 so the image fills it without cropping.

**Tech Stack:** Vue 3, TypeScript, Vue Router, CSS, Node.js built-in test runner, OpenAI image generation.

---

### Task 1: Lock the Premium carousel and poster-fit contract with a failing test

**Files:**
- Create: `tests/home-hero-premium-carousel.test.mjs`
- Reference: `src/views/home/components/HomeBanner.vue`
- Reference: `src/i18n.ts`
- Reference: `public/home-hero-premium-lifetime-access-en.png`

- [ ] **Step 1: Write the failing source and asset contract test**

```js
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
    assert.equal(i18n.match(new RegExp(`'${key.replace('.', '\\\.')}'`, 'g'))?.length, 14)
  }
  assert.match(i18n, /'home\.premiumTitle': 'Unlock Everything\. Keep It Forever\.'/)
  assert.match(i18n, /'home\.premiumDesc': 'One purchase unlocks thousands of premium apps — including future releases\.'/)
})

test('poster stage and image share a crop-free 3:4 box', async () => {
  const source = await read('../src/views/home/components/HomeBanner.vue')

  assert.match(source, /\.banner-stage\.banner-stage--poster\s*\{[^}]*width:\s*min\(100%,\s*510px\);[^}]*aspect-ratio:\s*3\s*\/\s*4;[^}]*min-height:\s*0;/s)
  assert.match(source, /\.banner-stage img\.banner-stage__image--poster\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain;/s)
})

test('Premium poster asset exists', async () => {
  await assert.doesNotReject(() => access(new URL('../public/home-hero-premium-lifetime-access-en.png', import.meta.url)))
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/home-hero-premium-carousel.test.mjs`

Expected: four failures because the Premium slide, translations, 3:4 stage contract, and poster asset do not exist yet.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/home-hero-premium-carousel.test.mjs
git commit -m "test premium hero carousel"
```

### Task 2: Generate and add the Premium poster asset

**Files:**
- Create: `public/home-hero-premium-lifetime-access-en.png`
- Test: `tests/home-hero-premium-carousel.test.mjs`

- [ ] **Step 1: Load the `imagegen` skill and generate the poster**

Use the image-generation tool with this production prompt:

```text
Create a polished 3:4 portrait ecommerce hero poster for Wristo Premium, designed to sit inside a rounded 510 x 680 px web card. Deep black background, warm champagne-gold typography, premium editorial lighting, and a refined wall of diverse smartwatch app/watch-face thumbnails behind three photorealistic dark Garmin-style sports watches. Make this visually related to a luxury watch campaign but clearly distinct from the existing 5000+ watch-faces poster. The primary headline must be exactly: "ONE PURCHASE. LIFETIME ACCESS." Include two smaller benefit lines exactly: "THOUSANDS OF PREMIUM APPS" and "FUTURE RELEASES INCLUDED". Keep all text centered, correctly spelled, high contrast, and inside a generous safe area. No logos other than a small text label "WRISTO PREMIUM". No outer frame, no letterboxing, no empty black side margins, no UI buttons. The artwork must fill the full 3:4 canvas edge to edge and remain legible when displayed at 510 x 680 px.
```

Save the accepted generated result as `public/home-hero-premium-lifetime-access-en.png`. Verify its proportions with:

```bash
sips -g pixelWidth -g pixelHeight public/home-hero-premium-lifetime-access-en.png
```

Expected: a portrait image with a 3:4 ratio and no baked-in outer border.

- [ ] **Step 2: Run the asset test**

Run: `node --test tests/home-hero-premium-carousel.test.mjs`

Expected: only the asset-existence test passes; slide, translation, and CSS tests remain red.

- [ ] **Step 3: Commit the generated asset**

```bash
git add public/home-hero-premium-lifetime-access-en.png
git commit -m "add premium hero poster"
```

### Task 3: Add localized Premium hero copy

**Files:**
- Modify: `src/i18n.ts`
- Test: `tests/home-hero-premium-carousel.test.mjs`

- [ ] **Step 1: Add the five English keys beside the existing home hero keys**

```ts
'home.premiumEyebrow': 'Wristo Premium',
'home.premiumTitle': 'Unlock Everything. Keep It Forever.',
'home.premiumDesc': 'One purchase unlocks thousands of premium apps — including future releases.',
'home.premiumCta': 'Get Premium',
'home.heroPremiumSlide': 'Show Wristo Premium slide',
```

- [ ] **Step 2: Add the same five keys to all 13 non-English locale objects**

Use these localized title and CTA pairs while translating the eyebrow, description, and dot label with the same meaning:

| Locale | Title | CTA |
|---|---|---|
| zh | `一次解锁，永久拥有。` | `获取高级套装` |
| de | `Alles freischalten. Für immer behalten.` | `Premium holen` |
| es | `Desbloquéalo todo. Consérvalo para siempre.` | `Obtener Premium` |
| fr | `Débloquez tout. Gardez-le pour toujours.` | `Obtenir Premium` |
| it | `Sblocca tutto. Per sempre.` | `Ottieni Premium` |
| ja | `すべてをアンロック。ずっと使える。` | `Premium を入手` |
| ko | `모두 잠금 해제하고 평생 이용하세요.` | `Premium 받기` |
| pt-br | `Desbloqueie tudo. Fique para sempre.` | `Obter Premium` |
| nl | `Ontgrendel alles. Voor altijd van jou.` | `Premium nemen` |
| pl | `Odblokuj wszystko. Zachowaj na zawsze.` | `Wybierz Premium` |
| sv | `Lås upp allt. Behåll det för alltid.` | `Skaffa Premium` |
| da | `Lås alt op. Behold det for altid.` | `Få Premium` |
| cs | `Odemkněte vše. Navždy.` | `Získat Premium` |

Every description must communicate: one purchase unlocks thousands of premium apps, including future releases.

- [ ] **Step 3: Run the copy test**

Run: `node --test tests/home-hero-premium-carousel.test.mjs`

Expected: the localization test passes; slide and CSS tests remain red.

- [ ] **Step 4: Commit translations**

```bash
git add src/i18n.ts
git commit -m "localize premium hero slide"
```

### Task 4: Add the Premium slide and eliminate poster margins

**Files:**
- Modify: `src/views/home/components/HomeBanner.vue`
- Test: `tests/home-hero-premium-carousel.test.mjs`
- Test: `tests/storefront-visual-system.test.mjs`

- [ ] **Step 1: Add the Premium slide after the Store slide**

```ts
{
  id: 'premium',
  themeClass: 'theme-store theme-premium',
  eyebrowIcon: 'solar:crown-star-bold-duotone',
  eyebrowKey: 'home.premiumEyebrow',
  titleKey: 'home.premiumTitle',
  descKey: 'home.premiumDesc',
  primaryLabelKey: 'home.premiumCta',
  primaryIcon: 'solar:arrow-right-up-linear',
  primaryAction: goToBundles,
  secondaryLabelKey: 'home.heroCode',
  secondaryIcon: 'solar:ticket-sale-linear',
  secondaryAction: goToCode,
  tertiaryLabelKey: 'home.heroBundles',
  tertiaryAction: goToBundles,
  metricOneValueKey: 'home.heroMetricFacesValue',
  metricOneLabelKey: 'home.heroMetricFacesLabel',
  metricTwoValueKey: 'home.heroMetricCheckoutValue',
  metricTwoLabelKey: 'home.heroMetricCheckoutLabel',
  metricThreeValueKey: 'home.heroMetricGarminValue',
  metricThreeLabelKey: 'home.heroMetricGarminLabel',
  compactActions: true,
  hideMetrics: true,
  imageSrc: '/home-hero-premium-lifetime-access-en.png',
  isPosterImage: true,
  hideArtCaption: true,
  artTopIcon: 'solar:crown-star-bold-duotone',
  artTopKey: 'home.heroArtSeries',
  artBottomIcon: 'solar:infinity-bold-duotone',
  artBottomKey: 'home.heroArtBattery',
  dotLabelKey: 'home.heroPremiumSlide'
},
```

Do not set `requiresBundle`; the Premium offer remains visible to all users. Keep the Studio slide and its existing `requiresBundle` behavior unchanged.

- [ ] **Step 2: Make the poster stage match its image at each breakpoint**

Use these shared rules:

```css
.banner-stage img.banner-stage__image--poster {
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  object-fit: contain;
  filter: none;
}

.banner-stage.banner-stage--poster {
  width: min(100%, 510px);
  min-height: 0;
  aspect-ratio: 3 / 4;
  background: #090d11;
}
```

At `max-width: 900px`, set poster width to `min(100%, 480px)` and remove the old `min-height: 640px`. At `max-width: 768px`, keep width `min(100%, 360px)` and remove the old responsive minimum height. The image remains `width: 100%; height: 100%` at every breakpoint.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/home-hero-premium-carousel.test.mjs tests/storefront-visual-system.test.mjs`

Expected: all tests pass.

- [ ] **Step 4: Commit carousel and fit behavior**

```bash
git add src/views/home/components/HomeBanner.vue tests/home-hero-premium-carousel.test.mjs
git commit -m "add premium homepage carousel"
```

### Task 5: Verify build and final scope

**Files:**
- Verify: `public/home-hero-premium-lifetime-access-en.png`
- Verify: `src/i18n.ts`
- Verify: `src/views/home/components/HomeBanner.vue`
- Verify: `tests/home-hero-premium-carousel.test.mjs`

- [ ] **Step 1: Run the complete relevant test set**

Run: `node --test tests/home-hero-premium-carousel.test.mjs tests/storefront-visual-system.test.mjs tests/final-review-fixes.test.mjs`

Expected: zero failures.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: TypeScript, Vite production build, 80-page SEO prerender, sitemap, and `llms.txt` generation finish with exit code 0.

- [ ] **Step 3: Inspect repository scope**

Run: `git diff --check && git status --short && git log --oneline -7`

Expected: no whitespace errors, no uncommitted files, and focused commits for the test, poster, translations, and carousel implementation.
