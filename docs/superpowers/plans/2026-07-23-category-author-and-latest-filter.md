# Category Author Filter and Latest Sort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add newest-first sorting to Store category pages and an administrator-only, category-scoped author filter.

**Architecture:** Keep pagination and filtering authoritative in `wristo-api`. Extend the existing category product query with an allowlisted newest order and optional author ID, expose a small admin-only author-options endpoint, then bind both capabilities to route-backed state in `wristo-store`.

**Tech Stack:** Java 17, Spring Boot, MyBatis, Maven/JUnit; Vue 3, TypeScript, Vue Router, Vite, Node test runner.

---

## File Map

- `wristo-api/.../ProductPublicController.java`: accept the optional author filter and authenticate its use.
- `wristo-api/.../ProductAdminController.java`: expose category author options.
- `wristo-api/.../ProductOrchestrator.java` and `impl/ProductOrchestratorImpl.java`: carry category query arguments and convert author options.
- `wristo-api/.../ProductService.java` and `impl/ProductServiceImpl.java`: normalize sorting and coordinate category/author queries.
- `wristo-api/.../ProductMapper.java` and `resources/mapper/ProductMapper.xml`: apply author predicates and select distinct category authors.
- `wristo-api/.../vo/CategoryAuthorVO.java`: minimal author option response.
- `wristo-api/src/test/.../ProductCategoryBrowseContractTest.java`: focused API/source contract regression coverage.
- `wristo-store/src/api/product.ts`: type and serialize newest order, author ID, and author options request.
- `wristo-store/src/views/products/Categories.vue`: render/admin-gate author selection and synchronize route-backed filters.
- `wristo-store/src/i18n.ts`: English and Chinese labels and error copy.
- `wristo-store/tests/storefront-visual-system.test.mjs`: focused Store contract coverage.

### Task 1: API category query contract

- [ ] Add failing assertions to `ProductCategoryBrowseContractTest` proving `createdAt:desc` is allowlisted, author ID reaches both device and non-device mapper queries, and the final order is `store_weight DESC, created_at DESC, id DESC`.
- [ ] Run `mvn -Dtest=ProductCategoryBrowseContractTest test`; expect failure because newest and author filtering do not exist.
- [ ] Extend public controller, orchestrator, service, and mapper signatures with nullable `userId`; reject non-admin use by checking the authenticated principal/roles before delegation.
- [ ] Replace the rating boolean normalizer with an allowlisted category-order resolver covering download, rating, and newest; never pass raw request SQL to MyBatis.
- [ ] Add `AND p.user_id = #{userId}` to both paged mapper statements only when `userId != null`.
- [ ] Run the focused Maven test; expect pass.
- [ ] Commit only the Task 1 API files with `git commit -m "add category author and newest queries"`.

### Task 2: Admin category author options

- [ ] Add failing assertions proving `/api/admin/products/category-authors` exists, returns `CategoryAuthorVO`, and its mapper query is distinct, category-scoped, and includes the shared public visibility filter.
- [ ] Run `mvn -Dtest=ProductCategoryBrowseContractTest test`; expect the new assertions to fail.
- [ ] Create `CategoryAuthorVO` with `id`, `nickname`, and `username`.
- [ ] Add `ProductMapper.selectCategoryAuthors(categoryIds, visibility)` joining products to users, grouping distinct users, and ordering by resolved display name then ID.
- [ ] Add service/orchestrator methods that resolve the slug through the same category expansion as product browsing and return an empty list for unknown categories.
- [ ] Add `GET /api/admin/products/category-authors?slug=<slug>` to `ProductAdminController`; rely on the existing `/api/admin/**` security boundary.
- [ ] Run the focused Maven test; expect pass.
- [ ] Commit only the Task 2 API files with `git commit -m "add category author options"`.

### Task 3: Store client and localization

- [ ] Extend `storefront-visual-system.test.mjs` with failing assertions for `createdAt:desc`, optional `userId`, the admin author endpoint, and English/Chinese keys `category.sortNewest`, `category.author`, `category.allAuthors`, and `category.authorLoadError`.
- [ ] Run `node --test tests/storefront-visual-system.test.mjs`; expect failure on the new contract.
- [ ] Extend `CategoryProductOrderBy`, add `CategoryAuthorOption`, serialize `userId` only when present, and add `fetchCategoryAuthors(slug)` in `src/api/product.ts`.
- [ ] Add concise English and Chinese translations to `src/i18n.ts`.
- [ ] Run the focused Node test; expect the client/localization assertions to pass while page assertions remain failing.
- [ ] Commit the client, locale, and test files with `git commit -m "add category browse filter client"`.

### Task 4: Category page controls and route state

- [ ] Add failing page assertions for a public newest button, `v-if="isAdmin"` author control, author loading restricted to admins, `author` query normalization, and passing `selectedAuthorId` to the category request.
- [ ] Run `node --test tests/storefront-visual-system.test.mjs`; expect failure on page behavior.
- [ ] Add newest to `sortOptions`, map it to `sort=newest`, and preserve the existing download default and rating alias.
- [ ] Add admin-only author state/options loading, nickname/username/fallback labels, `All authors`, accessible labeling, and non-blocking localized failure feedback.
- [ ] Synchronize author changes through `router.replace`, reset pagination through the existing route watcher, clear stale authors, and remove unauthorized/malformed author query values.
- [ ] Pass the normalized author ID into `getProductsByCategory`; reload author options only after resolving the active category.
- [ ] Add responsive styles matching the discovery toolbar without changing the product grid or admin category panel.
- [ ] Run `node --test tests/storefront-visual-system.test.mjs`; expect pass.
- [ ] Commit the page and updated test with `git commit -m "add admin category author filter"`.

### Task 5: Integrated verification

- [ ] Run `mvn -Dtest=ProductCategoryBrowseContractTest,ProductPublicControllerTest test` in `wristo-api`; expect all focused API tests to pass.
- [ ] Run `node --test tests/storefront-visual-system.test.mjs tests/category-browse-state.test.mjs` in `wristo-store`; expect all focused Store tests to pass.
- [ ] Run `npm run build` in `wristo-store`; expect TypeScript and Vite production build success.
- [ ] Run `git diff --check` and inspect `git status --short` in both repositories; confirm unrelated pre-existing dirty files remain untouched and uncommitted.
- [ ] Manually verify `/en/categories/whole` at desktop and mobile widths for public newest sorting, admin author visibility, URL persistence, loading state, and empty results.
