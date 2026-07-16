# 产品详情页多图画廊设计

## 目标

让公开 Store 的单个应用详情页展示后台为该应用维护的整套 Share images。用户可以查看大图、切换缩略图并进入全屏预览；没有可用 Share images 时，继续展示当前产品封面，不影响购买、安装、设备兼容性和评分流程。

## 范围

- 后台现有 Share Image Library 仍是图片上传、删除和排序的数据来源，每个应用最多 8 张图片。
- 新增公开只读查询能力，不向公开页面暴露管理员上传或删除接口。
- 仅修改 `wristo-api` 的公开商品图片查询契约，以及 `wristo-store` 的详情页数据加载和图片展示。
- 不修改 Share Image Library 的管理流程，不引入新的图片表或第二套上传机制。
- 不重做产品详情页右侧购买信息区。

## 后端设计

### 公开接口

新增：

```text
GET /api/public/products/app/{appId}/share-images
```

接口返回 `List<ProductImageVO>`，只包含：

- `type = share`
- `is_deleted = 0`
- `is_active = 1`
- 已关联有效图片文件且具有可用 URL 的记录

结果沿用 `product_images.sort_order ASC, created_at ASC` 的顺序。

### 公开访问校验

查询图片前必须复用公开商品详情的可见性校验，确保应用存在并且满足当前 Store 公开条件：未删除、已激活、已上线且未被隐藏。隐藏或下架应用不能通过图片接口单独读取素材。

管理员接口保持不变：

```text
GET    /api/admin/products/{appId}/share-images
POST   /api/admin/products/{appId}/share-images
DELETE /api/admin/products/{appId}/share-images/{productImageId}
```

### 数据职责

`ProductOrchestrator` 继续负责按 appId 定位商品和读取 Share images。公开控制器负责调用公开可见性校验后返回只读图片列表。不得直接把管理员接口用于公开页面。

## 前端设计

### API 与类型

在 Store 商品 API 中增加公开查询方法，访问 `/public/products/app/${appId}/share-images`。前台图片类型包含 `id`、`sortOrder`、`altText`、`imageUrl` 和关联 `image.url` 等必要字段，并通过统一解析逻辑得到最终 URL。

### 画廊组件

新增 `ProductImageGallery.vue`，职责限定为：

- 接收 Share images、产品名称和当前产品封面 URL。
- 生成去重且保持接口顺序的可浏览图片列表。
- 有 Share images 时默认选择第一张。
- 没有 Share images 时只使用当前产品封面。
- 渲染主图和缩略图轨道。
- 点击缩略图切换主图，并标识当前选中项。
- 点击主图进入全屏预览，预览列表包含全部有效 Share images。
- 单张图片时不渲染多余的缩略图轨道。
- 图片加载失败时剔除失败项；列表耗尽后回退到产品封面或现有 `W` 占位。

桌面端缩略图紧凑横向排列；移动端使用横向滚动，不改变详情页右侧信息区的内容与顺序。视觉继续沿用当前页面的浅色、克制风格。

### 详情页数据流

1. `ProductDetail.vue` 先按现有流程加载公开商品详情。
2. 商品存在且可公开访问后，并行加载评分、评论、管理员指标和公开 Share images。
3. 将 Share images 与 `productPreviewFallback` 传给画廊组件。
4. Share images 请求失败时记录非阻断错误并传入空列表，画廊自动显示当前封面。
5. 图片请求失败不得阻止详情页其他区域加载或跳转。

## 可访问性与交互

- 主图使用产品名生成替代文本；单张 Share image 可优先使用其 `altText`。
- 缩略图使用原生按钮，支持键盘聚焦和回车/空格切换。
- 当前缩略图通过选中样式及 `aria-current` 表达状态。
- 全屏预览沿用 Element Plus 图片预览能力，避免新增图片查看依赖。
- 缩略图在窄屏可横向滚动，触控目标保持可点击尺寸。

## 异常与边界

- 无 Share images：展示现有产品封面。
- 接口失败：展示现有产品封面，不弹出阻断式错误。
- 重复 URL：只保留第一次出现的位置。
- 空 URL 或关联图片缺失：过滤该记录。
- 某张图片加载失败：从当前浏览集合移除，并选择下一张有效图片；没有下一张时回退封面。
- 产品封面也不可用：保留当前 `W` 占位行为。

## 测试与验收

### 后端测试

- 先增加失败测试，覆盖公开 Share images 路由和响应结构。
- 验证公开接口在读取 Share images 前执行商品公开状态校验。
- 验证公开接口仅提供 GET，不新增公开上传和删除能力。
- 验证返回图片保持服务层排序和已解析 URL。

### 前端测试

- 先增加失败测试，覆盖图片 URL 解析、空 URL 过滤、重复 URL 去重和顺序保持。
- 验证空 Share images 使用产品封面兜底。
- 验证 Store 使用公开 API 路径，详情页接入独立画廊组件。
- 验证组件包含缩略图切换、当前项状态和全屏预览契约。

### 验证命令

```bash
cd /Users/mac/workspace/wristo/wristo-store
node --test tests/*.test.mjs
npm run build

cd /Users/mac/workspace/wristo/wristo-api
mvn -Dtest=ProductShareImagesPublicControllerTest test
```

条件允许时再运行 `mvn test`，并进行桌面端和移动端手工验收：多图、单图、无图、重复图片、损坏图片及全屏预览。

## 完成标准

- 公开应用详情页能展示该应用后台维护的整套 Share images。
- 用户能通过缩略图切换主图并查看全屏图片。
- 无图或图片接口异常时，现有封面和详情页其他功能保持可用。
- 隐藏或下架应用不能通过公开图片接口读取 Share images。
- 前端测试、构建和相关后端测试通过。
