# Product Gallery Ambient Stage Design

## Goal

Improve the product detail image gallery so portrait and landscape share images no longer sit beside harsh white bars, while preserving each uploaded image without cropping.

## Visual design

- Keep the existing square gallery stage and `contain` foreground image behavior.
- Paint a second copy of the selected image behind the foreground, scaled with `cover`, softly blurred, enlarged, and desaturated.
- Place a translucent white veil above the blurred copy so the background supplies color and depth without competing with the product artwork.
- Keep the foreground image crisp and visually separated with a subtle drop shadow.
- Turn the thumbnail row into a softly tinted filmstrip surface with a quiet border and inset highlight. The row remains horizontally scrollable and the active thumbnail keeps the Wristo teal selection treatment.

## Interaction and accessibility

- Navigation, fullscreen preview, keyboard controls, touch swipe, upload, deletion, and ordering remain unchanged.
- The ambient layer is decorative and hidden from assistive technology because it is rendered with CSS pseudo-elements.
- Motion remains limited to existing interaction transitions and continues to respect `prefers-reduced-motion`.

## Responsive behavior

- Desktop retains the 460px square stage.
- Small screens retain the existing smaller stage and thumbnail sizes.
- Blur radius and filmstrip padding reduce slightly on mobile so the treatment remains crisp rather than hazy.

## Verification

- Add source-contract tests for the dynamic backdrop image, layered stage, contained foreground, filmstrip surface, and reduced-motion behavior.
- Run gallery component/source tests, the complete Node test suite, and `npm run build:app`.
- Capture desktop and 375px screenshots against product `139993` for visual verification.
