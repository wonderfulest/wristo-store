import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'

import { compileScript, parse } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createRenderer, defineComponent, h, nextTick } from 'vue'

class HostElement {
  constructor(type) {
    this.kind = 'element'
    this.type = type
    this.props = {}
    this.children = []
    this.parent = null
    this.text = ''
  }
}

globalThis.HTMLElement = HostElement

const createTextNode = (kind, text) => ({ kind, text, parent: null })

const renderer = createRenderer({
  patchProp(element, key, _previousValue, nextValue) {
    if (nextValue == null) delete element.props[key]
    else element.props[key] = nextValue
  },
  insert(child, parent, anchor = null) {
    child.parent = parent
    if (anchor == null) parent.children.push(child)
    else parent.children.splice(parent.children.indexOf(anchor), 0, child)
  },
  remove(child) {
    if (!child.parent) return
    const index = child.parent.children.indexOf(child)
    if (index >= 0) child.parent.children.splice(index, 1)
    child.parent = null
  },
  createElement(type) {
    return new HostElement(type)
  },
  createText(text) {
    return createTextNode('text', text)
  },
  createComment(text) {
    return createTextNode('comment', text)
  },
  setText(node, text) {
    node.text = text
  },
  setElementText(element, text) {
    element.text = text
    element.children = []
  },
  parentNode(node) {
    return node.parent
  },
  nextSibling(node) {
    if (!node.parent) return null
    const index = node.parent.children.indexOf(node)
    return node.parent.children[index + 1] ?? null
  },
  querySelector() {
    return null
  },
  setScopeId(element, id) {
    element.props[id] = ''
  },
  cloneNode(node) {
    return node
  },
  insertStaticContent(content, parent, anchor) {
    const node = createTextNode('static', content)
    node.parent = parent
    if (anchor == null) parent.children.push(node)
    else parent.children.splice(parent.children.indexOf(anchor), 0, node)
    return [node, node]
  },
})

const walk = (node, visit) => {
  if (visit(node)) return node
  for (const child of node.children ?? []) {
    const match = walk(child, visit)
    if (match) return match
  }
  return null
}

const collect = (node, predicate, matches = []) => {
  if (predicate(node)) matches.push(node)
  for (const child of node.children ?? []) collect(child, predicate, matches)
  return matches
}

const hasClass = (node, className) =>
  typeof node.props?.class === 'string' && node.props.class.split(/\s+/).includes(className)

const findEventHandler = (node, eventName) => {
  const expectedKey = `on${eventName}`.toLowerCase()
  return Object.entries(node.props ?? {}).find(([key]) => key.toLowerCase() === expectedKey)?.[1]
}

export const loadClientVueComponent = async (filename) => {
  const source = await readFile(filename, 'utf8')
  const { descriptor } = parse(source, { filename })
  const compiled = compileScript(descriptor, { id: 'host-renderer-test', inlineTemplate: true })
  const vueModuleUrl = import.meta.resolve('vue')
  const componentCode = compiled.content
    .replaceAll("from 'vue'", `from '${vueModuleUrl}'`)
    .replaceAll('from "vue"', `from '${vueModuleUrl}'`)
  const sourceRoot = new URL('../../src/', import.meta.url).pathname
  const result = await build({
    stdin: {
      contents: componentCode,
      sourcefile: filename,
      resolveDir: new URL('../..', import.meta.url).pathname,
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    write: false,
    external: [vueModuleUrl],
    plugins: [
      {
        name: 'host-renderer-alias',
        setup(esbuild) {
          esbuild.onResolve({ filter: /^@\// }, ({ path }) => ({
            path: `${sourceRoot}${path.slice(2)}.ts`,
          }))
        },
      },
    ],
  })
  const moduleUrl =
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  return (await import(moduleUrl)).default
}

export const mountWithHostRenderer = async (component, props) => {
  const emitted = { addImages: [], deleteImage: [], reorderImages: [] }
  const root = new HostElement('root')

  const ElImageStub = defineComponent({
    name: 'ElImageStub',
    inheritAttrs: false,
    props: { src: String, alt: String },
    setup(imageProps, { attrs, expose }) {
      expose({ showPreview() {} })
      return () => h('el-image-stub', { ...attrs, src: imageProps.src, alt: imageProps.alt })
    },
  })
  const Parent = defineComponent({
    setup() {
      return () =>
        h(component, {
          ...props,
          onAddImages: (files) => emitted.addImages.push(files),
          onDeleteImage: (id) => emitted.deleteImage.push(id),
          onReorderImages: (ids) => emitted.reorderImages.push(ids),
        })
    },
  })
  const app = renderer.createApp(Parent)
  app.component('el-image', ElImageStub)
  app.mount(root)
  await nextTick()

  return {
    root,
    emitted,
    find(predicate) {
      return walk(root, predicate)
    },
    findWithin(node, predicate) {
      return walk(node, predicate)
    },
    findAll(predicate) {
      return collect(root, predicate)
    },
    findByAriaLabel(label) {
      return walk(root, (node) => node.props?.['aria-label'] === label)
    },
    findAllByClass(className) {
      return collect(root, (node) => hasClass(node, className))
    },
    async trigger(node, eventName, event = {}) {
      const handler = findEventHandler(node, eventName)
      const hostEvent = { preventDefault() {}, stopPropagation() {}, ...event }
      if (Array.isArray(handler)) handler.forEach((callback) => callback(hostEvent))
      else if (typeof handler === 'function') handler(hostEvent)
      await nextTick()
    },
    unmount() {
      app.unmount()
    },
  }
}
