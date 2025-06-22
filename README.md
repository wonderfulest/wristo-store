# 用户支付前端

## 环境配置

### Paddle 支付配置

在项目根目录创建 `.env` 文件，添加以下配置：

```env
# Paddle Configuration
VITE_PADDLE_CLIENT_TOKEN=your_paddle_client_token
VITE_PADDLE_PRICE_ID=your_paddle_price_id

# API Configuration
VITE_API_BASE_URL=your_api_base_url
```

### 获取 Paddle 配置

1. 登录 [Paddle Dashboard](https://vendors.paddle.com/)
2. 获取你的 Client Token
3. 创建产品并获取 Price ID
4. 将配置添加到 `.env` 文件中

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

