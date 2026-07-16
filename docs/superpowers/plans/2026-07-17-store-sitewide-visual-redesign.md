# Wristo Store Sitewide Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Wristo Store 的首页、商品浏览、详情和购买链路统一为“编辑型精品商店 + 局部科技舞台”的生产级视觉体验。

**Architecture:** 保留现有 Vue/Pinia/API/路由业务边界，以 `src/style.css` 为语义设计变量源，以现有页面组件为主要改造面；只为可复用的标签解析、区块标题、骨架网格和移动详情操作栏新增聚焦单元。测试采用 Node 原生测试：纯函数走真实导入，视觉和响应式约束走源码契约，现有业务回归测试保持全量运行。

**Tech Stack:** Vue 3、TypeScript、Pinia、Element Plus、Iconify、Vite、Node `node:test`、Playwright

## Global Constraints

- 不修改后端接口、支付流程、登录流程、路由结构和核心业务规则。
- 不破坏现有多语言能力；新增用户可见文案必须进入 `src/i18n.ts`，未翻译语言继承英文回退。
- 不引入新的大型依赖或动画库。
- 优先复用现有组件、设计变量、公共样式、store 和 composable。
- 保留 `src/config/axios.ts` 当前用户未提交改动，不覆盖、不整理、不纳入本计划提交。
- 桌面端覆盖 1440px，移动端覆盖 375px；320px–430px 无横向溢出，商品网格保持两列。
- 所有触控目标不小于 44px，键盘焦点可见，并遵守 `prefers-reduced-motion`。
- 不从名称猜测 `AMOLED`、`Minimal` 等标签；只使用可靠字段或真实分类数据。
- 最终必须运行完整 `node --test tests/*.test.mjs`、`npm run build` 与 `git diff --check`。

---

### Task 1: 建立全局设计系统和可复用展示原语

**Files:**
- Modify: `src/style.css:7-191`
- Modify: `src/components/Layout.vue:1-86`
- Modify: `src/components/Footer.vue`
- Modify: `src/components/FloatingActions/FloatingActions.vue`
- Create: `src/components/storefront/SectionHeading.vue`
- Create: `src/components/storefront/ProductGridSkeleton.vue`
- Create: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: 现有 CSS 变量、Element Plus 全局类、`Layout` 的 route meta。
- Produces: `SectionHeading` props `{ kicker?: string; title: string; description?: string; headingLevel?: 1 | 2 }` 和 `action` slot；`ProductGridSkeleton` prop `{ count?: number }`；所有后续任务使用的 `--space-*`、`--page-gutter`、`--container-wide`、`--surface-*` 和统一焦点/动效变量。

- [ ] **Step 1: 写失败的视觉系统源码契约测试**

```js
// tests/storefront-visual-system.test.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('global storefront tokens define spacing, surfaces, focus and reduced motion', async () => {
  const css = await read('../src/style.css')
  for (const token of [
    '--color-stage:', '--color-rating:', '--surface-raised:', '--page-gutter:',
    '--space-section:', '--container-wide:', '--motion-fast:', '--focus-ring:',
  ]) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(css, /:focus-visible/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.el-skeleton/)
})

test('layout exposes a shared content container without forcing viewport width', async () => {
  const source = await read('../src/components/Layout.vue')
  assert.match(source, /class="layout-root"/)
  assert.match(source, /--header-height/)
  assert.doesNotMatch(source, /width:\s*100vw/)
  assert.doesNotMatch(source, /min-width:\s*100vw/)
})

test('storefront primitives expose heading and skeleton contracts', async () => {
  const heading = await read('../src/components/storefront/SectionHeading.vue')
  const skeleton = await read('../src/components/storefront/ProductGridSkeleton.vue')
  assert.match(heading, /headingLevel/)
  assert.match(heading, /name="action"/)
  assert.match(skeleton, /product-grid-skeleton/)
  assert.match(skeleton, /aria-hidden="true"/)
})
```

- [ ] **Step 2: 运行测试并确认因变量和组件缺失而失败**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: FAIL，提示 `SectionHeading.vue`/`ProductGridSkeleton.vue` 不存在或 `--color-stage` 缺失。

- [ ] **Step 3: 扩展语义设计变量和公共控件样式**

将 `src/style.css` 的 `:root` 变量收敛为以下完整语义集合，并保留现有 Element Plus 主色映射：

