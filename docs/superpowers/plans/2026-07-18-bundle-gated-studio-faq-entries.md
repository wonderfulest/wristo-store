# Bundle-Gated Studio and FAQ Entries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Wristo Store 中所有普通 Studio 与 FAQ 入口仅对 bundle 用户显示，同时保留管理员商品面板的 Studio 工具和所有现有直达路由。

**Architecture:** 复用 `userInfo.userProfile.hasBundle` 的既有语义，在 `entitlements.ts` 中增加面向商城入口的共享策略函数。各 Vue 页面只通过响应式计算属性消费该策略；首页轮播通过过滤后的 slide 集合工作，其他页面只在现有入口节点上增加条件渲染。

**Tech Stack:** Vue 3 Composition API、TypeScript、Pinia、Node.js `node:test`、Vite、vue-tsc

---

## 文件结构

- `src/utils/entitlements.ts`：bundle、订阅和商城入口权限的唯一共享判定层。
- `tests/entitlements.test.mjs`：直接验证共享入口权限的真实输入输出。
- `tests/bundle-gated-store-entries.test.mjs`：锁定各商城入口必须消费共享权限，且管理员面板不被 bundle 条件污染。
- `src/components/Header.vue`：桌面/移动导航及用户菜单的 Studio、FAQ、Membership 入口。
- `src/views/home/components/HomeBanner.vue`：基于 bundle 权限过滤 Studio Banner。
- `src/views/search/SearchView.vue`：搜索无结果时的 Studio CTA。
- `src/views/products/ProductDetail.vue`：商品详情的 Customize in Studio CTA。
- `src/views/user-center/UserProfile.vue`：个人中心 Studio 区块。
- `src/components/ProductAdminPanel.vue`：不修改，仅由测试确认管理员入口保持独立。

### Task 1: 建立共享的 bundle 入口权限策略

**Files:**
- Modify: `tests/entitlements.test.mjs`
- Modify: `src/utils/entitlements.ts`

- [ ] **Step 1: 写入失败测试**

在 `tests/entitlements.test.mjs` 的 import 中加入 `hasBundleStoreEntryAccess`，并增加以下测试：

```js
test('Store Studio and FAQ entries require an active bundle specifically', () => {
  const bundleUser = { userProfile: { hasBundle: 1 } }
  const subscriptionOnlyUser = {
    subscription: { endTime: '2026-08-18T00:00:00.000Z' },
    userProfile: { hasBundle: 0 },
  }

  assert.equal(hasBundleStoreEntryAccess(bundleUser), true)
  assert.equal(hasBundleStoreEntryAccess(subscriptionOnlyUser), false)
  assert.equal(hasBundleStoreEntryAccess({ userProfile: { hasBundle: 0 } }), false)
  assert.equal(hasBundleStoreEntryAccess(null), false)
})
```

- [ ] **Step 2: 运行测试并确认因缺少导出而失败**

Run: `node --test tests/entitlements.test.mjs`

Expected: FAIL，错误指出 `src/utils/entitlements.ts` 未导出 `hasBundleStoreEntryAccess`。

- [ ] **Step 3: 实现最小共享策略**

在 `src/utils/entitlements.ts` 的 `hasActiveBundle` 之后加入：

```ts
export const hasBundleStoreEntryAccess = (userInfo?: UserInfo | null) => {
  return hasActiveBundle(userInfo)
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `node --test tests/entitlements.test.mjs`

Expected: PASS，新增入口权限测试与现有 entitlement 测试均通过。

- [ ] **Step 5: 提交共享策略**

```bash
git add src/utils/entitlements.ts tests/entitlements.test.mjs
git commit -m "gate Store creator entries by bundle"
```

### Task 2: 限制 Header 与首页 Studio Banner

**Files:**
- Create: `tests/bundle-gated-store-entries.test.mjs`
- Modify: `src/components/Header.vue`
- Modify: `src/views/home/components/HomeBanner.vue`

- [ ] **Step 1: 写入 Header 与首页的失败约束测试**

创建 `tests/bundle-gated-store-entries.test.mjs`：

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Header gates desktop and mobile Studio, FAQ, and membership entry groups', async () => {
  const source = await readSource('../src/components/Header.vue')

  assert.match(source, /hasBundleStoreEntryAccess/)
  assert.match(source, /const canShowBundleEntries = computed/)
  assert.match(source, /v-if="canShowBundleEntries"[^>]*@click="openStudio"/)
  assert.match(source, /v-if="canShowBundleEntries"[^>]*:to="faqPath"/)
  assert.match(source, /<div v-if="canShowBundleEntries" class="user-dropdown-section">/)
  assert.match(source, /v-if="canShowBundleEntries" class="mobile-action-btn"[^>]*'studio'/)
  assert.match(source, /v-if="canShowBundleEntries" class="mobile-action-btn"[^>]*'membership'/)
})

test('Home banner excludes the Studio slide without bundle entry access', async () => {
  const source = await readSource('../src/views/home/components/HomeBanner.vue')

  assert.match(source, /hasBundleStoreEntryAccess/)
  assert.match(source, /requiresBundle\?: boolean/)
  assert.match(source, /id: 'studio',[\s\S]*?requiresBundle: true/)
  assert.match(source, /const visibleSlides = computed/)
  assert.match(source, /v-for="\(slide, index\) in visibleSlides"/)
  assert.match(source, /visibleSlides\.value\.length/)
})
```

