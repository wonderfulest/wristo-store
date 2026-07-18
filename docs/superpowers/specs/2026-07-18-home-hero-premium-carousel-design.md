# 首页 Premium 海报轮播设计

## 目标

在 Store 首页现有 Watch Faces 海报旁新增一张 Premium Bundle 营销海报。轮播切换时同步更新左侧文案和操作，引导用户直接进入 Premium Bundle 套餐卡片；同时让所有 3:4 海报容器贴合图片比例，消除左右黑边且不裁切海报内容。

## 轮播内容

### Watch Faces

保留现有英文文案、按钮和 `home-hero-watchfaces-access-en.png` 海报：

- Eyebrow：`PREMIUM GARMIN WATCH FACES`
- Title：`Discover Your Next Watch Face.`
- Description：`5000+ designs for every style.`
- Button：`Explore Watch Faces`
- Destination：本地化 `/search`

### Premium Bundle

新增独立轮播项：

- Eyebrow：`WRISTO PREMIUM`
- Title：`Unlock Everything. Keep It Forever.`
- Description：`One purchase unlocks thousands of premium apps — including future releases.`
- Button：`Get Premium`
- Destination：本地化 `/purchase-options#bundle-subscription-card`

Premium 轮播项对所有用户显示。已购买 Bundle 的用户仍保留现有 Studio 轮播项，不因新增 Premium 轮播而改变权限逻辑。

## 海报视觉

- 使用 `imagegen` 生成一张英文黑金 Premium 权益海报。
- 资源比例固定为 3:4，目标尺寸 `1080 × 1440`。
- 视觉语言与现有深色 Watch Faces 海报协调：深黑背景、暖金标题、精致表盘应用墙或设备组合。
- 核心海报文字：`ONE PURCHASE. LIFETIME ACCESS.`
- 辅助卖点：`THOUSANDS OF PREMIUM APPS`、`FUTURE RELEASES INCLUDED`。
- 海报避免重复现有 `5000+ Watch Faces` 的主诉求，重点放在购买方式和持续权益。
- 生成结果作为仓库静态资源保存，不依赖运行时外部图片服务。

## 无黑边展示规则

- 桌面端海报容器和图片使用同一 3:4 比例，目标显示尺寸约 `510 × 680px`。
- 中等屏幕目标显示尺寸约 `480 × 640px`。
- 移动端最大显示尺寸约 `360 × 480px`，并受可用内容宽度约束。
- 海报图片填满同宽高比容器，保持完整内容，不使用会裁切顶部或底部的 `cover` 方案。
- 保留现有圆角，容器背景不得在图片四周形成可见黑边。

## 交互与数据流

- 在 `HomeBanner.vue` 的本地轮播配置中新增 Premium 项，不新增接口。
- 每个轮播项继续自带国际化 Key、图片路径和主操作函数，切换时左侧文案与右侧海报作为同一状态同步更新。
- 保持当前 6.5 秒自动轮播、悬停或聚焦暂停、圆点手动切换，以及 `prefers-reduced-motion` 下不自动播放的行为。
- Store 与 Premium 海报使用同一海报展示契约；Studio 项继续使用原舞台布局。

## 国际化

- 为 Premium 轮播项增加所有现有 Store 语言的文案 Key。
- 生成海报内文字保持英文，和现有英文海报资源规则一致。
- 圆点增加可本地化的 Premium 轮播辅助标签。

## 验证

- 增加契约测试，覆盖 Premium 轮播配置、Bundle 锚点目标、两张海报资源和 3:4 无黑边 CSS。
- 运行相关 Node 测试。
- 运行 `npm run build`，覆盖 TypeScript、Vite 生产构建和 SEO 预渲染。
- 人工检查桌面、平板和移动端：两张海报均完整显示、无明显黑边，轮播文案与图片匹配，Premium 按钮落到 Bundle 套餐卡片。
