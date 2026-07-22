# Store FAQ and Activation Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make FAQ visible to every Store visitor and add a localized homepage activation slide that opens the existing `/already-purchased` form.

**Architecture:** Keep the existing Header and HomeBanner component boundaries. Remove only the FAQ visibility guard, add one public static HeroSlide using the established locale-aware router helper, and supply a local SVG illustration so the new slide uses the existing poster/image rendering path without remote assets or backend changes.

**Tech Stack:** Vue 3, TypeScript, Vue Router, existing Wristo i18n helper, scoped CSS, SVG, Node test runner, Vite.

---

## File map

- Modify `src/components/Header.vue`: expose the existing FAQ links on desktop and mobile while retaining Studio bundle gating.
- Modify `src/views/home/components/HomeBanner.vue`: add the locale-aware activation action and public activation slide.
- Modify `src/i18n.ts`: define activation-slide copy for all 14 supported locales.
- Create `public/home-hero-activation.svg`: self-contained activation-code and unlocked-benefit illustration.
- Modify `tests/bundle-gated-store-entries.test.mjs`: lock the public FAQ/private Studio contract and public activation-slide behavior.
- Modify `tests/home-hero-premium-carousel.test.mjs`: lock activation localization and local asset availability.

### Task 1: Make FAQ navigation public

**Files:**
- Modify: `tests/bundle-gated-store-entries.test.mjs`
- Modify: `src/components/Header.vue`

- [ ] **Step 1: Change the Header contract test so FAQ must be public**

Rename the first test to `Header keeps Studio bundle-gated while FAQ is public on desktop and mobile`. Keep the existing `canShowBundleEntries` and Studio assertions, then replace the FAQ assertions with:

```js
assert.match(
  source,
  /<router-link\s+:to="faqPath"\s+class="nav-link">\{\{ t\('nav\.faq'\) \}\}<\/router-link>/,
)
assert.match(
  source,
  /<router-link\s+:to="faqPath"\s+class="mobile-nav-link"[^>]*>[\s\S]*?\{\{ t\('nav\.faq'\) \}\}[\s\S]*?<\/router-link>/,
)
assert.doesNotMatch(source, /<router-link\s+v-if="canShowBundleEntries"[^>]*:to="faqPath"/)
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test tests/bundle-gated-store-entries.test.mjs
```

Expected: FAIL in the renamed Header test because both FAQ links still contain `v-if="canShowBundleEntries"`.

- [ ] **Step 3: Remove only the FAQ visibility guards**

In `src/components/Header.vue`, change the desktop link to:

```vue
<router-link :to="faqPath" class="nav-link">{{ t('nav.faq') }}</router-link>
```

Change the mobile link to:

```vue
<router-link :to="faqPath" class="mobile-nav-link" @click="closeMobileMenu">
  <Icon icon="solar:document-text-line-duotone" width="22" height="22" aria-hidden="true" />
  <span>{{ t('nav.faq') }}</span>
</router-link>
```

