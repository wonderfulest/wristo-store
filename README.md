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
├──-------------------- Blog --------------------
├── /blog    → 博客首页
│    ├── /zh/blog/...
│    ├── /en/blog/...
│    ├── /fr/blog/...
│    └── ...
│
├──-------------------- Guides --------------------
├── /uninstall-guide           → Uninstall Guide
├── /contact                   → Contact
├── /newsletter                → Newsletter
├── /faq                       → FAQ
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

## 支付流程

1. 用户输入代码 (`/code`)
2. 验证成功后跳转到购买选项页面 (`/purchase-options`)
3. 用户选择 Bundle 或单个产品后跳转到结账页面 (`/checkout`)
4. 用户完成 Paddle 支付后跳转到成功页面 (`/payment/success`)

