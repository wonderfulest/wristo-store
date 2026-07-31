# Product Gallery External Navigation Design

## Goal

Move the previous and next controls on the public product-detail image gallery
outside the main image. The controls must no longer cover any part of the
watchface image.

## Scope

- Update `src/components/ProductImageGallery.vue`.
- Keep product data, image selection, fullscreen preview, thumbnails, and the
  product-information column unchanged.
- Apply the layout to every product using this shared gallery, including
  `/en/product/165417`.

## Layout

- On desktop, place the previous and next circular buttons immediately outside
  the left and right edges of the main image, with a small visible gap.
- Reserve layout space for the controls so they do not overlap the image or
  depend on clipping outside the gallery column.
- On narrow screens, reduce the control size and gap while keeping both
  controls outside the image and within the viewport.
- Show the controls only when more than one image is available, matching the
  existing behavior.

## Interaction and Accessibility

- Preserve circular previous/next navigation.
- Preserve keyboard left/right navigation, touch swiping, fullscreen preview,
  focus styles, and the existing accessible labels.
- Keep the main image square and preserve its circle or rounded-square shape.

## Verification

- Add a focused static regression assertion for the external-control layout.
- Run the focused product-gallery test.
- Run the Store production build.
- If browser verification is available, inspect desktop and narrow viewport
  rendering and confirm that neither control intersects the main image.
