# Search visibility

The international site's canonical origin is `https://www.wristo.io`, matching the live apex-domain redirect. Other regional origins are preserved. Public pages render in the browser. Normal deployment builds generate sitemap, robots.txt and llms.txt without browser prerendering. Static HTML snapshots are optional and must be requested separately.

## Build and validate

```sh
npm run build
# Optional static HTML snapshots:
npm run seo:browser:install
npm run seo:prerender
node --test tests/prerender-route-priority.test.mjs
```

For a local machine with Chrome installed, `PRERENDER_BROWSER_CHANNEL=chrome npm run seo:prerender` uses Chrome instead. Optional prerendering on Vercel uses the pinned @sparticuz/chromium package (including Amazon Linux libraries); local builds use Playwright's installed browser. A missing browser, JavaScript error or incomplete page stops the SEO build; it must not silently publish an empty shell. `npm run build` sets `SKIP_PRERENDER=1` to skip browser snapshots while retaining sitemap generation. `build:app` skips the entire SEO stage.

For optional prerendering, the default snapshot budget is 80 pages, including core pages, localized purchase pages, up to 20 product details and up to 20 category/guide pages before remaining localized pages. Increase `MAX_PRERENDER_ROUTES` when build time permits. The sitemap also lists discovered public routes beyond that snapshot budget; those still rely on JavaScript until added to the budget. Discovery currently takes the existing hot/new/search API lists, not every catalogue product.

`src/utils/publicSeriesDefinitions.json` is shared by category navigation and sitemap discovery. Disabled or noncanonical category aliases must not be added as landing pages. Sitemap entries intentionally omit `lastmod` because a build time does not prove the content changed.

`dist/app.html` is the untouched SPA shell. Vercel checks generated files first, then falls back to this shell; it must not fall back to the rendered homepage for every unrendered route. For Nginx deployments use the equivalent `try_files $uri $uri/ /app.html` rule in the owning deployment repository. Account/payment routes also receive `X-Robots-Tag: noindex, follow` through Vercel. Authentication remains the access-control boundary.

## After release

- Check `/`, one `/app/<id>`, one `/collections/<slug>` and one guide in a browser. Normal builds require JavaScript for page content and metadata. If optional prerendering was run, also verify generated pages without JavaScript.
- Fetch `/robots.txt` and `/sitemap.xml`; confirm the production origin and expected content types.
- Use the verified Search Console property to submit the sitemap and inspect representative URLs. Search Console ownership and submissions are separate from this code change.
- Record indexed-page counts, search impressions/clicks, source/referrer traffic and the existing visit → Studio → design → download conversion funnel. Compare periods using the same definitions; do not infer an AI recommendation from a direct visit.
- Check real crawler responses and CDN/firewall logs after release. Public robots access is allowed, but this alone does not prove a crawler can reach the CDN.
