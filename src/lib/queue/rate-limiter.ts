interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limits: Map<string, RateLimitEntry> = new Map()
const configs: Map<string, RateLimitConfig> = new Map()

export function configureDomainLimit(domain: string, windowMs: number, maxRequests: number): void {
  configs.set(domain, { windowMs, maxRequests })
}

export async function checkRateLimit(domain: string): Promise<boolean> {
  const config = configs.get(domain)
  if (!config) {
    return true
  }

  const now = Date.now()
  const entry = limits.get(domain)

  if (!entry || now > entry.resetAt) {
    limits.set(domain, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return true
  }

  if (entry.count >= config.maxRequests) {
    return false
  }

  entry.count++
  return true
}

export async function waitForRateLimit(domain: string): Promise<void> {
  const config = configs.get(domain)
  if (!config) return

  const now = Date.now()
  const entry = limits.get(domain)

  if (!entry || now > entry.resetAt) {
    limits.set(domain, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return
  }

  if (entry.count < config.maxRequests) {
    entry.count++
    return
  }

  const waitTime = entry.resetAt - now
  await new Promise(resolve => setTimeout(resolve, waitTime))

  limits.set(domain, {
    count: 1,
    resetAt: Date.now() + config.windowMs,
  })
}

export function getRemainingRequests(domain: string): number {
  const config = configs.get(domain)
  const entry = limits.get(domain)

  if (!config || !entry || Date.now() > entry.resetAt) {
    return config?.maxRequests || 0
  }

  return Math.max(0, config.maxRequests - entry.count)
}

export function resetRateLimit(domain: string): void {
  limits.delete(domain)
}

export function resetAllRateLimits(): void {
  limits.clear()
}

configureDomainLimit('default', 1000, 1)