```css
:root {
  font-family: var(--font-body);
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light;
  color: var(--color-ink);
  background: var(--color-canvas);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --color-canvas: #f3f6f4;
  --color-surface: #fffdf9;
  --color-surface-soft: #eaf1ee;
  --color-stage: #0b1717;
  --color-stage-soft: #122625;
  --color-ink: #13201f;
  --color-muted: #60706d;
  --color-subtle: #899692;
  --color-line: rgba(19, 32, 31, 0.11);
  --color-brand: #0b746d;
  --color-brand-strong: #07534f;
  --color-brand-soft: #d8efea;
  --color-brand-hover: #08645f;
  --color-brand-active: #064b47;
  --color-rating: #c98919;
  --color-danger: #b83b3b;
  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "DM Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --surface-raised: 0 1px 0 rgba(255,255,255,.8) inset, 0 12px 32px rgba(25,48,45,.07);
  --shadow-sm: 0 1px 3px rgba(25,48,45,.07);
  --shadow-md: 0 14px 34px rgba(25,48,45,.10);
  --shadow-lg: 0 24px 56px rgba(7,35,33,.16);
  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-display: 36px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-section: clamp(56px, 7vw, 96px);
  --page-gutter: clamp(16px, 4vw, 48px);
  --container: 1200px;
  --container-wide: 1380px;
  --header-height: 72px;
  --motion-fast: 160ms;
  --motion-base: 240ms;
  --focus-ring: 0 0 0 3px rgba(11,116,109,.22);
  --el-color-primary: var(--color-brand);
  --el-color-primary-light-3: #2b928a;
  --el-color-primary-light-5: #69b3ac;
  --el-color-primary-light-7: #a6d5d0;
  --el-color-primary-light-8: #c6e5e1;
  --el-color-primary-light-9: rgba(11,116,109,.09);
  --el-color-primary-dark-2: var(--color-brand-hover);
}
```

在同文件加入 `.storefront-container`、全局 `button/a/input` 焦点环、Element Plus 输入/按钮/下拉/消息/骨架样式和 `@keyframes storefront-enter`；`prefers-reduced-motion` 中把动画和位移清零。

- [ ] **Step 4: 创建区块标题和骨架组件**

```vue
<!-- src/components/storefront/SectionHeading.vue -->
<script setup lang="ts">
withDefaults(defineProps<{
  kicker?: string
  title: string
  description?: string
  headingLevel?: 1 | 2
}>(), { kicker: '', description: '', headingLevel: 2 })
</script>

<template>
  <header class="section-heading">
    <div class="section-heading__copy">
      <p v-if="kicker" class="section-heading__kicker">{{ kicker }}</p>
      <component :is="`h${headingLevel}`" class="section-heading__title">{{ title }}</component>
      <p v-if="description" class="section-heading__description">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="section-heading__action"><slot name="action" /></div>
  </header>
</template>
```

```vue
<!-- src/components/storefront/ProductGridSkeleton.vue -->
<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
</script>

<template>
  <div class="product-grid-skeleton" aria-hidden="true">
    <div v-for="item in count" :key="item" class="product-grid-skeleton__card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="circle" class="product-grid-skeleton__image" />
          <el-skeleton-item variant="h3" class="product-grid-skeleton__title" />
          <el-skeleton-item variant="text" class="product-grid-skeleton__meta" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>
```

两个组件的 scoped CSS 使用同一响应式列数：`repeat(5, minmax(0, 1fr))`，1200px 下 4 列、900px 下 3 列、600px 下 2 列。

- [ ] **Step 5: 清理 Layout 的 viewport 强制宽度**

将 `.layout-root` 改为 `width: 100%; min-width: 0;`，`.layout-main` 改为 `min-width: 0; isolation: isolate;`，删除移动端 `100vw`/`min-width: 100vw` 和无效的通配规则，同时保留 Header、FloatingActions、Footer 和 route meta 逻辑。

Footer 改用 `.storefront-container`、细边线和一致的标题/链接焦点样式；FloatingActions 统一为 48px 圆形控件、`--surface-raised` 阴影和 Solar 图标视觉，但保留现有显隐、滚动与购物车行为。

- [ ] **Step 6: 运行视觉系统测试**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: PASS（3 tests）。

- [ ] **Step 7: 提交设计系统任务**

```bash
git add src/style.css src/components/Layout.vue src/components/Footer.vue src/components/FloatingActions/FloatingActions.vue src/components/storefront tests/storefront-visual-system.test.mjs
git commit -m "refine store visual system"
```

---

### Task 2: 商品标签解析与精品商品卡片

**Files:**
- Modify: `src/types/product.ts:25-44`
- Modify: `src/i18n.ts:1-668`
- Create: `src/utils/productBadges.ts`
- Modify: `src/components/ProductCard.vue:1-327`
- Create: `tests/product-badges.test.mjs`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: `ProductBaseVO` 的 `price/download/createdAt/categories`、bundle entitlement、当前购物车状态。
- Produces: `resolveProductBadges(product, context?): ProductBadge[]`，其中 `ProductBadge = { kind: 'free' | 'new' | 'popular' | 'style'; labelKey: string }`；ProductCard 渲染最多两个标签。

- [ ] **Step 1: 写失败的标签纯函数测试**

