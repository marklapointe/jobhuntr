import { chromium, Browser, BrowserContext, Page } from 'playwright'

interface PoolConfig {
  maxConcurrent: number
  headless: boolean
  stealth: boolean
}

interface PooledBrowser {
  browser: Browser
  context: BrowserContext
  page: Page
  inUse: boolean
  createdAt: number
}

class BrowserPool {
  private pool: PooledBrowser[] = []
  private config: PoolConfig
  private waiting: Array<() => void> = []

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      headless: config.headless ?? true,
      stealth: config.stealth ?? true,
    }
  }

  async acquire(): Promise<PooledBrowser> {
    const available = this.pool.find(b => !b.inUse)
    
    if (available) {
      available.inUse = true
      return available
    }

    if (this.pool.length < this.config.maxConcurrent) {
      const browser = await chromium.launch({ headless: this.config.headless })
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: this.getRandomUserAgent(),
      })
      const page = await context.newPage()
      
      const pooled: PooledBrowser = {
        browser,
        context,
        page,
        inUse: true,
        createdAt: Date.now(),
      }
      
      this.pool.push(pooled)
      return pooled
    }

    return new Promise((resolve) => {
      this.waiting.push(() => resolve(this.acquire()))
    })
  }

  release(pooled: PooledBrowser): void {
    pooled.inUse = false
    
    const next = this.waiting.shift()
    if (next) {
      setTimeout(next, 0)
    }
  }

  async destroy(): Promise<void> {
    for (const pooled of this.pool) {
      await pooled.context.close()
      await pooled.browser.close()
    }
    this.pool = []
    this.waiting = []
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  getStats(): { total: number; inUse: number; available: number } {
    return {
      total: this.pool.length,
      inUse: this.pool.filter(b => b.inUse).length,
      available: this.pool.filter(b => !b.inUse).length,
    }
  }
}

export const browserPool = new BrowserPool()
export { BrowserPool }
export type { PoolConfig, PooledBrowser }
