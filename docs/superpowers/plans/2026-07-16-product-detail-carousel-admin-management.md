# 应用详情页轮播图与管理员就地管理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Store 应用详情页以固定应用主图开头提供手动轮播，并允许管理员在轮播缩略图区域添加、删除和持久化调整分享图片顺序。

**Architecture:** `ProductImageGallery.vue` 只负责无 API 依赖的轮播与管理员交互事件，`ProductDetail.vue` 负责鉴权态数据加载和上传、删除、排序编排。后端复用 `product_images.sort_order`，在锁定应用的事务中校验完整图片 ID 集并批量规范化排序，不新增数据库迁移。

**Tech Stack:** Vue 3、TypeScript、Element Plus、Vite/Node test、Spring Boot、Java、MyBatis、JUnit 5、Mockito、Maven

---

## 文件结构

### `wristo-api`

- Create: `src/main/java/com/wukong/face/modules/products/dto/ProductShareImageOrderDTO.java` — 批量排序请求体。
- Modify: `src/main/java/com/wukong/face/modules/products/controller/adm/ProductAdminController.java` — 暴露管理员排序接口。
- Modify: `src/main/java/com/wukong/face/modules/products/orchestrator/ProductOrchestrator.java` — 声明排序业务契约。
- Modify: `src/main/java/com/wukong/face/modules/products/orchestrator/impl/ProductOrchestratorImpl.java` — 在事务中校验归属并更新连续排序值。
- Modify: `src/test/java/com/wukong/face/modules/products/ProductShareImagesAdminControllerTest.java` — 控制器请求绑定测试。
- Modify: `src/test/java/com/wukong/face/modules/products/orchestrator/impl/ProductShareImagesOrchestratorTest.java` — 排序成功和拒绝异常集合测试。
- Create: `src/test/java/com/wukong/face/modules/products/service/impl/ProductImageServiceImplTest.java` — 验证排序更新经 Service 正确写入 Mapper。

### `wristo-store`

- Modify: `src/utils/productGallery.ts` — 固定主图合并、循环切换和顺序移动纯函数。
- Create: `src/utils/productShareImagePolicy.ts` — Store 两个管理员入口共享的数量、类型和大小常量。
- Modify: `src/components/ProductImageGallery.vue` — 手动轮播、触摸/键盘操作、管理员添加/删除/排序控件。
- Modify: `src/views/products/ProductDetail.vue` — 加载管理员图片并执行管理事件。
- Modify: `src/views/admin/ShareImageManager.vue` — 复用共享上传约束常量，避免两个入口漂移。
- Modify: `src/api/product-share-images.ts` — 新增排序请求。
- Modify: `tests/product-gallery.test.mjs` — 纯函数、组件契约、API 和详情页管理编排测试。

## Task 1：新增后端分享图片排序 HTTP 契约

**Files:**
- Create: `wristo-api/src/main/java/com/wukong/face/modules/products/dto/ProductShareImageOrderDTO.java`
- Modify: `wristo-api/src/main/java/com/wukong/face/modules/products/controller/adm/ProductAdminController.java:1-125`
- Modify: `wristo-api/src/main/java/com/wukong/face/modules/products/orchestrator/ProductOrchestrator.java:126-140`
- Test: `wristo-api/src/test/java/com/wukong/face/modules/products/ProductShareImagesAdminControllerTest.java`

- [ ] **Step 1: 先写排序接口控制器测试**

在 `ProductShareImagesAdminControllerTest` 增加 JSON `PUT` 请求和 DTO 捕获：

```java
import com.wukong.face.modules.products.dto.ProductShareImageOrderDTO;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

@Test
void reordersBoundShareImages() throws Exception {
    ProductImageVO first = new ProductImageVO();
    first.setId(31L);
    when(orchestrator.reorderShareImages(eq(1009L), any(ProductShareImageOrderDTO.class)))
            .thenReturn(List.of(first));

    mockMvc.perform(put("/api/admin/products/1009/share-images/order")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"productImageIds\":[31,18,42]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(0))
            .andExpect(jsonPath("$.data[0].id").value(31));

    verify(orchestrator).reorderShareImages(eq(1009L), argThat(dto ->
            dto != null && dto.getProductImageIds().equals(List.of(31L, 18L, 42L))));
}
```

- [ ] **Step 2: 运行测试并确认它先失败**

Run:

```bash
cd /Users/mac/workspace/wristo/wristo-api
mvn -Dtest=ProductShareImagesAdminControllerTest test
```

Expected: 编译失败，提示 `ProductShareImageOrderDTO` 或 `reorderShareImages` 尚不存在。

- [ ] **Step 3: 创建请求 DTO**

创建 `ProductShareImageOrderDTO.java`：

```java
package com.wukong.face.modules.products.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProductShareImageOrderDTO {

    @NotNull(message = "productImageIds is required")
    @Size(max = 8, message = "Each app can have at most 8 share images")
    private List<@NotNull(message = "productImageId is required") Long> productImageIds;
}
```