- [ ] **Step 2: 运行约束测试并确认入口尚未受控**

Run: `node --test tests/bundle-gated-store-entries.test.mjs`

Expected: FAIL，Header 缺少 `canShowBundleEntries`，HomeBanner 仍直接遍历 `slides`。

- [ ] **Step 3: 修改 Header 的共享可见性计算**

将 entitlement import 改为：

```ts
import {
  hasBundleStoreEntryAccess,
  hasPremiumEntitlement,
} from '@/utils/entitlements';
```

在 `hasPremiumAccess` 附近加入：

```ts
const canShowBundleEntries = computed(() => {
  return hasBundleStoreEntryAccess(userStore.userInfo)
})
```

模板中执行以下精确条件控制：

```vue
<button v-if="canShowBundleEntries" type="button" class="nav-link nav-button" @click="openStudio">
  {{ t('nav.studio') }}
</button>
<router-link v-if="canShowBundleEntries" :to="faqPath" class="nav-link">
  {{ t('nav.faq') }}
</router-link>
```

移动导航中的 Studio button 与 FAQ router-link 同样增加 `v-if="canShowBundleEntries"`。桌面用户菜单将包含 Membership 和 Studio 的整个 `user-dropdown-section` 改为：

```vue
<div v-if="canShowBundleEntries" class="user-dropdown-section">
```

移动用户操作区中的两个按钮分别改为：

```vue
<button v-if="canShowBundleEntries" class="mobile-action-btn" @click="handleUserMenuCommand('studio'); closeMobileMenu()">
```

```vue
<button v-if="canShowBundleEntries" class="mobile-action-btn" @click="handleUserMenuCommand('membership'); closeMobileMenu()">
```

- [ ] **Step 4: 修改首页轮播，使可见 slide 集合响应 bundle 状态**

在 `HomeBanner.vue` 引入：

```ts
import { useUserStore } from '@/store/user'
import { hasBundleStoreEntryAccess } from '@/utils/entitlements'
```

初始化 store：

```ts
const userStore = useUserStore()
```

在 `HeroSlide` 类型中增加：

```ts
requiresBundle?: boolean
```

把 `slides` 重命名为 `allSlides`，并在 Studio slide 的 `id` 后加入：

```ts
requiresBundle: true,
```

用以下计算替换直接读取 `slides` 的逻辑：

```ts
const canShowBundleEntries = computed(() => {
  return hasBundleStoreEntryAccess(userStore.userInfo)
})

const visibleSlides = computed(() => {
  return allSlides.filter((slide) => !slide.requiresBundle || canShowBundleEntries.value)
})

const activeSlide = computed(() => {
  return visibleSlides.value[activeSlideIndex.value] || visibleSlides.value[0]
})
```

模板 carousel 的 `v-for` 改为遍历 `visibleSlides`，轮播步进改为：

```ts
const nextSlide = () => {
  activeSlideIndex.value = (activeSlideIndex.value + 1) % visibleSlides.value.length
}
```

由于 Store slide 永远存在，`visibleSlides.value.length` 不会为零；`activeSlide` 的回退保证 bundle 状态变化时不会渲染空 slide。

- [ ] **Step 5: 运行测试并确认通过**

Run: `node --test tests/entitlements.test.mjs tests/bundle-gated-store-entries.test.mjs`

Expected: PASS，Header 和 HomeBanner 的新约束全部通过。

- [ ] **Step 6: 提交 Header 与首页入口控制**

```bash
git add tests/bundle-gated-store-entries.test.mjs src/components/Header.vue src/views/home/components/HomeBanner.vue
git commit -m "hide Store Studio navigation without bundle"
```

### Task 3: 限制搜索、商品详情和个人中心入口

**Files:**
- Modify: `tests/bundle-gated-store-entries.test.mjs`
- Modify: `src/views/search/SearchView.vue`
- Modify: `src/views/products/ProductDetail.vue`
- Modify: `src/views/user-center/UserProfile.vue`
- Verify only: `src/components/ProductAdminPanel.vue`

- [ ] **Step 1: 写入其余入口和管理员例外的失败约束测试**

追加到 `tests/bundle-gated-store-entries.test.mjs`：

