# Mobile Purchase Option Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the single-product card above bundle cards on phones and reduce the blank space below the final card.

**Architecture:** Keep the existing template and commerce behavior intact. Add semantic card classes and use scoped mobile CSS at the existing `768px` breakpoint to control visual order and bottom spacing without affecting desktop layout.

**Tech Stack:** Vue 3 SFC, scoped CSS, Node test runner, Vite

---

### Task 1: Add the mobile layout regression contract

**Files:**
- Create: `tests/mobile-purchase-option-layout.test.mjs`
- Modify: `src/views/shop/PurchaseOptions.vue`

- [ ] **Step 1: Write the failing test**

Assert that product and bundle cards have semantic classes and that the `768px` media query orders product before bundle, clears the page margin, removes the last card margin, and uses a safe-area-aware `24px` bottom padding.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mobile-purchase-option-layout.test.mjs`
Expected: FAIL because the semantic classes and mobile layout rules do not exist.

- [ ] **Step 3: Write minimal implementation**

Add `purchase-option-product` and `purchase-option-bundle` classes to the existing cards. In the existing `@media (max-width: 768px)` block, set product order to `1`, bundle order to `2`, clear the page bottom margin, remove the final card bottom margin, and set bottom padding to `max(24px, env(safe-area-inset-bottom))`.

- [ ] **Step 4: Run focused test and build**

Run: `node --test tests/mobile-purchase-option-layout.test.mjs`
Expected: PASS.

Run: `npm run build`
Expected: Vue type-check, Vite production build, and SEO prerender complete with exit code `0`.

- [ ] **Step 5: Review the diff**

Run: `git diff --check && git diff -- src/views/shop/PurchaseOptions.vue tests/mobile-purchase-option-layout.test.mjs`
Expected: no whitespace errors and only the approved mobile layout/test changes.