空数组必须允许，因为没有分享图片的应用也拥有合法的完整顺序。

- [ ] **Step 4: 声明 Orchestrator 契约并增加 Controller 路由**

在 `ProductOrchestrator` 增加：

```java
List<ProductImageVO> reorderShareImages(Long appId, ProductShareImageOrderDTO dto);
```

在 `ProductAdminController` 导入 `jakarta.validation.Valid` 和 DTO，并在删除接口前增加：

```java
@PutMapping("/{appId}/share-images/order")
public Result<List<ProductImageVO>> reorderShareImages(
        @PathVariable Long appId,
        @Valid @RequestBody ProductShareImageOrderDTO dto) {
    return Result.success(productOrchestrator.reorderShareImages(appId, dto));
}
```

## Task 2：实现后端原子排序与归属校验

**Files:**
- Modify: `wristo-api/src/main/java/com/wukong/face/modules/products/orchestrator/impl/ProductOrchestratorImpl.java:726-818`
- Test: `wristo-api/src/test/java/com/wukong/face/modules/products/orchestrator/impl/ProductShareImagesOrchestratorTest.java`
- Create: `wristo-api/src/test/java/com/wukong/face/modules/products/service/impl/ProductImageServiceImplTest.java`

- [ ] **Step 1: 写成功排序测试**

在 `ProductShareImagesOrchestratorTest` 增加 DTO 导入、`ArgumentCaptor<ProductImageUpdateDTO>` 和以下测试：

```java
@Test
void reorderShareImagesNormalizesSortOrderAndReturnsUpdatedList() {
    Product product = product(9L, 1009L);
    ProductImage first = relation(31L, 9L, 301L, 0);
    ProductImage second = relation(18L, 9L, 302L, 1);
    ProductImage third = relation(42L, 9L, 303L, 2);

    when(productMapper.selectByAppIdForUpdate(1009L)).thenReturn(product);
    when(productImageService.getByProductIdAndType(9L, ProductImageConstants.TYPE_SHARE))
            .thenReturn(List.of(first, second, third))
            .thenReturn(List.of(
                    relation(42L, 9L, 303L, 0),
                    relation(31L, 9L, 301L, 1),
                    relation(18L, 9L, 302L, 2)));
    when(imageService.getById(301L)).thenReturn(imageVO(301L, "https://cdn.wristo.io/share/first.png"));
    when(imageService.getById(302L)).thenReturn(imageVO(302L, "https://cdn.wristo.io/share/second.png"));
    when(imageService.getById(303L)).thenReturn(imageVO(303L, "https://cdn.wristo.io/share/third.png"));

    ProductShareImageOrderDTO dto = new ProductShareImageOrderDTO();
    dto.setProductImageIds(List.of(42L, 31L, 18L));

    List<ProductImageVO> result = orchestrator.reorderShareImages(1009L, dto);

    ArgumentCaptor<ProductImageUpdateDTO> updates = ArgumentCaptor.forClass(ProductImageUpdateDTO.class);
    verify(productImageService, times(3)).updateProductImage(updates.capture());
    assertEquals(List.of(42L, 31L, 18L), updates.getAllValues().stream()
            .map(ProductImageUpdateDTO::getId).toList());
    assertEquals(List.of(0, 1, 2), updates.getAllValues().stream()
            .map(ProductImageUpdateDTO::getSortOrder).toList());
    assertEquals(List.of(42L, 31L, 18L), result.stream().map(ProductImageVO::getId).toList());
}
```

- [ ] **Step 2: 写非法完整集合测试**

```java
@Test
void reorderShareImagesRejectsDuplicateMissingOrForeignIdsWithoutWriting() {
    when(productMapper.selectByAppIdForUpdate(1009L)).thenReturn(product(9L, 1009L));
    when(productImageService.getByProductIdAndType(9L, ProductImageConstants.TYPE_SHARE))
            .thenReturn(List.of(
                    relation(31L, 9L, 301L, 0),
                    relation(18L, 9L, 302L, 1)));

    for (List<Long> ids : List.of(
            List.of(31L, 31L),
            List.of(31L),
            List.of(31L, 99L))) {
        ProductShareImageOrderDTO dto = new ProductShareImageOrderDTO();
        dto.setProductImageIds(ids);
        assertThrows(BizException.class, () -> orchestrator.reorderShareImages(1009L, dto));
    }

    verify(productImageService, never()).updateProductImage(any());
}
```

同时创建 `ProductImageServiceImplTest.java`，验证现有 Service 会把排序值和版本更新时间交给 Mapper：

