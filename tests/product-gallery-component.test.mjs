import assert from 'node:assert/strict'
import test from 'node:test'

import {
  loadClientVueComponent,
  mountWithHostRenderer,
} from './helpers/vueHostRenderer.mjs'

const component = await loadClientVueComponent(
  new URL('../src/components/ProductImageGallery.vue', import.meta.url).pathname,
)
const fixedImageUrl = 'https://cdn.example.com/fixed.png'
const shareImages = [
  { id: 11, imageUrl: 'https://cdn.example.com/one.png', altText: 'One' },
  { id: 22, imageUrl: 'https://cdn.example.com/two.png', altText: 'Two' },
  { id: 33, imageUrl: 'https://cdn.example.com/three.png', altText: 'Three' },
]

const mountGallery = (overrides = {}) =>
  mountWithHostRenderer(component, {
    images: shareImages,
    fallbackImageUrl: fixedImageUrl,
    productName: 'Test product',
    ...overrides,
  })

test('ProductImageGallery renders management controls only in editable mode', async (t) => {
  const publicGallery = await mountGallery()
  t.after(() => publicGallery.unmount())
  assert.equal(publicGallery.findByAriaLabel('Add images'), null)
  assert.equal(publicGallery.findAll((node) => node.props?.['aria-label'] === 'Delete image').length, 0)

  const editableGallery = await mountGallery({ editable: true })
  t.after(() => editableGallery.unmount())
  assert.ok(editableGallery.findByAriaLabel('Add images'))
  const imageCards = editableGallery.findAllByClass('product-gallery__thumbnail-item')
  const hasDeleteButton = (card) =>
    editableGallery.findWithin(card, (node) => node.props?.['aria-label'] === 'Delete image')
  assert.equal(hasDeleteButton(imageCards[0]), null)
  for (const shareCard of imageCards.slice(1)) assert.ok(hasDeleteButton(shareCard))
})

test('ProductImageGallery emits selected files and blocks add while busy or at the limit', async (t) => {
  const file = { name: 'new.png', type: 'image/png' }
  const editableGallery = await mountGallery({ editable: true })
  t.after(() => editableGallery.unmount())
  const input = editableGallery.find((node) => node.type === 'input' && node.props?.type === 'file')
  const target = { files: [file], value: 'selected' }
  await editableGallery.trigger(input, 'change', { target })
  assert.deepEqual(editableGallery.emitted.addImages, [[file]])
  assert.equal(target.value, '')

  for (const props of [{ uploading: true }, { canAddImages: false }]) {
    const blockedGallery = await mountGallery({ editable: true, ...props })
    t.after(() => blockedGallery.unmount())
    const blockedInput = blockedGallery.find(
      (node) => node.type === 'input' && node.props?.type === 'file',
    )
    await blockedGallery.trigger(blockedInput, 'change', {
      target: { files: [file], value: 'selected' },
    })
    assert.deepEqual(blockedGallery.emitted.addImages, [])
  }
})

test('ProductImageGallery emits share relation IDs for delete unless busy', async (t) => {
  const editableGallery = await mountGallery({ editable: true })
  t.after(() => editableGallery.unmount())
  const deleteButtons = editableGallery.findAll(
    (node) => node.props?.['aria-label'] === 'Delete image',
  )
  await editableGallery.trigger(deleteButtons[1], 'click')
  assert.deepEqual(editableGallery.emitted.deleteImage, [22])

  const busyGallery = await mountGallery({ editable: true, deletingId: 11 })
  t.after(() => busyGallery.unmount())
  const busyDelete = busyGallery.findByAriaLabel('Delete image')
  await busyGallery.trigger(busyDelete, 'click')
  assert.deepEqual(busyGallery.emitted.deleteImage, [])
})

test('ProductImageGallery emits complete direction-aware drag order unless busy', async (t) => {
  const editableGallery = await mountGallery({ editable: true })
  t.after(() => editableGallery.unmount())
  const shareCards = editableGallery.findAllByClass('product-gallery__thumbnail-item--share')
  const dragEvent = {
    preventDefault() {},
    dataTransfer: { setData() {}, effectAllowed: '' },
  }
  await editableGallery.trigger(shareCards[0], 'dragstart', dragEvent)
  await editableGallery.trigger(shareCards[2], 'drop')
  assert.deepEqual(editableGallery.emitted.reorderImages, [[22, 33, 11]])

  const busyGallery = await mountGallery({ editable: true, reordering: true })
  t.after(() => busyGallery.unmount())
  const busyCards = busyGallery.findAllByClass('product-gallery__thumbnail-item--share')
  await busyGallery.trigger(busyCards[0], 'dragstart', dragEvent)
  await busyGallery.trigger(busyCards[2], 'drop')
  assert.deepEqual(busyGallery.emitted.reorderImages, [])
})
