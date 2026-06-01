import { Page } from 'playwright'

const CANVAS_NOISE = 0.5
const WEBGL_VENDORS = [
  'Intel Inc.',
  'NVIDIA Corporation',
  'AMD',
  'Apple Inc.',
  'VMware, Inc.',
]
const WEBGL_RENDERERS = [
  'Intel Iris OpenGL Engine',
  'NVIDIA GeForce GTX 1070',
  'AMD Radeon Pro 5500M',
  'Apple M1',
  'VMware SVGA 3D',
]
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
]

function randomizeCanvasFingerprint(page: Page): Promise<void> {
  return page.addInitScript(() => {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
    HTMLCanvasElement.prototype.toDataURL = function (type?: string, quality?: number) {
      const ctx = this.getContext('2d')
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, this.width, this.height)
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] += Math.random() * CANVAS_NOISE * 2 - CANVAS_NOISE
          imageData.data[i + 1] += Math.random() * CANVAS_NOISE * 2 - CANVAS_NOISE
          imageData.data[i + 2] += Math.random() * CANVAS_NOISE * 2 - CANVAS_NOISE
        }
        ctx.putImageData(imageData, 0, 0)
      }
      return originalToDataURL.call(this, type, quality)
    }
  }) as unknown as Promise<void>
}

function randomizeWebGLFingerprint(page: Page): Promise<void> {
  return page.addInitScript(() => {
    const vendor = WEBGL_VENDORS[Math.floor(Math.random() * WEBGL_VENDORS.length)]
    const renderer = WEBGL_RENDERERS[Math.floor(Math.random() * WEBGL_RENDERERS.length)]

    const originalGetParameter = WebGLRenderingContext.prototype.getParameter
    WebGLRenderingContext.prototype.getParameter = function (param: number) {
      if (param === 37445) return vendor
      if (param === 37446) return renderer
      return originalGetParameter.apply(this, [param])
    }

    const originalGetExtension = WebGLRenderingContext.prototype.getExtension
    WebGLRenderingContext.prototype.getExtension = function (name: string) {
      if (name === 'WEBGL_debug_renderer_info') {
        return {
          UNMASKED_VENDOR_WEBGL: vendor,
          UNMASKED_RENDERER_WEBGL: renderer,
        }
      }
      return originalGetExtension.apply(this, [name])
    }
  }) as unknown as Promise<void>
}

function randomizeTimezone(page: Page): Promise<void> {
  const timezone = TIMEZONES[Math.floor(Math.random() * TIMEZONES.length)]
  ;(page.context() as unknown as { setTimezone(tz: string): Promise<void> }).setTimezone(timezone)
  return Promise.resolve()
}

function getInstalledFonts(): string[] {
  const fonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Trebuchet MS', 'Comic Sans MS', 'Impact', 'Lucida Console',
  ]
  return fonts.filter(() => Math.random() > 0.3)
}

function randomizeFonts(page: Page): Promise<void> {
  const fonts = getInstalledFonts()
  return page.addInitScript((fontList: string[]) => {
    Object.defineProperty(document, 'fonts', {
      get: () => ({
        forEach: (cb: (font: { family: { get: () => string } }) => void) => {
          fontList.forEach(family => cb({ family: { get: () => family } }))
        },
        size: fontList.length,
      }),
    })
  }, fonts) as unknown as Promise<void>
}

export async function applyStealthFingerprints(page: Page): Promise<void> {
  await Promise.all([
    randomizeCanvasFingerprint(page),
    randomizeWebGLFingerprint(page),
    randomizeTimezone(page),
    randomizeFonts(page),
  ])
}

export { randomizeCanvasFingerprint, randomizeWebGLFingerprint, randomizeTimezone, randomizeFonts }
