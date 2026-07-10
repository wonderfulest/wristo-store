# 产品详情页预览图片设计

## 目标

产品详情页左侧预览区域继续展示产品已配置的预览图片，不使用运行时画布重新绘制表盘效果。

## 方案

- `ProductDetail.vue` 直接通过现有 `productPreviewFallback` 渲染图片。
- 保留现有图片缺失时的 `W` 占位。
- 不在详情页挂载 `ProductCanvasPreview`，因此不会请求预览配置、加载字体或绘制画布。
- 不修改 `ProductCanvasPreview.vue`，避免影响其可能的其他使用方及当前未提交工作。

## 验证

- 详情页模板不再引用 `ProductCanvasPreview`。
- `npm run build` 在 `wristo-store` 通过。
