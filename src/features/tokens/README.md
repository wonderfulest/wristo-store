# Public token tools

The `/tokens` route runs locally in the storefront without authentication. It preserves Studio token lookup, usage guidance, template formatting, validation, and preview.

The expression catalog, parser, formatter, calendar utilities, and page components were migrated from `wristo-studio/src` on 2026-11-12. Keep these implementations aligned when changing the supported watchface tokens. Imports are scoped to this feature so storefront builds do not require a neighboring Studio checkout. The page uses storefront locale and message adapters; Studio session storage is deliberately excluded.

Studio retains `/token-editor` for its same-origin editor-to-design handoff. Its public `/tokens` entry redirects to `https://wristo.io/tokens`; the China storefront has matching Nginx and client-side redirects. Query strings are preserved.