```java
package com.wukong.face.modules.products.service.impl;

import com.wukong.face.modules.products.dto.ProductImageUpdateDTO;
import com.wukong.face.modules.products.entity.ProductImage;
import com.wukong.face.modules.products.mapper.ProductImageMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductImageServiceImplTest {
    private ProductImageMapper mapper;
    private ProductImageServiceImpl service;

    @BeforeEach
    void setUp() {
        mapper = mock(ProductImageMapper.class);
        service = new ProductImageServiceImpl();
        ReflectionTestUtils.setField(service, "productImageMapper", mapper);
    }

    @Test
    void updateProductImagePersistsSortOrderAndAdvancesVersion() {
        ProductImage existing = new ProductImage();
        existing.setId(31L);
        existing.setSortOrder(7);
        existing.setVersion(1);
        when(mapper.selectById(31L)).thenReturn(existing);

        ProductImageUpdateDTO dto = new ProductImageUpdateDTO();
        dto.setId(31L);
        dto.setSortOrder(0);

        service.updateProductImage(dto);

        ArgumentCaptor<ProductImage> saved = ArgumentCaptor.forClass(ProductImage.class);
        verify(mapper).updateById(saved.capture());
        assertEquals(0, saved.getValue().getSortOrder());
        assertEquals(2, saved.getValue().getVersion());
        assertNotNull(saved.getValue().getUpdatedAt());
    }
}
```

- [ ] **Step 3: 运行测试并确认完整实现尚缺失**

Run:

```bash
mvn -Dtest=ProductShareImagesOrchestratorTest,ProductImageServiceImplTest test
```

Expected: 编译失败，提示 `ProductOrchestratorImpl` 尚未实现新契约；这证明测试和接口契约先于业务实现落地。

- [ ] **Step 4: 用事务实现完整排序**

在 `ProductOrchestratorImpl` 导入 `ProductShareImageOrderDTO`、`ProductImageUpdateDTO`、`HashSet`、`Set`，增加以下完整实现：

```java
@Override
@Transactional
public List<ProductImageVO> reorderShareImages(Long appId, ProductShareImageOrderDTO dto) {
    Product product = requireProductByAppIdForUpdate(appId);
    List<ProductImage> existing = productImageService.getByProductIdAndType(
            product.getId(), ProductImageConstants.TYPE_SHARE);
    List<Long> requestedIds = dto == null ? null : dto.getProductImageIds();

    if (requestedIds == null) {
        throw new BizException(BizErrorCode.INVALID_PARAMS.getCode(), "productImageIds is required");
    }

    Set<Long> requestedSet = new HashSet<>(requestedIds);
    Set<Long> existingSet = existing.stream()
            .map(ProductImage::getId)
            .collect(Collectors.toSet());
    if (requestedIds.size() != requestedSet.size()
            || requestedIds.size() != existing.size()
            || !requestedSet.equals(existingSet)) {
        throw new BizException(BizErrorCode.INVALID_PARAMS.getCode(),
                "Share image order must contain every current image exactly once");
    }

    for (int index = 0; index < requestedIds.size(); index++) {
        ProductImageUpdateDTO update = new ProductImageUpdateDTO();
        update.setId(requestedIds.get(index));
        update.setSortOrder(index);
        productImageService.updateProductImage(update);
    }

    return buildShareImageVOs(product.getId());
}
```

`requireProductByAppIdForUpdate` 的行锁和方法事务保证校验、更新和返回结果处在同一原子操作内；最多 8 条更新，不新增 Mapper 批量 SQL。

- [ ] **Step 5: 运行分享图片后端测试**

Run:

```bash
mvn -Dtest=ProductShareImagesOrchestratorTest,ProductShareImagesAdminControllerTest,ProductImageServiceImplTest test
```

Expected: 两个测试类全部 PASS。

- [ ] **Step 6: 提交完整后端排序纵切片**

```bash
git add src/main/java/com/wukong/face/modules/products/dto/ProductShareImageOrderDTO.java \
  src/main/java/com/wukong/face/modules/products/controller/adm/ProductAdminController.java \
  src/main/java/com/wukong/face/modules/products/orchestrator/ProductOrchestrator.java \
  src/main/java/com/wukong/face/modules/products/orchestrator/impl/ProductOrchestratorImpl.java \
  src/test/java/com/wukong/face/modules/products/ProductShareImagesAdminControllerTest.java \
  src/test/java/com/wukong/face/modules/products/orchestrator/impl/ProductShareImagesOrchestratorTest.java \
  src/test/java/com/wukong/face/modules/products/service/impl/ProductImageServiceImplTest.java
git commit -m "feat: persist share image ordering"
```

## Task 3：建立前端画廊顺序纯函数

**Files:**
- Modify: `wristo-store/src/utils/productGallery.ts`
- Test: `wristo-store/tests/product-gallery.test.mjs:40-196`

- [ ] **Step 1: 更新画廊项目模型和失败测试**

在测试导入中加入 `resolveCircularGalleryUrl`、`resolveSelectionAfterItemsChange` 和 `moveShareImageIds`，并把 `createProductGalleryItems` 期望改为固定主图在第一位：

