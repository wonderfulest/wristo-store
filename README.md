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

`npm run build` 构建应用并生成 sitemap、robots.txt 和 llms.txt，不启动浏览器逐页预渲染，以缩短部署时间。Vercel 使用同一构建命令，公共页面由浏览器执行 JavaScript 渲染。

- `npm run build:app`：只构建应用，不生成动态 sitemap。
- `npm run seo:prerender`：需要静态 HTML 快照时手动执行，应紧接新生成的应用构建运行；需安装浏览器。
- 手动预渲染默认最多 80 页、3 个并发，可通过 `MAX_PRERENDER_ROUTES` 和 `PRERENDER_CONCURRENCY`（1–8）调整。

## 支付流程

1. 用户输入代码 (`/code`)
2. 验证成功后跳转到购买选项页面 (`/purchase-options`)
3. 用户选择 Bundle 或单个产品后跳转到结账页面 (`/checkout`)
4. 用户完成 Paddle 支付后跳转到成功页面 (`/payment/success`)
