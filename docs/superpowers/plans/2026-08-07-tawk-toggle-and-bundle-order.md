# Tawk Toggle and Bundle Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable Tawk.to by default behind a Vite environment flag and show the bundle before the single product on the purchase-options page at every viewport size.

**Architecture:** Keep the existing inline Tawk loader, but guard it with the Vite HTML environment replacement `VITE_ENABLE_TAWK_TO` plus the existing production-host check. Remove only the mobile CSS ordering override so DOM order remains the single source of truth for purchase-card order.

**Tech Stack:** Vue 3, Vite HTML environment replacement, scoped CSS, Node test runner

---

### Task 1: Define the expected storefront behavior

**Files:**
- Modify: `tests/mobile-purchase-option-layout.test.mjs`
- Create: `tests/tawk-toggle.test.mjs`

- [ ] **Step 1: Change the mobile layout assertion**

Assert that the bundle appears before the product in template order and that the mobile stylesheet has no `order` override for either card.

- [ ] **Step 2: Add the Tawk environment assertion**

Assert that `index.html` checks `VITE_ENABLE_TAWK_TO` for the exact string `true`, retains the production-host restriction, and `.env.example` documents the flag as `false`.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/mobile-purchase-option-layout.test.mjs tests/tawk-toggle.test.mjs`

Expected: failures because mobile product-first CSS is still present and the Tawk environment flag is not implemented.

### Task 2: Implement the environment-controlled Tawk loader

**Files:**
- Modify: `index.html`
- Create: `.env.example`

- [ ] **Step 1: Guard Tawk loading**

Load Tawk only when `%VITE_ENABLE_TAWK_TO%` equals `true` and hostname is `wristo.io` or `www.wristo.io`. Missing, `false`, or any other value keeps it disabled.

- [ ] **Step 2: Document the default**

Add `VITE_ENABLE_TAWK_TO=false` to `.env.example`.

### Task 3: Restore bundle-first purchase ordering

**Files:**
- Modify: `src/views/shop/PurchaseOptions.vue`

- [ ] **Step 1: Remove mobile order overrides**

Delete only `.purchase-option-product { order: 1; }` and `.purchase-option-bundle { order: 2; }`. Preserve compact safe-area spacing and last-card margin behavior.

- [ ] **Step 2: Run focused tests and verify GREEN**

Run: `node --test tests/mobile-purchase-option-layout.test.mjs tests/tawk-toggle.test.mjs`

Expected: both tests pass.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: TypeScript checks and Vite build exit successfully.

- [ ] **Step 4: Review the final diff**

Confirm the diff contains only the environment toggle, example configuration, bundle-first mobile order, focused assertions, and this plan.