```js
// tests/product-badges.test.mjs
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { transformWithEsbuild } from 'vite'

const url = new URL('../src/utils/productBadges.ts', import.meta.url)
const source = await readFile(url, 'utf8')
const { code } = await transformWithEsbuild(source, url.pathname, { loader: 'ts', format: 'esm', target: 'es2020' })
const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('free takes precedence and badge output is capped at two', () => {
  assert.deepEqual(mod.resolveProductBadges({ price: 0, download: 80000 }, { popularDownloadThreshold: 50000 }), [
    { kind: 'free', labelKey: 'product.badge.free' },
    { kind: 'popular', labelKey: 'product.badge.popular' },
  ])
})

test('new appears only when createdAt is reliable and within 30 days', () => {
  const now = new Date('2026-07-17T00:00:00Z')
  assert.deepEqual(mod.resolveProductBadges({ price: 2.99, createdAt: '2026-07-01T00:00:00Z' }, { now }), [
    { kind: 'new', labelKey: 'product.badge.new' },
  ])
  assert.deepEqual(mod.resolveProductBadges({ price: 2.99 }, { now }), [])
})

test('style badges require explicit category slugs and never inspect product names', () => {
  assert.deepEqual(mod.resolveProductBadges({ name: 'AMOLED Minimal', price: 1.99 }), [])
  assert.deepEqual(mod.resolveProductBadges({ price: 1.99, categories: [{ slug: 'amoled' }] }), [
    { kind: 'style', labelKey: 'product.badge.amoled' },
  ])
})
```

- [ ] **Step 2: 运行测试并确认因工具缺失而失败**

Run: `node --test tests/product-badges.test.mjs`

Expected: FAIL with `ENOENT ... src/utils/productBadges.ts`。

- [ ] **Step 3: 扩展基础产品类型并实现解析器**

在 `ProductBaseVO` 增加可选字段：

```ts
createdAt?: string | null
categories?: CategoryVO[] | null
```

创建解析器：

```ts
export type ProductBadge = {
  kind: 'free' | 'new' | 'popular' | 'style'
  labelKey: string
}

type BadgeProduct = {
  price?: number | null
  download?: number | null
  createdAt?: string | null
  categories?: Array<{ slug?: string | null }> | null
}

type BadgeContext = {
  now?: Date
  popularDownloadThreshold?: number
}

export const resolveProductBadges = (product: BadgeProduct, context: BadgeContext = {}): ProductBadge[] => {
  const badges: ProductBadge[] = []
  if (Number(product.price ?? 0) <= 0) badges.push({ kind: 'free', labelKey: 'product.badge.free' })
  const createdAt = product.createdAt ? new Date(product.createdAt) : null
  const now = context.now ?? new Date()
  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const age = now.getTime() - createdAt.getTime()
    if (age >= 0 && age <= 30 * 24 * 60 * 60 * 1000) badges.push({ kind: 'new', labelKey: 'product.badge.new' })
  }
  if (Number(product.download ?? 0) >= (context.popularDownloadThreshold ?? 50000)) {
    badges.push({ kind: 'popular', labelKey: 'product.badge.popular' })
  }
  const slugs = new Set((product.categories ?? []).map((item) => item.slug?.trim().toLowerCase()).filter(Boolean))
  if (slugs.has('amoled')) badges.push({ kind: 'style', labelKey: 'product.badge.amoled' })
  else if (slugs.has('minimal')) badges.push({ kind: 'style', labelKey: 'product.badge.minimal' })
  return badges.slice(0, 2)
}
```

- [ ] **Step 4: 运行标签测试确认通过**

Run: `node --test tests/product-badges.test.mjs`

Expected: PASS（3 tests）。

- [ ] **Step 5: 为卡片增加可靠标签、统一图标和无障碍名称**

在 `ProductCard.vue` 引入 `resolveProductBadges`，创建：

```ts
const productBadges = computed(() => resolveProductBadges(props.product))
const productAriaLabel = computed(() => `${props.product?.name || ''}, ${formattedPrice.value}`)
const formattedPrice = computed(() => Number(props.product?.price || 0) <= 0
  ? t('product.badge.free')
  : `$${Number(props.product?.price || 0).toFixed(2)}`)
```

模板中给 `article` 增加 `:aria-label="productAriaLabel"`，在图片上方渲染：

```vue
<div v-if="productBadges.length" class="product-badges" :aria-label="t('product.labelsAria')">
  <span v-for="badge in productBadges" :key="badge.labelKey" class="product-badge" :class="`is-${badge.kind}`">
    {{ t(badge.labelKey) }}
  </span>
</div>
```

价格改用 `{{ formattedPrice }}`；购物车 title/aria-label 改用现有 `cart.addToCart`、`cart.removeFromCart` key；下载、评分和购物车图标统一为 Solar Iconify。卡片 CSS 改为低阴影编辑卡、圆形深浅舞台、44px 购物车按钮、tabular 数字和 600px 下两列友好间距。

- [ ] **Step 6: 增加标签文案并依赖现有回退机制**

在英文 `en` 增加：

```ts
'product.badge.free': 'Free',
'product.badge.new': 'New',
'product.badge.popular': 'Popular',
'product.badge.amoled': 'AMOLED',
'product.badge.minimal': 'Minimal',
'product.labelsAria': 'Product labels',
```

在 `zh` 覆盖 `免费 / 新品 / 热门 / AMOLED / 极简 / 商品标签`；其他语言通过已有 `...en` 得到可读英文，不显示 message key。

- [ ] **Step 7: 扩展源码契约并运行两组测试**

