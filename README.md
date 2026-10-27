# 路由

wristo.io/
├──-------------------- Home --------------------
├── /                          → Home
├── /product/:id               → Product Detail
├── /bundle/:id                → Bundle Detail
├── /bundle-products           → Bundled Products (list/landing)
├── /categories/:slug          → Category Detail
│
├──-------------------- User --------------------
├── /user/profile              → User Profile
├── /user/purchase-records     → User Purchase Records
│
├──-------------------- Shop --------------------
├── /code                      → Enter Unlock Code (Shop)
├── /purchase-options          → Purchase Options (Shop)
├── /checkout                  → Checkout (One-time) (Shop)
├── /checkout-subscription     → Checkout (Subscription) (Shop)
├── /payment/success           → Payment Success (Shop)
├── /auto-unlock               → Automatic Unlock (Shop)
├── /already-purchased         → Activate Existing Purchase (Shop)
├── /purchases-history         → Purchases History
├── /unlock                    → Unlock (General)
├── /subscription-management   → Subscription Management (Deprecated)
├── /subscription-cancel       → Subscription Cancel (Deprecated)
│
├──-------------------- FAQ Guides --------------------
├── /faq    → FAQ guides
│    ├── /zh/faq/...
│    ├── /en/faq/...
│    ├── /fr/faq/...
│    └── ...
│
├──-------------------- Guides --------------------
├── /uninstall-guide           → Uninstall Guide
├── /contact                   → Contact
├── /newsletter                → Newsletter
├── /faq/support               → Support FAQ
├── /faq/checkout              → Checkout Help
│
├──-------------------- System --------------------
├── /auth/callback             → SSO Callback
└── /terms-and-conditions      → Terms & Conditions
└── /privacy-policy            → Privacy Policy

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

### SEO 预渲染

`npm run build` 默认预渲染 80 个页面，使用 3 个并发浏览器页面；每页独立隔离语言、Cookie 和存储。构建期间按请求 URL、方法及语言复用成功的公共 API 响应，图片、字体和视频不参与下载（HTML 中的资源链接保留）。页面失败会在全新上下文重试一次，仍失败则终止构建并输出路由和接口错误。

- `PRERENDER_CONCURRENCY=1`：串行排查；允许 1–8，默认 3，Vercel 内存较小时可降到 2。
- `MAX_PRERENDER_ROUTES=80`：预渲染路由预算，默认不变。
- `npm run build:app`：只构建应用；`npm run seo:prerender`：执行 SEO 阶段，应紧接新生成的应用构建运行。

## 支付流程

1. 用户输入代码 (`/code`)
2. 验证成功后跳转到购买选项页面 (`/purchase-options`)
3. 用户选择 Bundle 或单个产品后跳转到结账页面 (`/checkout`)
4. 用户完成 Paddle 支付后跳转到成功页面 (`/payment/success`)
