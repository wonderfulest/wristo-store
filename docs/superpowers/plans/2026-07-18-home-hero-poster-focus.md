# Home Hero Poster Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 精简 Store 首页首屏英文信息，并把 3:4 表盘海报提升为右侧主要视觉。

**Architecture:** 继续使用现有 `HeroSlide` 配置驱动首页轮播，为 Store 轮播项增加精简展示标记，由模板决定是否渲染次要按钮和指标。通过 `theme-store` 与 `banner-stage--poster` 的组合样式扩大桌面端右栏和海报，Studio 轮播项不受影响。

**Tech Stack:** Vue 3、TypeScript、Vite、Scoped CSS、现有 i18n 字典。

---

### Task 1: 精简默认英文首屏文案

**Files:**
- Modify: `src/i18n.ts:200-205`

- [ ] **Step 1: 更新三条默认英文文案**

将默认英文 Store 首屏文案改为：

```ts
'home.heroTitle': 'Discover Your Next Watch Face.',
'home.heroDesc': '5000+ designs for every style.',
'home.heroExplore': 'Explore Watch Faces',
```

保留其他语言字典和 `home.heroCode`、`home.heroBundles` 键，避免影响 Studio 或其他入口。

- [ ] **Step 2: 核对字典内容**

Run:

```bash
rg -n "home.heroTitle|home.heroDesc|home.heroExplore" src/i18n.ts | head -n 3
```

Expected: 前三条默认英文结果分别包含 `Discover Your Next Watch Face.`、`5000+ designs for every style.` 和 `Explore Watch Faces`。

- [ ] **Step 3: 提交文案修改**

```bash
git add src/i18n.ts
git commit -m "simplify homepage hero copy"
```

### Task 2: 精简 Store 操作区并放大海报

**Files:**
- Modify: `src/views/home/components/HomeBanner.vue:23-50`
- Modify: `src/views/home/components/HomeBanner.vue:129-190`
- Modify: `src/views/home/components/HomeBanner.vue:270-453`
- Modify: `src/views/home/components/HomeBanner.vue:545-619`

- [ ] **Step 1: 为轮播配置增加精简展示标记**

在 `HeroSlide` 的 `hideArtCaption?: boolean` 后增加：

```ts
compactActions?: boolean
hideMetrics?: boolean
```

在 Store 轮播项的 `hideArtCaption: true` 后增加：

```ts
compactActions: true,
hideMetrics: true,
```

- [ ] **Step 2: 按配置隐藏次要按钮和指标**

保留主按钮；仅在非精简轮播项渲染另外两个按钮，并按配置渲染指标：

```vue
<button class="banner-primary" type="button" @click="activeSlide.primaryAction">
  {{ t(activeSlide.primaryLabelKey) }}
  <Icon :icon="activeSlide.primaryIcon" width="20" height="20" aria-hidden="true" />
</button>
<template v-if="!activeSlide.compactActions">
  <button class="banner-code" type="button" @click="activeSlide.secondaryAction">
    <Icon :icon="activeSlide.secondaryIcon" width="20" height="20" aria-hidden="true" />
    {{ t(activeSlide.secondaryLabelKey) }}
  </button>
  <button class="banner-secondary" type="button" @click="activeSlide.tertiaryAction">
    {{ t(activeSlide.tertiaryLabelKey) }}
  </button>
</template>

<div v-if="!activeSlide.hideMetrics" class="banner-metrics" :aria-label="t('home.heroHighlights')">
  <span>
    <strong>{{ t(activeSlide.metricOneValueKey) }}</strong>
    {{ t(activeSlide.metricOneLabelKey) }}
  </span>
  <span>
    <strong>{{ t(activeSlide.metricTwoValueKey) }}</strong>
    {{ t(activeSlide.metricTwoLabelKey) }}
  </span>
  <span>
    <strong>{{ t(activeSlide.metricThreeValueKey) }}</strong>
    {{ t(activeSlide.metricThreeLabelKey) }}
  </span>
</div>
```

- [ ] **Step 3: 扩大 Store 右栏与桌面海报**

增加 Store 主题覆盖，并把海报舞台扩大到约 `600 × 680px`：

```css
.banner-content.theme-store {
  grid-template-columns: minmax(320px, 0.72fr) minmax(520px, 1.28fr);
  gap: 32px;
}

.banner-content.theme-store .banner-copy {
  max-width: 430px;
}

.banner-content.theme-store .banner-title {
  font-size: clamp(3.2rem, 5vw, 5.4rem);
  line-height: 0.96;
}

.banner-content.theme-store .banner-actions {
  margin-top: 26px;
}

.banner-stage.banner-stage--poster {
  width: min(100%, 600px);
  min-height: 680px;
  background: #090d11;
}

.banner-stage img.banner-stage__image--poster {
  width: min(94%, 510px);
  aspect-ratio: 3 / 4;
  filter: none;
}
```

- [ ] **Step 4: 保证中等屏幕和移动端完整展示**

在现有断点中覆盖 Store 网格和海报尺寸：

```css
@media (max-width: 900px) {
  .banner-content.theme-store {
    grid-template-columns: 1fr;
  }

  .banner-stage.banner-stage--poster {
    width: min(100%, 510px);
    min-height: 640px;
  }

  .banner-stage img.banner-stage__image--poster {
    width: min(94%, 480px);
  }
}

@media (max-width: 768px) {
  .banner-stage.banner-stage--poster {
    width: min(100%, 360px);
    min-height: min(480px, 128vw);
  }

  .banner-stage img.banner-stage__image--poster {
    width: min(100%, 360px);
  }
}
```

在最窄移动端，3:4 图片宽度受父容器限制，高度随比例缩放；舞台 `overflow: hidden` 不应裁掉海报主体。

- [ ] **Step 5: 运行完整验证**

Run:

```bash
npm run build
git diff --check
```

Expected: `vue-tsc` 与 Vite 构建退出码为 `0`，SEO 输出包含 `Prerender 80/80`，`git diff --check` 无输出。

- [ ] **Step 6: 提交组件与资源修改**

```bash
git add src/views/home/components/HomeBanner.vue public/home-hero-watchfaces-access-en.png
git commit -m "focus homepage hero on watchface poster"
```
