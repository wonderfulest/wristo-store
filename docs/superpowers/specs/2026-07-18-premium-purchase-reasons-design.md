# Premium 套餐选择理由精简设计

## 目标

精简 Store 套餐选择页与结算页中的 Wristo Premium 选择理由，突出一次性购买永久解锁、数千款 Premium 应用，以及未来上新无需额外付费即可持续享有。

## 文案

英文文案固定为：

```text
Why Go Premium?

One-Time Purchase, Lifetime Access - Pay once and enjoy Wristo Premium forever. No subscription fees.

Thousands of Premium Apps - Unlock thousands of premium apps with one upgrade.

Future Releases Included - New premium apps are automatically included at no extra cost.
```

删除原有结尾宣传语，不增加其他权益，避免分散三个核心卖点。

## 展示规则

- `Why Go Premium?` 保持独立标题样式。
- 每条理由按第一个 ` - ` 拆分为重点标题和解释。
- 左侧重点标题使用较高字重和主文字颜色。
- 分隔符使用弱化颜色。
- 右侧解释使用常规字重和次级文字颜色。
- 桌面端优先同一行展示；空间不足时允许解释自然换行，不使用固定宽度双栏。
- 其他不符合拆分格式的描述行保留当前普通文本展示，避免影响非 Premium 套餐。

## 变更范围

- 在 `src/i18n.ts` 更新 Premium 套餐理由，并同步现有语言版本的三项语义。
- 在 `src/components/PurchaseCard.vue` 增加理由与解释的结构化渲染和样式。
- 套餐选择页和结算页继续共用 `purchase.premiumBundleDesc`，不修改 API、套餐识别、价格或支付逻辑。

## 验证

- 增加或更新针对文案和拆分结构的前端测试。
- 运行相关测试和 `npm run build`。
- 人工确认桌面端与窄屏下，重点标题、分隔符和解释层级清楚且换行正常。
