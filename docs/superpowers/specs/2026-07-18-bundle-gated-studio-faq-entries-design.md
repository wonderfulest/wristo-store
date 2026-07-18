# Bundle 用户专属的 Studio 与 FAQ 入口

## 背景与目标

Wristo Store 当前在导航、首页、搜索、商品详情和个人中心等位置展示 Studio 入口，并在导航中展示 FAQ 入口。商城需要将这些入口调整为仅对已开通 bundle 的用户可见。

本次仅控制入口的可见性，不限制路由或外部地址访问。未开通 bundle 的用户如果知道 `/faq`、`/studio/membership`、`/creators` 或 Studio 外部地址，仍可直接访问。

## 权限规则

- bundle 用户的唯一判定来源是 `hasActiveBundle(userInfo)`，即 `userInfo.userProfile.hasBundle > 0`。
- Store premium entitlement、普通订阅或 Studio membership 不替代 bundle 权限。
- 普通 Studio 与 FAQ 入口只有在 bundle 权限成立时渲染。
- `ProductAdminPanel` 中的 Studio 按钮属于管理员运营工具，继续由现有管理员权限控制，不受 bundle 权限影响。
- 用户信息尚未加载、用户未登录或字段缺失时，按非 bundle 用户处理，不展示相关入口。

## 变更范围

### Header

- 桌面导航中的 Studio、FAQ 入口仅对 bundle 用户显示。
- 移动导航中的 Studio、FAQ 入口仅对 bundle 用户显示。
- 桌面用户下拉菜单中的 Studio 与 Studio Membership 入口仅对 bundle 用户显示。
- 移动用户操作区中的 Studio 与 Studio Membership 入口仅对 bundle 用户显示。

### 首页

- bundle 用户继续看到 Store 与 Studio 两张 Banner。
- 非 bundle 用户只看到 Store Banner。
- Banner 的当前索引和轮播逻辑必须基于过滤后的可见列表，避免切换到不存在的 Studio Banner。

### 其他商城入口

- 搜索无结果状态中的 Create in Studio 按钮仅对 bundle 用户显示。
- 商品详情中的 Customize in Studio 按钮仅在商品有 `designId` 且当前用户具有 bundle 权限时显示。
- 个人中心的 Studio 区块仅对 bundle 用户显示。
- `ProductAdminPanel` 内的 Studio 管理按钮保持现有行为。

## 不在本次范围

- 不增加或修改后端接口、数据库字段和 bundle 购买流程。
- 不修改 FAQ、Studio Membership、Creators 页面内容。
- 不增加路由守卫，不重定向直接访问者。
- 不移除 SEO、预渲染、FAQ 内容或 Studio 工具函数。
- 不调整管理员面板内的 Studio 操作。

## 实现方式

在共享 entitlement 工具中提供语义清晰的入口可见性策略，并由相关组件通过响应式计算属性消费。所有入口使用同一 bundle 判定，避免组件自行解析 `hasBundle`，同时保持管理员工具与普通商城入口的权限边界。

## 测试与验收

- 单元测试覆盖 bundle、非 bundle、未登录和订阅但无 bundle 四种状态。
- 源码约束测试确认 Header 的桌面/移动入口、首页 Studio Banner、搜索 CTA、商品详情 CTA、个人中心 Studio 区块均使用共享策略。
- 测试确认管理员商品面板的 Studio 按钮未被 bundle 条件包裹。
- 运行相关 Node 测试。
- 运行 `npm run build`，验证 TypeScript、Vite 构建和 SEO 预渲染。

## 验收结果

- 非 bundle 用户在商城界面中看不到 Studio 或 FAQ 入口。
- bundle 用户看到现有 Studio 与 FAQ 入口且交互保持不变。
- 管理员仍可从商品管理面板进入 Studio。
- 直接访问现有 FAQ、Studio Membership 与 Creators 路由不被拦截。