```js
test('createProductGalleryItems keeps the fixed product image first', () => {
  assert.deepEqual(
    createProductGalleryItems(
      [
        { id: 3, imageUrl: 'https://cdn.example.com/third.png', altText: 'Third' },
        { id: 2, imageUrl: 'https://cdn.example.com/second.png', altText: null },
      ],
      'https://cdn.example.com/fixed.png',
      'Product name',
    ).map(({ kind, sourceId, url }) => ({ kind, sourceId, url })),
    [
      { kind: 'fixed', sourceId: null, url: 'https://cdn.example.com/fixed.png' },
      { kind: 'share', sourceId: 3, url: 'https://cdn.example.com/third.png' },
      { kind: 'share', sourceId: 2, url: 'https://cdn.example.com/second.png' },
    ],
  )
})

test('resolveCircularGalleryUrl wraps in both directions', () => {
  assert.equal(resolveCircularGalleryUrl(sourceGalleryItems, sourceGalleryItems[2].url, 1), sourceGalleryItems[0].url)
  assert.equal(resolveCircularGalleryUrl(sourceGalleryItems, sourceGalleryItems[0].url, -1), sourceGalleryItems[2].url)
})

test('moveShareImageIds moves one id without changing the id set', () => {
  assert.deepEqual(moveShareImageIds([31, 18, 42], 42, -1), [31, 42, 18])
  assert.deepEqual(moveShareImageIds([31, 18, 42], 31, -1), [31, 18, 42])
  assert.deepEqual(moveShareImageIds([31, 18, 42], 18, 1), [31, 42, 18])
})

test('resolveSelectionAfterItemsChange keeps selection or chooses its neighbor', () => {
  assert.equal(
    resolveSelectionAfterItemsChange(sourceGalleryItems, sourceGalleryItems.slice(0, 2), sourceGalleryItems[2].url),
    sourceGalleryItems[1].url,
  )
  assert.equal(
    resolveSelectionAfterItemsChange(sourceGalleryItems, [sourceGalleryItems[0], sourceGalleryItems[2]], sourceGalleryItems[1].url),
    sourceGalleryItems[2].url,
  )
})
```

同步改写现有 `public share image consumers use the minimal public DTO` 契约：公开 API 仍必须返回 `ProductShareImagePublicVO[]`，但 `ProductImageGallery` 和 `ProductDetail` 改为导入可兼容公开/管理员响应的 `ProductShareImageSource`，并明确禁止画廊直接依赖 `ProductShareImageVO`：

```js
assert.match(publicApiBlock, /Promise<ProductShareImagePublicVO\[\]>/)
assert.match(productImageGallerySource, /import type \{ ProductShareImageSource \} from ['"]@\/utils\/productGallery['"]/)
assert.match(galleryPropsBlock, /^\s*images:\s*ProductShareImageSource\[\]/m)
assert.doesNotMatch(productImageGallerySource, /\bProductShareImageVO\b/)
assert.match(productDetailSource, /const shareImages = ref<ProductShareImageSource\[\]>\(\[\]\)/)
```

更新所有受固定主图策略影响的旧断言：只要 fallback URL 有效，它始终位于分享图片之前；`resolveAvailableGalleryItems` 的旧三参数调用全部改为完整 items 加 `failedUrls` 两个参数。

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
cd /Users/mac/workspace/wristo/wristo-store
node --test tests/product-gallery.test.mjs
```

Expected: 固定主图顺序和两个新函数测试 FAIL。

- [ ] **Step 3: 扩展 `ProductGalleryItem` 并固定主图**

把模型扩展为：

```ts
export interface ProductGalleryItem {
  key: string
  url: string
  alt: string
  kind: 'fixed' | 'share'
  sourceId: string | number | null
}
```

将 `createProductGalleryItems` 的主体改为先加入固定主图，再加入去重后的分享图片：

```ts
const fallbackUrl = fallbackImageUrl?.trim()
if (fallbackUrl) {
  seenUrls.add(fallbackUrl)
  items.push({
    key: 'fixed',
    url: fallbackUrl,
    alt: productName,
    kind: 'fixed',
    sourceId: null,
  })
}

for (const image of shareImages) {
  const url = resolveProductShareImageUrl(image)
  if (!url || seenUrls.has(url)) continue
  seenUrls.add(url)
  items.push({
    key: `share-${image.id}`,
    url,
    alt: image.altText?.trim() || productName,
    kind: 'share',
    sourceId: image.id,
  })
}

return items
```

同步删除“只有没有分享图时才返回 fallback”的旧分支。测试中的 `sourceGalleryItems` 和 `fallbackGalleryItem` 补齐 `kind`、`sourceId`。

- [ ] **Step 4: 增加循环切换和顺序移动函数**

```ts
export const resolveCircularGalleryUrl = (
  items: readonly ProductGalleryItem[],
  selectedUrl: string | null,
  delta: -1 | 1,
): string | null => {
  if (!items.length) return null
  const current = items.findIndex((item) => item.url === selectedUrl)
  if (current < 0) return delta === 1 ? items[0].url : items[items.length - 1].url
  const next = (current + delta + items.length) % items.length
  return items[next].url
}