向 `tests/storefront-visual-system.test.mjs` 增加断言：ProductCard 含 `product-badges`、`aria-label`、`@keydown.enter`、`@keydown.space`、`min-width: 44px` 或 `width: 44px`，以及移动端媒体查询。

Run: `node --test tests/product-badges.test.mjs tests/storefront-visual-system.test.mjs`

Expected: PASS。

- [ ] **Step 8: 提交商品卡片任务**

```bash
git add src/types/product.ts src/i18n.ts src/utils/productBadges.ts src/components/ProductCard.vue tests/product-badges.test.mjs tests/storefront-visual-system.test.mjs
git commit -m "refine storefront product cards"
```

---

### Task 3: 重组首页为编辑型作品库

**Files:**
- Modify: `src/views/home/Home.vue`
- Modify: `src/views/home/components/HomeBanner.vue`
- Modify: `src/views/home/components/SearchSection.vue`
- Modify: `src/views/home/components/NewArrivalsCarousel.vue`
- Modify: `src/views/home/components/SeriesSection.vue`
- Modify: `src/views/brands/BrandsSection.vue`
- Modify: `src/views/home/components/FeatureSection.vue`
- Modify: `src/views/home/components/HotProductsSection.vue`
- Modify: `src/components/SeriesCard.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: `getHotSeries(10)`、`getHotProducts()`、`getNewProducts(30)` 和现有首页事件。
- Produces: 保持同样路由跳转的首页叙事顺序，区块共享 `SectionHeading`，现有失败隔离继续有效。

- [ ] **Step 1: 写失败的首页结构契约**

追加测试：读取 `Home.vue` 和首页组件，断言顺序为 `HomeBanner` → `SearchSection` → `NewArrivalsCarousel` → `SeriesSection` → `BrandsSection` → `HotProductsSection` → `PremiumSuiteCard`；断言 `HomeBanner` 含 `banner-stage`、一个 `banner-primary`、轮播 pause/resume 和 `prefers-reduced-motion`；断言各内容区至少五处使用 `SectionHeading`。

- [ ] **Step 2: 运行契约并确认因新结构标记缺失而失败**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: FAIL with missing `banner-stage`/`SectionHeading`。

- [ ] **Step 3: 收敛首页数据状态并保持失败隔离**

在 `Home.vue` 增加 `loading` 和按区块错误状态：

```ts
const loading = ref(true)
const sectionErrors = ref({ series: false, hot: false, newest: false })

onMounted(async () => {
  const [series, hot, newest] = await Promise.allSettled([
    productStore.getHotSeries(10), productStore.getHotProducts(), productStore.getNewProducts(30),
  ])
  if (series.status === 'fulfilled') seriesList.value = series.value
  else sectionErrors.value.series = true
  if (hot.status === 'fulfilled') hotProducts.value = hot.value
  else sectionErrors.value.hot = true
  if (newest.status === 'fulfilled') newProducts.value = newest.value
  else sectionErrors.value.newest = true
  loading.value = false
})
```

把对应 `loading/error` props 传入区块；失败区块显示小型可读状态，其余区块照常展示。

- [ ] **Step 4: 将 Banner 改为编辑文案 + 深色作品舞台**

保留 slides 数组、CTA 回调、暂停和轮播计时；模板把右侧视觉包裹为：

```vue
<div class="banner-stage" aria-hidden="true">
  <span class="banner-stage__index">0{{ activeSlideIndex + 1 }}</span>
  <div class="banner-stage__halo"></div>
  <img :src="activeSlide.imageSrc" alt="" loading="eager" />
  <div class="banner-stage__caption">
    <span>{{ t(activeSlide.artTopKey) }}</span>
    <strong>{{ t(activeSlide.artBottomKey) }}</strong>
  </div>
</div>
```

桌面 Banner 采用 `minmax(0, 1.05fr) minmax(360px, .95fr)`，舞台为深墨绿；900px 下单列且舞台不高于 420px；主 CTA 为唯一实心按钮，另外两个为描边/文字按钮。

- [ ] **Step 5: 统一首页内容区标题、卡片与节奏**

在新品、系列、品牌、热门中引入 `SectionHeading`，保留现有事件和数据 props；新品保持横向浏览，热门使用统一 ProductCard 网格；系列卡通过 `:style="{ '--series-accent': resolveSeriesAccent(series.slug) }"` 使用稳定主题色映射，不改变路由。FeatureSection 改为静态编辑说明带，不与商品 CTA 争夺主层级。

- [ ] **Step 6: 补齐首页文案 key**

只新增区块短标签和失败状态 key：`home.newKicker`、`home.seriesKicker`、`home.brandsKicker`、`home.hotKicker`、`home.sectionUnavailable`；英文提供完整文案，中文覆盖，其余语言沿用英文回退。

- [ ] **Step 7: 运行首页契约和完整现有测试**

Run: `node --test tests/storefront-visual-system.test.mjs tests/product-gallery-component.test.mjs`

Expected: PASS。

- [ ] **Step 8: 提交首页任务**

```bash
git add src/views/home src/views/brands/BrandsSection.vue src/components/SeriesCard.vue src/i18n.ts tests/storefront-visual-system.test.mjs
git commit -m "reshape store home as design gallery"
```

---

### Task 4: 收敛桌面导航和移动端核心入口

**Files:**
- Modify: `src/components/Header.vue`
- Modify: `src/components/LanguageSwitcher.vue`
- Modify: `src/components/DeviceDisplay.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: Header 现有系列加载、设备选择、账户命令、购物车 store、locale store 和 SSO 方法。
- Produces: 桌面紧凑导航；移动端固定的 Logo/Search/Cart/Menu 四入口；所有现有命令和下拉内容保持。