```js
test('secondary Store Studio entries use bundle-only access', async () => {
  const [search, detail, profile] = await Promise.all([
    readSource('../src/views/search/SearchView.vue'),
    readSource('../src/views/products/ProductDetail.vue'),
    readSource('../src/views/user-center/UserProfile.vue'),
  ])

  for (const source of [search, detail, profile]) {
    assert.match(source, /hasBundleStoreEntryAccess/)
    assert.match(source, /const canShowBundleEntries = computed/)
  }

  assert.match(search, /v-if="canShowBundleEntries" class="state-studio-btn"/)
  assert.match(detail, /v-if="product\?\.designId && canShowBundleEntries"/)
  assert.match(profile, /Section: Studio[\s\S]*?<div v-if="canShowBundleEntries" class="section">/)
})

test('admin product Studio tool remains independent from bundle access', async () => {
  const source = await readSource('../src/components/ProductAdminPanel.vue')

  assert.match(source, /@click="openProductInStudio"/)
  assert.doesNotMatch(source, /hasBundleStoreEntryAccess/)
})
```

- [ ] **Step 2: 运行约束测试并确认三个普通入口失败、管理员例外通过**

Run: `node --test tests/bundle-gated-store-entries.test.mjs`

Expected: FAIL 在 SearchView、ProductDetail、UserProfile 的 bundle 入口约束；管理员面板断言通过。

- [ ] **Step 3: 限制搜索无结果 Studio CTA**

在 `SearchView.vue` 引入并初始化：

```ts
import { useUserStore } from '@/store/user'
import { hasBundleStoreEntryAccess } from '@/utils/entitlements'

const userStore = useUserStore()
const canShowBundleEntries = computed(() => {
  return hasBundleStoreEntryAccess(userStore.userInfo)
})
```

把 Create in Studio button 改为：

```vue
<button v-if="canShowBundleEntries" class="state-studio-btn" type="button" @click="openStudio">
```

- [ ] **Step 4: 限制商品详情 Customize in Studio CTA**

将 `ProductDetail.vue` 的 entitlement import 改为：

```ts
import {
  hasBundleStoreEntryAccess,
  hasPremiumEntitlement,
} from '@/utils/entitlements'
```

在 `hasPremiumAccess` 后加入：

```ts
const canShowBundleEntries = computed(() => {
  return hasBundleStoreEntryAccess(userStore.userInfo)
})
```

把入口条件改为：

```vue
v-if="product?.designId && canShowBundleEntries"
```

- [ ] **Step 5: 限制个人中心 Studio 区块**

在 `UserProfile.vue` 引入：

```ts
import { hasBundleStoreEntryAccess } from '@/utils/entitlements'
```

在 `userInfo` 计算属性后加入：

```ts
const canShowBundleEntries = computed(() => {
  return hasBundleStoreEntryAccess(userInfo.value)
})
```

把 Studio section 的根节点改为：

```vue
<div v-if="canShowBundleEntries" class="section">
```

- [ ] **Step 6: 运行所有相关测试并确认通过**

Run: `node --test tests/entitlements.test.mjs tests/bundle-gated-store-entries.test.mjs`

Expected: PASS，bundle 入口约束和管理员例外全部通过。

- [ ] **Step 7: 提交其余页面入口控制**

```bash
git add tests/bundle-gated-store-entries.test.mjs src/views/search/SearchView.vue src/views/products/ProductDetail.vue src/views/user-center/UserProfile.vue
git commit -m "hide Store Studio calls to action without bundle"
```

### Task 4: 全量验证与范围复核

**Files:**
- Verify: `src/utils/entitlements.ts`
- Verify: `src/components/Header.vue`
- Verify: `src/views/home/components/HomeBanner.vue`
- Verify: `src/views/search/SearchView.vue`
- Verify: `src/views/products/ProductDetail.vue`
- Verify: `src/views/user-center/UserProfile.vue`
- Verify: `src/components/ProductAdminPanel.vue`
- Verify: `src/router/routes.ts`

- [ ] **Step 1: 运行 Store 的全部 Node 测试**

Run: `node --test tests/*.test.mjs`

Expected: PASS，零失败。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: `vue-tsc`、Vite build 与 SEO prerender 全部 exit 0。

- [ ] **Step 3: 搜索残留的普通 Studio/FAQ 入口**

Run:

```bash
rg -n -i "openStudio|faqPath|customizeInStudio|createInStudio|Section: Studio" \
  src/components src/views
```

Expected: 普通入口均位于已加 `canShowBundleEntries` 的组件中；`ProductAdminPanel.vue` 的 `openProductInStudio` 是唯一明确不受 bundle 控制的管理员例外。FAQ 页面内部内容、Creators 页面和直达路由可以继续出现，因为它们不是商城入口且不做访问拦截。

- [ ] **Step 4: 确认未加入路由守卫且工作区无意外文件**

Run:

```bash
git diff --check
git status --short
git diff -- src/router/routes.ts src/components/ProductAdminPanel.vue
```

Expected: `git diff --check` 无输出；路由和管理员面板无变更；状态只包含计划内文件（如尚未提交）。

- [ ] **Step 5: 如验证产生必要修正，提交最终修正**

仅当 Step 1-4 暴露出计划内问题并完成修正时执行：

```bash
git add src tests
git commit -m "verify bundle-only Store creator entries"
```
