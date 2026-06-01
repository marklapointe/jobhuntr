import { BrowserContext, Page } from 'playwright'

export interface SessionData {
  id: string
  userId: string
  atsType: string
  cookies: { name: string; value: string; domain: string; path: string }[]
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
  userAgent: string
  viewport: { width: number; height: number }
  createdAt: Date
  lastUsedAt: Date
}

export interface SavedSession extends SessionData {
  context: BrowserContext
}

export class SessionPreservationManager {
  private activeSessions: Map<string, SavedSession> = new Map()
  private maxSessions = 50

  async saveSession(context: BrowserContext, sessionId: string, userId: string, atsType: string): Promise<void> {
    const cookies = await context.cookies()
    const localStorage = await this.getLocalStorage(context)
    const sessionStorage = await this.getSessionStorage(context)
    
    const firstPage = context.pages()[0]
    const sessionData: SessionData = {
      id: sessionId,
      userId,
      atsType,
      cookies,
      localStorage,
      sessionStorage,
      userAgent: firstPage ? await firstPage.evaluate(() => navigator.userAgent) : '',
      viewport: { width: 1280, height: 720 },
      createdAt: new Date(),
      lastUsedAt: new Date(),
    }

    // Evict oldest if at capacity
    if (this.activeSessions.size >= this.maxSessions) {
      const oldest = this.findOldestSession()
      if (oldest) {
        await this.deleteSession(oldest)
      }
    }

    this.activeSessions.set(sessionId, {
      ...sessionData,
      context,
    })
  }

  async restoreSession(sessionId: string, page: Page): Promise<boolean> {
    const session = this.activeSessions.get(sessionId)
    if (!session) return false

    try {
      // Restore cookies
      await page.context().addCookies(session.cookies)
      
      // Restore localStorage
      for (const [key, value] of Object.entries(session.localStorage)) {
        await page.evaluate(([k, v]) => {
          localStorage.setItem(k, v)
        }, [key, value])
      }

      session.lastUsedAt = new Date()
      return true
    } catch (error) {
      console.error('Failed to restore session:', error)
      return false
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      await session.context.close()
      this.activeSessions.delete(sessionId)
    }
  }

  private async getLocalStorage(context: BrowserContext): Promise<Record<string, string>> {
    const page = context.pages()[0]
    if (!page) return {}
    return page.evaluate(() => {
      const result: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) result[key] = localStorage.getItem(key) || ''
      }
      return result
    })
  }

  private async getSessionStorage(context: BrowserContext): Promise<Record<string, string>> {
    const page = context.pages()[0]
    if (!page) return {}
    return page.evaluate(() => {
      const result: Record<string, string> = {}
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) result[key] = sessionStorage.getItem(key) || ''
      }
      return result
    })
  }

  private findOldestSession(): string | null {
    let oldest: string | null = null
    let oldestTime = Infinity

    for (const [id, session] of this.activeSessions) {
      if (session.lastUsedAt.getTime() < oldestTime) {
        oldestTime = session.lastUsedAt.getTime()
        oldest = id
      }
    }

    return oldest
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size
  }
}

export const sessionPreservation = new SessionPreservationManager()
