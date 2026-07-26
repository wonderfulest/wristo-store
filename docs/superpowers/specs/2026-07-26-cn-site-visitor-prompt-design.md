# CN Visitor China-Site Prompt Design

## Goal

When Vercel identifies a `wristo.io` visitor's public IP country as `CN`, show a
non-blocking prompt that lets the visitor open `wristo.cn` or continue using
`wristo.io`.

This feature is guidance, not access control. It must not claim that the visitor
is definitively located in China, and it must not force a redirect.

## Scope

Included:

- Detect the Vercel request country at the edge.
- Show one global prompt to visitors whose country code is `CN`.
- Provide explicit actions for opening the China site and continuing on
  `wristo.io`.
- Remember the continue choice for 30 days in the current browser.
- Map a Wristo product detail page to the matching China-site app detail page
  when an app ID is available.

Excluded:

- Network-quality probes or timeout-based routing.
- Automatic redirects.
- Paddle event handling or payment-failure routing.
- China-site cart, Bundle, or fallback checkout work.
- Changes to existing checkout, login, activation, or payment behavior.

## Edge Detection

Add Vercel Routing Middleware at the `wristo-store` project root. The middleware
handles a dedicated same-origin endpoint:

```text
GET /_wristo/visitor-region
```

It reads the request through Vercel's geolocation helper and returns only:

```json
{
  "countryCode": "CN",
  "mainlandChina": true
}
```

Unknown or unavailable geolocation returns a null country code and
`mainlandChina: false`. The response uses `Cache-Control: private, no-store` so
one visitor's location result cannot be served to another visitor.

Keeping the endpoint outside `/api/**` avoids the existing Vercel rewrite that
proxies Store API requests to `api.wristo.io`.

## Store Behavior

The Store calls the region endpoint once after the application mounts. A
failure, timeout, malformed response, or non-Vercel local-development response
is treated as an unknown region and does not show the prompt.

For a `CN` response, show a non-modal banner with this meaning:

> It looks like you may be visiting from mainland China. For more stable access
> and Alipay, you can visit Wristo China.

Actions:

- `Visit Wristo China`: navigate to the mapped `wristo.cn` URL.
- `Continue on Wristo.io`: close the banner and suppress it for 30 days.
- Close control: behaves the same as continuing on `wristo.io`.

The prompt must remain usable on mobile, must not block page content, and must
not interrupt checkout.

## Destination Mapping

Use a small isolated destination helper:

- A product page with an app ID maps to
  `https://www.wristo.cn/apps/{appId}`.
- All other routes map to `https://www.wristo.cn/apps`.

Do not copy arbitrary query parameters, email addresses, authentication tokens,
cart state, or checkout state to the China-site URL.

## Preference Storage

Store only the dismissal timestamp under a versioned local-storage key. The
prompt is suppressed until 30 days after that timestamp.

The preference is local to `wristo.io`; no cross-domain identity or cookie
sharing is introduced. Invalid or unavailable local storage fails open by
showing the prompt when the visitor is otherwise detected as `CN`.

## Error and Privacy Boundaries

- IP-based country detection can be wrong when a visitor uses a VPN, proxy,
  roaming provider, or corporate gateway, so the UI uses tentative wording.
- The Store does not request GPS permission or call a third-party geolocation
  service.
- The frontend receives only the country code and boolean result; it does not
  receive or persist the visitor IP.
- Detection failure never redirects and never blocks the Store.

## Verification

Add focused tests for:

- `CN` shows the prompt when no valid dismissal exists.
- Non-`CN`, unknown, endpoint failure, and malformed responses do not show it.
- Continue and close suppress the prompt for 30 days.
- Expired or invalid dismissal data allows the prompt again.
- Product routes map to the matching China-site app URL.
- Other routes map to the China-site apps page.
- No cart, auth, email, or checkout query data is forwarded.

Run the Store build after the focused tests. Verify Vercel Preview separately
because local Vite development does not provide Vercel geolocation.
