<template>
  <div
    ref="hostRef"
    class="preview-host"
    :class="{ 'preview-host-with-frame': shouldShowDeviceFrame }"
    :aria-label="`${productName} live preview`"
  >
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
    <img
      v-if="shouldShowDeviceFrame && deviceFrameUrl"
      :src="deviceFrameUrl"
      :alt="`${deviceDisplayName} device frame`"
      :style="deviceFrameStyle || undefined"
      class="preview-device-frame"
      :class="{ 'preview-device-frame-loading': !deviceFrameStyle }"
      draggable="false"
      @load="handleDeviceFrameLoad"
      @error="handleDeviceFrameError"
    />
    <img
      v-if="showFallback && resolvedFallbackImageUrl"
      :src="resolvedFallbackImageUrl"
      :alt="productName"
      class="preview-fallback"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Canvas as FabricCanvas,
  Circle,
  FabricText,
  Image as FabricImage,
  Line,
  Path,
  Polyline,
  Rect,
  type FabricObject,
} from 'fabric'
import { getProductPreviewConfig, getProductPreviewConfigByDesignId, getPublicFontBySlug } from '@/api/product'
import type { RuntimeDesignConfig, RuntimeDesignElement } from '@/types'
import { getDeviceDetailByDeviceId, type GarminDeviceBaseVO, type GarminDeviceVO } from '@/api/device'

const props = defineProps<{
  appId?: number | string
  designId?: string | null
  productName: string
  fallbackImageUrl?: string | null
  previewConfig?: RuntimeDesignConfig | null
  previewFallbackImageUrl?: string | null
  device?: GarminDeviceBaseVO | null
  showDeviceFrame?: boolean
  simulatedTimeMs?: number
}>()

const hostRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasRendered = ref(false)
const loading = ref(false)
const config = ref<RuntimeDesignConfig | null>(null)
const previewFallbackImageUrl = ref<string | null>(null)
const hostSize = ref({ width: 0, height: 0 })
const deviceDetail = ref<GarminDeviceVO | null>(null)
const deviceFrameNaturalSize = ref({ width: 0, height: 0 })
const deviceFrameFailed = ref(false)

let fabricCanvas: FabricCanvas | null = null
let resizeObserver: ResizeObserver | null = null
let tickTimer: number | null = null
let renderToken = 0
let deviceDetailRequestSeq = 0

type DesignBounds = {
  width: number
  height: number
}

type DisplayRect = {
  left: number
  top: number
  width: number
  height: number
}

type PreviewLayout = {
  width: number
  height: number
  displayRect: DisplayRect
  frameRect?: DisplayRect
}

type PreviewTransform = {
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  uniformScale: number
}

const loadedFonts = new Set<string>()
const unavailableFonts = new Set<string>()
const fontLoads = new Map<string, Promise<boolean>>()

const showFallback = computed(() => loading.value || !hasRendered.value)
const resolvedFallbackImageUrl = computed(() => previewFallbackImageUrl.value || props.fallbackImageUrl || '')
const resolvedDevice = computed(() => deviceDetail.value ?? props.device ?? null)
const deviceFrameUrl = computed(() => resolvedDevice.value?.deviceTransparentPng || '')
const deviceDisplayName = computed(() => resolvedDevice.value?.displayName || props.device?.displayName || 'Garmin')
const displayLocation = computed(() => resolvedDevice.value?.simulator?.display?.location ?? null)
const displayShape = computed(() => String(resolvedDevice.value?.simulator?.display?.shape ?? '').toLowerCase())

const validDisplayLocation = computed(() => {
  const location = displayLocation.value
  const x = Number(location?.x)
  const y = Number(location?.y)
  const width = Number(location?.width)
  const height = Number(location?.height)
  if (![x, y, width, height].every(Number.isFinite)) return null
  if (width <= 0 || height <= 0) return null
  return { x, y, width, height }
})

const hasDeviceFrameGeometry = computed(() => {
  return Boolean(
    props.showDeviceFrame &&
      deviceFrameUrl.value &&
      validDisplayLocation.value &&
      deviceFrameNaturalSize.value.width > 0 &&
      deviceFrameNaturalSize.value.height > 0 &&
      !deviceFrameFailed.value,
  )
})

const shouldShowDeviceFrame = computed(() => Boolean(props.showDeviceFrame && deviceFrameUrl.value && !deviceFrameFailed.value))

const sampleValues: Record<string, string> = {
  battery: '82',
  calories: '486',
  distance: '6.4',
  floors: '8',
  heartRate: '72',
  hr: '72',
  steps: '8,624',
  temperature: '24',
  weather: 'Sunny',
}

const numberValue = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const stringValue = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' && value.trim() ? value : fallback
}

const pad2 = (value: number): string => String(value).padStart(2, '0')

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const getPreviewNow = (): Date => {
  const simulatedTimeMs = props.simulatedTimeMs
  return typeof simulatedTimeMs === 'number' && Number.isFinite(simulatedTimeMs)
    ? new Date(simulatedTimeMs)
    : new Date()
}

