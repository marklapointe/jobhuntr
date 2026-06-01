import { Page } from 'playwright'

export async function applyStealth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
      configurable: true,
    })
    
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', description: 'Portable Document Format' },
        { name: 'Native Client', description: 'Native Client' },
      ],
      configurable: true,
    })
    
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
      configurable: true,
    })
    
    // Remove automation indicators
    // @ts-expect-error - Chrome runtime exists in Chrome
    window.chrome = { runtime: {} }
    
    // Mock permissions
    const originalQuery = window.navigator.permissions.query
    window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
        : originalQuery(parameters)
  })

  await page.route('**/*', (route) => {
    const url = route.request().url()
    if (
      url.includes('webdriver') ||
      url.includes('selenium') ||
      url.includes('puppeteer') ||
      url.includes('playwright')
    ) {
      route.abort()
    } else {
      route.continue()
    }
  })

  // Randomize viewport
  const viewports = [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]
  const viewport = viewports[Math.floor(Math.random() * viewports.length)]
  await page.setViewportSize(viewport)
}

export function getStealthOptions() {
  return {
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  }
}