- [ ] **Step 1: 写失败的 Header 结构契约**

追加测试断言：Header 模板含 `header-search-link`、`header-cart-link` 不受 `cartStore.count` 的 `v-if` 控制、移动端含 `mobile-search-link` 和 `mobile-cart-link`、按钮均有 aria-label；CSS 含 `position: sticky`、`--header-height`、`min-height: 44px`、`backdrop-filter`，900px 下隐藏 desktop nav 并显示 mobile controls。

- [ ] **Step 2: 运行契约并确认购物车入口/搜索入口条件失败**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: FAIL，指出 `header-search-link` 或稳定购物车入口缺失。

- [ ] **Step 3: 重排 Header 模板但不改变命令方法**

桌面结构固定为：Logo → nav → search → device → language → cart → account。新增搜索链接：

```vue
<router-link :to="localizedPath('/search')" class="header-search-link" :aria-label="t('nav.search')">
  <Icon icon="solar:magnifer-linear" width="20" height="20" aria-hidden="true" />
  <span>{{ t('nav.search') }}</span>
</router-link>
```

把购物车 `v-if="isCartEnabled && cartStore.count"` 改为 `v-if="isCartEnabled"`，仅数量徽标使用 `v-if="cartStore.count"`。移动端在 Logo 后加入 search/cart 按钮，菜单按钮保留原 toggle 行为。

- [ ] **Step 4: 精简 Header CSS 并保留弹层样式**

Header 设 `position: sticky; top: 0; min-height: var(--header-height); border-bottom: 1px solid var(--color-line); background: rgba(255,253,249,.88); backdrop-filter: blur(18px);`。桌面导航 gap 18px，按钮高度 44px；900px 以下隐藏 desktop nav/device/user，显示四个核心入口；mobile nav 从 Header 下方展开，最大高度使用 `calc(100dvh - var(--header-height))` 并可滚动。

- [ ] **Step 5: 统一设备和语言触发器**

只修改触发器尺寸、边框、focus-visible 和图标大小，不改变 DeviceDisplay emit、localStorage 或 LanguageSwitcher locale 切换逻辑。

- [ ] **Step 6: 增加导航搜索文案并运行测试**

英文加 `'nav.search': 'Search'`，中文覆盖 `'搜索'`，其他语言回退英文。

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: PASS。

- [ ] **Step 7: 提交导航任务**

```bash
git add src/components/Header.vue src/components/LanguageSwitcher.vue src/components/DeviceDisplay.vue src/i18n.ts tests/storefront-visual-system.test.mjs
git commit -m "refine store navigation experience"
```

---

### Task 5: 统一分类、搜索和热门列表的浏览状态

**Files:**
- Modify: `src/views/products/Categories.vue`
- Modify: `src/views/search/SearchView.vue`
- Modify: `src/views/shop/TopApps.vue`
- Modify: `src/views/home/components/SearchResultsSection.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: 现有分类分页、管理员分类管理、搜索分页/无限加载、TopApps 数据。
- Produces: 统一 `.storefront-product-grid`、ProductGridSkeleton、SectionHeading、状态卡和列表断点；不新增请求参数。

- [ ] **Step 1: 写失败的列表状态契约**

追加测试断言四个列表文件使用 `storefront-product-grid`；Categories 的初次加载使用 `ProductGridSkeleton`，后续加载保留 footer；空状态包含可执行按钮；Categories 的筛选按钮保留 `aria-pressed`；CSS 断点包含 5/4/3/2 列；搜索现有分页和无限加载标记仍存在。

- [ ] **Step 2: 运行测试确认统一网格和骨架缺失**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: FAIL with missing `storefront-product-grid`/`ProductGridSkeleton`。

- [ ] **Step 3: 改造分类页结构和状态**

保留 admin panel、filterOptions、sortOptions、分页与事件。分类 hero 增加结果数量，发现面板改为紧凑工具栏。初次加载判断使用 `loading && products.length === 0`，渲染 `<ProductGridSkeleton :count="10" />`；有数据时使用统一网格；加载更多只显示底部状态；空结果按钮清筛选或返回首页。

增加可见错误状态并提供真实重试动作：

```ts
const loadError = ref(false)