const ordinal = (day: number): string => {
  const mod10 = day % 10
  const mod100 = day % 100
  if (mod10 === 1 && mod100 !== 11) return `${day}st`
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`
  return `${day}th`
}

const applyTextCase = (value: string, textCase?: unknown): string => {
  const mode = numberValue(textCase, 0)
  if (mode === 1) return value.toUpperCase()
  if (mode === 2) return value.toLowerCase()
  if (mode === 3) return value.replace(/\b\w/g, (char) => char.toUpperCase())
  return value
}

const resolveFontFamily = (element: RuntimeDesignElement): string => {
  return stringValue(element.fontFamily ?? element.font, 'Arial')
}

const normalizeFontUrl = (url: string): string => {
  if (/^(https?:|blob:|data:)/i.test(url)) return url
  return `${location.origin}${url.startsWith('/') ? '' : '/'}${url}`
}

const loadFont = async (slug: string): Promise<boolean> => {
  if (!slug || slug === 'Arial') return true
  if (loadedFonts.has(slug)) return true
  if (unavailableFonts.has(slug)) return false
  const existing = fontLoads.get(slug)
  if (existing) return existing

  const load = (async () => {
    try {
      const font = await getPublicFontBySlug(slug)
      const url = font?.ttfFile?.url
      if (!url) {
        unavailableFonts.add(slug)
        return false
      }
      const fontFace = new FontFace(slug, `url(${normalizeFontUrl(url)})`)
      await fontFace.load()
      document.fonts.add(fontFace)
      try {
        await document.fonts.load(`12px "${slug}"`)
      } catch {}
      await document.fonts.ready
      if (document.fonts.check(`12px "${slug}"`)) {
        loadedFonts.add(slug)
        return true
      }
      return false
    } catch (error) {
      unavailableFonts.add(slug)
      console.warn('[ProductCanvasPreview] failed to load font', slug, error)
      return false
    } finally {
      fontLoads.delete(slug)
    }
  })()

  fontLoads.set(slug, load)
  return load
}

const loadConfigFonts = async (rawConfig: RuntimeDesignConfig): Promise<void> => {
  const fonts = new Set(
    (Array.isArray(rawConfig.elements) ? rawConfig.elements : [])
      .map(resolveFontFamily)
      .filter((font) => font && font !== 'Arial'),
  )
  await Promise.all([...fonts].map((font) => loadFont(font)))
}

const resolveMetricValue = (key?: unknown): string => {
  const normalized = String(key ?? '').trim()
  if (!normalized) return '68'
  return sampleValues[normalized] ?? sampleValues[normalized.replace(/_/g, '')] ?? '68'
}

const resolveTemplate = (template: string): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, rawKey: string) => {
    return resolveMetricValue(rawKey)
  })
}

const elementType = (element: RuntimeDesignElement): string => {
  return String(element.eleType ?? element.type ?? '').trim()
}

const elementId = (element: RuntimeDesignElement): string => {
  return String(element.id ?? '')
}

const sortedElements = (rawConfig: RuntimeDesignConfig): RuntimeDesignElement[] => {
  const elements = Array.isArray(rawConfig.elements) ? rawConfig.elements : []
  const orderIds = Array.isArray(rawConfig.orderIds) ? rawConfig.orderIds.map(String) : []
  if (!orderIds.length) return elements

  const order = new Map(orderIds.map((id, index) => [id, index]))
  return [...elements].sort((a, b) => {
    const aOrder = order.get(elementId(a)) ?? Number.MAX_SAFE_INTEGER
    const bOrder = order.get(elementId(b)) ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })
}

const inferDesignBounds = (rawConfig: RuntimeDesignConfig, elements: RuntimeDesignElement[]) => {
  const configWidth = numberValue(rawConfig.width ?? rawConfig.designWidth ?? rawConfig.watchWidth, 0)
  const configHeight = numberValue(rawConfig.height ?? rawConfig.designHeight ?? rawConfig.watchHeight, 0)
  if (configWidth > 0 && configHeight > 0) {
    return { width: configWidth, height: configHeight }
  }

  const candidates = elements.flatMap((element) => [
    numberValue(element.left) + numberValue(element.width),
    numberValue(element.top) + numberValue(element.height),
    numberValue(element.x2),
    numberValue(element.y2),
    numberValue(element.radius) * 2,
    numberValue(element.bgRadius) * 2,
  ])
  const max = Math.max(...candidates.filter((value) => Number.isFinite(value)), 454)
  const size = max > 600 ? max : 454
  return { width: size, height: size }
}

const getBounds = () => {
  const host = hostRef.value
  const width = Math.max(1, Math.round(host?.clientWidth ?? 1))
  const height = Math.max(1, Math.round(host?.clientHeight ?? width))
  hostSize.value = { width, height }
  return { width, height }
}

const getFrameLayout = (width: number, height: number): PreviewLayout | null => {
  const location = validDisplayLocation.value
  const frameWidth = deviceFrameNaturalSize.value.width
  const frameHeight = deviceFrameNaturalSize.value.height
  if (!hasDeviceFrameGeometry.value || !location || frameWidth <= 0 || frameHeight <= 0) return null

  const framePadding = 0.94
  const scale = Math.min((width * framePadding) / frameWidth, (height * framePadding) / frameHeight)
  if (!Number.isFinite(scale) || scale <= 0) return null

  const renderedFrameWidth = frameWidth * scale
  const renderedFrameHeight = frameHeight * scale
  const frameRect = {
    left: (width - renderedFrameWidth) / 2,
    top: (height - renderedFrameHeight) / 2,
    width: renderedFrameWidth,
    height: renderedFrameHeight,
  }
  const displayRect = {
    left: frameRect.left + location.x * scale,
    top: frameRect.top + location.y * scale,
    width: location.width * scale,
    height: location.height * scale,
  }

  return { width, height, displayRect, frameRect }
}

const getPreviewLayout = (designBounds: DesignBounds): PreviewLayout => {
  const { width, height } = getBounds()
  const frameLayout = getFrameLayout(width, height)
  if (frameLayout) return frameLayout

  const previewScale = 0.82
  const designAspect = designBounds.width / Math.max(1, designBounds.height)
  const maxWidth = width * previewScale
  const maxHeight = height * previewScale
  let displayWidth = maxWidth
  let displayHeight = displayWidth / designAspect
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight
    displayWidth = displayHeight * designAspect
  }

  const displayRect = {
    left: (width - displayWidth) / 2,
    top: (height - displayHeight) / 2,
    width: displayWidth,
    height: displayHeight,
  }

  return { width, height, displayRect }
}

const toTransform = (layout: PreviewLayout, designBounds: DesignBounds): PreviewTransform => {
  const scaleX = layout.displayRect.width / Math.max(1, designBounds.width)
  const scaleY = layout.displayRect.height / Math.max(1, designBounds.height)
  return {
    offsetX: layout.displayRect.left,
    offsetY: layout.displayRect.top,
    scaleX,
    scaleY,
    uniformScale: Math.min(scaleX, scaleY),
  }
}

const deviceFrameStyle = computed(() => {
  const layout = getFrameLayout(hostSize.value.width, hostSize.value.height)
  if (!layout?.frameRect) return null
  return {
    left: `${layout.frameRect.left}px`,
    top: `${layout.frameRect.top}px`,
    width: `${layout.frameRect.width}px`,
    height: `${layout.frameRect.height}px`,
  }
})

const scaledX = (value: unknown, transform: PreviewTransform, fallback = 0): number => {
  return transform.offsetX + numberValue(value, fallback) * transform.scaleX
}

const scaledY = (value: unknown, transform: PreviewTransform, fallback = 0): number => {
  return transform.offsetY + numberValue(value, fallback) * transform.scaleY
}

const setBaseProps = (
  object: FabricObject,
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  object.set({
    left: scaledX(element.left, transform),
    top: scaledY(element.top, transform),
    originX: (element.originX ?? 'center') as any,
    originY: (element.originY ?? 'center') as any,
    angle: Number(element.angle ?? 0),
    opacity: Number(element.opacity ?? 1),
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'default',
  } as any)
}

const lockObject = (object: FabricObject) => {
  object.set({
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'default',
  } as any)
}

const formatTime = (formatter: unknown): string => {
  const now = getPreviewNow()
  const hours = pad2(now.getHours())
  const minutes = pad2(now.getMinutes())
  const seconds = pad2(now.getSeconds())
  switch (numberValue(formatter, 0)) {
    case 1:
      return `${hours}:${minutes}:${seconds}`
    case 2:
      return hours
    case 3:
      return minutes
    case 4:
      return seconds
    case 5:
      return `${hours}:`
    case 6:
      return `:${minutes}`
    case 7:
      return now.getHours() >= 12 ? 'PM' : 'AM'
    case 8:
      return now.getHours() >= 12 ? 'pm' : 'am'
    case 9:
      return hours[0]
    case 10:
      return hours[1]
    case 11:
      return minutes[0]
    case 12:
      return minutes[1]
    default:
      return `${hours}:${minutes}`
  }
}

const formatDate = (formatter: unknown, textCase?: unknown): string => {
  const now = getPreviewNow()
  const day = now.getDate()
  const month = now.getMonth()
  const weekday = now.getDay()
  const year = now.getFullYear()
  let value = ''
  switch (numberValue(formatter, 0)) {
    case 1:
      value = weekdayShort[weekday]
      break
    case 2:
      value = weekdayLong[weekday]
      break
    case 3:
      value = ordinal(day)
      break
    case 4:
      value = monthShort[month]
      break
    case 5:
      value = monthLong[month]
      break
    case 6:
      value = `${monthShort[month]} ${day}`
      break
    case 7:
      value = `${monthLong[month]} ${day}`
      break
    case 8:
      value = `${weekdayShort[weekday]} ${pad2(day)}`
      break
    case 9:
      value = `${monthShort[month]} ${day}, ${weekdayShort[weekday]}`
      break
    case 10:
      value = `${monthShort[month]} ${day}, ${weekdayLong[weekday]}`
      break
    case 11:
      value = `${monthLong[month]}, ${day} ${weekdayLong[weekday]}`
      break
    case 12:
      value = `${weekdayLong[weekday]}, ${monthLong[month]} ${day}`
      break
    case 13:
      value = `${monthShort[month]} ${day}, ${year}`
      break
    case 14:
      value = `${day} ${monthShort[month]} ${year}`
      break
    case 15:
      value = `${pad2(day)}.${pad2(month + 1)}.${year}`
      break
    case 16:
      value = `${pad2(month + 1)}/${pad2(day)}/${year}`
      break
    case 17:
      value = `${year}-${pad2(month + 1)}-${pad2(day)}`
      break
    case 18:
      value = `${monthLong[month]} ${ordinal(day)}, ${year}`
      break
    case 19:
      value = `${monthShort[month]} ${day}, ${year}, ${weekdayLong[weekday]}`
      break
    default:
      value = pad2(day)
  }
  return applyTextCase(value, textCase)
}

const resolveText = (element: RuntimeDesignElement): string => {
  const type = elementType(element)

  if (type === 'time') {
    return formatTime(element.formatter)
  }
  if (type === 'date') {
    return formatDate(element.formatter, config.value?.textCase)
  }
  if (type === 'data') {
    return resolveMetricValue(element.dataProperty ?? element.goalProperty ?? element.metricSymbol)
  }
  if (type === 'label') {
    return String(element.label ?? element.text ?? element.metricSymbol ?? 'DATA')
  }
  if (type === 'unit') {
    return String(element.unit ?? element.text ?? '')
  }
  if (type.includes('weather')) {
    return String(element.text ?? element.value ?? 'Sunny')
  }

  const template = String(element.textTemplate ?? element.text ?? element.label ?? element.value ?? '')
  return template ? resolveTemplate(template) : ''
}

const addTextElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const content = resolveText(element)
  if (!content) return
  const text = new FabricText(content, {
    fill: element.fill ?? element.color ?? '#ffffff',
    fontSize: Math.max(7, numberValue(element.fontSize ?? element.size, 24) * transform.uniformScale),
    fontFamily: resolveFontFamily(element),
    fontWeight: element.fontWeight as any,
    textAlign: element.textAlign ?? 'center',
  } as any)
  setBaseProps(text as any, element, transform)
  fabricCanvas?.add(text)
}

const addShapeElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const type = elementType(element)
  const strokeWidth = Math.max(1, numberValue(element.strokeWidth, 1) * transform.uniformScale)
  const common = {
    fill: element.fill ?? 'transparent',
    stroke: element.stroke ?? element.fill ?? '#ffffff',
    strokeWidth,
    selectable: false,
    evented: false,
  }

  if (type === 'circle') {
    const radius = numberValue(element.radius ?? element.width, 20) * transform.uniformScale
    const circle = new Circle({ ...common, radius })
    setBaseProps(circle as any, element, transform)
    fabricCanvas?.add(circle)
    return
  }

  if (type === 'line') {
    const line = new Line(
      [
        scaledX(element.x1 ?? element.left, transform),
        scaledY(element.y1 ?? element.top, transform),
        scaledX(element.x2 ?? element.left, transform),
        scaledY(element.y2 ?? element.top, transform),
      ],
      common,
    )
    fabricCanvas?.add(line)
    return
  }

  const rect = new Rect({
    ...common,
    width: numberValue(element.width, 48) * transform.scaleX,
    height: numberValue(element.height, 18) * transform.scaleY,
    rx: numberValue(element.rx ?? element.borderRadius, 0) * transform.uniformScale,
    ry: numberValue(element.ry ?? element.borderRadius, 0) * transform.uniformScale,
  })
  setBaseProps(rect as any, element, transform)
  fabricCanvas?.add(rect)
}

const timeAngleForHand = (type: string, fallbackAngle: unknown): number => {
  const now = getPreviewNow()
  const ms = now.getMilliseconds()
  if (type === 'hourHand') return ((now.getHours() % 12) + now.getMinutes() / 60 + now.getSeconds() / 3600 + ms / 3600000) * 30
  if (type === 'minuteHand') return (now.getMinutes() + now.getSeconds() / 60 + ms / 60000) * 6
  if (type === 'secondHand') return (now.getSeconds() + ms / 1000) * 6
  return numberValue(fallbackAngle, 0)
}

const addHandElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const type = elementType(element)
  const baseAngle = timeAngleForHand(type, element.angle)
  const length = numberValue(element.length ?? element.targetHeight ?? element.height, 120) * transform.uniformScale
  const cx = scaledX(element.left ?? 227, transform)
  const cy = scaledY(element.top ?? 227, transform)
  const radians = (baseAngle - 90) * Math.PI / 180
  const x2 = cx + Math.cos(radians) * length
  const y2 = cy + Math.sin(radians) * length

  fabricCanvas?.add(new Line([cx, cy, x2, y2], {
    stroke: element.fill ?? element.stroke ?? '#ffffff',
    strokeWidth: Math.max(2, numberValue(element.strokeWidth ?? element.width, 4) * transform.uniformScale),
    selectable: false,
    evented: false,
  }))
}

const addHandImageElement = async (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const url = String(element.imageUrl ?? element.url ?? element.src ?? '')
  if (!url) {
    addHandElement(element, transform)
    return
  }

  const image = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' } as any)
  const targetHeight = numberValue(element.targetHeight ?? element.height, image.height ?? 120) * transform.uniformScale
  image.set({
    scaleX: targetHeight / Math.max(1, numberValue(image.height, 1)),
    scaleY: targetHeight / Math.max(1, numberValue(image.height, 1)),
    angle: timeAngleForHand(elementType(element), element.angle),
  } as any)
  setBaseProps(image as any, element, transform)
  fabricCanvas?.add(image)
}

const addGoalBarElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  if (element.variant === 'segmented') {
    const segments = Math.max(1, Math.round(numberValue(element.segments, 10)))
    const progress = Math.max(0, Math.min(1, numberValue(element.progress, 0.68)))
    const width = numberValue(element.width, 120) * transform.scaleX
    const height = Math.max(2, numberValue(element.height, 10) * transform.scaleY)
    const gap = Math.max(0, numberValue(element.gap, 2) * transform.uniformScale)
    const segmentWidth = Math.max(1, (width - gap * (segments - 1)) / segments)
    const activeTotal = progress * segments
    const fullActive = Math.floor(activeTotal)
    const remainder = activeTotal - fullActive
    const alignRight = element.progressAlign === 'right'
    const left = scaledX(element.left, transform) - width / 2
    const top = scaledY(element.top, transform) - height / 2
    const radius = numberValue(element.borderRadius, 2) * transform.uniformScale
    const strokeWidth = numberValue(element.borderWidth, 0) * transform.uniformScale

    for (let index = 0; index < segments; index += 1) {
      const x = left + index * (segmentWidth + gap)
      const rect = new Rect({
        left: x,
        top,
        width: segmentWidth,
        height,
        originX: 'left',
        originY: 'top',
        fill: element.bgColor ?? 'rgba(255,255,255,0.18)',
        stroke: strokeWidth > 0 ? element.borderColor ?? '#FFFFFF' : undefined,
        strokeWidth,
        rx: radius,
        ry: radius,
      })
      lockObject(rect as any)
      fabricCanvas?.add(rect)

      const progressIndex = alignRight ? segments - 1 - index : index
      if (progressIndex < fullActive || (progressIndex === fullActive && remainder > 0)) {
        const activeWidth = progressIndex < fullActive ? segmentWidth : Math.max(0, Math.min(1, remainder)) * segmentWidth
        const activeLeft = alignRight ? x + segmentWidth - activeWidth : x
        const activeRect = new Rect({
          left: activeLeft,
          top,
          width: activeWidth,
          height,
          originX: 'left',
          originY: 'top',
          fill: element.color ?? element.fill ?? '#1dbf73',
          rx: Math.min(radius, activeWidth / 2),
          ry: radius,
        })
        lockObject(activeRect as any)
        fabricCanvas?.add(activeRect)
      }
    }
    return
  }

  const width = numberValue(element.width, 90) * transform.scaleX
  const height = Math.max(4, numberValue(element.height, 12) * transform.scaleY)
  const progress = Math.max(0, Math.min(1, numberValue(element.progress, 0.68)))
  const padding = Math.max(0, numberValue(element.padding, 0) * transform.uniformScale)
  const borderRadius = numberValue(element.borderRadius, height / 2 / transform.uniformScale) * transform.uniformScale
  const background = new Rect({
    width,
    height,
    fill: element.bgColor ?? element.backgroundColor ?? 'rgba(255,255,255,0.18)',
    stroke: element.borderColor ?? undefined,
    strokeWidth: numberValue(element.borderWidth, 0) * transform.uniformScale,
    rx: borderRadius,
    ry: borderRadius,
  })
  setBaseProps(background as any, element, transform)
  fabricCanvas?.add(background)

  const fillWidth = Math.max(0, (width - padding * 2) * progress)
  const progressElement = new Rect({
    width: fillWidth,
    height: Math.max(1, height - padding * 2),
    fill: element.color ?? element.fill ?? '#1dbf73',
    rx: Math.max(0, borderRadius - padding),
    ry: Math.max(0, borderRadius - padding),
  })
  const alignRight = element.progressAlign === 'right'
  const progressLeft = numberValue(element.left) + (alignRight ? numberValue(element.width, 90) / 2 : -numberValue(element.width, 90) / 2) + (alignRight ? -padding / transform.scaleX : padding / transform.scaleX)
  setBaseProps(progressElement as any, {
    ...element,
    left: progressLeft,
    top: numberValue(element.top),
    originX: alignRight ? 'right' : 'left',
    originY: 'center',
  }, transform)
  fabricCanvas?.add(progressElement)
}

const addGoalArcElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const cx = scaledX(element.left, transform)
  const cy = scaledY(element.top, transform)
  const startAngle = numberValue(element.startAngle, -90)
  const endAngle = numberValue(element.endAngle, 270)
  const counterClockwise = Boolean(element.counterClockwise)
  const progress = Math.max(0, Math.min(1, numberValue(element.progress, 0.68)))
  const radius = numberValue(element.radius, 80) * transform.uniformScale
  const bgRadius = numberValue(element.bgRadius ?? element.radius, 80) * transform.uniformScale
  const getSignedSweep = () => {
    let start = ((startAngle % 360) + 360) % 360
    let end = ((endAngle % 360) + 360) % 360
    if (counterClockwise) {
      if (end > start) end -= 360
    } else if (end < start) {
      end += 360
    }
    return end - start
  }
  const sweep = getSignedSweep()
  const direction = sweep < 0 ? -1 : 1
  const progressEnd = startAngle + sweep * progress

  const pointOnArc = (arcRadius: number, angle: number) => {
    const radians = (angle - 90) * Math.PI / 180
    return {
      x: cx + Math.cos(radians) * arcRadius,
      y: cy + Math.sin(radians) * arcRadius,
    }
  }

  const makeArc = (arcRadius: number, from: number, to: number, stroke: unknown, strokeWidth: unknown) => {
    if (Math.abs(to - from) < 0.001) return
    const start = pointOnArc(arcRadius, from)
    const end = pointOnArc(arcRadius, to)
    const largeArcFlag = Math.abs(to - from) > 180 ? 1 : 0
    const sweepFlag = to >= from ? 1 : 0
    const arc = new Path(`M ${start.x} ${start.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`, {
      stroke: stringValue(stroke, '#1dbf73'),
      strokeWidth: Math.max(1, numberValue(strokeWidth, 6) * transform.uniformScale),
      fill: '',
    })
    lockObject(arc as any)
    fabricCanvas?.add(arc as any)
  }

  if (element.segmentMode) {
    const segments = Math.max(1, Math.floor(numberValue(element.segments, 12)))
    const totalAngle = Math.abs(sweep)
    const sliceAngle = totalAngle / segments
    const visibleGap = Math.min(Math.max(0, numberValue(element.gapAngle, 2)), Math.max(0, sliceAngle - 0.1))
    const visibleAngle = Math.max(0.1, sliceAngle - visibleGap)
    const activeAngle = totalAngle * progress

    for (let index = 0; index < segments; index += 1) {
      const segmentStartDistance = index * sliceAngle + visibleGap / 2
      const segmentEndDistance = segmentStartDistance + visibleAngle
      const segmentStart = startAngle + direction * segmentStartDistance
      const segmentEnd = startAngle + direction * segmentEndDistance
      makeArc(bgRadius, segmentStart, segmentEnd, element.bgColor, element.bgStrokeWidth ?? element.strokeWidth)

      const activeEndDistance = Math.min(segmentEndDistance, Math.max(segmentStartDistance, activeAngle))
      const activeVisibleAngle = activeEndDistance - segmentStartDistance
      if (activeVisibleAngle > 0.001) {
        makeArc(radius, segmentStart, segmentStart + direction * activeVisibleAngle, element.color ?? element.fill, element.strokeWidth)
      }
    }
    return
  }

  makeArc(bgRadius, startAngle, endAngle, element.bgColor, element.bgStrokeWidth ?? element.strokeWidth)
  makeArc(radius, startAngle, progressEnd, element.color ?? element.fill, element.strokeWidth)
}

const addChartElement = (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const type = elementType(element)
  if (type === 'goalArc') {
    addGoalArcElement(element, transform)
    return
  }
  if (type === 'goalBar') {
    addGoalBarElement(element, transform)
    return
  }
  if (type.includes('arc')) {
    const radius = numberValue(element.radius ?? element.width, 60) * transform.uniformScale
    const left = scaledX(element.left, transform)
    const top = scaledY(element.top, transform)
    const path = new Path(`M ${left - radius} ${top} A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`, {
      fill: '',
      stroke: element.fill ?? element.stroke ?? '#1dbf73',
      strokeWidth: Math.max(3, Number(element.strokeWidth ?? 8) * transform.uniformScale),
      selectable: false,
      evented: false,
    })
    fabricCanvas?.add(path)
    return
  }

  if (type.includes('lineChart') || type.includes('line-chart')) {
    const left = numberValue(element.left, 120)
    const top = numberValue(element.top, 230)
    const points = [
      { x: left - 50, y: top + 18 },
      { x: left - 20, y: top - 8 },
      { x: left + 12, y: top + 10 },
      { x: left + 54, y: top - 24 },
    ].map((point) => ({ x: scaledX(point.x, transform), y: scaledY(point.y, transform) }))
    fabricCanvas?.add(new Polyline(points, {
      fill: '',
      stroke: element.stroke ?? element.fill ?? '#ffffff',
      strokeWidth: Math.max(2, Number(element.strokeWidth ?? 3) * transform.uniformScale),
      selectable: false,
      evented: false,
    }))
    return
  }

  const bar = new Rect({
    width: numberValue(element.width, 90) * transform.scaleX,
    height: Math.max(4, numberValue(element.height, 12) * transform.scaleY),
    fill: element.backgroundColor ?? 'rgba(255,255,255,0.18)',
    rx: 999,
    ry: 999,
    selectable: false,
    evented: false,
  })
  setBaseProps(bar as any, element, transform)
  fabricCanvas?.add(bar)

  const progress = new Rect({
    width: numberValue(element.width, 90) * transform.scaleX * 0.68,
    height: Math.max(4, numberValue(element.height, 12) * transform.scaleY),
    fill: element.fill ?? '#1dbf73',
    rx: 999,
    ry: 999,
    selectable: false,
    evented: false,
  })
  setBaseProps(progress as any, { ...element, originX: 'left' }, transform)
  fabricCanvas?.add(progress)
}

const addImageElement = async (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
) => {
  const url = String(element.imageUrl ?? element.url ?? element.src ?? '')
  if (!url) return
  const image = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' } as any)
  const targetWidth = numberValue(element.width, numberValue(image.width, 80)) * transform.scaleX
  const targetHeight = numberValue(element.height, numberValue(image.height, 80)) * transform.scaleY
  image.set({
    scaleX: targetWidth / Math.max(1, Number(image.width ?? 1)),
    scaleY: targetHeight / Math.max(1, Number(image.height ?? 1)),
  } as any)
  setBaseProps(image as any, element, transform)
  fabricCanvas?.add(image)
}

const addImageLikeElement = async (
  element: RuntimeDesignElement,
  transform: PreviewTransform,
  designWidth: number,
  designHeight: number,
) => {
  const type = elementType(element)
  const url = String(element.imageUrl ?? element.url ?? element.src ?? '')
  if (url) {
    const fallbackSize = type === 'romans' || type === 'tick12' || type === 'tick60'
      ? Math.max(designWidth, designHeight)
      : 80
    await addImageElement({
      ...element,
      width: element.width ?? element.height ?? fallbackSize,
      height: element.height ?? element.width ?? fallbackSize,
    }, transform)
    return
  }

  if (type === 'tick12' || type === 'tick60') {
    const count = type === 'tick12' ? 12 : 60
    const radius = Math.min(designWidth, designHeight) * (type === 'tick12' ? 0.44 : 0.47)
    const cx = scaledX(element.left ?? designWidth / 2, transform)
    const cy = scaledY(element.top ?? designHeight / 2, transform)
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2
      const isMajor = type === 'tick12' || index % 5 === 0
      const tickLength = (isMajor ? 16 : 7) * transform.uniformScale
      const renderedRadius = radius * transform.uniformScale
      const x1 = cx + Math.sin(angle) * (renderedRadius - tickLength)
      const y1 = cy - Math.cos(angle) * (renderedRadius - tickLength)
      const x2 = cx + Math.sin(angle) * renderedRadius
      const y2 = cy - Math.cos(angle) * renderedRadius
      const line = new Line([x1, y1, x2, y2], {
        stroke: element.fill ?? '#ffffff',
        strokeWidth: Math.max(1, (isMajor ? 2 : 1) * transform.uniformScale),
      })
      lockObject(line as any)
      fabricCanvas?.add(line)
    }
    return
  }

  if (type === 'centerCap') {
    addShapeElement({ ...element, eleType: 'circle', radius: element.radius ?? 7, fill: element.fill ?? '#ffffff' }, transform)
  }
}

const resolveBackgroundImageUrl = (rawConfig: RuntimeDesignConfig): string => {
  const backgroundImage = rawConfig.backgroundImage
  if (typeof backgroundImage === 'string') return backgroundImage
  if (backgroundImage && typeof backgroundImage === 'object') {
    return String(backgroundImage.url ?? backgroundImage.imageUrl ?? backgroundImage.src ?? '')
  }
  return ''
}

const addConfigBackgroundImage = async (
  rawConfig: RuntimeDesignConfig,
  transform: PreviewTransform,
  designWidth: number,
  designHeight: number,
) => {
  const url = resolveBackgroundImageUrl(rawConfig)
  if (!url) return

  await addImageElement({
    id: '__config_background_image__',
    eleType: 'background',
    imageUrl: url,
    left: designWidth / 2,
    top: designHeight / 2,
    width: designWidth,
    height: designHeight,
    originX: 'center',
    originY: 'center',
  }, transform)
}

const addDisplayBackplate = (layout: PreviewLayout) => {
  const rect = layout.displayRect
  const shape = displayShape.value
  const shouldUseRect = shape.includes('rect') || shape.includes('square') || Math.abs(rect.width - rect.height) > 2

  if (shouldUseRect) {
    const backplate = new Rect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      originX: 'left',
      originY: 'top',
      fill: '#050505',
      selectable: false,
      evented: false,
    })
    fabricCanvas?.add(backplate)
    return
  }

  const face = new Circle({
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    radius: Math.min(rect.width, rect.height) / 2,
    originX: 'center',
    originY: 'center',
    fill: '#050505',
    selectable: false,
    evented: false,
  })
  fabricCanvas?.add(face)
}

const renderPreview = async () => {
  const currentToken = ++renderToken
  await nextTick()
  if (!canvasRef.value || !hostRef.value || !config.value) return

  const elements = sortedElements(config.value)
  await loadConfigFonts(config.value)
  if (currentToken !== renderToken) return
  const designBounds = inferDesignBounds(config.value, elements)
  const layout = getPreviewLayout(designBounds)
  const transform = toTransform(layout, designBounds)

  if (!fabricCanvas) {
    fabricCanvas = new FabricCanvas(canvasRef.value, {
      selection: false,
      preserveObjectStacking: true,
    })
  }

  fabricCanvas.setDimensions({ width: layout.width, height: layout.height })
  fabricCanvas.clear()
  fabricCanvas.backgroundColor = 'rgba(246,250,248,0)'
  addDisplayBackplate(layout)

  try {
    await addConfigBackgroundImage(config.value, transform, designBounds.width, designBounds.height)
  } catch (error) {
    console.warn('[ProductCanvasPreview] skipped config background image', error)
  }

  for (const element of elements) {
    if (currentToken !== renderToken) return
    const type = elementType(element)
    try {
      if (type === 'background' || type === 'image' || type === 'romans' || type === 'tick12' || type === 'tick60' || type === 'centerCap') {
        await addImageLikeElement(element, transform, designBounds.width, designBounds.height)
      } else if (type === 'circle' || type === 'rectangle' || type === 'rect' || type === 'line') {
        addShapeElement(element, transform)
      } else if (type.endsWith('Hand')) {
        await addHandImageElement(element, transform)
      } else if (type.includes('Bar') || type.includes('Arc') || type.includes('Chart')) {
        addChartElement(element, transform)
      } else if (type) {
        addTextElement(element, transform)
      }
    } catch (error) {
      console.warn('[ProductCanvasPreview] skipped element', type, error)
    }
  }

  fabricCanvas.renderAll()
  hasRendered.value = true
}

const loadConfig = async () => {
  if (!props.designId && !props.appId) return
  loading.value = true
  hasRendered.value = false
  try {
    if (props.previewConfig) {
      previewFallbackImageUrl.value = props.previewFallbackImageUrl || null
      config.value = props.previewConfig
      await renderPreview()
      return
    }

    const preview = props.designId
      ? await getProductPreviewConfigByDesignId(props.designId)
      : await getProductPreviewConfig(props.appId as string | number)
    previewFallbackImageUrl.value = preview.fallbackImageUrl || null
    config.value = preview.configJson
    await renderPreview()
  } catch (error) {
    console.warn('[ProductCanvasPreview] preview config unavailable', error)
    previewFallbackImageUrl.value = null
    config.value = null
    hasRendered.value = false
  } finally {
    loading.value = false
  }
}

const loadDeviceDetail = async () => {
  const deviceId = String(props.device?.deviceId ?? '').trim()
  const requestSeq = ++deviceDetailRequestSeq
  deviceDetail.value = null
  deviceFrameFailed.value = false
  deviceFrameNaturalSize.value = { width: 0, height: 0 }
  if (!deviceId) {
    if (config.value) renderPreview()
    return
  }

  try {
    const detail = await getDeviceDetailByDeviceId(deviceId)
    if (requestSeq !== deviceDetailRequestSeq) return
    deviceDetail.value = {
      ...props.device,
      ...detail,
      displayName: props.device?.displayName || detail.displayName,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[ProductCanvasPreview] device detail unavailable', deviceId, error)
    }
  } finally {
    if (requestSeq === deviceDetailRequestSeq && config.value) {
      renderPreview()
    }
  }
}

const handleDeviceFrameLoad = (event: Event) => {
  const image = event.target as HTMLImageElement | null
  deviceFrameNaturalSize.value = {
    width: Number(image?.naturalWidth || 0),
    height: Number(image?.naturalHeight || 0),
  }
  deviceFrameFailed.value = false
  if (config.value) renderPreview()
}

const handleDeviceFrameError = () => {
  deviceFrameNaturalSize.value = { width: 0, height: 0 }
  deviceFrameFailed.value = true
  if (config.value) renderPreview()
  if (import.meta.env.DEV) {
    console.warn('[ProductCanvasPreview] failed to load device frame', deviceFrameUrl.value)
  }
}

const startTicking = () => {
  if (tickTimer != null) return
  tickTimer = window.setInterval(() => {
    if (config.value && hasRendered.value) {
      renderPreview()
    }
  }, 1000)
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (config.value) renderPreview()
    else getBounds()
  })
  if (hostRef.value) {
    resizeObserver.observe(hostRef.value)
    getBounds()
  }
  loadConfig()
  loadDeviceDetail()
  startTicking()
})

onBeforeUnmount(() => {
  if (tickTimer != null) window.clearInterval(tickTimer)
  resizeObserver?.disconnect()
  fabricCanvas?.dispose()
  fabricCanvas = null
})

watch(() => props.appId, () => {
  loadConfig()
})

watch(() => props.designId, () => {
  loadConfig()
})

watch(() => props.previewConfig, () => {
  loadConfig()
})

watch(() => props.device?.deviceId, () => {
  loadDeviceDetail()
})

watch(() => props.showDeviceFrame, () => {
  if (config.value) renderPreview()
})

watch(() => props.simulatedTimeMs, () => {
  if (config.value && hasRendered.value) renderPreview()
})
</script>

<style scoped>
.preview-host {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f6faf8;
}

.preview-canvas,
.preview-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.preview-canvas {
  z-index: 1;
}

.preview-device-frame {
  position: absolute;
  z-index: 2;
  display: block;
  max-width: none;
  max-height: none;
  pointer-events: none;
  user-select: none;
}

.preview-device-frame-loading {
  visibility: hidden;
}

.preview-fallback {
  object-fit: cover;
  z-index: 3;
}

.preview-host-with-frame .preview-fallback {
  box-sizing: border-box;
  object-fit: contain;
  padding: 8%;
}
</style>