export const resolveSelectionAfterItemsChange = (
  beforeItems: readonly ProductGalleryItem[],
  afterItems: readonly ProductGalleryItem[],
  selectedUrl: string | null,
): string | null => {
  if (!afterItems.length) return null
  if (afterItems.some((item) => item.url === selectedUrl)) return selectedUrl
  const previousIndex = beforeItems.findIndex((item) => item.url === selectedUrl)
  if (previousIndex < 0) return afterItems[0].url
  return afterItems[Math.min(previousIndex, afterItems.length - 1)].url
}

export const moveShareImageIds = (
  ids: readonly number[],
  imageId: number,
  delta: -1 | 1,
): number[] => {
  const from = ids.indexOf(imageId)
  const to = from + delta
  if (from < 0 || to < 0 || to >= ids.length) return [...ids]
  const result = [...ids]
  ;[result[from], result[to]] = [result[to], result[from]]
  return result
}
```

- [ ] **Step 5: 调整可用图片过滤调用并运行测试**

将 `resolveAvailableGalleryItems` 收敛为过滤完整画廊集合，不再单独注入 fallback：

```ts
export const resolveAvailableGalleryItems = (
  items: readonly ProductGalleryItem[],
  failedUrls: ReadonlySet<string>,
): ProductGalleryItem[] => items.filter((item) => !failedUrls.has(item.url))
```

同步把测试和 `ProductImageGallery.vue` 调用改为两个参数，使失败图片过滤覆盖固定主图和分享图同一集合。

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: 纯函数测试 PASS；组件契约可能因后续任务尚未实现而保持原状态。

- [ ] **Step 6: 提交画廊模型**

```bash
git add src/utils/productGallery.ts tests/product-gallery.test.mjs
git commit -m "refactor: keep product hero first in gallery"
```

## Task 4：新增 Store 排序客户端和共享上传规则

**Files:**
- Create: `wristo-store/src/utils/productShareImagePolicy.ts`
- Modify: `wristo-store/src/api/product-share-images.ts`
- Modify: `wristo-store/src/views/admin/ShareImageManager.vue:192-223`
- Test: `wristo-store/tests/product-gallery.test.mjs`

- [ ] **Step 1: 写 API 与共享约束契约测试**

在测试顶部读取新文件，并增加：

```js
const productShareImagePolicyUrl = new URL('../src/utils/productShareImagePolicy.ts', import.meta.url)

