# Mobile Product Discovery and Favorites

## Goal

Turn the Wristo Store product detail page into a mobile-first watch-face browsing loop. Users should always have another relevant watch face to open, can save candidates without committing to purchase, and receive restrained prompts that convert saved items into a cart and checkout.

## Scope

This specification covers:

- the public Store product-detail information hierarchy;
- continuous similar-watch-face discovery;
- guest and signed-in product favorites;
- favorite-to-cart conversion prompts;
- the mobile action bar;
- the Store/API contracts and verification needed for those behaviors.

It does not introduce an ML recommendation system, change pricing or checkout rules, or redesign the cart and payment flow.

## Mobile Product Detail

The watch-face artwork is the primary content. On mobile, the first viewport contains a near-full-width hero image, a compact name and price area, and the fixed action bar. Supporting information must not compete with the artwork.

The fixed action bar exposes three distinct actions:

1. Favorite: save or remove the product without changing the cart.
2. Add to cart: use the existing cart behavior and indicate when the product is already present.
3. Buy now: use the existing single-product purchase path.

Description, compatibility, installation, unlock and recovery information move into a single progressive-disclosure area labelled `More Information`. It is collapsed by default. For a user who already owns the product, the installation subsection opens automatically. Administrative-only content remains governed by its current authorization rules and is not part of the public mobile hierarchy.

## Continuous Similar Watch Faces

Immediately after the compact product content, render `Similar Watch Faces` as a two-column, image-led mobile feed. A card contains the watch-face image, short name, price and favorite control. It does not contain an add-to-cart button; users open the detail page before adding a product to the cart.

Opening a card navigates to that product's canonical localized detail route, places the new product at the top of the viewport, and preserves browser Back behavior. The next recommendation page is generated for the newly opened product.

The server returns a paginated recommendation feed. Ranking and fallback order are:

1. same series and related style metadata;
2. same author;
3. compatibility with the user's selected device when available;
4. popular products;
5. new products.

The response excludes the current product, unavailable products, explicit exclusion IDs supplied by the client, and duplicates within the response. The client supplies a bounded list of recently viewed app IDs so repeated navigation does not immediately cycle. When precise matches are insufficient, server-side fallbacks fill the page. Approaching the end of the feed loads the next page.

If a later request fails, the client keeps already rendered cards and shows a retry affordance. If the initial request fails, it retries against the fallback recommendation mode. An empty result is valid only when the catalog has no other available product.

## Favorites

Favorites are separate from the cart and keyed by `appId`.

Guests can favorite products without signing in. Guest favorites are persisted locally and include only the fields required to render a favorite item plus a timestamp. Signed-in favorites are stored by the API and returned with product-card/detail state.

After sign-in, the Store merges local and server favorites by `appId`, retaining the earliest creation time for stable ordering, writes the merged set to the server, and clears the successfully synchronized local entries. A failed merge leaves local entries intact and can be retried.

Favorite changes use optimistic UI. On an authenticated API failure, the UI rolls back and shows a concise error. Guest local-storage failures also roll back rather than displaying a favorite state that cannot be retained.

The API provides authenticated operations to list, add, remove and merge product favorites. Add and merge operations are idempotent. Product detail and recommendation DTOs expose whether the current signed-in user has favorited each item when authentication context exists.

## Conversion Reminder

The first reminder becomes eligible when the favorite count changes from below 3 to at least 3. If the user dismisses it and continues saving products, a second reminder becomes eligible when the count changes from below 6 to at least 6.

Each threshold is shown at most once per browser session. Page navigation and refresh must not repeatedly trigger the same threshold. Removing and re-adding favorites does not make a consumed threshold eligible again during that session. No prompts occur beyond the 6-item threshold in this version.

The reminder is a mobile bottom sheet. It displays favorite watch-face thumbnails and defaults all eligible products to selected. Users may deselect individual products.

Eligibility rules are evaluated using fresh product state:

- already purchased and unavailable products remain visible with a clear status but cannot be selected;
- products already in the cart remain visible and do not get added again;
- available, unowned products may be selected.

`Add to Cart & Checkout` batch-adds selected eligible products using idempotent cart behavior, then navigates to the existing cart checkout page. If no new product is selectable but the cart already contains products, the action becomes `Go to Cart`. `Continue Browsing` closes the sheet without modifying favorites or cart state.

A partial batch failure keeps failed items selected, reports which items were not added, and does not navigate away until the user retries or explicitly chooses to visit the cart.

## State and Component Boundaries

The Store implementation should keep responsibilities isolated:

- `ProductFavoriteStore`: local persistence, authenticated API synchronization, merge and favorite counts.
- `SimilarProductsFeed`: paginated rendering, exclusions, loading, retry and route navigation.
- `FavoriteCheckoutPrompt`: 3/6 threshold session state, fresh eligibility, selection and batch cart action.
- `ProductDetail.vue`: composes the sections and reacts to route product changes; it does not own persistence or recommendation ranking.
- Existing cart store and checkout routes remain the source of truth for cart membership and checkout.

Route changes must reset product-specific view state and requests. Stale responses for a previously opened app ID must not overwrite the current detail or recommendation feed.

## Measurement and Privacy

The funnel needs aggregate events for product-detail view, similar-product open, favorite add/remove, reminder impression/dismissal, batch add, and checkout navigation. Events must not include email, user ID, device ID, raw favorite lists, or other identifiers.

Before enabling these events, reconcile them with the Store privacy copy and consent/configuration behavior. If current policy does not permit the events, ship the user-facing feature with measurement disabled rather than silently broadening collection.

## Accessibility and Interaction

All action targets are at least 44 by 44 CSS pixels. Favorite buttons expose pressed state and product-specific accessible labels. The bottom sheet traps focus, supports Escape, restores focus to the invoking control, and prevents background scroll. Loading and error states are announced without repeatedly interrupting screen readers. Motion respects `prefers-reduced-motion`.

## Verification

Store tests must cover:

- mobile layout order, collapsed supporting content and owned-product installation expansion;
- route changes, scroll-to-top, stale-request protection and browser-history navigation;
- recommendation pagination, exclusions, deduplication, fallback and retry;
- guest favorite persistence and failure rollback;
- authenticated favorite add/remove and guest-to-account merge retry;
- reminder crossings at 3 and 6, once-per-session suppression, and no prompt on ordinary reload;
- default selection, unavailable/purchased/cart statuses, batch deduplication and partial failure;
- keyboard, focus, accessible labels and 44-pixel targets.

API tests must cover favorite authorization and idempotency, merge behavior, recommendation exclusions/deduplication/fallback, unavailable-product filtering and authenticated favorite flags.

Run the relevant targeted Store and API tests, then `npm run build` in `wristo-store` and the targeted Maven tests in `wristo-api`. These checks establish automated behavior and compilation only; final mobile-browser interaction still requires explicit browser verification.

## Acceptance Criteria

- A mobile user can move through product details indefinitely while at least two available products exist in the catalog.
- The watch-face artwork and primary commerce actions dominate the mobile screen; supporting content starts collapsed.
- Guest favorites survive a reload and merge without loss after sign-in.
- Favorite reminders appear only at the confirmed 3- and 6-item crossings and never repeatedly at the same threshold in one session.
- Selected eligible favorites are added to the cart without duplicates before checkout navigation.
- Existing buy-now, cart, entitlement, installation and localized-route behavior remains intact.