Do not change either Studio `v-if="canShowBundleEntries"` condition or the creator-section gates.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
node --test tests/bundle-gated-store-entries.test.mjs
```

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit the public FAQ entry**

```bash
git add src/components/Header.vue tests/bundle-gated-store-entries.test.mjs
git commit -m "show FAQ in Store navigation"
```

### Task 2: Add the activation Hero behavior and visual

**Files:**
- Modify: `tests/bundle-gated-store-entries.test.mjs`
- Modify: `src/views/home/components/HomeBanner.vue`
- Create: `public/home-hero-activation.svg`

- [ ] **Step 1: Add failing activation-slide assertions**

Append these assertions to the `HomeBanner filters bundle-only slides and cycles through the visible slides` test after `const source`:

```js
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
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test tests/bundle-gated-store-entries.test.mjs
```

Expected: FAIL because `goToActivation` and `id: 'activation'` do not exist.

- [ ] **Step 3: Add the locale-aware route action**

In `HomeBanner.vue`, immediately after `goToCode`, add:

```ts
const goToActivation = () => {
  router.push(addLocaleToPath('/already-purchased', localeStore.currentLocale))
}
```

- [ ] **Step 4: Add the public activation slide**

Insert this object between the existing `premium` and `studio` slides:

```ts
{
  id: 'activation',
  themeClass: 'theme-store theme-activation',
  eyebrowIcon: 'solar:shield-check-bold-duotone',
  eyebrowKey: 'home.activationEyebrow',
  titleKey: 'home.activationTitle',
  descKey: 'home.activationDesc',
  primaryLabelKey: 'home.activationCta',
  primaryIcon: 'solar:arrow-right-up-linear',
  primaryAction: goToActivation,
  secondaryLabelKey: 'home.heroCode',
  secondaryIcon: 'solar:hashtag-circle-line-duotone',
  secondaryAction: goToCode,
  tertiaryLabelKey: 'nav.faq',
  tertiaryAction: goToActivation,
  metricOneValueKey: 'home.heroMetricFacesValue',
  metricOneLabelKey: 'home.heroMetricFacesLabel',
  metricTwoValueKey: 'home.heroMetricCheckoutValue',
  metricTwoLabelKey: 'home.heroMetricCheckoutLabel',
  metricThreeValueKey: 'home.heroMetricGarminValue',
  metricThreeLabelKey: 'home.heroMetricGarminLabel',
  compactActions: true,
  hideMetrics: true,
  imageSrc: '/home-hero-activation.svg',
  isPosterImage: true,
  hideArtCaption: true,
  artTopIcon: 'solar:shield-check-bold-duotone',
  artTopKey: 'home.activationEyebrow',
  artBottomIcon: 'solar:stars-bold-duotone',
  artBottomKey: 'home.activationCta',
  dotLabelKey: 'home.heroActivationSlide'
},
```

The object deliberately omits `requiresBundle`, so it remains visible to every visitor.

- [ ] **Step 5: Create the local activation illustration**

Create `public/home-hero-activation.svg` as a `900 × 1200` SVG with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" fill="none">
  <rect width="900" height="1200" rx="48" fill="#F3F5F2"/>
  <circle cx="450" cy="420" r="250" fill="#E2E9E1"/>
  <rect x="224" y="236" width="452" height="520" rx="104" fill="#19211D"/>
  <rect x="270" y="292" width="360" height="408" rx="72" fill="#FBFCF8"/>
  <path d="M450 356C401 356 362 395 362 444V478H334V594H566V478H538V444C538 395 499 356 450 356ZM410 444C410 422 428 404 450 404C472 404 490 422 490 444V478H410V444Z" fill="#D96A3B"/>
  <circle cx="450" cy="535" r="24" fill="#19211D"/>
  <path d="M450 558V600" stroke="#19211D" stroke-width="18" stroke-linecap="round"/>
  <rect x="128" y="820" width="644" height="176" rx="40" fill="#FFFFFF"/>
  <circle cx="224" cy="908" r="48" fill="#D96A3B"/>
  <path d="M202 908L219 925L249 891" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="304" y="866" width="332" height="22" rx="11" fill="#19211D"/>
  <rect x="304" y="914" width="252" height="18" rx="9" fill="#8A948E"/>
  <rect x="304" y="954" width="188" height="18" rx="9" fill="#C5CCC7"/>
  <circle cx="702" cy="192" r="24" fill="#D96A3B"/>
  <path d="M148 184L156 204L176 212L156 220L148 240L140 220L120 212L140 204L148 184Z" fill="#D8A54A"/>
</svg>
```

- [ ] **Step 6: Run the focused behavior test**

Run:

```bash
node --test tests/bundle-gated-store-entries.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 7: Commit the activation slide behavior**

```bash
git add src/views/home/components/HomeBanner.vue public/home-hero-activation.svg tests/bundle-gated-store-entries.test.mjs
git commit -m "add Store activation hero"
```

### Task 3: Localize the activation slide and verify the Store

**Files:**
- Modify: `tests/home-hero-premium-carousel.test.mjs`
- Modify: `src/i18n.ts`

- [ ] **Step 1: Add failing localization and asset tests**

Append:

```js
test('activation hero copy is defined for every supported locale', async () => {
  const i18n = await read('../src/i18n.ts')

  for (const key of ['home.activationEyebrow', 'home.activationTitle', 'home.activationDesc', 'home.activationCta', 'home.heroActivationSlide']) {
    assert.equal(i18n.match(new RegExp(`'${key.replace('.', '\\.')}':`, 'g'))?.length, 14)
  }
  assert.match(i18n, /'home\.activationTitle': 'How to activate and enjoy your benefits'/)
  assert.match(i18n, /'home\.activationDesc': 'Enter your purchase email and the 6-digit code shown on your watch to restore access\.'/)
})

test('activation hero asset exists', async () => {
  await assert.doesNotReject(() => access(new URL('../public/home-hero-activation.svg', import.meta.url)))
})
```

- [ ] **Step 2: Run the localization test and verify it fails**

Run:

```bash
node --test tests/home-hero-premium-carousel.test.mjs
```

Expected: the asset test PASS and the localization test FAIL because the five message keys are absent.

- [ ] **Step 3: Add English and Chinese copy**

Add beside each locale's existing `home.hero*` block:

```ts
// en
'home.activationEyebrow': 'Activate your purchase',
'home.activationTitle': 'How to activate and enjoy your benefits',
'home.activationDesc': 'Enter your purchase email and the 6-digit code shown on your watch to restore access.',
'home.activationCta': 'Activate now',
'home.heroActivationSlide': 'Show purchase activation slide',

// zh
'home.activationEyebrow': '激活购买权益',
'home.activationTitle': '如何激活，享受权益',
'home.activationDesc': '输入购买邮箱和手表上显示的六位数字激活码，即可恢复权益。',
'home.activationCta': '立即激活',
'home.heroActivationSlide': '显示购买激活轮播',
```

- [ ] **Step 4: Add copy for the other supported locales**

Add these five keys to each corresponding locale block:

```ts
// de
'home.activationEyebrow': 'Kauf aktivieren',
'home.activationTitle': 'Aktivieren und Vorteile nutzen',
'home.activationDesc': 'Gib deine Kauf-E-Mail und den 6-stelligen Code von deiner Uhr ein, um den Zugriff wiederherzustellen.',
'home.activationCta': 'Jetzt aktivieren',
'home.heroActivationSlide': 'Folie zur Kaufaktivierung anzeigen',

// es
'home.activationEyebrow': 'Activa tu compra',
'home.activationTitle': 'Activa y disfruta tus ventajas',
'home.activationDesc': 'Introduce el correo de compra y el código de 6 dígitos que aparece en tu reloj para recuperar el acceso.',
'home.activationCta': 'Activar ahora',
'home.heroActivationSlide': 'Mostrar diapositiva de activación',

// fr
'home.activationEyebrow': 'Activez votre achat',
'home.activationTitle': 'Activez et profitez de vos avantages',
'home.activationDesc': 'Saisissez votre e-mail d’achat et le code à 6 chiffres affiché sur votre montre pour rétablir l’accès.',
'home.activationCta': 'Activer maintenant',
'home.heroActivationSlide': 'Afficher la diapositive d’activation',

// it
'home.activationEyebrow': 'Attiva il tuo acquisto',
'home.activationTitle': 'Attiva e goditi i tuoi vantaggi',
'home.activationDesc': 'Inserisci l’e-mail di acquisto e il codice a 6 cifre mostrato sull’orologio per ripristinare l’accesso.',
'home.activationCta': 'Attiva ora',
'home.heroActivationSlide': 'Mostra la slide di attivazione',