test('admin share image API exposes atomic reorder request', async () => {
  const source = await readFile(productShareImagesAdminApiUrl, 'utf8')
  const block = extractExportedConstBlock(source, 'reorderProductShareImages')
  assert.match(block, /instance\.put\(`\/admin\/products\/\$\{appId\}\/share-images\/order`/)
  assert.match(block, /productImageIds/)
  assert.match(block, /Promise<ProductShareImageVO\[\]>/)
})

test('share image upload constraints have one Store source of truth', async () => {
  const [policy, manager] = await Promise.all([
    readFile(productShareImagePolicyUrl, 'utf8'),
    readFile(new URL('../src/views/admin/ShareImageManager.vue', import.meta.url), 'utf8'),
  ])
  assert.match(policy, /MAX_SHARE_IMAGES\s*=\s*8/)
  assert.match(policy, /MAX_SHARE_IMAGE_FILE_SIZE_BYTES\s*=\s*10\s*\*\s*1024\s*\*\s*1024/)
  assert.match(manager, /from ['"]@\/utils\/productShareImagePolicy['"]/)
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: 新排序函数和共享 policy 文件不存在。

- [ ] **Step 3: 创建共享约束文件**

创建 `productShareImagePolicy.ts`：

```ts
export const MAX_SHARE_IMAGES = 8
export const MAX_SHARE_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const SUPPORTED_SHARE_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])
```

在 `ShareImageManager.vue` 导入这三个常量，删除组件内同名常量，并把现有 `MAX_FILE_SIZE_BYTES` 引用改成 `MAX_SHARE_IMAGE_FILE_SIZE_BYTES`、`SUPPORTED_TYPES` 改成 `SUPPORTED_SHARE_IMAGE_TYPES`。

- [ ] **Step 4: 新增排序 API**

在 `product-share-images.ts` 增加：

```ts
export const reorderProductShareImages = (
  appId: number,
  productImageIds: number[],
): Promise<ProductShareImageVO[]> => {
  return instance.put(`/admin/products/${appId}/share-images/order`, { productImageIds })
}
```

- [ ] **Step 5: 运行测试**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: API 与共享上传约束测试 PASS。

- [ ] **Step 6: 提交 Store 数据契约**

```bash
git add src/api/product-share-images.ts src/utils/productShareImagePolicy.ts \
  src/views/admin/ShareImageManager.vue tests/product-gallery.test.mjs
git commit -m "feat: add Store share image reorder client"
```

## Task 5：实现无自动播放的手动轮播和管理员控件

**Files:**
- Modify: `wristo-store/src/components/ProductImageGallery.vue`
- Modify: `wristo-store/src/utils/productGallery.ts`
- Test: `wristo-store/tests/product-gallery.test.mjs:198-216`

- [ ] **Step 1: 先写组件交互契约测试**

扩展现有 `ProductImageGallery exposes...` 测试：

```js
assert.match(source, /aria-label="Previous image"/)
assert.match(source, /aria-label="Next image"/)
assert.match(source, /@keydown\.left="showPrevious"/)
assert.match(source, /@keydown\.right="showNext"/)
assert.match(source, /@touchstart="handleTouchStart"/)
assert.match(source, /@touchend="handleTouchEnd"/)
assert.doesNotMatch(source, /autoplay/i)
assert.match(source, /v-if="editable"[\s\S]*Add images/)
assert.match(source, /emit\('add-images'/)
assert.match(source, /emit\('delete-image'/)
assert.match(source, /emit\('reorder-images'/)
assert.match(source, /draggable="true"/)
assert.match(source, /aria-label="Move image left"/)
assert.match(source, /aria-label="Move image right"/)
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: 手动切换和管理员事件契约断言 FAIL。

- [ ] **Step 3: 扩展组件 props 和 emits**

在组件脚本中使用宽化的 `ProductShareImageSource`，并声明：

```ts
const props = withDefaults(defineProps<{
  images: ProductShareImageSource[]
  fallbackImageUrl?: string | null
  productName: string
  editable?: boolean
  canAddImages?: boolean
  uploading?: boolean
  deletingId?: number | null
  reordering?: boolean
}>(), {
  fallbackImageUrl: null,
  editable: false,
  canAddImages: true,
  uploading: false,
  deletingId: null,
  reordering: false,
})

const emit = defineEmits<{
  'add-images': [files: File[]]
  'delete-image': [imageId: number]
  'reorder-images': [imageIds: number[]]
}>()
```

删除 `sourceItems` 和 `fallbackItem`，改为 `resolveAvailableGalleryItems(galleryItems.value, failedUrls.value)`；固定主图和分享图同时存在时不再丢弃固定主图。缩略图行条件改为 `v-if="availableItems.length > 1 || editable"`，保证管理员只有固定主图时仍能添加。把现有 `availableItems` watcher 改为使用 `resolveSelectionAfterItemsChange(previousItems ?? [], items, selectedUrl.value)`，确保删除当前图片后选择相邻图片。

- [ ] **Step 4: 增加左右、键盘和触摸手动切换**

在主图 stage 上增加 `tabindex="0"`、键盘和触摸事件，并加入：

```ts
const thumbnailsRef = ref<HTMLElement | null>(null)
const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const showRelative = (delta: -1 | 1) => {
  selectedUrl.value = resolveCircularGalleryUrl(availableItems.value, selectedUrl.value, delta)
  requestAnimationFrame(() => {
    thumbnailsRef.value
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  })
}

const showPrevious = () => showRelative(-1)
const showNext = () => showRelative(1)
const touchStartX = ref<number | null>(null)
const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.changedTouches[0]?.clientX ?? null
}
const handleTouchEnd = (event: TouchEvent) => {
  if (touchStartX.value === null) return
  const delta = (event.changedTouches[0]?.clientX ?? touchStartX.value) - touchStartX.value
  touchStartX.value = null
  if (Math.abs(delta) < 48) return
  delta > 0 ? showPrevious() : showNext()
}
```

图片多于一张时在 stage 内加入 Previous/Next 按钮。按钮使用绝对定位、半透明深色背景和清晰 focus ring；`prefers-reduced-motion` 下关闭平滑动画。

- [ ] **Step 5: 增加管理员添加和删除事件**

在缩略图行末加入隐藏多选文件 input 和添加卡片：

```vue
<label v-if="editable" class="product-gallery__add" :class="{ disabled: uploading || !canAddImages }">
  <input
    type="file"
    multiple
    accept="image/png,image/jpeg,image/webp"
    :disabled="uploading || !canAddImages"
    @change="handleFileSelection"
  />
  <span aria-hidden="true">＋</span>
  <strong>{{ uploading ? 'Uploading…' : canAddImages ? 'Add images' : '8 image limit' }}</strong>
</label>
```

每个 `kind === 'share'` 的缩略图外层增加删除按钮，点击时 `stop` 并执行：

```ts
const requestDelete = (item: ProductGalleryItem) => {
  if (item.kind === 'share' && typeof item.sourceId === 'number') {
    emit('delete-image', item.sourceId)
  }
}

const handleFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (files.length) emit('add-images', files)
}
```

- [ ] **Step 6: 增加桌面拖拽和移动端左右移动**

仅让分享缩略图 `draggable="true"`。保存被拖拽 ID，在 drop 目标前重排完整分享 ID 列表并 emit：

```ts
const draggedImageId = ref<number | null>(null)
const shareImageIds = computed(() => props.images.map((image) => Number(image.id)))

const handleDrop = (targetId: number) => {
  const fromId = draggedImageId.value
  draggedImageId.value = null
  if (fromId === null || fromId === targetId) return
  const next = [...shareImageIds.value]
  const from = next.indexOf(fromId)
  const to = next.indexOf(targetId)
  if (from < 0 || to < 0) return
  next.splice(to, 0, next.splice(from, 1)[0])
  emit('reorder-images', next)
}

const moveImage = (imageId: number, delta: -1 | 1) => {
  const next = moveShareImageIds(shareImageIds.value, imageId, delta)
  if (next.some((id, index) => id !== shareImageIds.value[index])) {
    emit('reorder-images', next)
  }
}
```

移动按钮只在管理员模式显示；位于首张或末张时分别禁用。排序、上传或删除期间禁用所有冲突管理控件。

- [ ] **Step 7: 完成样式与响应式规则**

保持现有青绿色 Store 视觉，不引入新字体或全局样式：

- stage 左右按钮桌面悬浮显示、键盘 focus 时始终可见；触摸设备保持可见。
- 管理员操作层不遮挡缩略图主体，删除按钮使用高对比危险色。
- 添加卡片尺寸与缩略图一致，使用虚线边框。
- 移动端隐藏拖拽手柄并显示左移、右移按钮。
- 缩略图管理行在管理员只有固定主图时仍渲染。

- [ ] **Step 8: 运行前端契约测试**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: 画廊纯函数和组件契约全部 PASS。

- [ ] **Step 9: 提交轮播组件**

```bash
git add src/components/ProductImageGallery.vue src/utils/productGallery.ts tests/product-gallery.test.mjs
git commit -m "feat: add manual product image carousel controls"
```

## Task 6：在应用详情页接入管理员添加、删除和排序

**Files:**
- Modify: `wristo-store/src/views/products/ProductDetail.vue:1-19,267-320,428-441,820-835`
- Modify: `wristo-store/tests/product-gallery.test.mjs:265-328`

- [ ] **Step 1: 写详情页管理编排契约测试**

在 `ProductDetail` 测试增加：

```js
assert.match(productDetailSource, /:editable="isAdmin"/)
assert.match(productDetailSource, /@add-images="handleShareImageAdd"/)
assert.match(productDetailSource, /@delete-image="handleShareImageDelete"/)
assert.match(productDetailSource, /@reorder-images="handleShareImageReorder"/)
assert.match(productDetailSource, /isAdmin\.value\s*\?\s*fetchProductShareImages/)
assert.match(productDetailSource, /uploadProductShareImages\(/)
assert.match(productDetailSource, /deleteProductShareImage\(/)
assert.match(productDetailSource, /reorderProductShareImages\(/)
assert.match(productDetailSource, /ElMessageBox\.confirm\(/)
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
node --test tests/product-gallery.test.mjs
```

Expected: 管理员详情页事件和 API 调用断言 FAIL。

- [ ] **Step 3: 接入管理员 API 和状态**

导入 `ElMessageBox`、三个管理员 API、共享上传常量及 `ProductShareImageSource`。将详情页列表类型改为：

```ts
const shareImages = ref<ProductShareImageSource[]>([])
const shareImagesUploading = ref(false)
const shareImageDeletingId = ref<number | null>(null)
const shareImagesReordering = ref(false)
```

给 `ProductImageGallery` 增加：

```vue
:editable="isAdmin"
:can-add-images="shareImages.length < MAX_SHARE_IMAGES"
:uploading="shareImagesUploading"
:deleting-id="shareImageDeletingId"
:reordering="shareImagesReordering"
@add-images="handleShareImageAdd"
@delete-image="handleShareImageDelete"
@reorder-images="handleShareImageReorder"
```

- [ ] **Step 4: 管理员加载完整列表，普通用户继续公开接口**

把 `loadProductShareImages` 的请求改为：

```ts
const images = isAdmin.value
  ? await fetchProductShareImages(Number(product.value.appId))
  : await getProductShareImages(product.value.appId)
shareImages.value = Array.isArray(images) ? images : []
```

这保证普通用户不触发管理员接口；管理员拿到删除、排序需要的完整关系数据。

同时把现有“详情页加载公开图片”契约改为验证这个条件分支，并保留 `getProductShareImages` 公开 API 路径断言，避免测试继续要求所有身份都只调用公开接口。

- [ ] **Step 5: 实现批量添加与前端预校验**

```ts
const handleShareImageAdd = async (files: File[]) => {
  if (!isAdmin.value || !product.value?.appId || !files.length) return
  const remaining = MAX_SHARE_IMAGES - shareImages.value.length
  if (files.length > remaining) {
    ElMessage.warning(`This app can accept ${remaining} more image${remaining === 1 ? '' : 's'}`)
    return
  }
  const invalidType = files.find((file) => !SUPPORTED_SHARE_IMAGE_TYPES.has(file.type))
  if (invalidType) {
    ElMessage.error(`${invalidType.name} must be a PNG, JPEG, or WebP image`)
    return
  }
  const oversized = files.find((file) => file.size > MAX_SHARE_IMAGE_FILE_SIZE_BYTES)
  if (oversized) {
    ElMessage.error(`${oversized.name} exceeds the 10 MB limit`)
    return
  }

  shareImagesUploading.value = true
  try {
    shareImages.value = await uploadProductShareImages(Number(product.value.appId), files)
    ElMessage.success('Images added')
  } finally {
    shareImagesUploading.value = false
  }
}
```

- [ ] **Step 6: 实现确认删除**

```ts
const handleShareImageDelete = async (imageId: number) => {
  if (!isAdmin.value || !product.value?.appId) return
  try {
    await ElMessageBox.confirm(
      'Delete this carousel image? The fixed application image will not be affected.',
      'Delete image',
      { type: 'warning', confirmButtonText: 'Delete image' },
    )
  } catch {
    return
  }

  shareImageDeletingId.value = imageId
  try {
    await deleteProductShareImage(Number(product.value.appId), imageId)
    shareImages.value = shareImages.value.filter((image) => Number(image.id) !== imageId)
    ElMessage.success('Image deleted')
  } finally {
    shareImageDeletingId.value = null
  }
}
```

组件的 `availableItems` watcher 通过 `resolveSelectionAfterItemsChange` 在当前图片被移除后选择相邻可用图片。

- [ ] **Step 7: 实现乐观排序和失败回滚**

```ts
const handleShareImageReorder = async (imageIds: number[]) => {
  if (!isAdmin.value || !product.value?.appId || shareImagesReordering.value) return
  const snapshot = [...shareImages.value]
  const byId = new Map(snapshot.map((image) => [Number(image.id), image]))
  const optimistic = imageIds.map((id) => byId.get(id)).filter(Boolean) as ProductShareImageSource[]
  if (optimistic.length !== snapshot.length) return

  shareImages.value = optimistic
  shareImagesReordering.value = true
  try {
    shareImages.value = await reorderProductShareImages(Number(product.value.appId), imageIds)
    ElMessage.success('Image order updated')
  } catch (error) {
    shareImages.value = snapshot
    ElMessage.error('Failed to update image order')
  } finally {
    shareImagesReordering.value = false
  }
}
```

- [ ] **Step 8: 运行契约测试和类型构建**

Run:

```bash
node --test tests/product-gallery.test.mjs
npm run build:app
```

Expected: Node 测试全部 PASS；Vue TypeScript 检查和 Vite build 成功。

- [ ] **Step 9: 提交详情页管理员管理功能**

```bash
git add src/views/products/ProductDetail.vue tests/product-gallery.test.mjs
git commit -m "feat: manage carousel images from product detail"
```

## Task 7：完整回归与验收

**Files:**
- Verify only；仅修复本功能直接导致的问题。

- [ ] **Step 1: 运行后端目标测试**

```bash
cd /Users/mac/workspace/wristo/wristo-api
mvn -Dtest=ProductShareImagesOrchestratorTest,ProductShareImagesAdminControllerTest,ProductShareImagesPublicControllerTest,ProductImageServiceImplTest test
```

Expected: 三个测试类全部 PASS，公开读取接口仍保持只读。

- [ ] **Step 2: 运行完整后端测试**

```bash
mvn test
```

Expected: BUILD SUCCESS。若失败来自外部数据库、Docker/Testcontainers 或既有无关测试，记录第一处失败命令与错误，不把环境阻塞表述为代码失败。

- [ ] **Step 3: 运行 Store 测试和生产构建**

```bash
cd /Users/mac/workspace/wristo/wristo-store
node --test tests/product-gallery.test.mjs
npm run build
```

Expected: Node 测试全部 PASS；TypeScript、Vite 生产构建和 SEO 预渲染成功。

- [ ] **Step 4: 手工验收管理员和普通用户路径**

启动 API 和 Store 后验证：

1. 普通用户详情页固定主图第一，左右按钮、缩略图和手机滑动均为手动切换，无自动播放。
2. 普通用户看不到添加、删除、拖拽、左移或右移控件。
3. 管理员从只有固定主图的状态可添加图片，上传后不刷新页面即出现。
4. 管理员可删除当前图片，选择项落到相邻图片，固定主图不可删除。
5. 管理员拖拽排序，刷新后保持；移动端左右移动后刷新也保持。
6. 达到 8 张时添加入口禁用或给出明确上限提示，固定主图不计入 8 张。
7. 模拟排序失败时恢复旧顺序，上传或删除失败时现有轮播不丢失。

- [ ] **Step 5: 检查两个仓库工作树和提交边界**

```bash
git -C /Users/mac/workspace/wristo/wristo-api status --short
git -C /Users/mac/workspace/wristo/wristo-store status --short
git -C /Users/mac/workspace/wristo/wristo-api log -4 --oneline
git -C /Users/mac/workspace/wristo/wristo-store log -5 --oneline
```

Expected: 两个仓库只包含本功能相关提交，工作树无未解释改动；API 与 Store 提交分别留在各自仓库。
