# Agent Guide for This Repo

This file captures collaboration preferences and architecture notes for agents working in this repository.

## Communication
- Default language: Chinese for user-facing responses, unless the user explicitly requests another language.

## Social Share Architecture
- Use backend-rendered OG pages (SSR HTML) for sharing to ensure correct previews and crawler compatibility.
- Endpoints:
  - `GET /share/{appId}` → Product share page (already wired on frontend).
  - `GET /share/store` → Store-level share page (homepage/collection).
  - `GET /share/brand/{merchantId}` → Optional brand share page.
- Meta requirements (examples):
  - `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`.
  - `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- Human redirect: Lightweight JS redirect to the actual product/store URL; crawlers still read OG tags.
- Pinterest: Prefer 2:3 images (e.g., 1200×1800). Frontend may pass image via `&media=` when sharing.
- Caching: Consider short cache (5–15 minutes). Include a cache-busting param `t` in frontend links during testing.

## Frontend Share UX
- Product detail uses a dedicated share URL `/share/{appId}`.
- Provide platform buttons: Twitter, Facebook, LinkedIn, Pinterest.
- Default styling: branded text pill buttons for clarity and cleanliness.