// ja
'home.activationEyebrow': '購入を有効化',
'home.activationTitle': '有効化して特典を楽しむ方法',
'home.activationDesc': '購入時のメールアドレスとウォッチに表示された6桁のコードを入力してアクセスを復元します。',
'home.activationCta': '今すぐ有効化',
'home.heroActivationSlide': '購入の有効化スライドを表示',

// ko
'home.activationEyebrow': '구매 활성화',
'home.activationTitle': '활성화하고 혜택을 누리는 방법',
'home.activationDesc': '구매 이메일과 시계에 표시된 6자리 코드를 입력해 이용 권한을 복원하세요.',
'home.activationCta': '지금 활성화',
'home.heroActivationSlide': '구매 활성화 슬라이드 표시',

// pt
'home.activationEyebrow': 'Ative sua compra',
'home.activationTitle': 'Ative e aproveite seus benefícios',
'home.activationDesc': 'Insira o e-mail da compra e o código de 6 dígitos exibido no relógio para restaurar o acesso.',
'home.activationCta': 'Ativar agora',
'home.heroActivationSlide': 'Mostrar slide de ativação',

// nl
'home.activationEyebrow': 'Activeer je aankoop',
'home.activationTitle': 'Activeer en geniet van je voordelen',
'home.activationDesc': 'Voer je aankoopmail en de 6-cijferige code op je horloge in om de toegang te herstellen.',
'home.activationCta': 'Nu activeren',
'home.heroActivationSlide': 'Dia voor aankoopactivering tonen',

// pl
'home.activationEyebrow': 'Aktywuj zakup',
'home.activationTitle': 'Aktywuj i korzystaj z uprawnień',
'home.activationDesc': 'Wpisz e-mail użyty przy zakupie i 6-cyfrowy kod z zegarka, aby przywrócić dostęp.',
'home.activationCta': 'Aktywuj teraz',
'home.heroActivationSlide': 'Pokaż slajd aktywacji zakupu',

// sv
'home.activationEyebrow': 'Aktivera ditt köp',
'home.activationTitle': 'Aktivera och ta del av dina förmåner',
'home.activationDesc': 'Ange köpmejlen och den 6-siffriga koden på klockan för att återställa åtkomsten.',
'home.activationCta': 'Aktivera nu',
'home.heroActivationSlide': 'Visa bild för köpaktivering',

// da
'home.activationEyebrow': 'Aktivér dit køb',
'home.activationTitle': 'Aktivér og få glæde af dine fordele',
'home.activationDesc': 'Indtast købsmailen og den 6-cifrede kode på uret for at gendanne adgangen.',
'home.activationCta': 'Aktivér nu',
'home.heroActivationSlide': 'Vis slide til købsaktivering',

// cs
'home.activationEyebrow': 'Aktivujte svůj nákup',
'home.activationTitle': 'Aktivujte a využívejte své výhody',
'home.activationDesc': 'Zadejte nákupní e-mail a šestimístný kód z hodinek a obnovte přístup.',
'home.activationCta': 'Aktivovat nyní',
'home.heroActivationSlide': 'Zobrazit snímek aktivace nákupu',
```

- [ ] **Step 5: Run both focused test files**

Run:

```bash
node --test tests/bundle-gated-store-entries.test.mjs tests/home-hero-premium-carousel.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Run TypeScript and production build validation**

Run:

```bash
npm run build
```

Expected: TypeScript checking and the Vite production build exit with code 0. If an unrelated pre-existing failure occurs, record the exact error separately and do not describe the full build as passing.

- [ ] **Step 7: Check formatting and scope**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` exits 0. Status includes only this feature's files plus the pre-existing user changes in `src/views/products/ProductDetail.vue` and `tests/product-gallery.test.mjs`.

- [ ] **Step 8: Commit localization and verification contracts**

```bash
git add src/i18n.ts tests/home-hero-premium-carousel.test.mjs
git commit -m "localize Store activation hero"
```