const fetchSeriesAndProducts = async (reset = true) => {
  loadError.value = false
  if (reset) {
    products.value = []
    adminMetricsMap.value = new Map()
    currentPage.value = 1
    hasMore.value = true
  }
  loading.value = true
  try {
    const slug = route.params.slug as string
    const allSeries = await productStore.getSeries()
    series.value = allSeries.find((item: Series) => item.slug === slug) || null
    if (!series.value) {
      products.value = []
      hasMore.value = false
      return
    }
    const response = await getProductsByCategory(slug, currentPage.value, pageSize, selectedOrderBy.value)
    products.value = reset ? (response.list || []) : [...products.value, ...(response.list || [])]
    await fetchAdminMetrics()
    applyCategorySeo()
    hasMore.value = (response.list?.length || 0) === pageSize
  } catch (error) {
    loadError.value = true
    console.error('Failed to fetch products:', error)
    if (reset) products.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}
```

模板在没有商品且 `loadError` 时显示 `role="alert"` 的状态卡和 `@click="fetchSeriesAndProducts(true)"` 重试按钮。

系列强调色使用纯函数：

```ts
const categoryAccent = computed(() => {
  const palette = ['#0b746d', '#805b38', '#315f78', '#775b70']
  const slug = String(series.value?.slug || '')
  const index = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length
  return palette[index]
})
```

绑定 `:style="{ '--category-accent': categoryAccent }"`，仅影响 hero/标签，不影响主按钮。

- [ ] **Step 4: 统一搜索与 Top Apps 网格**

SearchView 保留 SearchSection、popular searches、分页和无限加载，只用 ProductGridSkeleton 替代手写骨架，并用 SectionHeading 重排结果标题。SearchResultsSection 和 TopApps 的 ProductCard 容器改用 `.storefront-product-grid`。错误、空和末尾状态统一为 `role="status"` 或 `role="alert"`。把这些公开页面的 `mdi:*` 图标替换为语义相同的 `solar:*` 线性或双色图标，使其与 Header、首页和商品卡一致。

- [ ] **Step 5: 将分类用户文案纳入 i18n**

新增 `category.collection`、`category.filtersAria`、`category.sort`、`category.sortAria`、`category.loading`、`category.end`、`category.empty`、`category.noMatches`、`category.clearFilter`、`category.results`、`category.error`、`category.retry`；英文和中文覆盖。管理员中文文案保持管理员内部现状，不纳入本轮公开多语言改造。

- [ ] **Step 6: 运行列表契约与标签测试**

Run: `node --test tests/storefront-visual-system.test.mjs tests/product-badges.test.mjs`

Expected: PASS。

- [ ] **Step 7: 提交列表任务**

```bash
git add src/views/products/Categories.vue src/views/search/SearchView.vue src/views/shop/TopApps.vue src/views/home/components/SearchResultsSection.vue src/i18n.ts tests/storefront-visual-system.test.mjs
git commit -m "unify store browsing surfaces"
```

---

### Task 6: 商品详情 sticky 购买面板与移动底部操作栏

**Files:**
- Create: `src/components/storefront/MobileProductActionBar.vue`
- Modify: `src/views/products/ProductDetail.vue`
- Modify: `src/components/ProductImageGallery.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/product-gallery.test.mjs`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: ProductDetail 已计算的购买/下载/激活状态和现有 handler；ProductImageGallery 现有 props/emits 不变。
- Produces: `MobileProductActionBar` props `{ visible: boolean; priceLabel: string; primaryLabel: string; primaryDisabled?: boolean; secondaryLabel?: string }`，emits `primary`、`secondary`；不自行判断 entitlement 或调用 API。

- [ ] **Step 1: 写失败的详情布局与移动栏契约**

追加测试断言 ProductDetail 含 `product-purchase-panel`、`position: sticky`、`top: calc(var(--header-height)`、`MobileProductActionBar`、`safe-area-inset-bottom`、为底栏预留的 mobile padding；断言 ProductImageGallery 现有 `contain`、动态 backdrop、键盘与缩略图标记仍存在。

- [ ] **Step 2: 运行详情测试确认移动栏缺失**

Run: `node --test tests/storefront-visual-system.test.mjs tests/product-gallery.test.mjs tests/product-gallery-component.test.mjs`

Expected: 视觉契约 FAIL；既有 gallery tests PASS。

- [ ] **Step 3: 创建无业务判断的移动操作栏**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
  priceLabel: string
  primaryLabel: string
  primaryDisabled?: boolean
  secondaryLabel?: string
}>(), { primaryDisabled: false, secondaryLabel: '' })
defineEmits<{ (event: 'primary'): void; (event: 'secondary'): void }>()
</script>

<template>
  <div v-if="visible" class="mobile-product-action-bar" role="region" :aria-label="primaryLabel">
    <div class="mobile-product-action-bar__price">{{ priceLabel }}</div>
    <button v-if="secondaryLabel" type="button" class="mobile-product-action-bar__secondary" @click="$emit('secondary')">
      {{ secondaryLabel }}
    </button>
    <button type="button" class="mobile-product-action-bar__primary" :disabled="primaryDisabled" @click="$emit('primary')">
      {{ primaryLabel }}
    </button>
  </div>
</template>
```

CSS：桌面 `display:none`；900px 下 `position:fixed; z-index:40; bottom:0; padding-bottom:calc(12px + env(safe-area-inset-bottom));`，按钮至少 48px。

- [ ] **Step 4: 重组 ProductDetail 两栏但复用全部 handler**

把右侧现有标题、评分、价格、按钮、摘要、安装和设备区分为：`product-purchase-panel`（sticky 信息/CTA）、`product-detail-sections`（描述/安装/设备）。不改变 `buyProduct`、`toggleCart`、`handleDownload`、`goToAlreadyPurchased`、管理员面板、route loader 或 share image management。

新增由现有状态派生的展示 computed：

```ts
const mobilePrimaryLabel = computed(() => hasBundleEntitlement.value
  ? t('product.websiteOption')
  : t('product.buyNow'))
const mobileSecondaryLabel = computed(() => isCartEnabled && !hasBundleEntitlement.value
  ? (isInCart.value ? t('cart.goToCart') : t('product.addToCart'))
  : '')
const mobilePrimaryAction = () => hasBundleEntitlement.value ? handleDownload() : handleBuyNow()
const mobileActionVisible = computed(() => Boolean(product.value?.appId))
```

底栏 secondary 使用 `mobileSecondaryLabel`，仅在购物车功能开启且可购买时绑定现有 `toggleCart`。

- [ ] **Step 5: 增强兼容性和更新时间信息层级**

用现有 `product.devices`、`product.updatedAt` 和当前设备状态渲染信息组；日期使用现有 locale 格式，不改变原始字段。没有相关数据时不显示占位假信息。相关推荐只在当前文件已获取到真实同系列/推荐列表时渲染，否则本轮不增加接口调用。

- [ ] **Step 6: 保持画廊行为，仅调整舞台和缩略片视觉**

ProductImageGallery 只改 CSS：舞台改为 `--color-stage`，保留前景 `object-fit: contain`、背景 pseudo layer、fullscreen、swipe、键盘、管理按钮和图片失败隔离。现有 gallery tests 必须不改断言语义。

- [ ] **Step 7: 运行详情与画廊测试**

Run: `node --test tests/storefront-visual-system.test.mjs tests/product-gallery.test.mjs tests/product-gallery-component.test.mjs tests/latest-route-product-load.test.mjs`

Expected: PASS。

- [ ] **Step 8: 提交详情任务**

```bash
git add src/components/storefront/MobileProductActionBar.vue src/views/products/ProductDetail.vue src/components/ProductImageGallery.vue src/i18n.ts tests/product-gallery.test.mjs tests/storefront-visual-system.test.mjs
git commit -m "refine product detail purchase experience"
```

---

### Task 7: 统一购物车、支付和激活页面的交易视觉

**Files:**
- Modify: `src/views/user-center/CartList.vue`
- Modify: `src/views/user-center/CartListPage.vue`
- Modify: `src/views/shop/PurchaseOptions.vue`
- Modify: `src/views/shop/Checkout.vue`
- Modify: `src/views/shop/AlreadyPurchased.vue`
- Modify: `src/views/shop/Success.vue`
- Modify: `src/components/PurchaseCard.vue`
- Modify: `src/i18n.ts`
- Modify: `tests/storefront-visual-system.test.mjs`

**Interfaces:**
- Consumes: 现有购物车折扣/刷新/购买冲突/Paddle checkout、激活 API、成功页 query/session 数据。
- Produces: 同一交易页面壳、商品摘要、唯一主 CTA、稳定错误/成功状态；业务函数和参数不变。

- [ ] **Step 1: 写失败的交易页面契约**

追加测试读取六个页面，断言存在统一 `commerce-page`、`commerce-panel`、`commerce-primary-action` 类；CartList 仍含 `checkCartPurchases`、`checkout(items, email` 和 inline checkout frame；Checkout 仍含 email validation/Paddle handler；AlreadyPurchased 仍含 `@submit.prevent="handleActivation"`；所有表单错误有 `role="alert"`，主按钮有 disabled/aria-busy。

- [ ] **Step 2: 运行契约并确认统一类缺失**

Run: `node --test tests/storefront-visual-system.test.mjs`

Expected: FAIL with missing `commerce-page`/`commerce-primary-action`，业务标记断言仍通过。

- [ ] **Step 3: 改造购物车为编辑式商品摘要 + sticky 结算面板**

CartList 保留所有 computed/watch/checkout 方法，只重排模板类名。桌面使用 `minmax(0,1fr) minmax(340px,420px)`；结算面板 `position: sticky; top: calc(var(--header-height) + 24px)`；移动端单列且 checkout 按钮 100% 宽。商品图保持圆形，购买冲突使用可见 warning，不改移除逻辑。

- [ ] **Step 4: 统一 PurchaseOptions、PurchaseCard 和 Checkout**

PurchaseOptions 使用统一页面标题和方案网格；PurchaseCard 保留价格、bundle/product 选择和事件，只收敛圆角、边线、特性列表与主按钮。Checkout 保留 email lock、Paddle、bundle/item 分支和 loading，右侧支付面板成为唯一高强调区域；不改变 query 解析或 checkout 参数。

- [ ] **Step 5: 统一激活与成功页，并把硬编码公开文案迁入 i18n**

AlreadyPurchased 的标题、说明、label、help、同步提示、按钮文案迁移为 `activation.*` key；Success 的 eyebrow、summary、next step、account benefit 和 aria 文案迁移为 `paymentSuccess.*` key。英文完整，中文覆盖，其他语言回退英文。表单字段 id、验证、submit 和 API 调用不变。

- [ ] **Step 6: 运行交易契约与全量 Node 测试**

Run: `node --test tests/*.test.mjs`

Expected: PASS，0 failures。

- [ ] **Step 7: 提交交易页面任务**

```bash
git add src/views/user-center/CartList.vue src/views/user-center/CartListPage.vue src/views/shop/PurchaseOptions.vue src/views/shop/Checkout.vue src/views/shop/AlreadyPurchased.vue src/views/shop/Success.vue src/components/PurchaseCard.vue src/i18n.ts tests/storefront-visual-system.test.mjs
git commit -m "unify store purchase journey"
```

---

### Task 8: 全站验收、构建和完成审计

**Files:**
- Modify only if verification exposes a defect: files already listed in Tasks 1–7
- Do not modify: `src/config/axios.ts`

**Interfaces:**
- Consumes: Tasks 1–7 的最终工作树。
- Produces: 可复核的测试、构建、响应式截图和逐要求完成证据。

- [ ] **Step 1: 运行完整 Node 测试**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS，0 failures；记录实际 test count。

- [ ] **Step 2: 运行生产构建和 SEO 预渲染**

Run: `npm run build`

Expected: `vue-tsc -b`、Vite production build 和 `scripts/prerender-seo.mjs` 均 exit 0。

- [ ] **Step 3: 启动本地预览并进行桌面/移动浏览器验收**

Run: `npm run dev -- --host 127.0.0.1 --port 5173`

用 Playwright 在 1440×1000 与 375×812 检查 `/` 和 `/search`；从首页实际渲染的第一个系列链接进入分类页，从第一个商品卡进入详情页，再直接检查 `/user/cart`、`/purchase-options`、`/checkout`。保存首页、分类、详情、购物车和购买选项截图到 `/tmp/wristo-store-visual-verification/`；检查控制台错误、横向溢出、sticky 遮挡和移动底栏安全区。

- [ ] **Step 4: 做键盘和 reduced-motion 验收**

使用 Tab/Shift+Tab/Enter/Space 检查 Header、ProductCard、筛选、详情 CTA 和购物车按钮。Playwright context 设置 `reducedMotion: 'reduce'`，确认无持续动画且功能不受影响。

- [ ] **Step 5: 做业务边界静态审计**

Run:

```bash
git diff 0c6a8ae..HEAD -- src/api src/router src/config/axios.ts
git diff --check
git status --short
```

Expected: `src/api`、`src/router` 和 `src/config/axios.ts` 没有由本计划产生的 diff；`git diff --check` 无输出；status 中原有 `src/config/axios.ts` 修改仍保留且未被提交。

- [ ] **Step 6: 按规格逐项核验交付范围**

逐项在当前源码、测试结果和截图中确认：全局视觉、首页、商品卡、分类/搜索列表、详情 sticky、移动底栏、Header/移动导航、动效/reduced-motion、多语言、购物车与购买流程、桌面/移动无溢出。不以单一 build 结果替代视觉或业务边界证据。

- [ ] **Step 7: 修复验收发现的问题并重新运行受影响测试与完整构建**

任何缺陷先写能复现的失败测试；修复后运行该测试、`node --test tests/*.test.mjs`、`npm run build` 和 `git diff --check`。只有所有命令 fresh exit 0 后才能报告完成。

- [ ] **Step 8: 提交最终验收修复（仅在 Step 7 有修改时）**

```bash
git add src/style.css src/i18n.ts src/types/product.ts src/utils/productBadges.ts \
  src/components/Layout.vue src/components/Header.vue src/components/LanguageSwitcher.vue \
  src/components/DeviceDisplay.vue src/components/Footer.vue src/components/FloatingActions/FloatingActions.vue \
  src/components/ProductCard.vue src/components/SeriesCard.vue \
  src/components/ProductImageGallery.vue src/components/PurchaseCard.vue src/components/storefront \
  src/views/home src/views/brands/BrandsSection.vue src/views/products/Categories.vue \
  src/views/products/ProductDetail.vue src/views/search/SearchView.vue src/views/shop/TopApps.vue \
  src/views/shop/PurchaseOptions.vue src/views/shop/Checkout.vue src/views/shop/AlreadyPurchased.vue \
  src/views/shop/Success.vue src/views/user-center/CartList.vue src/views/user-center/CartListPage.vue \
  tests/storefront-visual-system.test.mjs tests/product-badges.test.mjs tests/product-gallery.test.mjs
git commit -m "polish store responsive experience"
```

不要暂存 `src/config/axios.ts`。
