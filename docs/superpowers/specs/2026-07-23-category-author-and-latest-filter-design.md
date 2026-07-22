# Category Author Filter and Latest Sort Design

## Goal

Extend the Wristo Store category detail page so shoppers can sort products by newest first, while administrators can additionally filter the category by author. Preserve the existing server-side pagination and public visibility rules.

## User Experience

- Add a localized `Newest` sort option beside `Most downloaded` and `Top rated` for every visitor.
- `Newest` sorts by product creation time descending, with product ID descending as a stable tie-breaker.
- Show an author selector only when the signed-in user has `ROLE_ADMIN`.
- The selector lists only authors who currently have at least one publicly visible product in the active category.
- Author labels use nickname first, then username, then `User #<id>`.
- Changing the sort or author resets pagination and reloads the category from page one.
- Persist the selected sort in the existing `sort` query parameter and the selected author in an `author` query parameter.
- Ignore and remove an `author` query parameter for non-administrators.

## API Contract

### Category products

Extend `GET /public/products/page/category` with:

- `orderBy=createdAt:desc` for newest-first ordering.
- Optional `userId` to constrain results to one author.

Because author filtering is an administrator-only Store feature, a supplied `userId` must only be honored for an authenticated `ROLE_ADMIN`. Anonymous and non-admin requests that supply it must be rejected rather than silently exposing an undocumented filter contract.

The existing public-product visibility conditions, category membership, device filtering, page size, and response shape remain unchanged.

### Category authors

Add an authenticated administrator endpoint that accepts the category slug and returns the distinct authors who have publicly visible products in that category. Each item contains only the fields needed by the selector: `id`, `nickname`, and `username`.

The query must derive authors from the full category result set, not the currently loaded Store page, and apply the same public visibility rules as the category product query.

## Frontend Data Flow

`Categories.vue` remains the owner of category browsing state.

1. Normalize `route.query.sort` to one of download, rating, or newest.
2. Normalize `route.query.author` only when `isAdmin` is true.
3. Pass the normalized order and optional author ID to `getProductsByCategory`.
4. Load category authors after the active category is known and only for administrators.
5. On selection changes, update the route query and let the existing route watcher reset and reload pagination.
6. If the active author no longer exists in the returned options, clear the author query and reload without the filter.

The author selector must have a localized label, an `All authors` option, an accessible name, a disabled/loading state, and responsive styling consistent with the existing discovery toolbar.

## Error Handling

- A product request failure continues through the existing initial-load or load-more error states.
- An author-list failure does not block category products. Keep the selector available with `All authors`, show a localized non-blocking error message, and allow retry when the category reloads.
- Route values that are malformed or unauthorized fall back to the unfiltered state.

## Testing

### API

- Newest ordering is allowlisted and emits the expected stable SQL order.
- Author filtering constrains both normal and device-aware category pagination.
- Supplying `userId` requires `ROLE_ADMIN`.
- The author-list endpoint is admin-protected, distinct, category-scoped, and uses public visibility rules.

### Store

- The category API client serializes newest ordering and optional author ID.
- The page exposes `Newest` to all visitors.
- The author control and author-list request are admin-only.
- Sort and author route state reset pagination and survive refresh.
- English and Chinese locale keys exist.
- Run focused Store tests and `npm run build`; run focused Maven tests for the changed API path.

## Scope Boundaries

- Do not change product-card presentation.
- Do not add author filtering to search, home, or other collection pages.
- Do not redesign the category management panel.
- Do not include unrelated dirty changes in either repository.
